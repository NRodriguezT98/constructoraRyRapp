-- =====================================================
-- Migración: Crear sistema de historial de abonos
-- =====================================================
-- Fecha: 2025-10-21
-- Propósito: Crear tabla para registrar historial de abonos
--            y actualizar automáticamente monto_recibido en fuentes_pago
-- =====================================================

-- =====================================================
-- TABLA: abonos_historial
-- Registra cada abono individual realizado a una fuente de pago
-- =====================================================
CREATE TABLE IF NOT EXISTS public.abonos_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  negociacion_id UUID REFERENCES public.negociaciones(id) ON DELETE CASCADE NOT NULL,
  fuente_pago_id UUID REFERENCES public.fuentes_pago(id) ON DELETE CASCADE NOT NULL,

  -- Datos del Abono
  monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
  fecha_abono TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Método de Pago
  metodo_pago VARCHAR(50) CHECK (metodo_pago IN (
    'Transferencia',
    'Efectivo',
    'Cheque',
    'Consignación',
    'PSE',
    'Tarjeta de Crédito',
    'Tarjeta de Débito'
  )) NOT NULL,

  numero_referencia VARCHAR(100), -- Número de transacción, cheque, etc.

  -- Documentos
  comprobante_url TEXT, -- URL del comprobante en Supabase Storage

  -- Observaciones
  notas TEXT,

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_registro UUID REFERENCES auth.users(id)
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_abonos_historial_negociacion
ON public.abonos_historial(negociacion_id);

CREATE INDEX IF NOT EXISTS idx_abonos_historial_fuente
ON public.abonos_historial(fuente_pago_id);

CREATE INDEX IF NOT EXISTS idx_abonos_historial_fecha
ON public.abonos_historial(fecha_abono DESC);

CREATE INDEX IF NOT EXISTS idx_abonos_historial_metodo
ON public.abonos_historial(metodo_pago);

-- =====================================================
-- TRIGGER: Actualizar fecha_actualizacion
-- =====================================================
CREATE OR REPLACE FUNCTION update_abonos_historial_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_abonos_historial_fecha_actualizacion
ON public.abonos_historial;

CREATE TRIGGER trigger_update_abonos_historial_fecha_actualizacion
  BEFORE UPDATE ON public.abonos_historial
  FOR EACH ROW
  EXECUTE FUNCTION update_abonos_historial_fecha_actualizacion();

-- =====================================================
-- TRIGGER: Actualizar monto_recibido en fuentes_pago
-- Cuando se registra un abono, actualiza automáticamente
-- el monto_recibido sumando todos los abonos de esa fuente
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_monto_recibido_fuente()
RETURNS TRIGGER AS $$
DECLARE
  fuente_id UUID;
BEGIN
  -- Determinar el fuente_pago_id afectado
  IF TG_OP = 'DELETE' THEN
    fuente_id := OLD.fuente_pago_id;
  ELSE
    fuente_id := NEW.fuente_pago_id;
  END IF;

  -- Actualizar monto_recibido en fuentes_pago
  UPDATE public.fuentes_pago
  SET monto_recibido = (
    SELECT COALESCE(SUM(monto), 0)
    FROM public.abonos_historial
    WHERE fuente_pago_id = fuente_id
  )
  WHERE id = fuente_id;

  -- El resto (saldo_pendiente, porcentaje_completado) se calcula automáticamente
  -- porque son columnas GENERATED en la tabla fuentes_pago

  -- Los totales de la negociación se actualizan con el trigger existente
  -- que ya está configurado en fuentes_pago

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_monto_recibido
ON public.abonos_historial;

CREATE TRIGGER trigger_actualizar_monto_recibido
  AFTER INSERT OR UPDATE OR DELETE ON public.abonos_historial
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_monto_recibido_fuente();

