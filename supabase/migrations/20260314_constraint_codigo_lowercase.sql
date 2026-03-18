-- Migración: Constraint para que codigo sea siempre lowercase
--
-- Problema que previene:
--   UPDATE tipos_fuentes_pago SET ... WHERE codigo = 'SUBSIDIO_CAJA_COMPENSACION'
--   afecta 0 filas silenciosamente porque los códigos son minúsculas.
--
-- Con este CHECK, cualquier INSERT/UPDATE que intente guardar un código
-- con mayúsculas falla inmediatamente con un error claro.

-- 1. Sanitizar datos existentes (por si acaso)
UPDATE tipos_fuentes_pago
SET codigo = lower(codigo)
WHERE codigo != lower(codigo);

-- 2. Agregar constraint
ALTER TABLE tipos_fuentes_pago
ADD CONSTRAINT chk_codigo_lowercase
CHECK (codigo = lower(codigo));

COMMENT ON CONSTRAINT chk_codigo_lowercase ON tipos_fuentes_pago IS
'El código debe ser siempre snake_case minúsculas. Usar lower() antes de INSERT/UPDATE.';
