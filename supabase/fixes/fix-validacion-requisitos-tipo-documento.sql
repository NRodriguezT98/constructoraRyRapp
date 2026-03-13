-- ============================================
-- CORRECCIÓN: Funciones de validación (fix campo tipo_documento)
-- ============================================
--
-- Problema: documentos_cliente NO tiene columna tipo_documento
-- Solución: Buscar en titulo o metadata->>'tipo_documento'
--
-- Fecha: 2025-12-12
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
    (COUNT(*) FILTER (WHERE es_obligatorio = true AND documento_existe = false)) = 0 AS cumple_requisitos,
    (COUNT(*) FILTER (WHERE es_obligatorio = true AND documento_existe = false)) = 0 AS puede_continuar,
    COUNT(*)::INT AS total_requisitos,
    COUNT(*) FILTER (WHERE documento_existe = true)::INT AS requisitos_completados,
    COUNT(*) FILTER (WHERE es_obligatorio = true AND documento_existe = false)::INT AS obligatorios_faltantes,
    COUNT(*) FILTER (WHERE es_obligatorio = false AND documento_existe = false)::INT AS opcionales_faltantes,
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
-- ✅ VERIFICACIÓN
-- ============================================

SELECT '✅ Función validar_requisitos_desembolso actualizada' AS status;
