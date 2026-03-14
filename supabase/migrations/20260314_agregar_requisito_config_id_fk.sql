-- =====================================================================
-- MIGRACIÓN: FK requisito_config_id en documentos_cliente
-- =====================================================================
-- Objetivos:
--   1. Agregar FK requisito_config_id (UUID) → elimina string-matching
--   2. CHECK constraint en estado → previene regresión de case silenciosa
--   3. Reconstruir vista usando UUID en lugar de string match
--
-- Impacto:
--   - Docs existentes: requisito_config_id = NULL (no rompe nada)
--   - Futuros docs subidos desde el banner: FK se guarda → vista los encuentra
--   - Docs subidos manualmente: FK NULL → NO eliminan pendiente (correcto)
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 1. FK COLUMN
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE documentos_cliente
  ADD COLUMN IF NOT EXISTS requisito_config_id uuid
  REFERENCES requisitos_fuentes_pago_config(id) ON DELETE SET NULL;

-- Índice parcial solo para filas con FK (no NULL) → sin overhead en resto
CREATE INDEX IF NOT EXISTS idx_documentos_cliente_requisito_config
  ON documentos_cliente (requisito_config_id)
  WHERE requisito_config_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────
-- 2. CHECK CONSTRAINT en estado
-- Asegurarnos de que no existan valores fuera del dominio antes de agregar
-- ─────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_invalidos integer;
BEGIN
  SELECT COUNT(*)
    INTO v_invalidos
    FROM documentos_cliente
   WHERE estado NOT IN ('activo', 'inactivo', 'obsoleto');

  IF v_invalidos > 0 THEN
    RAISE WARNING 'CHECK constraint NO agregada: existen % filas con estado fuera del dominio.
    Valores actuales: %',
      v_invalidos,
      (SELECT string_agg(DISTINCT estado, ', ') FROM documentos_cliente
        WHERE estado NOT IN ('activo', 'inactivo', 'obsoleto'));
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
       WHERE table_name = 'documentos_cliente'
         AND constraint_name = 'chk_estado_documentos_cliente'
    ) THEN
      ALTER TABLE documentos_cliente
        ADD CONSTRAINT chk_estado_documentos_cliente
        CHECK (estado IN ('activo', 'inactivo', 'obsoleto'));

      RAISE NOTICE '✅ CHECK constraint chk_estado_documentos_cliente agregada.';
    ELSE
      RAISE NOTICE 'ℹ️  CHECK constraint ya existe — sin cambios.';
    END IF;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────
-- 3. VISTA: reemplaza string-match por UUID match
-- ─────────────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS vista_documentos_pendientes_fuentes CASCADE;

CREATE OR REPLACE VIEW vista_documentos_pendientes_fuentes AS

-- ==============================================================
-- Branch 1: Documentos ESPECÍFICOS — uno por fuente
-- ==============================================================
SELECT
  fp.id                               AS fuente_pago_id,
  n.cliente_id,
  rfc.id                              AS requisito_config_id,
  rfc.titulo                          AS tipo_documento,
  rfc.tipo_documento_sugerido         AS tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden,
  rfc.descripcion,
  rfc.alcance,
  fp.tipo                             AS tipo_fuente,
  fp.entidad,
  fp.monto_aprobado,
  rfc.fuentes_aplicables,
  jsonb_build_object(
    'tipo_fuente',            fp.tipo,
    'entidad_fuente',         COALESCE(fp.entidad, ''),
    'monto_aprobado',         fp.monto_aprobado,
    'nivel_validacion',       rfc.nivel_validacion,
    'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
    'requisito_config_id',    rfc.id,
    'alcance',                rfc.alcance
  )                                   AS metadata,
  'Pendiente'                         AS estado,
  CASE
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL'    THEN 'Media'
    ELSE 'Baja'
  END                                 AS prioridad,
  fp.fecha_creacion,
  NOW()                               AS fecha_calculo

FROM fuentes_pago fp
JOIN negociaciones n
  ON n.id = fp.negociacion_id
JOIN requisitos_fuentes_pago_config rfc
  ON  rfc.tipo_fuente       = fp.tipo
  AND rfc.activo            = true
  AND rfc.alcance           = 'ESPECIFICO_FUENTE'
  AND rfc.nivel_validacion  IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
