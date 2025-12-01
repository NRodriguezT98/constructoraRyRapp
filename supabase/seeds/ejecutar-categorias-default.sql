-- ============================================
-- EJECUTAR CREACIÓN DE CATEGORÍAS POR DEFECTO
-- ============================================
-- Descripción: Llama a las funciones para crear categorías para todos los módulos
-- Fecha: 2025-11-24 (Actualizado)

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
    -- Llamar a las funciones para crear categorías de todos los módulos
    PERFORM crear_categorias_proyectos_default(v_user_id);
    PERFORM crear_categorias_viviendas_default(v_user_id);
    PERFORM crear_categorias_clientes_default(v_user_id);

    RAISE NOTICE '✅ Categorías creadas para todos los módulos - usuario: %', v_user_id;
  ELSE
    RAISE NOTICE '⚠️ No se encontró ningún usuario en la base de datos';
  END IF;
END $$;

-- Verificar categorías creadas por módulo
-- PROYECTOS
SELECT
  'PROYECTOS' as modulo,
  nombre,
  color,
  icono,
  orden
FROM categorias_documento
WHERE 'proyectos' = ANY(modulos_permitidos)
ORDER BY orden;

-- VIVIENDAS
SELECT
  'VIVIENDAS' as modulo,
  nombre,
  color,
  icono,
  orden
FROM categorias_documento
WHERE 'viviendas' = ANY(modulos_permitidos)
ORDER BY orden;

-- CLIENTES
SELECT
  'CLIENTES' as modulo,
  nombre,
  color,
  icono,
  orden
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
ORDER BY orden;
