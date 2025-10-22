-- =====================================================
-- MIGRACIÓN 004: ACTUALIZAR TABLA RENUNCIAS
-- =====================================================
-- Fecha: 2025-10-22
-- Descripción: Agregar campos faltantes y actualizar estados
-- Referencia: docs/DEFINICION-ESTADOS-SISTEMA.md
-- =====================================================

-- PASO 1: Ver estructura actual
DO $$
BEGIN
  RAISE NOTICE 'Actualizando tabla renuncias...';
END $$;

-- PASO 2: Agregar campo negociacion_id si no existe
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS negociacion_id UUID NULL REFERENCES public.negociaciones(id) ON DELETE CASCADE;

-- PASO 3: Agregar campos para snapshot (reversión)
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS vivienda_valor_snapshot NUMERIC(15,2);

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS abonos_snapshot JSONB;

-- PASO 4: Agregar campos para control de devolución
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS requiere_devolucion BOOLEAN NOT NULL DEFAULT false;

-- Renombrar campo existente si tiene nombre diferente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'renuncias'
    AND column_name = 'monto_devolucion'
  ) THEN
    ALTER TABLE public.renuncias RENAME COLUMN monto_devolucion TO monto_a_devolver;
  END IF;
END $$;

-- Agregar si no existe
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS monto_a_devolver NUMERIC(15,2) DEFAULT 0;

-- PASO 5: Agregar campos para proceso de devolución
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS fecha_devolucion TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS comprobante_devolucion_url TEXT;

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS metodo_devolucion VARCHAR(50);

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS numero_comprobante VARCHAR(100);

-- PASO 6: Agregar campos para cancelación
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS fecha_cancelacion TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT;

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS usuario_cancelacion UUID REFERENCES auth.users(id);

-- PASO 7: Agregar campos para cierre
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS usuario_registro UUID REFERENCES auth.users(id);

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS usuario_cierre UUID REFERENCES auth.users(id);

-- PASO 8: Eliminar constraint de estado actual
ALTER TABLE public.renuncias
DROP CONSTRAINT IF EXISTS renuncias_estado_check;

-- PASO 9: Migrar datos existentes
-- Mapeo de estados antiguos:
-- 'pendiente' → 'Pendiente Devolución'
-- 'aprobada' → 'Cerrada'
-- 'rechazada' → 'Cancelada'

UPDATE public.renuncias
SET estado = CASE
  WHEN estado = 'pendiente' THEN 'Pendiente Devolución'
  WHEN estado = 'aprobada' THEN 'Cerrada'
  WHEN estado = 'rechazada' THEN 'Cancelada'
  WHEN estado = 'Pendiente Devolución' THEN 'Pendiente Devolución'
  WHEN estado = 'Cerrada' THEN 'Cerrada'
  WHEN estado = 'Cancelada' THEN 'Cancelada'
  ELSE 'Pendiente Devolución'
END
WHERE estado IS NOT NULL;

-- PASO 10: Crear nuevo constraint de estado
ALTER TABLE public.renuncias
ADD CONSTRAINT renuncias_estado_check CHECK (
  ((estado)::text = ANY ((ARRAY[
    'Pendiente Devolución'::character varying,
    'Cerrada'::character varying,
    'Cancelada'::character varying
  ])::text[]))
);

-- PASO 11: Crear constraints de integridad

-- Si requiere devolución, debe tener monto > 0
ALTER TABLE public.renuncias
DROP CONSTRAINT IF EXISTS renuncias_devolucion_check;

ALTER TABLE public.renuncias
ADD CONSTRAINT renuncias_devolucion_check CHECK (
  (requiere_devolucion = false AND monto_a_devolver = 0) OR
  (requiere_devolucion = true AND monto_a_devolver > 0)
);

-- Si está Cerrada y requiere devolución, debe tener fecha y comprobante
ALTER TABLE public.renuncias
DROP CONSTRAINT IF EXISTS renuncias_cerrada_devolucion_check;

ALTER TABLE public.renuncias
ADD CONSTRAINT renuncias_cerrada_devolucion_check CHECK (
  (estado != 'Cerrada') OR
  (estado = 'Cerrada' AND requiere_devolucion = false) OR
  (estado = 'Cerrada' AND requiere_devolucion = true AND fecha_devolucion IS NOT NULL)
);

