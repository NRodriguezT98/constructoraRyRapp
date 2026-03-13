/**
 * ============================================
 * MIGRACIÓN: Sistema de Vinculación Documento-Paso
 * ============================================
 *
 * Vincula documentos del sistema con pasos de validación de fuentes.
 * Permite validación automática y bloqueo de desembolsos.
 *
 * Características:
 * - Detección automática de documentos requeridos
 * - Validación en tiempo real al subir/eliminar
 * - Bloqueo de desembolsos si falta documento obligatorio
 * - Notificaciones de documentos faltantes
 * - Auditoría completa
 *
 * @version 1.0.0 - 2025-12-11
 */

-- ============================================
-- 1. AGREGAR COLUMNA: documento_id en pasos_fuente_pago
-- ============================================

ALTER TABLE pasos_fuente_pago
ADD COLUMN IF NOT EXISTS documento_id UUID REFERENCES documentos_proyecto(id) ON DELETE SET NULL;

COMMENT ON COLUMN pasos_fuente_pago.documento_id IS 'Documento vinculado que respalda este paso (NULL si aún no se sube)';

CREATE INDEX IF NOT EXISTS idx_pasos_fuente_documento ON pasos_fuente_pago(documento_id) WHERE documento_id IS NOT NULL;

-- ============================================
-- 2. FUNCIÓN: Validar automáticamente paso al subir documento
-- ============================================

CREATE OR REPLACE FUNCTION validar_paso_con_documento()
RETURNS TRIGGER AS $$
DECLARE
  paso_relacionado RECORD;
  config_requisito RECORD;
BEGIN
  -- Solo procesar documentos de clientes (que pueden tener fuentes de pago)
  IF NEW.entidad_tipo != 'cliente' THEN
    RETURN NEW;
  END IF;

  -- Buscar si existe una configuración de requisito que coincida con este documento
  FOR config_requisito IN
    SELECT * FROM requisitos_fuentes_pago_config
    WHERE activo = true
      AND (
        -- Coincide por tipo de documento sugerido
        tipo_documento_sugerido = NEW.tipo_documento
        OR
        -- O por categoría
        categoria_documento = NEW.categoria
      )
  LOOP
    -- Buscar pasos pendientes de este cliente que coincidan con este requisito
    FOR paso_relacionado IN
      SELECT pf.*
      FROM pasos_fuente_pago pf
      INNER JOIN fuentes_pago fp ON fp.id = pf.fuente_pago_id
      INNER JOIN negociaciones n ON n.id = fp.negociacion_id
      WHERE n.cliente_id = NEW.entidad_id
        AND pf.paso = config_requisito.paso_identificador
        AND pf.completado = false
        AND pf.documento_id IS NULL
        AND fp.estado = 'activa' -- Solo fuentes activas
      LIMIT 1 -- Solo vincular al primer paso pendiente
    LOOP
      -- Vincular documento al paso
      UPDATE pasos_fuente_pago
      SET
        documento_id = NEW.id,
        completado = true,
        fecha_completado = NOW(),
        observaciones = COALESCE(observaciones, '') ||
          E'\n✅ Documento vinculado automáticamente: ' || NEW.titulo
      WHERE id = paso_relacionado.id;

      -- Registrar en auditoría
      INSERT INTO audit_log (
        tabla_afectada,
        accion,
        registro_id,
        datos_nuevos,
        usuario_id
      ) VALUES (
        'pasos_fuente_pago',
        'UPDATE',
        paso_relacionado.id,
        jsonb_build_object(
          'documento_vinculado', NEW.id,
          'titulo_documento', NEW.titulo,
          'tipo_documento', NEW.tipo_documento,
          'vinculacion', 'automatica'
        ),
        NEW.usuario_id
      );

      -- Solo vincular a UN paso (el primero encontrado)
      EXIT;
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Ejecutar al insertar documento
DROP TRIGGER IF EXISTS trg_validar_paso_documento ON documentos_proyecto;
CREATE TRIGGER trg_validar_paso_documento
  AFTER INSERT ON documentos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION validar_paso_con_documento();

-- ============================================
-- 3. FUNCIÓN: Invalidar paso al eliminar documento
-- ============================================

CREATE OR REPLACE FUNCTION invalidar_paso_al_eliminar_documento()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el documento estaba vinculado a un paso, invalidarlo
  UPDATE pasos_fuente_pago
  SET
    completado = false,
    fecha_completado = NULL,
    documento_id = NULL,
    observaciones = COALESCE(observaciones, '') ||
      E'\n⚠️ Documento eliminado: ' || OLD.titulo || ' (requiere subir nuevamente)'
  WHERE documento_id = OLD.id
    AND nivel_validacion = 'DOCUMENTO_OBLIGATORIO'; -- Solo obligatorios se invalidan

  -- Registrar en auditoría
  IF FOUND THEN
    INSERT INTO audit_log (
      tabla_afectada,
      accion,
      registro_id,
      datos_anteriores,
      usuario_id
    ) VALUES (
      'pasos_fuente_pago',
      'UPDATE',
      OLD.id,
      jsonb_build_object(
        'documento_eliminado', OLD.id,
        'titulo_documento', OLD.titulo,
        'accion', 'paso_invalidado_automaticamente'
      ),
      OLD.usuario_id
    );
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Ejecutar al eliminar documento
DROP TRIGGER IF EXISTS trg_invalidar_paso_documento ON documentos_proyecto;
CREATE TRIGGER trg_invalidar_paso_documento
  BEFORE DELETE ON documentos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION invalidar_paso_al_eliminar_documento();

