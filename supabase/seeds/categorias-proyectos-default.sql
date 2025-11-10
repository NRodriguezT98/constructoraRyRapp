-- ============================================
-- CATEGORÍAS POR DEFECTO PARA MÓDULO PROYECTOS
-- ============================================
-- Descripción: Crea categorías base para gestión documental de proyectos
-- Autor: Sistema
-- Fecha: 2025-11-10

-- Función para crear categorías por defecto si no existen
CREATE OR REPLACE FUNCTION crear_categorias_proyectos_default(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_count INT;
BEGIN
  -- Verificar si ya existen categorías para este usuario en módulo proyectos
  SELECT COUNT(*) INTO v_count
  FROM categorias_documento
  WHERE user_id = p_user_id
    AND 'proyectos' = ANY(modulos_permitidos);

  -- Si no hay categorías, crear las predeterminadas
  IF v_count = 0 THEN
    INSERT INTO categorias_documento (user_id, nombre, descripcion, color, icono, modulos_permitidos, es_global, orden)
    VALUES
      -- 1. Permisos y Licencias
      (p_user_id, 'Permisos y Licencias', 'Licencias de construcción, urbanismo y certificados oficiales', '#3B82F6', 'shield-check', ARRAY['proyectos'], true, 1),

      -- 2. Documentos Legales
      (p_user_id, 'Documentos Legales', 'Boletas fiscales, matrículas, paz y salvos', '#8B5CF6', 'scale', ARRAY['proyectos'], true, 2),

      -- 3. Documentos Técnicos
      (p_user_id, 'Documentos Técnicos', 'Planos, diseños, memorias de cálculo', '#10B981', 'drafting-compass', ARRAY['proyectos'], true, 3),

      -- 4. Facturas y Pagos
      (p_user_id, 'Facturas y Pagos', 'Facturas prediales, comprobantes de pago, recibos', '#F59E0B', 'receipt', ARRAY['proyectos'], true, 4),

      -- 5. Otros Documentos
      (p_user_id, 'Otros Documentos', 'Documentos generales y varios', '#6B7280', 'folder', ARRAY['proyectos'], true, 5);

    RAISE NOTICE 'Categorías por defecto creadas para usuario %', p_user_id;
  ELSE
    RAISE NOTICE 'El usuario % ya tiene categorías para proyectos', p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION crear_categorias_proyectos_default(UUID) IS
'Crea categorías predeterminadas para módulo proyectos si el usuario no tiene ninguna';
