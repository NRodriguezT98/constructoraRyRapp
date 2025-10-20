-- =====================================================
-- ¿QUÉ TABLAS DE INTERESES EXISTEN?
-- =====================================================

-- Ver todas las tablas que contienen "interes"
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%interes%'
ORDER BY table_name;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Si ves "intereses_clientes" = Tabla del SQL que acabamos de crear
-- Si ves "cliente_intereses" = Tabla antigua del sistema anterior
-- Si ves ambas = Hay duplicación, decidir cuál usar
-- =====================================================
