-- Verificar y ejecutar función de categorías de clientes
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obtener primer usuario
  SELECT id INTO v_user_id
  FROM auth.users
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Ejecutar función para crear categorías
    PERFORM crear_categorias_clientes_default(v_user_id);
    RAISE NOTICE '✅ Función ejecutada para usuario: %', v_user_id;
  END IF;
END $$;

-- Mostrar categorías creadas
SELECT
  nombre,
  descripcion,
  color,
  icono,
  orden
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
ORDER BY orden;
