-- 🔍 VERIFICAR USUARIO ADMINISTRADOR ACTUAL
-- Verifica el usuario autenticado y su rol

-- 1. Información del usuario actual (auth.uid())
SELECT
  auth.uid() as "🔑 UUID Autenticado",
  auth.email() as "📧 Email Autenticado";

-- 2. Información del usuario en tabla usuarios
SELECT
  id as "🆔 ID Usuario",
  email as "📧 Email",
  nombres as "👤 Nombres",
  rol as "🎭 Rol"
FROM usuarios
WHERE id = auth.uid();

-- 3. Verificar si el subquery de la policy funciona
SELECT
  EXISTS (
    SELECT 1
    FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  ) as "🔐 ¿Es Administrador? (Policy Check)";

-- 4. Listar TODAS las policies activas de documentos_cliente
SELECT
  schemaname as "Schema",
  tablename as "Tabla",
  policyname as "📋 Policy",
  permissive as "Permisivo",
  roles as "Roles",
  cmd as "Comando",
  qual as "🔍 Condición"
FROM pg_policies
WHERE tablename = 'documentos_cliente'
ORDER BY policyname;

-- 5. Verificar documentos que DEBERÍAN ser visibles
SELECT
  id,
  titulo,
  estado,
  es_version_actual,
  subido_por,
  fecha_actualizacion
FROM documentos_cliente
WHERE estado = 'Eliminado'
  AND es_version_actual = true;
