-- =====================================================
-- HABILITAR TRIGGERS DE AUDITORÍA PARA HISTORIAL CLIENTES
-- =====================================================
-- Fecha: 2025-11-22
-- Descripción: Asegura que TODOS los eventos relacionados
--              con clientes sean capturados en audit_log
--              para el módulo de "Historial del Cliente"
--
-- EVENTOS A CAPTURAR:
-- 1. Clientes (creación, actualización, eliminación)
-- 2. Negociaciones (inicio, cambios de estado, completación)
-- 3. Abonos (pagos realizados)
-- 4. Intereses (registro, conversión, descarte)
-- 5. Renuncias (presentación, procesamiento, cierre)
-- 6. Documentos (subida de archivos)
-- =====================================================

-- =====================================================
-- 1. TRIGGER PARA TABLA: clientes
-- =====================================================

-- Eliminar si existe (para recraar)
DROP TRIGGER IF EXISTS clientes_audit_trigger ON clientes;

-- Crear trigger
CREATE TRIGGER clientes_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON clientes
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER clientes_audit_trigger ON clientes IS
'Captura todos los cambios en clientes: creación, actualización de datos personales, cambios de estado, etc.';

-- =====================================================
-- 2. TRIGGER PARA TABLA: negociaciones
-- =====================================================

DROP TRIGGER IF EXISTS negociaciones_audit_trigger ON negociaciones;

CREATE TRIGGER negociaciones_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON negociaciones
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER negociaciones_audit_trigger ON negociaciones IS
'Captura: inicio de negociación, cambios de estado (Activa→Suspendida→Completada), actualización de valores, asignación de viviendas.';

-- =====================================================
-- 3. TRIGGER PARA TABLA: abonos
-- =====================================================

DROP TRIGGER IF EXISTS abonos_audit_trigger ON abonos;

CREATE TRIGGER abonos_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON abonos
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER abonos_audit_trigger ON abonos IS
'Captura: pagos realizados, modificaciones de montos, anulaciones de abonos.';

-- =====================================================
-- 4. TRIGGER PARA TABLA: intereses
-- =====================================================

DROP TRIGGER IF EXISTS intereses_audit_trigger ON intereses;

CREATE TRIGGER intereses_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON intereses
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER intereses_audit_trigger ON intereses IS
'Captura: registro de interés en proyecto/vivienda, conversión a negociación, descarte de interés.';

-- =====================================================
-- 5. TRIGGER PARA TABLA: renuncias
-- =====================================================

DROP TRIGGER IF EXISTS renuncias_audit_trigger ON renuncias;

CREATE TRIGGER renuncias_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON renuncias
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER renuncias_audit_trigger ON renuncias IS
'Captura: presentación de renuncia, procesamiento de devolución, cierre administrativo, cancelación.';

-- =====================================================
-- 6. TRIGGER PARA TABLA: documentos_proyecto (si contiene docs de clientes)
-- =====================================================

DROP TRIGGER IF EXISTS documentos_proyecto_audit_trigger ON documentos_proyecto;

CREATE TRIGGER documentos_proyecto_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON documentos_proyecto
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER documentos_proyecto_audit_trigger ON documentos_proyecto IS
'Captura: subida de promesas, escrituras, cédulas, y otros documentos relacionados con clientes.';

-- =====================================================
-- 7. VERIFICAR FUNCIÓN audit_trigger_func() EXISTE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'audit_trigger_func'
  ) THEN
    RAISE EXCEPTION 'ERROR: Función audit_trigger_func() no existe. Ejecuta primero 20251104_create_audit_log.sql';
  END IF;

  RAISE NOTICE '✅ Función audit_trigger_func() existe';
END $$;

-- =====================================================
-- 8. VALIDACIÓN: Verificar triggers creados
-- =====================================================

DO $$
DECLARE
  trigger_count INTEGER;
  trigger_record RECORD;
BEGIN
  -- Contar triggers de auditoría creados
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_name LIKE '%audit_trigger%'
  AND event_object_schema = 'public'
  AND event_object_table IN ('clientes', 'negociaciones', 'abonos', 'intereses', 'renuncias', 'documentos_proyecto');

  RAISE NOTICE '========================================';
  RAISE NOTICE 'TRIGGERS DE AUDITORÍA HABILITADOS:';
  RAISE NOTICE '========================================';

  -- Listar cada trigger
  FOR trigger_record IN
    SELECT
      event_object_table AS tabla,
      trigger_name AS trigger_nombre,
      action_timing || ' ' || string_agg(event_manipulation, ', ') AS eventos
    FROM information_schema.triggers
    WHERE trigger_name LIKE '%audit_trigger%'
    AND event_object_schema = 'public'
    AND event_object_table IN ('clientes', 'negociaciones', 'abonos', 'intereses', 'renuncias', 'documentos_proyecto')
    GROUP BY event_object_table, trigger_name, action_timing
    ORDER BY event_object_table
  LOOP
    RAISE NOTICE '✅ Tabla: % | Trigger: % | Eventos: %',
      UPPER(trigger_record.tabla),
      trigger_record.trigger_nombre,
      trigger_record.eventos;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de triggers habilitados: %', trigger_count;
  RAISE NOTICE '========================================';

  IF trigger_count < 6 THEN
    RAISE WARNING 'Se esperaban 6 triggers, pero solo se encontraron %. Verifica las tablas.', trigger_count;
  ELSE
    RAISE NOTICE '✅ TODOS LOS TRIGGERS ESTÁN ACTIVOS';
  END IF;
END $$;

-- =====================================================
-- 9. COMENTARIOS FINALES
-- =====================================================

COMMENT ON TABLE audit_log IS
'Registro de auditoría completo.
HISTORIAL CLIENTES: Filtra eventos por cliente_id en metadata para mostrar timeline humanizado.
AUDITORÍAS ADMIN: Vista completa de todos los eventos del sistema para administradores.';

-- =====================================================
-- 10. GRANT ADICIONAL (por si acaso)
-- =====================================================

-- Asegurar que la función audit_trigger_func puede ser ejecutada por los triggers
GRANT EXECUTE ON FUNCTION audit_trigger_func() TO PUBLIC;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

/*
DESPUÉS DE EJECUTAR ESTA MIGRACIÓN:

✅ TABLA clientes:
   - CREATE: Cliente registrado
   - UPDATE: Datos personales actualizados, estado civil cambiado, estado del cliente modificado
   - DELETE: Cliente eliminado

✅ TABLA negociaciones:
   - CREATE: Negociación iniciada para vivienda X
   - UPDATE: Estado cambiado (Activa→Completada), valor modificado
   - DELETE: Negociación cancelada

✅ TABLA abonos:
   - CREATE: Abono de $X realizado
   - UPDATE: Monto corregido
   - DELETE: Abono anulado

✅ TABLA intereses:
   - CREATE: Interés registrado en proyecto X
   - UPDATE: Interés convertido a negociación
   - DELETE: Interés descartado

✅ TABLA renuncias:
   - CREATE: Renuncia presentada
   - UPDATE: Devolución procesada, estado cambiado
   - DELETE: Renuncia cancelada

✅ TABLA documentos_proyecto:
   - CREATE: Documento subido (promesa, escritura, cédula)
   - UPDATE: Documento actualizado
   - DELETE: Documento eliminado

TODOS los eventos quedarán registrados en audit_log con:
- tabla, accion, registro_id
- usuario_email, fecha_evento
- datos_anteriores, datos_nuevos, cambios_especificos
- metadata (incluirá cliente_id para filtrado)
*/