-- =====================================================
-- VALIDACIÓN: Verificar que el abono no exceda el saldo
-- =====================================================
CREATE OR REPLACE FUNCTION validar_abono_no_excede_saldo()
RETURNS TRIGGER AS $$
DECLARE
  monto_aprobado_fuente DECIMAL(15,2);
  monto_recibido_actual DECIMAL(15,2);
  nuevo_total DECIMAL(15,2);
BEGIN
  -- Obtener monto aprobado y recibido actual de la fuente
  SELECT
    monto_aprobado,
    monto_recibido
  INTO
    monto_aprobado_fuente,
    monto_recibido_actual
  FROM public.fuentes_pago
  WHERE id = NEW.fuente_pago_id;

  -- Calcular nuevo total
  nuevo_total := monto_recibido_actual + NEW.monto;

  -- Validar que no exceda el monto aprobado
  IF nuevo_total > monto_aprobado_fuente THEN
    RAISE EXCEPTION
      'El abono de $ % excede el saldo pendiente. Monto aprobado: $ %, Ya abonado: $ %, Saldo disponible: $ %',
      NEW.monto,
      monto_aprobado_fuente,
      monto_recibido_actual,
      (monto_aprobado_fuente - monto_recibido_actual);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_abono_no_excede_saldo
ON public.abonos_historial;

CREATE TRIGGER trigger_validar_abono_no_excede_saldo
  BEFORE INSERT OR UPDATE ON public.abonos_historial
  FOR EACH ROW
  EXECUTE FUNCTION validar_abono_no_excede_saldo();

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE public.abonos_historial IS
'Historial de abonos realizados a cada fuente de pago de una negociación';

COMMENT ON COLUMN public.abonos_historial.monto IS
'Monto del abono individual. La suma de todos los abonos actualiza monto_recibido en fuentes_pago';

COMMENT ON COLUMN public.abonos_historial.metodo_pago IS
'Método utilizado para realizar el pago';

COMMENT ON COLUMN public.abonos_historial.numero_referencia IS
'Número de transacción, cheque, referencia bancaria, etc.';

COMMENT ON COLUMN public.abonos_historial.comprobante_url IS
'URL del comprobante de pago almacenado en Supabase Storage';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- 1. Ver estructura de la tabla
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'abonos_historial'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver triggers creados
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'abonos_historial'
  AND trigger_schema = 'public';

-- 3. Ver funciones creadas
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%abono%'
ORDER BY routine_name;

-- =====================================================
-- EJEMPLO DE USO
-- =====================================================

/*
-- Registrar un abono
INSERT INTO public.abonos_historial (
  negociacion_id,
  fuente_pago_id,
  monto,
  fecha_abono,
  metodo_pago,
  numero_referencia,
  notas
) VALUES (
  '[negociacion-id]',
  '[fuente-pago-id]',
  10000000,
  NOW(),
  'Transferencia',
  'TRX-20251021-001',
  'Primer abono de cuota inicial'
);

-- Ver abonos de una fuente
SELECT
  id,
  monto,
  fecha_abono,
  metodo_pago,
  numero_referencia,
  fecha_creacion
FROM public.abonos_historial
WHERE fuente_pago_id = '[fuente-pago-id]'
ORDER BY fecha_abono DESC;

-- Ver resumen de abonos por negociación
SELECT
  n.id as negociacion_id,
  c.nombre_completo as cliente,
  v.numero as vivienda,
  COUNT(ah.id) as cantidad_abonos,
  SUM(ah.monto) as total_abonado,
  n.valor_total,
  n.saldo_pendiente
FROM public.negociaciones n
INNER JOIN public.clientes c ON n.cliente_id = c.id
INNER JOIN public.viviendas v ON n.vivienda_id = v.id
LEFT JOIN public.fuentes_pago fp ON fp.negociacion_id = n.id
LEFT JOIN public.abonos_historial ah ON ah.fuente_pago_id = fp.id
GROUP BY n.id, c.nombre_completo, v.numero, n.valor_total, n.saldo_pendiente
ORDER BY n.fecha_creacion DESC;
*/
