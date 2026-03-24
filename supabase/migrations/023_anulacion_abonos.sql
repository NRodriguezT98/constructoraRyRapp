-- ============================================================
-- Migración 023: Sistema de Anulación de Abonos (Soft Delete)
-- ============================================================
--
-- CAMBIOS:
--   1. Nuevos campos en abonos_historial (estado, motivo, auditoria)
--   2. Índices de performance
--   3. Trigger AFTER UPDATE para recalcular saldos sin DELETE
--   4. Actualización de vista_abonos_completos
--   5. Políticas RLS para control de acceso
--
-- PRINCIPIO: Inmutabilidad contable — no se borra, se anula
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. NUEVOS CAMPOS
-- ─────────────────────────────────────────────────────────────

ALTER TABLE abonos_historial
  ADD COLUMN IF NOT EXISTS estado             TEXT        NOT NULL DEFAULT 'Activo'
    CONSTRAINT chk_abonos_estado
    CHECK (estado IN ('Activo', 'Anulado')),

  ADD COLUMN IF NOT EXISTS motivo_categoria   TEXT
    CONSTRAINT chk_abonos_motivo_categoria
    CHECK (motivo_categoria IN (
      'Error en el monto',
      'Pago duplicado',
      'Comprobante inválido',
      'Error en la fecha',
      'Solicitud del cliente',
      'Otro'
    )),

  ADD COLUMN IF NOT EXISTS motivo_detalle     TEXT,
  ADD COLUMN IF NOT EXISTS anulado_por_id     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS anulado_por_nombre TEXT,          -- snapshot: nombre en el momento de la anulación
  ADD COLUMN IF NOT EXISTS fecha_anulacion    TIMESTAMPTZ;

