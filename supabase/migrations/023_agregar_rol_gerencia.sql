-- Agregar valor "Gerencia" al enum rol_usuario
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'Gerencia';

-- Verificar todos los valores
SELECT enumlabel as rol
FROM pg_enum
WHERE enumtypid = 'rol_usuario'::regtype::oid
ORDER BY enumsortorder;
