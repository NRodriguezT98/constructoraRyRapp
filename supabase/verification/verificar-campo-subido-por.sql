-- ============================================
-- VERIFICACIÓN: Campo subido_por en documentos_proyecto
-- ============================================

-- Ver tipo de dato actual
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'documentos_proyecto'
  AND column_name = 'subido_por';

-- Ver si existe foreign key
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'documentos_proyecto'
  AND kcu.column_name = 'subido_por';

-- Ver algunos registros de ejemplo
SELECT
  id,
  titulo,
  subido_por,
  fecha_creacion
FROM documentos_proyecto
LIMIT 5;
