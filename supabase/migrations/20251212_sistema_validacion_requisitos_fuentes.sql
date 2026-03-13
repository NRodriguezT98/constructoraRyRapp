-- ============================================
-- SISTEMA DE VALIDACIÓN DE REQUISITOS POR FUENTE DE PAGO
-- ============================================
--
-- Estrategia: Validación Just-in-Time (no intrusiva)
-- - Carta de Aprobación: Se valida al crear fuente (genera pendiente)
-- - Boleta de Registro: Se valida al intentar desembolso (lazy)
-- - Solicitud Desembolso: Se valida al intentar desembolso (opcional)
--
-- Fecha: 2025-12-12
-- Versión: 1.0.0
-- ============================================

-- ============================================
-- 1. TABLA DE CONFIGURACIÓN DE REQUISITOS
-- ============================================

CREATE TABLE IF NOT EXISTS fuentes_pago_requisitos_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_fuente TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  es_obligatorio BOOLEAN DEFAULT true,
  orden INT DEFAULT 0,
  se_valida_en TEXT DEFAULT 'desembolso', -- 'creacion' | 'desembolso'
  descripcion TEXT,
  icono TEXT, -- Nombre del ícono Lucide
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tipo_fuente, tipo_documento)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_requisitos_tipo_fuente
  ON fuentes_pago_requisitos_config(tipo_fuente);

CREATE INDEX IF NOT EXISTS idx_requisitos_validacion
  ON fuentes_pago_requisitos_config(se_valida_en);

-- ============================================
-- 2. DATOS MAESTROS (CONFIGURACIÓN)
-- ============================================

INSERT INTO fuentes_pago_requisitos_config
  (tipo_fuente, tipo_documento, es_obligatorio, orden, se_valida_en, descripcion, icono)
VALUES
  -- CRÉDITO HIPOTECARIO
  (
    'Crédito Hipotecario',
    'Carta de Aprobación',
    true,
    1,
    'creacion',
    'Carta de aprobación emitida por la entidad bancaria',
    'FileCheck'
  ),
  (
    'Crédito Hipotecario',
    'Boleta de Registro',
    true,
    2,
    'desembolso',
    'Boleta de registro de escritura pública ante notaría',
    'FileSignature'
  ),
  (
    'Crédito Hipotecario',
    'Solicitud Desembolso',
    false,
    3,
    'desembolso',
    'Formato de solicitud de desembolso del banco (opcional según entidad)',
    'Send'
  ),

  -- SUBSIDIO MI CASA YA
  (
    'Subsidio Mi Casa Ya',
    'Carta de Aprobación',
    true,
    1,
    'creacion',
    'Carta de aprobación del Ministerio de Vivienda',
    'FileCheck'
  ),
  (
    'Subsidio Mi Casa Ya',
    'Boleta de Registro',
    true,
    2,
    'desembolso',
    'Boleta de registro de escritura pública',
    'FileSignature'
  ),
  (
    'Subsidio Mi Casa Ya',
    'Solicitud Desembolso',
    false,
    3,
    'desembolso',
    'Formato de solicitud de desembolso (opcional)',
    'Send'
  ),

  -- SUBSIDIO CAJA COMPENSACIÓN
  (
    'Subsidio Caja Compensación',
    'Carta de Aprobación',
    true,
    1,
    'creacion',
    'Carta de aprobación de la caja de compensación',
    'FileCheck'
  ),
  (
    'Subsidio Caja Compensación',
    'Boleta de Registro',
    true,
    2,
    'desembolso',
    'Boleta de registro de escritura pública',
    'FileSignature'
  ),
  (
    'Subsidio Caja Compensación',
    'Solicitud Desembolso',
    false,
    3,
    'desembolso',
    'Formato de solicitud de desembolso (opcional)',
    'Send'
  )
ON CONFLICT (tipo_fuente, tipo_documento) DO UPDATE
SET
  es_obligatorio = EXCLUDED.es_obligatorio,
  orden = EXCLUDED.orden,
  se_valida_en = EXCLUDED.se_valida_en,
  descripcion = EXCLUDED.descripcion,
  icono = EXCLUDED.icono,
  updated_at = NOW();

-- ============================================
-- 3. FUNCIÓN: VALIDAR REQUISITOS PARA DESEMBOLSO
-- ============================================

