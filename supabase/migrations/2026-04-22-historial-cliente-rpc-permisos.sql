-- ============================================================
-- MIGRACIÓN: Historial de cliente — RPC + RBAC dinámico
-- Fecha: 2026-04-22
--
-- PROBLEMA:
--   La tabla audit_log tenía RLS "solo Administrador puede SELECT",
--   por lo que cualquier otro rol veía "Sin historial" aunque tuviera
--   permiso conceptual de ver el detalle del cliente.
--
-- SOLUCIÓN (3 partes):
--   1. RPC SECURITY DEFINER que centraliza acceso y reemplaza las
--      6 queries paralelas del servicio (1 round-trip en lugar de 6+1).
--   2. Nueva acción RBAC: clientes.ver_historial — controlable desde
--      la matriz de permisos en el módulo Usuarios.
--   3. Seed inicial: Contabilidad y Gerencia pueden ver historial;
--      Administrador de Obra no (decisión de negocio, configurable).
-- ============================================================

BEGIN;

-- ============================================================
-- PARTE 1: Función RPC — obtener_historial_cliente
-- ============================================================
-- SECURITY DEFINER: corre como owner (bypassa RLS de audit_log).
-- La función aplica su propio control de acceso interno.
-- SET search_path = public: previene ataques de search_path hijacking.
-- ============================================================

CREATE OR REPLACE FUNCTION obtener_historial_cliente(
  p_cliente_id UUID,
  p_limit      INT DEFAULT 200
)
RETURNS TABLE (
  id                  uuid,
  tabla               varchar,
  accion              varchar,
  registro_id         uuid,
  fecha_evento        timestamptz,
  usuario_id          uuid,
  usuario_email       varchar,
  usuario_nombres     varchar,
  datos_anteriores    jsonb,
  datos_nuevos        jsonb,
  cambios_especificos jsonb,
  metadata            jsonb,
  modulo              varchar
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ── Control de acceso ────────────────────────────────────
  -- Condición 1: Es Administrador activo (bypass total)
  -- Condición 2: Tiene permiso clientes.ver_historial activo en su rol
  IF NOT (
    EXISTS (
      SELECT 1
      FROM usuarios u
      WHERE u.id = auth.uid()
        AND u.rol::text = 'Administrador'
        AND u.estado = 'Activo'
    )
    OR
    EXISTS (
      SELECT 1
      FROM usuarios u
      JOIN permisos_rol p ON p.rol = u.rol::text
      WHERE u.id = auth.uid()
        AND u.estado = 'Activo'
        AND p.modulo  = 'clientes'
        AND p.accion  = 'ver_historial'
        AND p.permitido = true
    )
  ) THEN
    -- Sin permiso → retorna conjunto vacío (no error, para que
    -- la UI distinga "sin permiso" vs "error de red")
    RETURN;
  END IF;

  -- ── Consulta unificada (1 round-trip) ────────────────────
  -- Consolida los 6 filtros que antes hacía el servicio en paralelo.
  -- Los índices GIN en metadata y (tabla, fecha_evento) ya existen:
  --   idx_audit_log_metadata_gin   → cubre @>
  --   idx_audit_log_tabla_fecha    → cubre ORDER BY
  --   idx_audit_log_tabla_registro → cubre tabla = 'clientes' AND registro_id
  RETURN QUERY
  SELECT
    al.id,
    al.tabla,
    al.accion,
    al.registro_id,
    al.fecha_evento,
    al.usuario_id,
    al.usuario_email,
    al.usuario_nombres,
    al.datos_anteriores,
    al.datos_nuevos,
    al.cambios_especificos,
    al.metadata,
    al.modulo
  FROM audit_log al
  WHERE
    (al.tabla = 'clientes'          AND al.registro_id = p_cliente_id)
    OR (al.tabla = 'negociaciones'      AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
    OR (al.tabla = 'abonos_historial'   AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
    OR (al.tabla = 'renuncias'          AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
    OR (al.tabla = 'intereses'          AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
    OR (al.tabla = 'documentos_cliente' AND al.metadata @> jsonb_build_object('cliente_id', p_cliente_id::text))
  ORDER BY al.fecha_evento DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION obtener_historial_cliente IS
'Retorna eventos de audit_log relacionados con un cliente.
Requiere rol Administrador o permiso RBAC clientes.ver_historial.
Reemplaza 6 queries paralelas del servicio → 1 round-trip.';

-- ============================================================
-- PARTE 2: Seed — nueva acción ver_historial en clientes
-- ============================================================
-- Decisión inicial de negocio (configurable desde UI de permisos):
--   Contabilidad          → true  (maneja documentación y pagos)
--   Gerencia              → true  (visibilidad ejecutiva)
--   Administrador de Obra → false (solo necesita estado físico)
-- ============================================================

INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion)
VALUES
  ('clientes', 'ver_historial', 'Contabilidad',          true,  'Ver línea de tiempo con eventos del cliente'),
  ('clientes', 'ver_historial', 'Administrador de Obra', false, 'Ver línea de tiempo con eventos del cliente'),
  ('clientes', 'ver_historial', 'Gerencia',              true,  'Ver línea de tiempo con eventos del cliente')
ON CONFLICT DO NOTHING;

COMMIT;

-- ── Verificación post-migración ───────────────────────────
SELECT
  modulo,
  accion,
  rol,
  permitido
FROM permisos_rol
WHERE modulo = 'clientes' AND accion = 'ver_historial'
ORDER BY rol;
