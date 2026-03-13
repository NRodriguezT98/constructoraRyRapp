-- =====================================================
-- MIGRACIÓN: Desactivar trigger automático de snapshots
-- =====================================================
-- Fecha: 2025-12-03
-- Problema: Duplicación de versiones en historial
-- Causa: trigger_snapshot_cambio_fuente + servicio manual crean 2 snapshots por edición
-- Solución: Desactivar trigger, mantener solo creación manual con motivo de usuario
-- =====================================================

-- 1. Verificar trigger actual
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICANDO TRIGGER ACTUAL ===';

  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_snapshot_cambio_fuente'
    AND tgrelid = 'fuentes_pago'::regclass
  ) THEN
    RAISE NOTICE '✓ Trigger encontrado: trigger_snapshot_cambio_fuente';
  ELSE
    RAISE NOTICE '⚠ Trigger NO encontrado';
  END IF;
END $$;

-- 2. Desactivar el trigger (NO eliminarlo por si se necesita reactivar)
DROP TRIGGER IF EXISTS trigger_snapshot_cambio_fuente ON fuentes_pago;

-- 3. Comentar la función para documentar por qué se desactivó
COMMENT ON FUNCTION crear_snapshot_por_cambio_fuente() IS
'DESACTIVADO: Causaba duplicación de versiones.
Ahora solo se crean snapshots manualmente desde negociaciones.service.ts
con motivo de usuario explícito y resumen estructurado.
Trigger desactivado el 2025-12-03 para evitar duplicados tipo fuente_modificada.';

-- 4. Verificar desactivación
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== RESULTADO ===';

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_snapshot_cambio_fuente'
    AND tgrelid = 'fuentes_pago'::regclass
  ) THEN
    RAISE NOTICE '✓ Trigger desactivado correctamente';
    RAISE NOTICE '✓ Ahora solo se crearán snapshots desde el servicio (con motivo de usuario)';
  ELSE
    RAISE NOTICE '⚠ El trigger aún está activo';
  END IF;
END $$;

-- 5. Mostrar triggers restantes en fuentes_pago
SELECT
  '=== TRIGGERS ACTIVOS EN fuentes_pago ===' as info,
  tgname as trigger_name,
  tgenabled as enabled,
  CASE tgtype::integer & 66
    WHEN 2 THEN 'BEFORE'
    WHEN 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as timing,
  CASE tgtype::integer & cast(28 as int2)
    WHEN 4 THEN 'INSERT'
    WHEN 8 THEN 'DELETE'
    WHEN 16 THEN 'UPDATE'
    WHEN 12 THEN 'INSERT OR DELETE'
    WHEN 20 THEN 'INSERT OR UPDATE'
    WHEN 24 THEN 'DELETE OR UPDATE'
    WHEN 28 THEN 'INSERT OR UPDATE OR DELETE'
  END as events
FROM pg_trigger
WHERE tgrelid = 'fuentes_pago'::regclass
  AND tgname NOT LIKE 'RI_ConstraintTrigger%'
ORDER BY tgname;
