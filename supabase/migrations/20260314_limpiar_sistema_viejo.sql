-- =====================================================
-- MIGRACIÓN: Eliminar sistema viejo (pasos_fuente_pago + documentos_pendientes)
-- Fecha: 2026-03-14
-- Objetivo: Limpiar completamente el sistema antiguo y dejar solo el nuevo
--           (vista_documentos_pendientes_fuentes + requisitos_fuentes_pago_config)
-- =====================================================

-- =====================================================
-- PASO 1: Eliminar triggers del sistema viejo en fuentes_pago
-- =====================================================

DROP TRIGGER IF EXISTS trigger_crear_documento_pendiente ON fuentes_pago;
DROP TRIGGER IF EXISTS trigger_limpiar_pendientes_fuente ON fuentes_pago;

-- =====================================================
-- PASO 2: Eliminar funciones del sistema viejo
-- =====================================================

DROP FUNCTION IF EXISTS crear_documento_pendiente_automatico() CASCADE;
DROP FUNCTION IF EXISTS limpiar_pendientes_fuente() CASCADE;
DROP FUNCTION IF EXISTS validar_requisitos_desembolso(UUID) CASCADE;

-- También eliminar la función de validación si existe con otro nombre
DROP FUNCTION IF EXISTS validar_pre_desembolso(UUID) CASCADE;
DROP FUNCTION IF EXISTS calcular_progreso_fuente_pago(UUID) CASCADE;
DROP FUNCTION IF EXISTS obtener_pasos_fuente_pago(UUID) CASCADE;

-- =====================================================
-- PASO 3: Eliminar tablas del sistema viejo
-- (CASCADE elimina dependencias automáticamente)
-- =====================================================

DROP TABLE IF EXISTS pasos_fuente_pago CASCADE;
DROP TABLE IF EXISTS documentos_pendientes CASCADE;

-- =====================================================
-- PASO 4: Eliminar columna obsoleta carta_aprobacion_url
-- (Los documentos ahora viven en documentos_proyecto)
-- =====================================================

ALTER TABLE fuentes_pago DROP COLUMN IF EXISTS carta_aprobacion_url CASCADE;

-- =====================================================
-- PASO 5: Limpiar cualquier tipo ENUM obsoleto
-- =====================================================

DROP TYPE IF EXISTS tipo_nivel_validacion CASCADE;
DROP TYPE IF EXISTS estado_paso_fuente CASCADE;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
BEGIN
  -- Verificar que las tablas viejas ya no existen
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pasos_fuente_pago') THEN
    RAISE EXCEPTION 'ERROR: Tabla pasos_fuente_pago aún existe';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documentos_pendientes') THEN
    RAISE EXCEPTION 'ERROR: Tabla documentos_pendientes aún existe';
  END IF;

  -- Verificar que la vista nueva existe
  IF NOT EXISTS (SELECT FROM information_schema.views WHERE table_name = 'vista_documentos_pendientes_fuentes') THEN
    RAISE EXCEPTION 'ERROR: Vista vista_documentos_pendientes_fuentes no existe';
  END IF;

  RAISE NOTICE '✅ Limpieza completada: sistema viejo eliminado, sistema nuevo verificado';
END $$;
