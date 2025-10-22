-- =====================================================
-- PRUEBA: Registrar primer abono en el sistema
-- =====================================================
-- Usa la negociación que creaste: 9092999d-a902-48f6-a9a9-061c6a4dc132
-- =====================================================

-- 1️⃣ Ver las fuentes de pago de tu negociación
SELECT
  fp.id,
  fp.tipo,
  fp.monto_aprobado,
  fp.monto_recibido,
  fp.saldo_pendiente,
  fp.porcentaje_completado,
  fp.entidad,
  fp.numero_referencia
FROM fuentes_pago fp
WHERE fp.negociacion_id = '9092999d-a902-48f6-a9a9-061c6a4dc132'
ORDER BY fp.tipo;

-- 2️⃣ Registrar un abono de $10.000.000 a la Cuota Inicial
-- REEMPLAZA [id-fuente-cuota-inicial] con el ID real de la Cuota Inicial
INSERT INTO abonos_historial (
  negociacion_id,
  fuente_pago_id,
  monto,
  fecha_abono,
  metodo_pago,
  numero_referencia,
  notas
) VALUES (
  '9092999d-a902-48f6-a9a9-061c6a4dc132',
  '[id-fuente-cuota-inicial]', -- Reemplaza con el ID real
  10000000, -- $10.000.000
  NOW(),
  'Transferencia',
  'TRX-TEST-001',
  'Primer abono de prueba - Cuota Inicial'
) RETURNING *;

-- 3️⃣ Verificar que monto_recibido se actualizó AUTOMÁTICAMENTE
SELECT
  fp.tipo,
  fp.monto_aprobado,
  fp.monto_recibido, -- Debe mostrar 10000000
  fp.saldo_pendiente, -- Debe mostrar 12000000 (22M - 10M)
  fp.porcentaje_completado -- Debe mostrar ~45.45%
FROM fuentes_pago fp
WHERE fp.negociacion_id = '9092999d-a902-48f6-a9a9-061c6a4dc132'
  AND fp.tipo = 'Cuota Inicial';

-- 4️⃣ Ver historial de abonos
SELECT
  id,
  monto,
  fecha_abono,
  metodo_pago,
  numero_referencia,
  notas,
  fecha_creacion
FROM abonos_historial
WHERE negociacion_id = '9092999d-a902-48f6-a9a9-061c6a4dc132'
ORDER BY fecha_abono DESC;

-- 5️⃣ Ver totales de la negociación
SELECT
  n.valor_total,
  n.monto_recibido_total, -- Se actualiza automáticamente
  n.saldo_pendiente_total, -- Se calcula automáticamente
  n.porcentaje_completado -- Se calcula automáticamente
FROM negociaciones n
WHERE n.id = '9092999d-a902-48f6-a9a9-061c6a4dc132';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Abono insertado correctamente
-- ✅ monto_recibido: 10.000.000 (actualizado AUTOMÁTICAMENTE)
-- ✅ saldo_pendiente: 12.000.000 (calculado AUTOMÁTICAMENTE)
-- ✅ porcentaje_completado: ~45% (calculado AUTOMÁTICAMENTE)
-- ✅ Historial muestra el abono registrado
-- ✅ CERO intervención manual - TODO automático 🎉
-- =====================================================

-- =====================================================
-- PRUEBA DE VALIDACIÓN: Intentar exceder el saldo
-- =====================================================
-- Este query debe FALLAR con error de validación
/*
INSERT INTO abonos_historial (
  negociacion_id,
  fuente_pago_id,
  monto,
  fecha_abono,
  metodo_pago
) VALUES (
  '9092999d-a902-48f6-a9a9-061c6a4dc132',
  '[id-fuente-cuota-inicial]',
  20000000, -- $20M excede el saldo de $12M restante
  NOW(),
  'Efectivo'
);
-- ERROR ESPERADO: "El abono excede el saldo pendiente..."
*/
