-- Verificar valores del enum rol_usuario
SELECT enumlabel as rol
FROM pg_enum
WHERE enumtypid = 'rol_usuario'::regtype::oid
ORDER BY enumsortorder;
