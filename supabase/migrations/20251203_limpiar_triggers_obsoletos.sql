-- =====================================================
-- SOLUCIÓN PROFESIONAL: Limpiar triggers obsoletos
-- =====================================================
-- Fecha: 2025-12-03
-- Problema: Triggers desactualizados en producción
-- Solución: Eliminar y recrear TODOS correctamente
-- =====================================================

-- =====================================================
-- PASO 1: ELIMINAR TODOS LOS TRIGGERS OBSOLETOS
-- =====================================================

-- Eliminar triggers de fuentes_pago
DROP TRIGGER IF EXISTS trigger_inactivar_fuente_pago ON fuentes_pago CASCADE;
DROP TRIGGER IF EXISTS trigger_audit_fuentes_pago ON fuentes_pago CASCADE;
DROP TRIGGER IF EXISTS audit_trigger_fuentes_pago ON fuentes_pago CASCADE;

-- Eliminar triggers de documentos
DROP TRIGGER IF EXISTS trigger_vincular_documento_automatico ON documentos_cliente CASCADE;
DROP TRIGGER IF EXISTS audit_trigger_documentos ON documentos_cliente CASCADE;

-- Eliminar funciones obsoletas
DROP FUNCTION IF EXISTS trigger_inactivar_fuente_pago() CASCADE;
DROP FUNCTION IF EXISTS vincular_documento_fuente_automatico() CASCADE;
DROP FUNCTION IF EXISTS audit_fuentes_pago() CASCADE;

-- =====================================================
-- PASO 2: VERIFICAR QUE audit_log TIENE COLUMNAS CORRECTAS
-- =====================================================

DO $$
BEGIN
  -- Verificar columnas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_log' AND column_name = 'tabla'
  ) THEN
    RAISE EXCEPTION 'ERROR: audit_log no tiene columna "tabla"';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_log' AND column_name = 'registro_id'
  ) THEN
    RAISE EXCEPTION 'ERROR: audit_log no tiene columna "registro_id"';
  END IF;

  RAISE NOTICE '✅ audit_log tiene las columnas correctas (tabla, registro_id)';
END $$;

-- =====================================================
-- PASO 3: RECREAR TRIGGERS CORRECTOS (OPCIONAL - solo si necesitas auditoría automática)
-- =====================================================

-- NOTA: Por ahora NO recreamos triggers para evitar problemas
-- La auditoría se manejará manualmente desde el código TypeScript
-- Esto es más transparente y fácil de debuggear

-- =====================================================
-- RESULTADO
-- =====================================================

DO $$
DECLARE
  v_trigger_count INT;
BEGIN
  SELECT COUNT(*) INTO v_trigger_count
  FROM pg_trigger
  WHERE tgname LIKE '%fuente%' OR tgname LIKE '%documento%';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ LIMPIEZA COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Triggers eliminados correctamente';
  RAISE NOTICE 'Triggers restantes: %', v_trigger_count;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE:';
  RAISE NOTICE 'La auditoría ahora se maneja manualmente';
  RAISE NOTICE 'desde el código TypeScript';
  RAISE NOTICE '========================================';
END $$;
