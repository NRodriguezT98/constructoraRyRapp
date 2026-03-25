-- =====================================================
-- MIGRACIÓN 037: Backfill usuario_registro con nombre completo + rol
-- =====================================================
-- Paso anterior (036) dejó emails en usuario_registro.
-- Esta migración los reemplaza con "Nombres Apellidos (Rol)"
-- consultando la tabla usuarios por email.
-- El RPC también se actualiza para guardar nombre+rol desde ahora.
-- =====================================================

-- Paso 1: Backfill usuario_registro (email → nombre + rol)
UPDATE renuncias r
SET usuario_registro = u.nombres || ' ' || u.apellidos || ' (' || u.rol || ')'
FROM usuarios u
WHERE r.usuario_registro = u.email;

-- Paso 2: Backfill usuario_cierre (email → nombre + rol)
UPDATE renuncias r
SET usuario_cierre = u.nombres || ' ' || u.apellidos || ' (' || u.rol || ')'
FROM usuarios u
WHERE r.usuario_cierre IS NOT NULL
  AND r.usuario_cierre = u.email;
