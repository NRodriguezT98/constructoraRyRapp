-- ============================================
-- ACTUALIZAR TRIGGER: Solo crear pendiente de Carta de Aprobación
-- ============================================
--
-- Estrategia: Validación no intrusiva
-- - Carta de Aprobación: Se genera pendiente al crear fuente (temprano)
-- - Otros documentos: Se validan just-in-time al intentar desembolso (lazy)
--
-- Fecha: 2025-12-12
-- Versión: 2.0.0 (actualización)
-- ============================================

-- ============================================
-- 1. ACTUALIZAR FUNCIÓN DEL TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION crear_documento_pendiente_automatico()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_prioridad TEXT;
BEGIN
  -- ⚠️ SOLO crear pendiente de CARTA DE APROBACIÓN
  -- Los demás documentos (Boleta, Solicitud) se validan just-in-time

  -- NO crear pendiente si ya tiene carta de aprobación
  IF NEW.carta_aprobacion_url IS NOT NULL THEN
    RAISE NOTICE 'Fuente % ya tiene carta de aprobación, no crear pendiente', NEW.id;
    RETURN NEW;
  END IF;

  -- NO crear pendiente para Cuota Inicial (no requiere carta)
  IF NEW.tipo = 'Cuota Inicial' THEN
    RAISE NOTICE 'Fuente % es Cuota Inicial, no requiere carta', NEW.id;
    RETURN NEW;
  END IF;

  -- Obtener cliente_id desde negociacion
  SELECT cliente_id INTO v_cliente_id
  FROM negociaciones
  WHERE id = NEW.negociacion_id;

  -- Si no hay cliente, no crear pendiente
  IF v_cliente_id IS NULL THEN
    RAISE WARNING 'No se encontró cliente para negociacion %', NEW.negociacion_id;
    RETURN NEW;
  END IF;

  -- Determinar prioridad según monto
  IF NEW.monto_aprobado > 50000000 THEN
    v_prioridad := 'Alta';
  ELSIF NEW.monto_aprobado > 20000000 THEN
    v_prioridad := 'Media';
  ELSE
    v_prioridad := 'Normal';
  END IF;

  -- Verificar que no exista ya un pendiente para esta fuente
  IF EXISTS (
    SELECT 1 FROM documentos_pendientes
    WHERE fuente_pago_id = NEW.id
      AND tipo_documento = 'Carta de Aprobación'
      AND estado = 'Pendiente'
  ) THEN
    RAISE NOTICE 'Ya existe pendiente de carta para fuente %', NEW.id;
    RETURN NEW;
  END IF;

  -- Crear SOLO pendiente de Carta de Aprobación
  INSERT INTO documentos_pendientes (
    fuente_pago_id,
    cliente_id,
    tipo_documento,
    metadata,
    estado,
    prioridad
  ) VALUES (
    NEW.id,
    v_cliente_id,
    'Carta de Aprobación',
    jsonb_build_object(
      'tipo_fuente', NEW.tipo,
      'entidad', NEW.entidad,
      'monto_aprobado', NEW.monto_aprobado,
      'negociacion_id', NEW.negociacion_id,
      'validacion_etapa', 'creacion',
      'creado_automaticamente', true,
      'fecha_creacion_trigger', NOW()
    ),
    'Pendiente',
    v_prioridad
  );

  RAISE NOTICE '✅ Documento pendiente (Carta) creado para fuente % - Prioridad: %', NEW.id, v_prioridad;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Error al crear documento pendiente para fuente %: %', NEW.id, SQLERRM;
    RETURN NEW; -- No fallar la transacción por este trigger
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. RECREAR TRIGGER (SI NO EXISTE)
-- ============================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_crear_documento_pendiente ON fuentes_pago;

-- Crear trigger actualizado
CREATE TRIGGER trigger_crear_documento_pendiente
  AFTER INSERT OR UPDATE OF carta_aprobacion_url ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION crear_documento_pendiente_automatico();

-- ============================================
-- 3. AGREGAR COLUMNAS A documentos_pendientes (SI NO EXISTEN)
-- ============================================

-- Agregar columnas para mejorar el sistema
DO $$
BEGIN
  -- Columna: es_obligatorio
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documentos_pendientes'
      AND column_name = 'es_obligatorio'
  ) THEN
    ALTER TABLE documentos_pendientes
    ADD COLUMN es_obligatorio BOOLEAN DEFAULT true;

    RAISE NOTICE '✅ Columna es_obligatorio agregada';
  END IF;

  -- Columna: orden
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documentos_pendientes'
      AND column_name = 'orden'
  ) THEN
    ALTER TABLE documentos_pendientes
    ADD COLUMN orden INT DEFAULT 0;

    RAISE NOTICE '✅ Columna orden agregada';
  END IF;
END$$;

-- Actualizar registros existentes de carta de aprobación
UPDATE documentos_pendientes
SET
  es_obligatorio = true,
  orden = 1
WHERE tipo_documento = 'Carta de Aprobación'
  AND es_obligatorio IS NULL;

-- ============================================
-- 4. COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON FUNCTION crear_documento_pendiente_automatico IS
'Crea pendiente solo de Carta de Aprobación al insertar fuente sin carta. Otros documentos se validan just-in-time.';

COMMENT ON COLUMN documentos_pendientes.es_obligatorio IS
'Indica si el documento es obligatorio (true) u opcional (false). Solo obligatorios bloquean acciones.';

COMMENT ON COLUMN documentos_pendientes.orden IS
'Orden de presentación del documento en la UI (1 = más importante)';

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================

-- Ver que el trigger quedó actualizado
SELECT
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ Enabled'
    WHEN 'D' THEN '❌ Disabled'
  END AS status,
  obj_description(p.oid, 'pg_proc') AS descripcion
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'fuentes_pago'
  AND t.tgname = 'trigger_crear_documento_pendiente';

-- Ver estructura actualizada de documentos_pendientes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'documentos_pendientes'
  AND column_name IN ('es_obligatorio', 'orden', 'tipo_documento', 'estado')
ORDER BY ordinal_position;

-- ============================================
-- 📋 RESULTADO ESPERADO:
-- ============================================
-- trigger_name                        | table_name   | function_name                        | status
-- ------------------------------------+--------------+--------------------------------------+-----------
-- trigger_crear_documento_pendiente   | fuentes_pago | crear_documento_pendiente_automatico | ✅ Enabled
-- ============================================