-- Si está Cancelada, debe tener motivo
ALTER TABLE public.renuncias
DROP CONSTRAINT IF EXISTS renuncias_cancelada_motivo_check;

ALTER TABLE public.renuncias
ADD CONSTRAINT renuncias_cancelada_motivo_check CHECK (
  (estado != 'Cancelada') OR
  (estado = 'Cancelada' AND motivo_cancelacion IS NOT NULL)
);

-- PASO 12: Crear índices
CREATE INDEX IF NOT EXISTS idx_renuncias_negociacion
ON public.renuncias(negociacion_id);

CREATE INDEX IF NOT EXISTS idx_renuncias_estado
ON public.renuncias(estado);

CREATE INDEX IF NOT EXISTS idx_renuncias_requiere_devolucion
ON public.renuncias(requiere_devolucion)
WHERE requiere_devolucion = true;

CREATE INDEX IF NOT EXISTS idx_renuncias_fecha_renuncia
ON public.renuncias(fecha_renuncia DESC);

CREATE INDEX IF NOT EXISTS idx_renuncias_fecha_cierre
ON public.renuncias(fecha_cierre DESC)
WHERE fecha_cierre IS NOT NULL;

-- PASO 13: Actualizar campos de auditoría para registros existentes
UPDATE public.renuncias
SET
  requiere_devolucion = (monto_a_devolver > 0),
  fecha_cierre = fecha_actualizacion
WHERE estado IN ('Cerrada', 'Cancelada') AND fecha_cierre IS NULL;

-- PASO 14: Comentarios para documentación
COMMENT ON TABLE public.renuncias IS
'Histórico completo de renuncias de ventas/negociaciones. Incluye reversiones (Cancelada) y confirmadas (Cerrada).';

COMMENT ON COLUMN public.renuncias.negociacion_id IS
'ID de la negociación/venta a la que pertenece esta renuncia';

COMMENT ON COLUMN public.renuncias.vivienda_valor_snapshot IS
'Precio de la vivienda al momento de registrar la renuncia (para validar reversión)';

COMMENT ON COLUMN public.renuncias.abonos_snapshot IS
'JSON con backup de fuentes_pago al momento de la renuncia (auditoría)';

COMMENT ON COLUMN public.renuncias.requiere_devolucion IS
'TRUE si el cliente tiene abonos que deben devolverse, FALSE si no tiene abonos';

COMMENT ON COLUMN public.renuncias.fecha_devolucion IS
'Fecha MANUAL ingresada por usuario cuando se devolvió el dinero al cliente';

COMMENT ON COLUMN public.renuncias.comprobante_devolucion_url IS
'URL del documento (PDF) en Supabase Storage que evidencia la devolución';

COMMENT ON COLUMN public.renuncias.metodo_devolucion IS
'Método usado para devolver el dinero: Transferencia, Cheque, Efectivo';

COMMENT ON COLUMN public.renuncias.motivo_cancelacion IS
'Motivo por el cual el cliente canceló su renuncia y volvió al proceso de compra';

COMMENT ON CONSTRAINT renuncias_estado_check ON public.renuncias IS
'Estados: Pendiente Devolución (esperando devolver $), Cerrada (renuncia efectiva), Cancelada (cliente se retractó)';

-- =====================================================
-- VALIDACIÓN POST-MIGRACIÓN
-- =====================================================
-- Ejecutar para verificar:
-- SELECT estado, COUNT(*) FROM renuncias GROUP BY estado;
-- SELECT COUNT(*) FROM renuncias WHERE requiere_devolucion = true AND monto_a_devolver = 0; -- Debe ser 0
-- SELECT COUNT(*) FROM renuncias WHERE estado = 'Cerrada' AND requiere_devolucion = true AND fecha_devolucion IS NULL; -- Debe ser 0
-- SELECT COUNT(*) FROM renuncias WHERE estado = 'Cancelada' AND motivo_cancelacion IS NULL; -- Debe ser 0
-- =====================================================

-- ROLLBACK (en caso de error):
-- ALTER TABLE public.renuncias DROP CONSTRAINT renuncias_estado_check;
-- UPDATE public.renuncias SET estado = 'pendiente' WHERE estado = 'Pendiente Devolución';
-- UPDATE public.renuncias SET estado = 'aprobada' WHERE estado = 'Cerrada';
-- UPDATE public.renuncias SET estado = 'rechazada' WHERE estado = 'Cancelada';
