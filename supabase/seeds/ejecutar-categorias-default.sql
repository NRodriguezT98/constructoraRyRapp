-- ============================================
-- EJECUTAR CREACIÓN DE CATEGORÍAS POR DEFECTO
-- ============================================
-- Descripción: Llama a la función para crear categorías para todos los usuarios
-- Fecha: 2025-11-10

-- Obtener el ID del usuario actual (primer usuario en la tabla)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obtener el primer usuario (o puedes especificar el UUID directamente)
  SELECT id INTO v_user_id
  FROM auth.users
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Llamar a la función para crear categorías
    PERFORM crear_categorias_proyectos_default(v_user_id);
    RAISE NOTICE 'Categorías creadas para usuario: %', v_user_id;
  ELSE
    RAISE NOTICE 'No se encontró ningún usuario en la base de datos';
  END IF;
END $$;

-- Verificar categorías creadas
SELECT
  id,
  nombre,
  descripcion,
  color,
  icono,
  modulos_permitidos,
  orden
FROM categorias_documento
WHERE 'proyectos' = ANY(modulos_permitidos)
ORDER BY orden;
