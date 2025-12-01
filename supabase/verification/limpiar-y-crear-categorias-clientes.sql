-- Limpiar y recrear categorías de clientes
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obtener el primer usuario
  SELECT id INTO v_user_id
  FROM auth.users
  LIMIT 1;

  -- Eliminar categorías existentes de clientes para este usuario
  DELETE FROM categorias_documento
  WHERE user_id = v_user_id
    AND 'clientes' = ANY(modulos_permitidos);

  RAISE NOTICE 'Categorías antiguas eliminadas';

  -- Crear las nuevas categorías
  PERFORM crear_categorias_clientes_default(v_user_id);

  RAISE NOTICE 'Categorías nuevas creadas para usuario: %', v_user_id;
END $$;

-- Verificar resultado
SELECT
  id,
  nombre,
  descripcion,
  color,
  icono,
  orden
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
ORDER BY orden;
