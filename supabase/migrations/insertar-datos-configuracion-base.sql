-- ============================================
-- 📝 INSERTAR DATOS DE CONFIGURACIÓN BASE
-- ============================================
-- Fecha: 2025-10-22
-- Propósito: Insertar configuraciones esenciales del sistema
-- ⚠️ Ejecutar DESPUÉS de limpiar la base de datos
-- ============================================

-- Insertar configuración de recargos por defecto
INSERT INTO public.configuracion_recargos (tipo, nombre, valor, descripcion, activo) VALUES
  ('gastos_notariales', 'Gastos Notariales', 5000000, 'Gastos de escrituración y registro', true)
ON CONFLICT DO NOTHING;

-- Verificar inserción
DO $$
DECLARE
  total_configs INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_configs FROM configuracion_recargos;

  RAISE NOTICE '';
  RAISE NOTICE '✅ CONFIGURACIÓN BASE INSERTADA';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 Total de configuraciones: %', total_configs;
  RAISE NOTICE '';

  IF total_configs > 0 THEN
    RAISE NOTICE '✨ Sistema listo para operar';
  ELSE
    RAISE WARNING '⚠️ No se insertaron configuraciones. Revisa manualmente.';
  END IF;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '⏰ Finalizado: %', NOW();
END $$;
