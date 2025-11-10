-- ============================================
-- MIGRACIÓN: Corregir campo subido_por en documentos_proyecto
-- ============================================
-- Fecha: 2025-11-10
-- Descripción:
--   1. Cambiar tipo de dato de varchar a uuid
--   2. Agregar foreign key a tabla usuarios
--   3. Crear índice para mejorar performance de JOINs
-- ============================================

BEGIN;

-- ============================================
-- 1. VERIFICAR Y LIMPIAR DATOS INCONSISTENTES
-- ============================================

-- Verificar si hay registros con subido_por que no sean UUID válidos
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM documentos_proyecto
  WHERE subido_por !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  IF invalid_count > 0 THEN
    RAISE WARNING 'Se encontraron % registros con subido_por inválido', invalid_count;
  END IF;
END $$;

-- ============================================
-- 2. CAMBIAR TIPO DE DATO A UUID
-- ============================================

DO $$
BEGIN
  -- Cambiar de character varying a uuid
  ALTER TABLE documentos_proyecto
    ALTER COLUMN subido_por TYPE uuid USING subido_por::uuid;

  RAISE NOTICE '✓ Tipo de dato cambiado de varchar a uuid';
END $$;

-- ============================================
-- 3. AGREGAR FOREIGN KEY A TABLA USUARIOS
-- ============================================

DO $$
BEGIN
  -- Agregar constraint de foreign key
  ALTER TABLE documentos_proyecto
    ADD CONSTRAINT fk_documentos_proyecto_subido_por
    FOREIGN KEY (subido_por)
    REFERENCES usuarios(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

  RAISE NOTICE '✓ Foreign key agregada: documentos_proyecto.subido_por -> usuarios.id';
END $$;

-- ============================================
-- 4. CREAR ÍNDICE PARA MEJORAR PERFORMANCE
-- ============================================

DO $$
BEGIN
  -- Índice para mejorar JOINs con usuarios
  CREATE INDEX IF NOT EXISTS idx_documentos_proyecto_subido_por
    ON documentos_proyecto(subido_por);

  RAISE NOTICE '✓ Índice creado para subido_por';
END $$;

-- ============================================
-- 5. VERIFICACIÓN POST-MIGRACIÓN
-- ============================================

-- Verificar que todos los subido_por existan en usuarios
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM documentos_proyecto dp
  LEFT JOIN usuarios u ON dp.subido_por = u.id
  WHERE u.id IS NULL;

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'ERROR: Se encontraron % documentos con usuarios inexistentes', orphan_count;
  ELSE
    RAISE NOTICE '✓ Verificación exitosa: Todos los documentos tienen usuarios válidos';
  END IF;
END $$;

COMMIT;

-- ============================================
-- 6. RESUMEN DE CAMBIOS
-- ============================================

SELECT
  '✅ MIGRACIÓN COMPLETADA' AS status,
  NOW() AS fecha_ejecucion,
  COUNT(*) AS total_documentos,
  COUNT(DISTINCT subido_por) AS total_usuarios_distintos
FROM documentos_proyecto;

-- Verificar foreign key creada
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