CREATE OR REPLACE FUNCTION validar_requisitos_desembolso(p_fuente_pago_id UUID)
RETURNS TABLE(
  cumple_requisitos BOOLEAN,
  puede_continuar BOOLEAN,
  total_requisitos INT,
  requisitos_completados INT,
  obligatorios_faltantes INT,
  opcionales_faltantes INT,
  documentos_faltantes JSONB,
  documentos_completados JSONB
) AS $$
DECLARE
  v_tipo_fuente TEXT;
  v_cliente_id UUID;
BEGIN
  -- Obtener tipo de fuente y cliente
  SELECT fp.tipo, n.cliente_id
  INTO v_tipo_fuente, v_cliente_id
  FROM fuentes_pago fp
  JOIN negociaciones n ON fp.negociacion_id = n.id
  WHERE fp.id = p_fuente_pago_id;

  -- Si no se encuentra la fuente, retornar valores por defecto
  IF v_tipo_fuente IS NULL THEN
    RETURN QUERY
    SELECT
      false::BOOLEAN,
      false::BOOLEAN,
      0::INT,
      0::INT,
      0::INT,
      0::INT,
      '[]'::JSONB,
      '[]'::JSONB;
    RETURN;
  END IF;

  RETURN QUERY
  WITH requisitos_info AS (
    SELECT
      req.tipo_documento,
      req.es_obligatorio,
      req.orden,
      req.descripcion,
      req.icono,
      EXISTS(
        SELECT 1 FROM documentos_cliente d
        WHERE d.cliente_id = v_cliente_id
          AND (
            d.titulo ILIKE '%' || req.tipo_documento || '%'
            OR d.metadata->>'tipo_documento' = req.tipo_documento
          )
          AND (d.metadata->>'fuente_pago_id')::uuid = p_fuente_pago_id
          AND d.url_storage IS NOT NULL
      ) AS documento_existe,
      (
        SELECT jsonb_build_object(
          'id', d.id,
          'titulo', d.titulo,
          'fecha_documento', d.fecha_documento,
          'url_storage', d.url_storage
        )
        FROM documentos_cliente d
        WHERE d.cliente_id = v_cliente_id
          AND (
            d.titulo ILIKE '%' || req.tipo_documento || '%'
            OR d.metadata->>'tipo_documento' = req.tipo_documento
          )
          AND (d.metadata->>'fuente_pago_id')::uuid = p_fuente_pago_id
          AND d.url_storage IS NOT NULL
        LIMIT 1
      ) AS documento_info
    FROM fuentes_pago_requisitos_config req
    WHERE req.tipo_fuente = v_tipo_fuente
      AND req.se_valida_en = 'desembolso'
    ORDER BY req.orden
  )
  SELECT
    -- Cumple requisitos: NO hay obligatorios faltantes
    (COUNT(*) FILTER (WHERE es_obligatorio = true AND documento_existe = false)) = 0 AS cumple_requisitos,

    -- Puede continuar: mismo que cumple_requisitos (no bloquear por opcionales)
    (COUNT(*) FILTER (WHERE es_obligatorio = true AND documento_existe = false)) = 0 AS puede_continuar,

    -- Total de requisitos
    COUNT(*)::INT AS total_requisitos,

    -- Requisitos completados
    COUNT(*) FILTER (WHERE documento_existe = true)::INT AS requisitos_completados,

    -- Obligatorios faltantes
    COUNT(*) FILTER (WHERE es_obligatorio = true AND documento_existe = false)::INT AS obligatorios_faltantes,

    -- Opcionales faltantes
    COUNT(*) FILTER (WHERE es_obligatorio = false AND documento_existe = false)::INT AS opcionales_faltantes,

    -- Lista de documentos faltantes
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'tipo_documento', tipo_documento,
          'es_obligatorio', es_obligatorio,
          'orden', orden,
          'descripcion', descripcion,
          'icono', icono
        ) ORDER BY orden
      ) FILTER (WHERE documento_existe = false),
      '[]'::JSONB
    ) AS documentos_faltantes,

    -- Lista de documentos completados
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'tipo_documento', tipo_documento,
          'es_obligatorio', es_obligatorio,
          'orden', orden,
          'documento', documento_info
        ) ORDER BY orden
      ) FILTER (WHERE documento_existe = true),
      '[]'::JSONB
    ) AS documentos_completados
  FROM requisitos_info;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. FUNCIÓN: OBTENER ESTADO DE DOCUMENTACIÓN
