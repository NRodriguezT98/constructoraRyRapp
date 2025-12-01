-- ============================================
-- CATEGORÍAS POR DEFECTO PARA MÓDULO VIVIENDAS
-- ============================================
-- Descripción: Crea categorías base para gestión documental de viviendas
-- Autor: Sistema
-- Fecha: 2025-11-20

-- Función para crear categorías por defecto si no existen
CREATE OR REPLACE FUNCTION crear_categorias_viviendas_default(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_count INT;
BEGIN
  -- Verificar si ya existen categorías para este usuario en módulo viviendas
  SELECT COUNT(*) INTO v_count
  FROM categorias_documento
  WHERE user_id = p_user_id
    AND 'viviendas' = ANY(modulos_permitidos);

  -- Si no hay categorías, crear las predeterminadas
  IF v_count = 0 THEN
    INSERT INTO categorias_documento (user_id, nombre, descripcion, color, icono, modulos_permitidos, es_global, orden)
    VALUES
      -- 1. Certificados
      (p_user_id, 'Certificados', 'Certificados de tradición y libertad, certificados de dominio', '#3B82F6', 'file-badge', ARRAY['viviendas'], true, 1),

      -- 2. Documentos Legales
      (p_user_id, 'Documentos Legales', 'Boletas fiscales, paz y salvos', '#8B5CF6', 'scale', ARRAY['viviendas'], true, 2),

      -- 3. Documentos Técnicos
      (p_user_id, 'Documentos Técnicos', 'Planos, diseños, memorias de cálculo', '#10B981', 'drafting-compass', ARRAY['viviendas'], true, 3),

      -- 4. Facturas y Pagos
      (p_user_id, 'Facturas y Pagos', 'Facturas prediales, comprobantes de pago, recibos', '#F59E0B', 'receipt', ARRAY['viviendas'], true, 4),

      -- 5. Fotos de la vivienda
      (p_user_id, 'Fotos de la vivienda', 'Fotografías del inmueble, estado actual, entregas', '#EC4899', 'camera', ARRAY['viviendas'], true, 5),

      -- 6. Otros Documentos
      (p_user_id, 'Otros Documentos', 'Documentos generales y varios', '#6B7280', 'folder', ARRAY['viviendas'], true, 6);

    RAISE NOTICE 'Categorías por defecto creadas para viviendas - usuario %', p_user_id;
  ELSE
    RAISE NOTICE 'El usuario % ya tiene categorías para viviendas', p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION crear_categorias_viviendas_default(UUID) IS
'Crea categorías predeterminadas para módulo viviendas si el usuario no tiene ninguna';
