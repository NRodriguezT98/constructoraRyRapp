-- ============================================
-- MIGRACIÓN: Asignar documentos existentes a carpetas
-- ============================================
-- Fecha: 2024-11-07
-- Descripción: Migrar documentos_vivienda existentes a las carpetas
--              correspondientes según su categoría

-- ============================================
-- FUNCIÓN: Migrar documentos a carpetas
-- ============================================
CREATE OR REPLACE FUNCTION migrar_documentos_a_carpetas()
RETURNS TABLE (
  vivienda_id UUID,
  documentos_migrados INTEGER,
  documentos_sin_carpeta INTEGER
) AS $$
DECLARE
  v_vivienda RECORD;
  v_total_migrados INTEGER := 0;
  v_total_sin_carpeta INTEGER := 0;
BEGIN
  -- Iterar sobre cada vivienda que tenga documentos
  FOR v_vivienda IN
    SELECT DISTINCT dv.vivienda_id
    FROM documentos_vivienda dv
    WHERE dv.carpeta_id IS NULL
  LOOP
    -- Documentos Legales → Escrituras
    UPDATE documentos_vivienda dv
    SET carpeta_id = (
      SELECT c.id
      FROM carpetas_documentos_viviendas c
      WHERE c.vivienda_id = v_vivienda.vivienda_id
      AND c.nombre = 'Escrituras'
      LIMIT 1
    )
    WHERE dv.vivienda_id = v_vivienda.vivienda_id
    AND dv.carpeta_id IS NULL
    AND dv.categoria_id IN (
      SELECT id FROM categorias_documento
      WHERE nombre ILIKE '%escritura%'
    );

    -- Documentos Legales → Certificados (Certificado de Tradición)
    UPDATE documentos_vivienda dv
    SET carpeta_id = (
      SELECT c.id
      FROM carpetas_documentos_viviendas c
      WHERE c.vivienda_id = v_vivienda.vivienda_id
      AND c.nombre = 'Certificados'
      LIMIT 1
    )
    WHERE dv.vivienda_id = v_vivienda.vivienda_id
    AND dv.carpeta_id IS NULL
    AND (
      dv.categoria_id IN (
        SELECT id FROM categorias_documento
        WHERE nombre ILIKE '%certificado%' OR nombre ILIKE '%tradición%'
      )
      OR dv.titulo ILIKE '%certificado%'
      OR dv.titulo ILIKE '%tradición%'
    );

    -- Documentos Legales → Permisos
    UPDATE documentos_vivienda dv
    SET carpeta_id = (
      SELECT c.id
      FROM carpetas_documentos_viviendas c
      WHERE c.vivienda_id = v_vivienda.vivienda_id
      AND c.nombre = 'Permisos'
      LIMIT 1
    )
    WHERE dv.vivienda_id = v_vivienda.vivienda_id
    AND dv.carpeta_id IS NULL
    AND dv.categoria_id IN (
      SELECT id FROM categorias_documento
      WHERE nombre ILIKE '%permiso%' OR nombre ILIKE '%licencia%'
    );

    -- Documentos Técnicos → Planos
    UPDATE documentos_vivienda dv
    SET carpeta_id = (
      SELECT c.id
      FROM carpetas_documentos_viviendas c
      WHERE c.vivienda_id = v_vivienda.vivienda_id
      AND c.nombre = 'Planos'
      LIMIT 1
    )
    WHERE dv.vivienda_id = v_vivienda.vivienda_id
    AND dv.carpeta_id IS NULL
    AND (
      dv.categoria_id IN (
        SELECT id FROM categorias_documento
        WHERE nombre ILIKE '%plano%'
      )
      OR dv.titulo ILIKE '%plano%'
    );

    -- Documentos Técnicos → Especificaciones
    UPDATE documentos_vivienda dv
    SET carpeta_id = (
      SELECT c.id
      FROM carpetas_documentos_viviendas c
      WHERE c.vivienda_id = v_vivienda.vivienda_id
      AND c.nombre = 'Especificaciones'
      LIMIT 1
    )
    WHERE dv.vivienda_id = v_vivienda.vivienda_id
    AND dv.carpeta_id IS NULL
    AND dv.categoria_id IN (
      SELECT id FROM categorias_documento
      WHERE nombre ILIKE '%especificación%' OR nombre ILIKE '%técnica%'
    );

    -- Fotografías → Avance Obra
    UPDATE documentos_vivienda dv
    SET carpeta_id = (
      SELECT c.id
      FROM carpetas_documentos_viviendas c
      WHERE c.vivienda_id = v_vivienda.vivienda_id
      AND c.nombre = 'Avance Obra'
      LIMIT 1
    )
    WHERE dv.vivienda_id = v_vivienda.vivienda_id
    AND dv.carpeta_id IS NULL
    AND (
      dv.categoria_id IN (
        SELECT id FROM categorias_documento
        WHERE nombre ILIKE '%fotografía%' OR nombre ILIKE '%foto%' OR nombre ILIKE '%avance%'
      )
      OR dv.titulo ILIKE '%avance%'
      OR dv.titulo ILIKE '%obra%'
      OR dv.nombre_original ILIKE '%.jpg' OR dv.nombre_original ILIKE '%.png' OR dv.nombre_original ILIKE '%.jpeg'
    );

    -- Documentos Financieros → Contratos
    UPDATE documentos_vivienda dv
    SET carpeta_id = (
      SELECT c.id
      FROM carpetas_documentos_viviendas c
      WHERE c.vivienda_id = v_vivienda.vivienda_id
      AND c.nombre = 'Contratos'
      LIMIT 1
    )
    WHERE dv.vivienda_id = v_vivienda.vivienda_id
    AND dv.carpeta_id IS NULL
    AND (
      dv.categoria_id IN (
        SELECT id FROM categorias_documento
        WHERE nombre ILIKE '%contrato%'
      )
      OR dv.titulo ILIKE '%contrato%'
    );

    -- Documentos Financieros → Presupuestos
    UPDATE documentos_vivienda dv
    SET carpeta_id = (
      SELECT c.id
      FROM carpetas_documentos_viviendas c
      WHERE c.vivienda_id = v_vivienda.vivienda_id
      AND c.nombre = 'Presupuestos'
      LIMIT 1
    )
    WHERE dv.vivienda_id = v_vivienda.vivienda_id
    AND dv.carpeta_id IS NULL
    AND (
      dv.categoria_id IN (
        SELECT id FROM categorias_documento
        WHERE nombre ILIKE '%presupuesto%' OR nombre ILIKE '%financier%'
      )
      OR dv.titulo ILIKE '%presupuesto%'
    );

    -- Resto de documentos legales → Carpeta raíz "Documentos Legales"
    UPDATE documentos_vivienda dv
    SET carpeta_id = (
      SELECT c.id
      FROM carpetas_documentos_viviendas c
      WHERE c.vivienda_id = v_vivienda.vivienda_id
      AND c.nombre = 'Documentos Legales'
      AND c.carpeta_padre_id IS NULL
      LIMIT 1
    )
    WHERE dv.vivienda_id = v_vivienda.vivienda_id
    AND dv.carpeta_id IS NULL
    AND dv.categoria_id IN (
      SELECT id FROM categorias_documento
      WHERE nombre ILIKE '%legal%' OR nombre ILIKE '%documento%'
    );

    -- Contar resultados para esta vivienda
    SELECT
      COUNT(*) FILTER (WHERE carpeta_id IS NOT NULL),
      COUNT(*) FILTER (WHERE carpeta_id IS NULL)
    INTO v_total_migrados, v_total_sin_carpeta
    FROM documentos_vivienda
    WHERE documentos_vivienda.vivienda_id = v_vivienda.vivienda_id;

    -- Retornar resultado de esta vivienda
    RETURN QUERY SELECT
      v_vivienda.vivienda_id,
      v_total_migrados,
      v_total_sin_carpeta;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON FUNCTION migrar_documentos_a_carpetas() IS
'Migra documentos existentes a carpetas basándose en su categoría.
Retorna estadísticas por vivienda: documentos migrados vs sin carpeta';

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================
-- Para ejecutar la migración:
-- SELECT * FROM migrar_documentos_a_carpetas();

-- Para verificar documentos sin carpeta después:
-- SELECT vivienda_id, COUNT(*) as sin_carpeta
-- FROM documentos_vivienda
-- WHERE carpeta_id IS NULL
-- GROUP BY vivienda_id;
