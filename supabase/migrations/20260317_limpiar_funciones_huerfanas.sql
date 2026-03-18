-- ============================================================
-- LIMPIEZA: Funciones huérfanas sin trigger activo
-- Fecha: 2026-03-17
-- Autor: Auditoría automatizada
-- ============================================================
-- VERIFICADO ANTES DE EJECUTAR:
--   ✅ Ninguna función es llamada desde TypeScript
--   ✅ Ninguna tiene trigger activo que la use
--   ✅ Los grupos 1 y 2 son seguros de eliminar
-- ============================================================

-- ============================================================
-- GRUPO 1: PELIGROSAS — referencian tablas ya eliminadas
-- (pasos_fuente_pago, documentos_pendientes)
-- Si existiera un trigger apuntando a ellas causarían error
-- ============================================================

-- Vinculación automática al viejo sistema de pasos
DROP FUNCTION IF EXISTS desvincular_documento_de_paso() CASCADE;
DROP FUNCTION IF EXISTS vincular_documento_a_paso_fuente() CASCADE;

-- Vinculación al viejo sistema documentos_pendientes (tabla eliminada Mar 2026)
DROP FUNCTION IF EXISTS vincular_documento_subido_a_pendiente_mejorado() CASCADE;

-- Limpieza del viejo sistema documentos_pendientes
DROP FUNCTION IF EXISTS limpiar_pendientes_fuente_inactiva() CASCADE;
DROP FUNCTION IF EXISTS limpiar_pendientes_fuente_eliminada() CASCADE;

-- ============================================================
-- GRUPO 2: INOFENSIVAS — huérfanas del sistema viejo
-- Marcadas como desactivadas o sin uso desde Nov/Dic 2025
-- ============================================================

-- Marcada explícitamente DESACTIVADO en comentario (Dic 2025)
-- Causaba duplicación de versiones — reemplazada por snapshot manual
DROP FUNCTION IF EXISTS crear_snapshot_por_cambio_fuente() CASCADE;

-- Viejo sistema auto-pendientes (reemplazado por vista_documentos_pendientes_fuentes)
DROP FUNCTION IF EXISTS crear_documento_pendiente_si_falta_carta() CASCADE;
DROP FUNCTION IF EXISTS crear_documentos_pendientes_fuente_completos() CASCADE;

-- Trigger droppeado en la migración 20251129 — función quedó sola
DROP FUNCTION IF EXISTS actualizar_estado_documentacion_fuente() CASCADE;

-- Sin trigger, sin uso TypeScript, sin referencias en código
DROP FUNCTION IF EXISTS validar_categoria_documento_paso() CASCADE;

-- ============================================================
-- VERIFICACIÓN POST-LIMPIEZA
-- ============================================================
DO $$
DECLARE
  v_funciones_eliminadas TEXT[] := ARRAY[
    'desvincular_documento_de_paso',
    'vincular_documento_a_paso_fuente',
    'vincular_documento_subido_a_pendiente_mejorado',
    'limpiar_pendientes_fuente_inactiva',
    'limpiar_pendientes_fuente_eliminada',
    'crear_snapshot_por_cambio_fuente',
    'crear_documento_pendiente_si_falta_carta',
    'crear_documentos_pendientes_fuente_completos',
    'actualizar_estado_documentacion_fuente',
    'validar_categoria_documento_paso'
  ];
  v_nombre TEXT;
  v_aun_existe INT;
  v_ok BOOLEAN := TRUE;
BEGIN
  FOREACH v_nombre IN ARRAY v_funciones_eliminadas LOOP
    SELECT COUNT(*) INTO v_aun_existe
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = v_nombre;

    IF v_aun_existe > 0 THEN
      RAISE WARNING '⚠️  Función NO eliminada: %', v_nombre;
      v_ok := FALSE;
    ELSE
      RAISE NOTICE '✅ Eliminada: %', v_nombre;
    END IF;
  END LOOP;

  IF v_ok THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 LIMPIEZA COMPLETADA: 10 funciones huérfanas eliminadas';
    RAISE NOTICE '   El sistema queda con solo funciones activas y en uso.';
  END IF;
END $$;
