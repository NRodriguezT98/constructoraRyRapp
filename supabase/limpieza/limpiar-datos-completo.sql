-- ============================================================
-- 🧹 LIMPIEZA TOTAL DE DATOS TRANSACCIONALES
-- ============================================================
-- Elimina TODOS los datos de negocio manteniendo la configuración
--
-- ✅ SE MANTIENE:
--    - usuarios, permisos_rol
--    - tipos_fuentes_pago, entidades_financieras
--    - categorias_documento
--    - configuración del sistema
--
-- ❌ SE ELIMINA:
--    - abonos_historial, cuotas_credito
--    - pasos_fuente_pago, fuentes_pago
--    - documentos_pendientes
--    - negociaciones_historial, negociaciones
--    - documentos_cliente, documentos_vivienda, documentos_proyecto
--    - intereses
--    - clientes
--    - viviendas, manzanas, proyectos
--    - audit_log
--
-- ⚠️  ORDEN: respeta foreign keys (hijos primero, padres después)
-- ============================================================

BEGIN;

-- 1. Abonos y cuotas (dependen de fuentes_pago y negociaciones)
TRUNCATE TABLE abonos_historial CASCADE;
RAISE NOTICE '✅ abonos_historial limpio';

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cuotas_credito' AND table_schema = 'public') THEN
    TRUNCATE TABLE cuotas_credito CASCADE;
    RAISE NOTICE '✅ cuotas_credito limpio';
  END IF;
END $$;

-- 2. Pasos de fuentes de pago
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pasos_fuente_pago' AND table_schema = 'public') THEN
    TRUNCATE TABLE pasos_fuente_pago CASCADE;
    RAISE NOTICE '✅ pasos_fuente_pago limpio';
  END IF;
END $$;

-- 3. Fuentes de pago (dependen de negociaciones)
TRUNCATE TABLE fuentes_pago CASCADE;
RAISE NOTICE '✅ fuentes_pago limpio';

-- 4. Documentos pendientes
TRUNCATE TABLE documentos_pendientes CASCADE;
RAISE NOTICE '✅ documentos_pendientes limpio';

-- 5. Historial de negociaciones
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'negociaciones_historial' AND table_schema = 'public') THEN
    TRUNCATE TABLE negociaciones_historial CASCADE;
    RAISE NOTICE '✅ negociaciones_historial limpio';
  END IF;
END $$;

-- 6. Negociaciones (dependen de clientes y viviendas)
TRUNCATE TABLE negociaciones CASCADE;
RAISE NOTICE '✅ negociaciones limpio';

-- 7. Documentos de todos los módulos
TRUNCATE TABLE documentos_cliente CASCADE;
RAISE NOTICE '✅ documentos_cliente limpio';

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documentos_vivienda' AND table_schema = 'public') THEN
    TRUNCATE TABLE documentos_vivienda CASCADE;
    RAISE NOTICE '✅ documentos_vivienda limpio';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documentos_proyecto' AND table_schema = 'public') THEN
    TRUNCATE TABLE documentos_proyecto CASCADE;
    RAISE NOTICE '✅ documentos_proyecto limpio';
  END IF;
END $$;

-- 8. Intereses de clientes
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intereses' AND table_schema = 'public') THEN
    TRUNCATE TABLE intereses CASCADE;
    RAISE NOTICE '✅ intereses limpio';
  END IF;
END $$;

-- 9. Clientes
TRUNCATE TABLE clientes CASCADE;
RAISE NOTICE '✅ clientes limpio';

-- 10. Viviendas (dependen de manzanas)
TRUNCATE TABLE viviendas CASCADE;
RAISE NOTICE '✅ viviendas limpio';

-- 11. Manzanas (dependen de proyectos)
TRUNCATE TABLE manzanas CASCADE;
RAISE NOTICE '✅ manzanas limpio';

-- 12. Proyectos
TRUNCATE TABLE proyectos CASCADE;
RAISE NOTICE '✅ proyectos limpio';

-- 13. Audit log
TRUNCATE TABLE audit_log CASCADE;
RAISE NOTICE '✅ audit_log limpio';

COMMIT;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'proyectos' as tabla, count(*) as registros FROM proyectos
UNION ALL SELECT 'manzanas', count(*) FROM manzanas
UNION ALL SELECT 'viviendas', count(*) FROM viviendas
UNION ALL SELECT 'clientes', count(*) FROM clientes
UNION ALL SELECT 'negociaciones', count(*) FROM negociaciones
UNION ALL SELECT 'fuentes_pago', count(*) FROM fuentes_pago
UNION ALL SELECT 'abonos_historial', count(*) FROM abonos_historial
UNION ALL SELECT 'documentos_cliente', count(*) FROM documentos_cliente
UNION ALL SELECT 'audit_log', count(*) FROM audit_log
ORDER BY tabla;
