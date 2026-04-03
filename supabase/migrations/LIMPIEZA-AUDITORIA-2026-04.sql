-- ============================================================
-- LIMPIEZA DE BD - AUDITORÍA ABRIL 2026
-- ============================================================
--
-- Resultado de: AUDITORIA-BD-LIMPIEZA-2026-04.md
-- Ejecutar con: npm run db:exec supabase/migrations/LIMPIEZA-AUDITORIA-2026-04.sql
--
-- ⚠️ ESTE SCRIPT ES DESTRUCTIVO. Ejecutar solo después de revisar
-- el reporte de auditoría y confirmar que los objetos son obsoletos.
--
-- ============================================================

BEGIN;

-- ============================================================
-- FASE 1: ELIMINAR TABLAS NO USADAS (0 filas, 0 refs en código)
-- ============================================================

-- 1.1 plantillas_proceso (0 filas, 0 código)
-- Concepto abandonado de workflow de procesos.
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar plantillas de proceso" ON plantillas_proceso;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear plantillas de proceso" ON plantillas_proceso;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar plantillas de proceso" ON plantillas_proceso;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver plantillas de proceso" ON plantillas_proceso;
DROP TABLE IF EXISTS plantillas_proceso CASCADE;

-- 1.2 tipo_documento_mapping (0 filas, 0 código)
-- Mapping de tipos de documento nunca usado.
DROP TABLE IF EXISTS tipo_documento_mapping CASCADE;

-- 1.3 tipos_fuente_plantillas (0 filas, 0 código)
-- Plantillas de tipos de fuente. Nunca implementado.
DROP TABLE IF EXISTS tipos_fuente_plantillas CASCADE;

-- 1.4 viviendas_historial_estados (0 filas, 0 código)
-- Historial de estados de viviendas. Nunca conectado a UI.
DROP POLICY IF EXISTS "Solo admins pueden insertar historial estados" ON viviendas_historial_estados;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver historial estados" ON viviendas_historial_estados;
DROP TABLE IF EXISTS viviendas_historial_estados CASCADE;

-- 1.5 viviendas_historial_matriculas (0 filas, 0 código)
-- Historial de matrículas. Nunca conectado a UI.
DROP POLICY IF EXISTS "Solo admins pueden insertar historial matriculas" ON viviendas_historial_matriculas;
DROP POLICY IF EXISTS "Solo admins pueden ver historial matriculas" ON viviendas_historial_matriculas;
DROP TABLE IF EXISTS viviendas_historial_matriculas CASCADE;

-- 1.6 procesos_negociacion (0 filas, solo mapping en audit.service.ts)
-- Workflow de procesos de negociación nunca implementado.
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar procesos" ON procesos_negociacion;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear procesos" ON procesos_negociacion;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar procesos" ON procesos_negociacion;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver procesos" ON procesos_negociacion;
DROP TABLE IF EXISTS procesos_negociacion CASCADE;


-- ============================================================
-- FASE 2: ELIMINAR VISTAS NO USADAS (0 refs en código)
-- ============================================================

-- 2.1 Vistas que NUNCA se referencian desde código
DROP VIEW IF EXISTS negociaciones_con_version_actual CASCADE;
DROP VIEW IF EXISTS v_negociaciones_completas CASCADE;
DROP VIEW IF EXISTS v_reemplazos_admin CASCADE;
DROP VIEW IF EXISTS v_renuncias_pendientes CASCADE;
DROP VIEW IF EXISTS vista_cuotas_calendario CASCADE;
DROP VIEW IF EXISTS vista_descuentos_aplicados CASCADE;
DROP VIEW IF EXISTS vista_documentos_vivienda CASCADE;
DROP VIEW IF EXISTS vista_entidades_con_fuentes CASCADE;
DROP VIEW IF EXISTS vista_requisitos_con_orden_visual CASCADE;


-- ============================================================
-- FASE 3: ELIMINAR TRIGGER DUPLICADO
-- ============================================================

-- 3.1 Trigger duplicado de protección de categorías
-- trigger_proteger_categoria_sistema (UPDATE+DELETE) → prevenir_eliminacion_categoria_sistema()  ← MANTENER (más completa)
-- trigger_proteger_categorias_sistema (DELETE only) → proteger_categorias_sistema()              ← ELIMINAR (redundante)
DROP TRIGGER IF EXISTS trigger_proteger_categorias_sistema ON categorias_documento;
DROP FUNCTION IF EXISTS proteger_categorias_sistema();


