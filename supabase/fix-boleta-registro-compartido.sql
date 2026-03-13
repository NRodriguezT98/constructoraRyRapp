-- ============================================
-- SCRIPT: Verificar y Corregir Configuración Boleta de Registro
-- ============================================
--
-- Verifica que la Boleta de Registro esté configurada correctamente
-- para las 3 fuentes con alcance COMPARTIDO_CLIENTE
--
-- ============================================

-- 1. Ver configuración ACTUAL de Boleta de Registro
SELECT
  tipo_fuente,
  titulo,
  alcance,
  nivel_validacion,
  activo,
  orden
FROM requisitos_fuentes_pago_config
WHERE paso_identificador = 'boleta_registro'
  OR titulo ILIKE '%boleta%registro%'
ORDER BY tipo_fuente;

-- Resultado esperado:
-- Crédito Hipotecario    | Boleta de Registro | COMPARTIDO_CLIENTE | DOCUMENTO_OBLIGATORIO | true
-- Subsidio Caja          | Boleta de Registro | COMPARTIDO_CLIENTE | DOCUMENTO_OBLIGATORIO | true
-- Subsidio Mi Casa Ya    | Boleta de Registro | COMPARTIDO_CLIENTE | DOCUMENTO_OBLIGATORIO | true

-- ============================================

-- 2. Si NO existen los registros para Subsidios, crearlos
DO $$
DECLARE
  v_credito_id uuid;
  v_paso_identificador text := 'boleta_registro';
BEGIN
  -- Buscar el registro de Crédito Hipotecario como plantilla
  SELECT id INTO v_credito_id
  FROM requisitos_fuentes_pago_config
  WHERE tipo_fuente = 'Crédito Hipotecario'
    AND (paso_identificador = v_paso_identificador OR titulo ILIKE '%boleta%registro%')
    AND activo = true
  LIMIT 1;

  IF v_credito_id IS NULL THEN
    RAISE NOTICE 'No existe configuración base de Boleta de Registro en Crédito Hipotecario';
    RETURN;
  END IF;

  -- Crear para Subsidio Caja si no existe
  INSERT INTO requisitos_fuentes_pago_config (
    tipo_fuente,
    paso_identificador,
    titulo,
    descripcion,
    instrucciones,
    nivel_validacion,
    alcance,
    tipo_documento_sugerido,
    categoria_documento_requerida,
    orden,
    activo
  )
  SELECT
    'Subsidio Caja de Compensación' AS tipo_fuente,
    paso_identificador,
    titulo,
    descripcion,
    instrucciones,
    nivel_validacion,
    'COMPARTIDO_CLIENTE' AS alcance, -- ← Forzar alcance correcto
    tipo_documento_sugerido,
    categoria_documento_requerida,
    orden,
    true AS activo
  FROM requisitos_fuentes_pago_config
  WHERE id = v_credito_id
  ON CONFLICT DO NOTHING;

  -- Crear para Subsidio Mi Casa Ya si no existe
  INSERT INTO requisitos_fuentes_pago_config (
    tipo_fuente,
    paso_identificador,
    titulo,
    descripcion,
    instrucciones,
    nivel_validacion,
    alcance,
    tipo_documento_sugerido,
    categoria_documento_requerida,
    orden,
    activo
  )
  SELECT
    'Subsidio Mi Casa Ya' AS tipo_fuente,
    paso_identificador,
    titulo,
    descripcion,
    instrucciones,
    nivel_validacion,
    'COMPARTIDO_CLIENTE' AS alcance, -- ← Forzar alcance correcto
    tipo_documento_sugerido,
    categoria_documento_requerida,
    orden,
    true AS activo
  FROM requisitos_fuentes_pago_config
  WHERE id = v_credito_id
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Requisitos de Boleta de Registro creados/actualizados para Subsidios';
END $$;

-- ============================================

-- 3. Actualizar alcance a COMPARTIDO_CLIENTE en todos si es NULL o incorrecto
UPDATE requisitos_fuentes_pago_config
SET
  alcance = 'COMPARTIDO_CLIENTE',
  fecha_actualizacion = NOW()
WHERE (paso_identificador = 'boleta_registro' OR titulo ILIKE '%boleta%registro%')
  AND (alcance IS NULL OR alcance != 'COMPARTIDO_CLIENTE')
  AND activo = true;

-- ============================================

-- 4. Verificar resultado FINAL
SELECT
  tipo_fuente,
  titulo,
  alcance,
  nivel_validacion,
  activo,
  COUNT(*) OVER (PARTITION BY paso_identificador) as "total_fuentes_con_requisito"
FROM requisitos_fuentes_pago_config
WHERE paso_identificador = 'boleta_registro'
  OR titulo ILIKE '%boleta%registro%'
ORDER BY tipo_fuente;

-- Debe mostrar 3 registros todos con alcance = 'COMPARTIDO_CLIENTE'

-- ============================================

-- 5. Verificar que la vista funcione correctamente
SELECT
  cliente_id,
  fuente_pago_id,
  tipo_documento,
  metadata->>'tipo_fuente' AS tipo_fuente_metadata,
  metadata->>'alcance' AS alcance,
  prioridad
FROM vista_documentos_pendientes_fuentes
WHERE tipo_documento ILIKE '%boleta%registro%'
LIMIT 5;

-- Debe mostrar:
-- - fuente_pago_id = NULL para documentos compartidos
-- - Un solo pendiente por cliente (no duplicados)

-- ============================================
