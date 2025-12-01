-- Verificar si el usuario autenticado es reconocido como Administrador
SELECT
  auth.uid() as "Usuario Auth",
  u.id as "Usuario Tabla",
  u.email,
  u.nombres,
  u.rol,
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  ) as "Es Admin (Policy Check)"
FROM usuarios u
WHERE u.id = auth.uid();