-- ============================================
-- 4. FUNCIÓN: Verificar si fuente puede registrar desembolso
-- ============================================

CREATE OR REPLACE FUNCTION puede_registrar_desembolso(p_fuente_pago_id UUID)
RETURNS TABLE (
  puede_desembolsar BOOLEAN,
  razon TEXT,
  pasos_faltantes JSONB
) AS $$
DECLARE
  pasos_obligatorios_incompletos INTEGER;
  pasos_info JSONB;
BEGIN
  -- Contar pasos obligatorios no completados
  SELECT
    COUNT(*),
    jsonb_agg(
      jsonb_build_object(
        'paso', paso,
        'titulo', titulo,
        'descripcion', descripcion
      )
    )
  INTO
    pasos_obligatorios_incompletos,
    pasos_info
  FROM pasos_fuente_pago
  WHERE fuente_pago_id = p_fuente_pago_id
    AND nivel_validacion = 'DOCUMENTO_OBLIGATORIO'
    AND completado = false;

  -- Si hay pasos obligatorios incompletos → NO PUEDE desembolsar
  IF pasos_obligatorios_incompletos > 0 THEN
    RETURN QUERY SELECT
      false,
      'Faltan ' || pasos_obligatorios_incompletos || ' documento(s) obligatorio(s)',
      pasos_info;
  ELSE
    -- Puede desembolsar
    RETURN QUERY SELECT
      true,
      'Todos los requisitos obligatorios están completos',
      '[]'::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. VISTA: Estado de validación por fuente
-- ============================================

CREATE OR REPLACE VIEW vista_estado_validacion_fuentes AS
SELECT
  fp.id AS fuente_pago_id,
  fp.tipo AS tipo_fuente,
  n.cliente_id,
  c.nombres || ' ' || c.apellidos AS cliente_nombre,
  n.vivienda_id,

  -- Contadores de pasos
  COUNT(pf.id) AS total_pasos,
  COUNT(pf.id) FILTER (WHERE pf.completado = true) AS pasos_completados,
  COUNT(pf.id) FILTER (WHERE pf.nivel_validacion = 'DOCUMENTO_OBLIGATORIO') AS pasos_obligatorios,
  COUNT(pf.id) FILTER (WHERE pf.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' AND pf.completado = true) AS obligatorios_completados,

  -- Progreso
  CASE
    WHEN COUNT(pf.id) = 0 THEN 100
    ELSE ROUND((COUNT(pf.id) FILTER (WHERE pf.completado = true)::NUMERIC / COUNT(pf.id)) * 100)
  END AS progreso_porcentaje,

  -- Estado general
  CASE
    WHEN COUNT(pf.id) FILTER (WHERE pf.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' AND pf.completado = false) > 0 THEN 'bloqueado'
    WHEN COUNT(pf.id) FILTER (WHERE pf.completado = false) > 0 THEN 'incompleto'
    ELSE 'listo'
  END AS estado_validacion,

  -- Puede desembolsar?
  COUNT(pf.id) FILTER (WHERE pf.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' AND pf.completado = false) = 0 AS puede_desembolsar,

  -- Detalles de pasos faltantes
  jsonb_agg(
    CASE
      WHEN pf.completado = false AND pf.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN
        jsonb_build_object(
          'paso', pf.paso,
          'titulo', pf.titulo,
          'descripcion', pf.descripcion
        )
      ELSE NULL
    END
  ) FILTER (WHERE pf.completado = false AND pf.nivel_validacion = 'DOCUMENTO_OBLIGATORIO') AS documentos_faltantes

FROM fuentes_pago fp
INNER JOIN negociaciones n ON n.id = fp.negociacion_id
INNER JOIN clientes c ON c.id = n.cliente_id
LEFT JOIN pasos_fuente_pago pf ON pf.fuente_pago_id = fp.id
WHERE fp.estado = 'activa'
GROUP BY
  fp.id,
  fp.tipo,
  n.cliente_id,
  c.nombres,
  c.apellidos,
  n.vivienda_id;

COMMENT ON VIEW vista_estado_validacion_fuentes IS 'Estado de validación de documentos por fuente de pago (para bloqueo de desembolsos)';

-- ============================================
-- 6. POLÍTICA RLS: Vista es accesible para todos
-- ============================================

GRANT SELECT ON vista_estado_validacion_fuentes TO authenticated;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON FUNCTION validar_paso_con_documento() IS 'Vincula automáticamente documentos subidos con pasos de validación pendientes';
COMMENT ON FUNCTION invalidar_paso_al_eliminar_documento() IS 'Invalida pasos obligatorios al eliminar el documento vinculado';
COMMENT ON FUNCTION puede_registrar_desembolso(UUID) IS 'Verifica si una fuente de pago puede registrar desembolso (todos los obligatorios completos)';
