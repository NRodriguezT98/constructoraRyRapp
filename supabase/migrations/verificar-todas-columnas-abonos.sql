-- Verificar columnas REALES de todas las tablas relacionadas
SELECT
  'clientes' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Separador
SELECT '---' as separador;

SELECT
  'fuentes_pago' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fuentes_pago'
  AND table_schema = 'public'
ORDER BY ordinal_position;
