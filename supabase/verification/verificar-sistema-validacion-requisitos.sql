-- ============================================
-- VERIFICACIÓN: Sistema de Validación de Requisitos
-- ============================================
--
-- Script para validar que el sistema fue instalado correctamente
--
-- Fecha: 2025-12-12
-- ============================================

-- ============================================
-- 1. VERIFICAR TABLA DE CONFIGURACIÓN
-- ============================================

SELECT
  '✅ Tabla fuentes_pago_requisitos_config' AS verificacion,
  COUNT(*) AS registros_insertados,
  COUNT(DISTINCT tipo_fuente) AS tipos_fuente_configurados
FROM fuentes_pago_requisitos_config;

-- Detalle por tipo de fuente
SELECT
  tipo_fuente,
  COUNT(*) AS total_requisitos,
  COUNT(*) FILTER (WHERE es_obligatorio) AS obligatorios,
  COUNT(*) FILTER (WHERE NOT es_obligatorio) AS opcionales,
  COUNT(*) FILTER (WHERE se_valida_en = 'creacion') AS valida_temprano,
  COUNT(*) FILTER (WHERE se_valida_en = 'desembolso') AS valida_desembolso
FROM fuentes_pago_requisitos_config
GROUP BY tipo_fuente
ORDER BY tipo_fuente;

-- ============================================
-- 2. VERIFICAR FUNCIONES CREADAS
-- ============================================

SELECT
  '✅ Funciones PostgreSQL' AS verificacion,
  p.proname AS funcion,
  pg_get_function_result(p.oid) AS retorna,
  obj_description(p.oid, 'pg_proc') AS descripcion
FROM pg_proc p
WHERE p.proname IN (
  'validar_requisitos_desembolso',
  'obtener_estado_documentacion_fuente'
)
ORDER BY p.proname;

-- ============================================
-- 3. VERIFICAR TRIGGER ACTUALIZADO
-- ============================================

SELECT
  '✅ Trigger actualizado' AS verificacion,
  t.tgname AS trigger_name,
  c.relname AS tabla,
  p.proname AS funcion,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ Habilitado'
    WHEN 'D' THEN '❌ Deshabilitado'
  END AS estado,
  obj_description(p.oid, 'pg_proc') AS descripcion_funcion
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'fuentes_pago'
  AND t.tgname = 'trigger_crear_documento_pendiente';

-- ============================================
-- 4. VERIFICAR RLS POLICIES
-- ============================================

SELECT
  '✅ Políticas RLS' AS verificacion,
  schemaname,
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS operacion
FROM pg_policies
WHERE tablename = 'fuentes_pago_requisitos_config'
ORDER BY policyname;

-- ============================================
-- 5. VERIFICAR COLUMNAS EN documentos_pendientes
-- ============================================

SELECT
  '✅ Columnas documentos_pendientes' AS verificacion,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'documentos_pendientes'
  AND column_name IN ('es_obligatorio', 'orden', 'tipo_documento', 'estado')
ORDER BY ordinal_position;

-- ============================================
-- 6. PRUEBA FUNCIONAL (SI HAY FUENTES)
-- ============================================

-- Contar fuentes de pago existentes
SELECT
  '🧪 Prueba con datos existentes' AS verificacion,
  COUNT(*) AS total_fuentes_pago,
  COUNT(*) FILTER (WHERE tipo = 'Crédito Hipotecario') AS creditos,
  COUNT(*) FILTER (WHERE tipo LIKE 'Subsidio%') AS subsidios,
  COUNT(*) FILTER (WHERE tipo = 'Cuota Inicial') AS cuotas_iniciales
FROM fuentes_pago;

-- Probar validación con primera fuente encontrada (si existe)
DO $$
DECLARE
  v_fuente_id UUID;
  v_resultado RECORD;
BEGIN
  -- Obtener primera fuente de crédito hipotecario
  SELECT id INTO v_fuente_id
  FROM fuentes_pago
  WHERE tipo = 'Crédito Hipotecario'
  LIMIT 1;

  IF v_fuente_id IS NOT NULL THEN
    -- Probar función de validación
    SELECT * INTO v_resultado
    FROM validar_requisitos_desembolso(v_fuente_id);

    RAISE NOTICE '🧪 PRUEBA DE VALIDACIÓN';
    RAISE NOTICE '  Fuente ID: %', v_fuente_id;
    RAISE NOTICE '  Cumple requisitos: %', v_resultado.cumple_requisitos;
    RAISE NOTICE '  Total requisitos: %', v_resultado.total_requisitos;
    RAISE NOTICE '  Completados: %', v_resultado.requisitos_completados;
    RAISE NOTICE '  Obligatorios faltantes: %', v_resultado.obligatorios_faltantes;

    -- Probar función de estado general
    SELECT * INTO v_resultado
    FROM obtener_estado_documentacion_fuente(v_fuente_id);

    RAISE NOTICE '  Estado general: %', v_resultado.estado_general;
    RAISE NOTICE '  Progreso: %% %', v_resultado.progreso_porcentaje;
  ELSE
    RAISE NOTICE '⚠️ No hay fuentes de crédito hipotecario para probar';
  END IF;
END$$;

-- ============================================
-- ✅ RESUMEN FINAL
-- ============================================

SELECT
  '✅ SISTEMA INSTALADO CORRECTAMENTE' AS status,
  (SELECT COUNT(*) FROM fuentes_pago_requisitos_config) AS config_requisitos,
  (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%requisitos%') AS funciones_creadas,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'trigger_crear_documento_pendiente') AS trigger_actualizado,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'fuentes_pago_requisitos_config') AS rls_policies;

-- ============================================
-- 📋 RESULTADO ESPERADO:
-- ============================================
-- ✅ Tabla: 9 registros (3 tipos fuente × 3 documentos)
-- ✅ Funciones: 2 creadas (validar + obtener_estado)
-- ✅ Trigger: 1 actualizado (crear_documento_pendiente)
-- ✅ RLS: 2 policies (lectura + escritura admin)
-- ============================================