LEFT JOIN documentos_cliente dc
  ON  dc.fuente_pago_relacionada = fp.id
  AND dc.requisito_config_id     = rfc.id   -- ✅ UUID match: exacto, no frágil
  AND dc.estado                  = 'activo' -- ✅ minúscula (CHECK constraint lo garantiza)
  AND dc.cliente_id              = n.cliente_id
WHERE fp.estado = 'Activa'
  AND dc.id IS NULL

UNION ALL

-- ==============================================================
-- Branch 2: Documentos COMPARTIDOS — uno por cliente
-- ==============================================================
SELECT DISTINCT ON (clientes_con_fuentes.cliente_id, rfc.id)
  NULL::UUID                          AS fuente_pago_id,
  clientes_con_fuentes.cliente_id,
  rfc.id                              AS requisito_config_id,
  rfc.titulo                          AS tipo_documento,
  rfc.tipo_documento_sugerido         AS tipo_documento_sistema,
  rfc.nivel_validacion,
  rfc.orden,
  rfc.descripcion,
  rfc.alcance,
  'Compartido'                        AS tipo_fuente,
  'General'                           AS entidad,
  NULL::NUMERIC                       AS monto_aprobado,
  rfc.fuentes_aplicables,
  jsonb_build_object(
    'tipo_fuente',            'Compartido',
    'entidad_fuente',         'General',
    'monto_aprobado',         NULL,
    'nivel_validacion',       rfc.nivel_validacion,
    'tipo_documento_sistema', COALESCE(rfc.tipo_documento_sugerido, rfc.titulo),
    'requisito_config_id',    rfc.id,
    'alcance',                rfc.alcance,
    'fuentes_aplicables',     rfc.fuentes_aplicables
  )                                   AS metadata,
  'Pendiente'                         AS estado,
  CASE
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
    WHEN rfc.nivel_validacion = 'DOCUMENTO_OPCIONAL'    THEN 'Media'
    ELSE 'Baja'
  END                                 AS prioridad,
  NOW()                               AS fecha_creacion,
  NOW()                               AS fecha_calculo

FROM (
  SELECT DISTINCT n.cliente_id
  FROM fuentes_pago fp
  JOIN negociaciones n ON n.id = fp.negociacion_id
  WHERE fp.estado = 'Activa'
) clientes_con_fuentes

JOIN requisitos_fuentes_pago_config rfc
  ON (
    rfc.fuentes_aplicables IS NULL
    OR rfc.fuentes_aplicables = '{}'
    OR EXISTS (
      SELECT 1
      FROM fuentes_pago fp2
      JOIN negociaciones n2 ON n2.id = fp2.negociacion_id
      WHERE n2.cliente_id = clientes_con_fuentes.cliente_id
        AND fp2.estado    = 'Activa'
        AND fp2.tipo      = ANY(rfc.fuentes_aplicables)
    )
  )

LEFT JOIN documentos_cliente dc
  ON  dc.cliente_id          = clientes_con_fuentes.cliente_id
  AND dc.requisito_config_id = rfc.id   -- ✅ UUID match: exacto, no frágil
  AND dc.estado              = 'activo' -- ✅ minúscula (CHECK constraint lo garantiza)

WHERE rfc.activo           = true
  AND rfc.alcance          = 'COMPARTIDO_CLIENTE'
  AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
  AND dc.id IS NULL

ORDER BY prioridad DESC, tipo_documento;

-- ─────────────────────────────────────────────────────────────────────
-- 4. VERIFICACIÓN
-- ─────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Verificar que la columna existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'documentos_cliente'
       AND column_name = 'requisito_config_id'
  ) THEN
    RAISE NOTICE '✅ Columna requisito_config_id presente en documentos_cliente.';
  ELSE
    RAISE EXCEPTION '❌ Columna requisito_config_id NO encontrada.';
  END IF;

  -- Verificar que la vista existe
  IF EXISTS (
    SELECT 1 FROM information_schema.views
     WHERE table_name = 'vista_documentos_pendientes_fuentes'
  ) THEN
    RAISE NOTICE '✅ Vista vista_documentos_pendientes_fuentes reconstruida correctamente.';
  ELSE
    RAISE EXCEPTION '❌ Vista no encontrada.';
  END IF;

  RAISE NOTICE '✅ Migración 20260314 completada.';
END $$;
