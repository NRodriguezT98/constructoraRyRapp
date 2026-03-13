-- ============================================
-- VERIFICACIÓN: Estado Post-Fix
-- ============================================

-- 1. Estado actual del cliente Pedrito
SELECT
  '👤 CLIENTE PEDRITO' as tipo,
  nombres,
  apellidos,
  numero_documento,
  estado as estado_actual,
  CASE
    WHEN estado = 'Activo' THEN '⚠️ TODAVÍA ACTIVO - Ejecutar desvinculación'
    WHEN estado = 'Renunció' THEN '✅ CORRECTO - Estado actualizado'
    ELSE '🔸 Estado: ' || estado
  END as resultado
FROM clientes
WHERE numero_documento = '1233333';

-- 2. Estado de la vivienda Casa 5, Manzana A
SELECT
  '🏠 VIVIENDA CASA 5' as tipo,
  v.numero,
  m.nombre as manzana,
  v.estado,
  v.cliente_id,
  v.negociacion_id,
  CASE
    WHEN v.estado = 'Disponible' AND v.cliente_id IS NULL AND v.negociacion_id IS NULL
    THEN '✅ DISPONIBLE SIN VÍNCULOS'
    ELSE '⚠️ AÚN VINCULADA'
  END as resultado
FROM viviendas v
INNER JOIN manzanas m ON v.manzana_id = m.id
WHERE v.numero = '5' AND m.nombre = 'Manzana A';

-- 3. Verificar que existe el estado "Renunció" en el sistema
SELECT
  '📊 CHECK CONSTRAINT' as tipo,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'clientes_estado_check';
