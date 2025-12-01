-- 🔍 DIAGNÓSTICO COMPLETO: ¿Por qué no se ven documentos eliminados de clientes?

-- Test 1: ¿Qué usuario está autenticado?
DO $$
DECLARE
  current_user_id uuid;
  current_email text;
BEGIN
  current_user_id := auth.uid();
  current_email := auth.email();

  RAISE NOTICE '🔑 Usuario autenticado: % (%)', current_email, current_user_id;
END $$;

-- Test 2: ¿Ese usuario existe en tabla usuarios?
DO $$
DECLARE
  user_rec RECORD;
BEGIN
  SELECT id, email, nombres, rol
  INTO user_rec
  FROM usuarios
  WHERE id = auth.uid();

  IF FOUND THEN
    RAISE NOTICE '👤 Usuario en tabla: % - Rol: %', user_rec.nombres, user_rec.rol;
  ELSE
    RAISE NOTICE '❌ Usuario NO existe en tabla usuarios';
  END IF;
END $$;

-- Test 3: ¿La policy de admin funciona?
DO $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  ) INTO is_admin;

  RAISE NOTICE '🔐 ¿Es Admin según policy?: %', is_admin;
END $$;

-- Test 4: ¿Cuántos documentos eliminados hay?
DO $$
DECLARE
  total_docs integer;
BEGIN
  SELECT COUNT(*)
  INTO total_docs
  FROM documentos_cliente
  WHERE estado = 'Eliminado'
    AND es_version_actual = true;

  RAISE NOTICE '📄 Total documentos eliminados: %', total_docs;
END $$;

-- Test 5: Ver documentos eliminados (bypass RLS)
SELECT
  '📋 Documento ' || id::text as info,
  titulo,
  subido_por,
  estado
FROM documentos_cliente
WHERE estado = 'Eliminado'
  AND es_version_actual = true
LIMIT 5;
