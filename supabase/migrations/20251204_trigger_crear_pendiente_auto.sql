-- ============================================
-- TRIGGER: Crear documento pendiente automáticamente
-- ============================================
--
-- Problema: No existe trigger que cree documentos_pendientes cuando
--           fuentes_pago se inserta sin carta_aprobacion_url
--
-- Solución: Crear trigger AFTER INSERT/UPDATE en fuentes_pago
--
-- Fecha: 2025-12-04
-- ============================================

-- Función que crea documento pendiente si falta carta
CREATE OR REPLACE FUNCTION crear_documento_pendiente_automatico()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_prioridad TEXT;
  v_categoria_id UUID;
BEGIN
  -- Solo crear pendiente si NO tiene carta de aprobación
  IF NEW.carta_aprobacion_url IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- NO crear pendiente para Cuota Inicial (no requiere carta)
  IF NEW.tipo = 'Cuota Inicial' THEN
    RETURN NEW;
  END IF;

  -- Obtener cliente_id desde negociacion
  SELECT cliente_id INTO v_cliente_id
  FROM negociaciones
  WHERE id = NEW.negociacion_id;

  -- Si no hay cliente, no crear pendiente
  IF v_cliente_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determinar prioridad según monto
  IF NEW.monto_aprobado > 10000000 THEN
    v_prioridad := 'Alta';
  ELSIF NEW.monto_aprobado > 5000000 THEN
    v_prioridad := 'Media';
  ELSE
    v_prioridad := 'Normal';
  END IF;

  -- ⚠️ categoria_id ya no se usa (tabla categorias_documentos eliminada)
  -- Se establece como NULL
  v_categoria_id := NULL;

  -- Verificar que no exista ya un pendiente para esta fuente
  IF EXISTS (
    SELECT 1 FROM documentos_pendientes
    WHERE fuente_pago_id = NEW.id
      AND estado = 'Pendiente'
  ) THEN
    RETURN NEW;  -- Ya existe, no duplicar
  END IF;

  -- Crear documento pendiente (sin categoria_id - eliminada)
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
      'creado_automaticamente', true,
      'fecha_creacion_trigger', NOW()
    ),
    'Pendiente',
    v_prioridad
  );

  RAISE NOTICE 'Documento pendiente creado automáticamente para fuente_pago %', NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger en INSERT y UPDATE
DROP TRIGGER IF EXISTS trigger_crear_documento_pendiente ON fuentes_pago;

CREATE TRIGGER trigger_crear_documento_pendiente
  AFTER INSERT OR UPDATE OF carta_aprobacion_url ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION crear_documento_pendiente_automatico();

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================

-- Ver que el trigger quedó creado
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'Enabled ✅'
    WHEN 'D' THEN 'Disabled ❌'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'fuentes_pago'
  AND t.tgname = 'trigger_crear_documento_pendiente';
