-- =====================================================
-- Verificar FUNCIONES y TRIGGERS del sistema de abonos
-- =====================================================

-- 1️⃣ Ver TODAS las funciones relacionadas con abonos
SELECT
  routine_name,
  routine_type,
  CASE routine_name
    WHEN 'actualizar_monto_recibido_fuente' THEN '🔄 AUTO-ACTUALIZA monto_recibido (CRÍTICA)'
    WHEN 'validar_abono_no_excede_saldo' THEN '🛡️ Valida que abono no exceda saldo'
    WHEN 'update_abonos_historial_fecha_actualizacion' THEN '📅 Actualiza timestamp'
    ELSE '❓ Otra función'
  END as descripcion
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%abono%'
    OR routine_name = 'actualizar_monto_recibido_fuente'
  )
ORDER BY routine_name;

-- 2️⃣ Ver TODOS los triggers activos en abonos_historial
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'abonos_historial'
  AND trigger_schema = 'public'
ORDER BY trigger_name;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
--
-- FUNCIONES (debe haber 3):
-- ✅ actualizar_monto_recibido_fuente (LA MÁS CRÍTICA)
-- ✅ validar_abono_no_excede_saldo
-- ✅ update_abonos_historial_fecha_actualizacion
--
-- TRIGGERS (debe haber 3):
-- ✅ trigger_actualizar_monto_recibido (AFTER INSERT/UPDATE/DELETE)
-- ✅ trigger_validar_abono_no_excede_saldo (BEFORE INSERT/UPDATE)
-- ✅ trigger_update_abonos_historial_fecha_actualizacion (BEFORE UPDATE)
--
-- Si falta "actualizar_monto_recibido_fuente", hay que crearla manualmente
-- =====================================================
