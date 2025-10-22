-- =====================================================
-- 📊 VERIFICACIÓN RÁPIDA DE TABLA ESPECÍFICA
-- =====================================================
--
-- USA ESTE SCRIPT para verificar UNA tabla a la vez
-- Es más simple y funciona perfecto en Supabase
--
-- INSTRUCCIONES:
-- 1. Reemplaza 'clientes' con el nombre de la tabla que quieres verificar
-- 2. Ejecuta en Supabase SQL Editor
-- 3. Copia los resultados
-- 4. Repite para cada tabla
--
-- =====================================================

-- ⚠️ CAMBIA 'clientes' por la tabla que quieres verificar
SELECT
  ordinal_position as "#",
  column_name as "COLUMNA",
  data_type as "TIPO",
  CASE
    WHEN character_maximum_length IS NOT NULL
    THEN data_type || '(' || character_maximum_length || ')'
    WHEN numeric_precision IS NOT NULL
    THEN data_type || '(' || numeric_precision || ',' || numeric_scale || ')'
    ELSE data_type
  END as "TIPO_COMPLETO",
  CASE
    WHEN is_nullable = 'YES' THEN '✅ Opcional'
    ELSE '❌ Obligatorio'
  END as "NULLABLE",
  COALESCE(column_default, '') as "DEFAULT"
FROM information_schema.columns
WHERE table_name = 'clientes'  -- ⬅️ CAMBIA AQUÍ EL NOMBRE DE LA TABLA
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- TABLAS PARA VERIFICAR:
-- =====================================================
-- Ejecuta este script cambiando el nombre para cada tabla:
--
-- 1. clientes
-- 2. proyectos
-- 3. manzanas
-- 4. viviendas
-- 5. negociaciones
-- 6. fuentes_pago
-- 7. abonos_historial
-- 8. renuncias
-- 9. documentos
-- 10. categorias_documentos
--
-- =====================================================