-- ============================================

CREATE OR REPLACE FUNCTION obtener_estado_documentacion_fuente(p_fuente_pago_id UUID)
RETURNS TABLE(
  fuente_pago_id UUID,
  tipo_fuente TEXT,
  entidad TEXT,
  estado_general TEXT, -- 'completo' | 'advertencia' | 'bloqueado'
  progreso_porcentaje INT,
  validacion JSONB
) AS $$
DECLARE
  v_validacion RECORD;
BEGIN
  -- Obtener validación de requisitos
  SELECT * INTO v_validacion
  FROM validar_requisitos_desembolso(p_fuente_pago_id);

  RETURN QUERY
  SELECT
    fp.id AS fuente_pago_id,
    fp.tipo AS tipo_fuente,
    fp.entidad,
    CASE
      WHEN v_validacion.cumple_requisitos THEN 'completo'
      WHEN v_validacion.puede_continuar THEN 'advertencia'
      ELSE 'bloqueado'
    END AS estado_general,
    CASE
      WHEN v_validacion.total_requisitos > 0 THEN
        ROUND((v_validacion.requisitos_completados::NUMERIC / v_validacion.total_requisitos::NUMERIC) * 100)::INT
      ELSE 100
    END AS progreso_porcentaje,
    jsonb_build_object(
      'cumple_requisitos', v_validacion.cumple_requisitos,
      'puede_continuar', v_validacion.puede_continuar,
      'total_requisitos', v_validacion.total_requisitos,
      'requisitos_completados', v_validacion.requisitos_completados,
      'obligatorios_faltantes', v_validacion.obligatorios_faltantes,
      'opcionales_faltantes', v_validacion.opcionales_faltantes,
      'documentos_faltantes', v_validacion.documentos_faltantes,
      'documentos_completados', v_validacion.documentos_completados
    ) AS validacion
  FROM fuentes_pago fp
  WHERE fp.id = p_fuente_pago_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. RLS POLICIES (SEGURIDAD)
-- ============================================

-- Habilitar RLS
ALTER TABLE fuentes_pago_requisitos_config ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer requisitos"
  ON fuentes_pago_requisitos_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Solo admins pueden modificar configuración
CREATE POLICY "Solo admins pueden modificar requisitos"
  ON fuentes_pago_requisitos_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
        AND u.rol = 'Administrador'
    )
  );

-- ============================================
-- 6. COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE fuentes_pago_requisitos_config IS
'Catálogo de documentos requeridos por tipo de fuente de pago. Define validaciones just-in-time.';

COMMENT ON COLUMN fuentes_pago_requisitos_config.se_valida_en IS
'Momento de validación: creacion (genera pendiente inmediato) | desembolso (validación lazy)';

COMMENT ON FUNCTION validar_requisitos_desembolso IS
'Valida si una fuente de pago cumple con todos los requisitos obligatorios para permitir el desembolso';

COMMENT ON FUNCTION obtener_estado_documentacion_fuente IS
'Obtiene el estado general de documentación de una fuente con progreso y validación completa';

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================

-- Ver configuración insertada
SELECT
  tipo_fuente,
  COUNT(*) AS total_requisitos,
  COUNT(*) FILTER (WHERE es_obligatorio) AS obligatorios,
  COUNT(*) FILTER (WHERE NOT es_obligatorio) AS opcionales
FROM fuentes_pago_requisitos_config
GROUP BY tipo_fuente
ORDER BY tipo_fuente;

-- Ver estructura de funciones creadas
SELECT
  p.proname AS funcion,
  pg_get_function_result(p.oid) AS retorna,
  obj_description(p.oid, 'pg_proc') AS descripcion
FROM pg_proc p
WHERE p.proname IN (
  'validar_requisitos_desembolso',
  'obtener_estado_documentacion_fuente'
)
ORDER BY p.proname;

-- ============================================
-- 📋 RESULTADO ESPERADO:
-- ============================================
-- tipo_fuente                     | total_requisitos | obligatorios | opcionales
-- --------------------------------+------------------+--------------+------------
-- Crédito Hipotecario            | 3                | 2            | 1
-- Subsidio Caja Compensación     | 3                | 2            | 1
-- Subsidio Mi Casa Ya            | 3                | 2            | 1
-- ============================================
