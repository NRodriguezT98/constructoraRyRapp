-- =====================================================
-- CREAR CATEGORÍA: Cartas de Aprobación (si no existe)
-- =====================================================
-- Fecha: 2025-12-01
-- Descripción: Crea la categoría global "Cartas de Aprobación" para el sistema de documentos pendientes

-- Verificar si existe y crearla si no
DO $$
DECLARE
  v_categoria_id UUID := '4898e798-c188-4f02-bfcf-b2b15be48e34';
  v_count INT;
  v_user_id UUID;
BEGIN
  -- Contar categorías existentes con ese nombre
  SELECT COUNT(*) INTO v_count
  FROM categorias_documento
  WHERE nombre = 'Cartas de Aprobación';

  IF v_count = 0 THEN
    -- Obtener el primer usuario del sistema
    SELECT id INTO v_user_id
    FROM auth.users
    LIMIT 1;

    -- Crear categoría global
    INSERT INTO categorias_documento (
      id,
      user_id,
      nombre,
      descripcion,
      color,
      icono,
      modulos_permitidos,
      es_global,
      orden
    ) VALUES (
      v_categoria_id,
      v_user_id,
      'Cartas de Aprobación',
      'Cartas de aprobación de créditos hipotecarios, subsidios y otras fuentes de financiamiento',
      '#F59E0B', -- Naranja/ámbar
      'file-check',
      ARRAY['clientes'],
      true,
      10
    );

    RAISE NOTICE '✅ Categoría "Cartas de Aprobación" creada con ID %', v_categoria_id;
  ELSE
    RAISE NOTICE '✅ Categoría "Cartas de Aprobación" ya existe';
  END IF;
END $$;

-- Verificar resultado
SELECT
  id,
  nombre,
  color,
  es_global,
  modulos_permitidos
FROM categorias_documento
WHERE nombre = 'Cartas de Aprobación';
