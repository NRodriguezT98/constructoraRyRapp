-- =====================================================
-- SCRIPT: EXTRAER ESTRUCTURA COMPLETA DE BASE DE DATOS
-- =====================================================
-- Genera documentación completa de todas las tablas, columnas,
-- tipos de datos, constraints, foreign keys, índices, enums, etc.
-- =====================================================

-- =====================================================
-- TABLAS Y COLUMNAS DETALLADAS
-- =====================================================
SELECT
  '## 📋 TABLA: `' || c.table_name || '`' || E'\n' ||
  COALESCE(pgd.description, 'Sin descripción') || E'\n\n' ||
  '| Campo | Tipo | Nullable | Default | Descripción |' || E'\n' ||
  '|-------|------|----------|---------|-------------|' || E'\n' ||
  string_agg(
    '| `' || c.column_name || '` | ' ||
    c.data_type ||
    CASE
      WHEN c.character_maximum_length IS NOT NULL THEN '(' || c.character_maximum_length || ')'
      WHEN c.numeric_precision IS NOT NULL THEN '(' || c.numeric_precision ||
        CASE WHEN c.numeric_scale IS NOT NULL THEN ',' || c.numeric_scale ELSE '' END || ')'
      ELSE ''
    END || ' | ' ||
    CASE WHEN c.is_nullable = 'YES' THEN '✅' ELSE '❌ **Requerido**' END || ' | ' ||
    COALESCE('`' || c.column_default || '`', '-') || ' | ' ||
    COALESCE(col_desc.description, '-') || ' |',
    E'\n'
    ORDER BY c.ordinal_position
  ) || E'\n\n' ||
  '### 🔑 Constraints' || E'\n' ||
  COALESCE(
    (
      SELECT string_agg(
        '- **' || tc.constraint_type || '**: `' || tc.constraint_name || '`' ||
        CASE
          WHEN tc.constraint_type = 'FOREIGN KEY' THEN
            ' → `' || ccu.table_name || '.' || ccu.column_name || '`'
          ELSE ''
        END,
        E'\n'
      )
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = c.table_name
    ),
    'Sin constraints'
  ) || E'\n\n' ||
  '### 📊 Índices' || E'\n' ||
  COALESCE(
    (
      SELECT string_agg(
        '- `' || indexname || '`: ' || indexdef,
        E'\n'
      )
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = c.table_name
    ),
    'Sin índices personalizados'
  ) || E'\n\n' ||
  '---' || E'\n\n' as tabla_completa
FROM information_schema.columns c
LEFT JOIN pg_catalog.pg_statio_all_tables st
  ON c.table_schema = st.schemaname AND c.table_name = st.relname
LEFT JOIN pg_catalog.pg_description pgd
  ON pgd.objoid = st.relid AND pgd.objsubid = 0
LEFT JOIN pg_catalog.pg_description col_desc
  ON col_desc.objoid = st.relid AND col_desc.objsubid = c.ordinal_position
WHERE c.table_schema = 'public'
  AND c.table_name NOT LIKE 'pg_%'
  AND c.table_name NOT LIKE 'sql_%'
GROUP BY c.table_name, pgd.description
ORDER BY c.table_name;

-- =====================================================
-- ENUMS (TIPOS PERSONALIZADOS)
-- =====================================================
SELECT
  E'\n## 🎨 ENUMS (Tipos Personalizados)\n\n' ||
  string_agg(
    '### `' || t.typname || '`' || E'\n' ||
    'Valores permitidos:' || E'\n' ||
    (
      SELECT string_agg('- `' || e.enumlabel || '`', E'\n' ORDER BY e.enumsortorder)
      FROM pg_enum e
      WHERE e.enumtypid = t.oid
    ) || E'\n',
    E'\n'
  ) as enums
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
  AND t.typtype = 'e'
ORDER BY t.typname;

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================
SELECT
  E'\n## ⚙️ FUNCIONES Y TRIGGERS\n\n' ||
  string_agg(
    '### Función: `' || p.proname || '`' || E'\n' ||
    '```sql' || E'\n' ||
    pg_get_functiondef(p.oid) || E'\n' ||
    '```' || E'\n',
    E'\n'
  ) as funciones
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================
SELECT
  E'\n## 🔒 POLÍTICAS RLS (Row Level Security)\n\n' ||
  string_agg(
    '### Tabla: `' || schemaname || '.' || tablename || '`' || E'\n' ||
    '- **Política**: `' || policyname || '`' || E'\n' ||
    '- **Comando**: ' || cmd || E'\n' ||
    '- **Roles**: ' || COALESCE(roles::text, 'public') || E'\n' ||
    '- **USING**: `' || COALESCE(qual::text, '-') || '`' || E'\n' ||
    '- **WITH CHECK**: `' || COALESCE(with_check::text, '-') || '`' || E'\n',
    E'\n'
  ) as politicas_rls
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- ESTADÍSTICAS DE TABLAS
-- =====================================================
SELECT
  E'\n## 📊 ESTADÍSTICAS DE TABLAS\n\n' ||
  '| Tabla | Filas Aprox | Tamaño Tabla | Tamaño Índices | Total |' || E'\n' ||
  '|-------|-------------|--------------|----------------|-------|' || E'\n' ||
  string_agg(
    '| `' || schemaname || '.' || tablename || '` | ' ||
    COALESCE(n_live_tup::text, '0') || ' | ' ||
    pg_size_pretty(pg_table_size(schemaname || '.' || tablename)) || ' | ' ||
    pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) || ' | ' ||
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) || ' |',
    E'\n'
    ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
  ) as estadisticas
FROM pg_stat_user_tables
WHERE schemaname = 'public'
GROUP BY schemaname;

-- =====================================================
-- RELACIONES ENTRE TABLAS (FOREIGN KEYS)
-- =====================================================
SELECT
  E'\n## 🔗 RELACIONES ENTRE TABLAS\n\n' ||
  '```mermaid' || E'\n' ||
  'erDiagram' || E'\n' ||
  string_agg(
    '    ' || tc.table_name || ' ||--o{ ' || ccu.table_name || ' : "' || kcu.column_name || '"',
    E'\n'
  ) || E'\n' ||
  '```' || E'\n' as diagrama_relaciones
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
GROUP BY tc.table_schema;
