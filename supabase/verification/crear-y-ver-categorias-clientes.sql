-- Ejecutar la creación de categorías para tu usuario actual
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obtener el primer usuario (debería ser tu usuario)
  SELECT id INTO v_user_id
  FROM auth.users
  LIMIT 1;

  -- Ejecutar la función
  PERFORM crear_categorias_clientes_default(v_user_id);

  RAISE NOTICE 'Categorías creadas para usuario: %', v_user_id;
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