-- Restricción: si estado = 'Anulado', los campos de anulación son obligatorios
ALTER TABLE abonos_historial
  ADD CONSTRAINT chk_anulacion_campos_requeridos
  CHECK (
    estado = 'Activo'
    OR (
      estado = 'Anulado'
      AND motivo_categoria IS NOT NULL
      AND anulado_por_nombre IS NOT NULL
      AND fecha_anulacion IS NOT NULL
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 2. ÍNDICES DE PERFORMANCE
-- ─────────────────────────────────────────────────────────────

-- Filtro más frecuente: solo activos
CREATE INDEX IF NOT EXISTS idx_abonos_estado
  ON abonos_historial(estado);

-- Filtro combinado: negociación + estado (query principal)
CREATE INDEX IF NOT EXISTS idx_abonos_negociacion_estado
  ON abonos_historial(negociacion_id, estado);

-- Auditoría: buscar por quién anuló
CREATE INDEX IF NOT EXISTS idx_abonos_anulado_por_id
  ON abonos_historial(anulado_por_id)
  WHERE anulado_por_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 3. FUNCIÓN Y TRIGGER: Recalcular saldos en anulación
-- ─────────────────────────────────────────────────────────────
--
-- Se dispara AFTER UPDATE solo cuando estado cambia de 'Activo' a 'Anulado'.
-- Recalcula filtrando WHERE estado = 'Activo' para excluir anulados.
-- Los triggers AFTER DELETE existentes se mantienen sin cambio.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_recalcular_saldos_tras_anulacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_nuevo_monto_recibido  NUMERIC;
  v_monto_aprobado        NUMERIC;
  v_nuevo_saldo_fuente    NUMERIC;
  v_nuevo_total_abonado   NUMERIC;
  v_valor_total_pagar     NUMERIC;
BEGIN
  -- ── Paso 1: Recalcular fuente_pago ──────────────────────
  -- NOTA: saldo_pendiente y porcentaje_completado son GENERATED ALWAYS
  --       → solo actualizamos monto_recibido; las demás se calculan solas.
  SELECT COALESCE(SUM(monto), 0)
    INTO v_nuevo_monto_recibido
    FROM abonos_historial
   WHERE fuente_pago_id = NEW.fuente_pago_id
     AND estado = 'Activo';                    -- ← solo activos

  UPDATE fuentes_pago
     SET monto_recibido      = v_nuevo_monto_recibido,
         fecha_actualizacion = NOW()
   WHERE id = NEW.fuente_pago_id;

  -- ── Paso 2: Recalcular negociación ──────────────────────
  SELECT COALESCE(SUM(ah.monto), 0)
    INTO v_nuevo_total_abonado
    FROM abonos_historial ah
    JOIN fuentes_pago fp ON fp.id = ah.fuente_pago_id
   WHERE fp.negociacion_id = NEW.negociacion_id
     AND ah.estado = 'Activo';                 -- ← solo activos

  SELECT valor_total_pagar
    INTO v_valor_total_pagar
    FROM negociaciones
   WHERE id = NEW.negociacion_id;

  UPDATE negociaciones
     SET total_abonado       = v_nuevo_total_abonado,
         saldo_pendiente     = GREATEST(COALESCE(v_valor_total_pagar, 0) - v_nuevo_total_abonado, 0),
         porcentaje_pagado   = CASE
           WHEN COALESCE(v_valor_total_pagar, 0) > 0
           THEN ROUND((v_nuevo_total_abonado / v_valor_total_pagar) * 100, 2)
           ELSE 0
         END,
         fecha_actualizacion = NOW()
   WHERE id = NEW.negociacion_id;

  RETURN NEW;
END;
$$;

-- Trigger: solo se dispara cuando estado cambia de 'Activo' → 'Anulado'
DROP TRIGGER IF EXISTS trg_recalcular_saldos_anulacion ON abonos_historial;

CREATE TRIGGER trg_recalcular_saldos_anulacion
  AFTER UPDATE OF estado
  ON abonos_historial
  FOR EACH ROW
  WHEN (OLD.estado = 'Activo' AND NEW.estado = 'Anulado')
  EXECUTE FUNCTION fn_recalcular_saldos_tras_anulacion();

-- ─────────────────────────────────────────────────────────────
-- 4. ACTUALIZAR VISTA vista_abonos_completos
-- ─────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS vista_abonos_completos;

CREATE VIEW vista_abonos_completos AS
SELECT
  -- Campos del abono
  ah.id,
  ah.numero_recibo,
  ah.monto,
  ah.fecha_abono,
  ah.metodo_pago,
  ah.numero_referencia,
  ah.comprobante_url,
  ah.notas,
  ah.usuario_registro,
  ah.fecha_creacion,
  ah.fecha_actualizacion,
  -- Nuevos campos de anulación
  ah.estado,
  ah.motivo_categoria,
  ah.motivo_detalle,
  ah.anulado_por_id,
  ah.anulado_por_nombre,
  ah.fecha_anulacion,
  -- Negociación
  ah.negociacion_id,
  n.estado                     AS negociacion_estado,
  -- Fuente de pago
  ah.fuente_pago_id,
  fp.tipo                      AS fuente_pago_tipo,
  -- Cliente
  c.id                         AS cliente_id,
  c.nombres                    AS cliente_nombres,
  c.apellidos                  AS cliente_apellidos,
  c.numero_documento           AS cliente_numero_documento,
  -- Vivienda
  v.id                         AS vivienda_id,
  v.numero                     AS vivienda_numero,
  -- Manzana
  m.id                         AS manzana_id,
  m.nombre                     AS manzana_nombre,
  -- Proyecto
  p.id                         AS proyecto_id,
  p.nombre                     AS proyecto_nombre
FROM abonos_historial ah
JOIN fuentes_pago      fp ON fp.id             = ah.fuente_pago_id
JOIN negociaciones     n  ON n.id              = fp.negociacion_id
JOIN clientes          c  ON c.id              = n.cliente_id
JOIN viviendas         v  ON v.id              = n.vivienda_id
JOIN manzanas          m  ON m.id              = v.manzana_id
JOIN proyectos         p  ON p.id              = m.proyecto_id;

-- ─────────────────────────────────────────────────────────────
-- 5. POLÍTICAS RLS
-- ─────────────────────────────────────────────────────────────

-- Habilitar RLS si no estaba habilitado
ALTER TABLE abonos_historial ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes que puedan colisionar
DROP POLICY IF EXISTS "abonos_select_estado" ON abonos_historial;
DROP POLICY IF EXISTS "abonos_update_anular_admin" ON abonos_historial;

-- SELECT: activos para todos autenticados; anulados solo para admin
CREATE POLICY "abonos_select_estado"
  ON abonos_historial
  FOR SELECT
  TO authenticated
  USING (
    estado = 'Activo'
    OR (
      estado = 'Anulado'
      AND (auth.jwt() ->> 'user_rol') = 'Administrador'
    )
  );

-- INSERT: cualquier usuario autenticado puede registrar abonos
CREATE POLICY "abonos_insert_authenticated"
  ON abonos_historial
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE para anular: solo admin (aplicado sobre filas en estado Activo)
CREATE POLICY "abonos_update_anular_admin"
  ON abonos_historial
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_rol') = 'Administrador'
    AND estado = 'Activo'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_rol') = 'Administrador'
    AND estado = 'Anulado'
  );

-- ─────────────────────────────────────────────────────────────
-- Fin de migración 023
-- ─────────────────────────────────────────────────────────────