-- ============================================================
-- FASE 4: ELIMINAR COLUMNAS NO USADAS EN TABLAS ACTIVAS
-- ============================================================

-- 4.1 viviendas: Sistema de inactivación/reactivación nunca implementado en UI
ALTER TABLE viviendas DROP COLUMN IF EXISTS motivo_inactivacion;
ALTER TABLE viviendas DROP COLUMN IF EXISTS inactivada_por;
ALTER TABLE viviendas DROP COLUMN IF EXISTS fecha_reactivacion;
ALTER TABLE viviendas DROP COLUMN IF EXISTS motivo_reactivacion;
ALTER TABLE viviendas DROP COLUMN IF EXISTS reactivada_por;
ALTER TABLE viviendas DROP COLUMN IF EXISTS contador_desactivaciones;

-- 4.2 documentos_cliente: Campos vestigio de sistema anterior
ALTER TABLE documentos_cliente DROP COLUMN IF EXISTS estado_documento;
-- fecha_obsolescencia se conserva (potencialmente útil para sistema de obsolescencia)
-- eliminado_en: soft-delete no implementado pero podría usarse
ALTER TABLE documentos_cliente DROP COLUMN IF EXISTS eliminado_en;

-- 4.3 documentos_proyecto: Soft-delete no implementado
ALTER TABLE documentos_proyecto DROP COLUMN IF EXISTS eliminado_en;

-- 4.4 documentos_vivienda: Soft-delete no implementado
ALTER TABLE documentos_vivienda DROP COLUMN IF EXISTS eliminado_en;

-- 4.5 negociaciones: Campo duplicado de fecha_actualizacion
ALTER TABLE negociaciones DROP COLUMN IF EXISTS fecha_ultima_modificacion;

-- 4.6 documento_reemplazos_admin: Hash de integridad no implementado
ALTER TABLE documento_reemplazos_admin DROP COLUMN IF EXISTS hash_anterior;
ALTER TABLE documento_reemplazos_admin DROP COLUMN IF EXISTS hash_nuevo;
ALTER TABLE documento_reemplazos_admin DROP COLUMN IF EXISTS fecha_reemplazo;


-- ============================================================
-- VERIFICACIÓN POST-LIMPIEZA
-- ============================================================

-- Verificar que las tablas eliminadas ya no existen
DO $$
DECLARE
  tablas_eliminadas text[] := ARRAY[
    'plantillas_proceso', 'tipo_documento_mapping', 'tipos_fuente_plantillas',
    'viviendas_historial_estados', 'viviendas_historial_matriculas', 'procesos_negociacion'
  ];
  tabla text;
  existe boolean;
BEGIN
  FOREACH tabla IN ARRAY tablas_eliminadas LOOP
    SELECT EXISTS(
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tabla
    ) INTO existe;

    IF existe THEN
      RAISE WARNING '⚠️ Tabla % todavía existe', tabla;
    ELSE
      RAISE NOTICE '✅ Tabla % eliminada correctamente', tabla;
    END IF;
  END LOOP;
END $$;

-- Verificar que las vistas eliminadas ya no existen
DO $$
DECLARE
  vistas_eliminadas text[] := ARRAY[
    'negociaciones_con_version_actual', 'v_negociaciones_completas', 'v_reemplazos_admin',
    'v_renuncias_pendientes', 'vista_cuotas_calendario', 'vista_descuentos_aplicados',
    'vista_documentos_vivienda', 'vista_entidades_con_fuentes', 'vista_requisitos_con_orden_visual'
  ];
  vista text;
  existe boolean;
BEGIN
  FOREACH vista IN ARRAY vistas_eliminadas LOOP
    SELECT EXISTS(
      SELECT 1 FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = vista
    ) INTO existe;

    IF existe THEN
      RAISE WARNING '⚠️ Vista % todavía existe', vista;
    ELSE
      RAISE NOTICE '✅ Vista % eliminada correctamente', vista;
    END IF;
  END LOOP;
END $$;

COMMIT;

-- ============================================================
-- POST-LIMPIEZA REQUERIDA EN CÓDIGO:
-- ============================================================
-- 1. Eliminar 'procesos_negociacion' del mapping en src/services/audit.service.ts
-- 2. Ejecutar: npm run types:generate  (regenerar tipos TypeScript)
-- 3. Ejecutar: npm run type-check  (verificar que no hay errores)
-- ============================================================
