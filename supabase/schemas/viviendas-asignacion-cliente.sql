-- ============================================
-- EXTENSIÓN SCHEMA: Viviendas - Solo Campos Nuevos
-- Descripción: Script SEGURO para agregar solo campos de asignación y vista de abonos
-- Fecha: 2025-10-15
-- NOTA: Este script puede ejecutarse múltiples veces sin errores
-- ============================================

-- ============================================
-- CAMPOS DE ASIGNACIÓN DE CLIENTE
-- ============================================

-- Solo agregar si NO existen
DO $$
BEGIN
    -- cliente_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'viviendas' AND column_name = 'cliente_id'
    ) THEN
        ALTER TABLE public.viviendas
        ADD COLUMN cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL;

        RAISE NOTICE 'Columna cliente_id agregada';
    ELSE
        RAISE NOTICE 'Columna cliente_id ya existe';
    END IF;

    -- fecha_asignacion
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'viviendas' AND column_name = 'fecha_asignacion'
    ) THEN
        ALTER TABLE public.viviendas
        ADD COLUMN fecha_asignacion TIMESTAMP WITH TIME ZONE;

        RAISE NOTICE 'Columna fecha_asignacion agregada';
    ELSE
        RAISE NOTICE 'Columna fecha_asignacion ya existe';
    END IF;

    -- fecha_pago_completo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'viviendas' AND column_name = 'fecha_pago_completo'
    ) THEN
        ALTER TABLE public.viviendas
        ADD COLUMN fecha_pago_completo TIMESTAMP WITH TIME ZONE;

        RAISE NOTICE 'Columna fecha_pago_completo agregada';
    ELSE
        RAISE NOTICE 'Columna fecha_pago_completo ya existe';
    END IF;
END $$;

-- ============================================
-- ÍNDICE PARA CLIENTE_ID
-- ============================================

-- Crear índice solo si no existe
CREATE INDEX IF NOT EXISTS idx_viviendas_cliente_id
ON public.viviendas(cliente_id)
WHERE cliente_id IS NOT NULL;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON COLUMN public.viviendas.cliente_id IS 'Cliente asignado a la vivienda (NULL = disponible)';
COMMENT ON COLUMN public.viviendas.fecha_asignacion IS 'Fecha en que se asignó la vivienda al cliente';
COMMENT ON COLUMN public.viviendas.fecha_pago_completo IS 'Fecha en que se completó el pago total';

-- ============================================
-- VISTA: Viviendas con Cálculos de Abonos
-- ============================================

CREATE OR REPLACE VIEW public.vista_viviendas_abonos AS
SELECT
  v.id,
  v.numero,
  v.manzana_id,
  v.estado,
  v.cliente_id,
  v.valor_total,
  v.fecha_asignacion,
  v.fecha_pago_completo,
  COALESCE(SUM(a.monto), 0) as total_abonado,
  v.valor_total - COALESCE(SUM(a.monto), 0) as saldo_pendiente,
  CASE
    WHEN v.valor_total > 0 THEN
      ROUND((COALESCE(SUM(a.monto), 0)::NUMERIC * 100.0 / v.valor_total::NUMERIC), 2)
    ELSE 0
  END as porcentaje_pagado,
  COUNT(a.id) as cantidad_abonos
FROM public.viviendas v
LEFT JOIN public.abonos a ON a.vivienda_id = v.id
GROUP BY v.id, v.numero, v.manzana_id, v.estado, v.cliente_id, v.valor_total, v.fecha_asignacion, v.fecha_pago_completo;

COMMENT ON VIEW public.vista_viviendas_abonos IS 'Vista con cálculos financieros de cada vivienda (abonos, saldo, porcentaje)';

-- ============================================
-- FUNCIÓN: Actualizar Estado Automático
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_estado_vivienda()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se asigna un cliente y no tiene fecha de asignación, establecerla
  IF NEW.cliente_id IS NOT NULL AND (OLD.cliente_id IS NULL OR OLD.cliente_id IS DISTINCT FROM NEW.cliente_id) THEN
    NEW.fecha_asignacion := NOW();
    NEW.estado := 'Asignada';
    RAISE NOTICE 'Vivienda % asignada a cliente %', NEW.id, NEW.cliente_id;
  END IF;

  -- Si se remueve el cliente, volver a Disponible
  IF NEW.cliente_id IS NULL AND OLD.cliente_id IS NOT NULL THEN
    NEW.estado := 'Disponible';
    NEW.fecha_asignacion := NULL;
    NEW.fecha_pago_completo := NULL;
    RAISE NOTICE 'Vivienda % liberada (cliente removido)', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION actualizar_estado_vivienda IS 'Actualiza automáticamente el estado de la vivienda según asignación de cliente';

-- ============================================
-- TRIGGER (eliminar si existe y recrear)
-- ============================================

DROP TRIGGER IF EXISTS trigger_actualizar_estado_vivienda ON public.viviendas;

CREATE TRIGGER trigger_actualizar_estado_vivienda
BEFORE UPDATE ON public.viviendas
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_vivienda();

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que las columnas existen
DO $$
DECLARE
    columnas_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO columnas_count
    FROM information_schema.columns
    WHERE table_name = 'viviendas'
    AND column_name IN ('cliente_id', 'fecha_asignacion', 'fecha_pago_completo');

    IF columnas_count = 3 THEN
        RAISE NOTICE '✅ Las 3 columnas nuevas existen correctamente';
    ELSE
        RAISE WARNING '⚠️  Solo % de 3 columnas existen', columnas_count;
    END IF;
END $$;

-- Verificar que la vista existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_name = 'vista_viviendas_abonos'
    ) THEN
        RAISE NOTICE '✅ Vista vista_viviendas_abonos creada correctamente';
    ELSE
        RAISE WARNING '⚠️  Vista vista_viviendas_abonos NO existe';
    END IF;
END $$;

-- Verificar que el trigger existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'trigger_actualizar_estado_vivienda'
    ) THEN
        RAISE NOTICE '✅ Trigger trigger_actualizar_estado_vivienda creado correctamente';
    ELSE
        RAISE WARNING '⚠️  Trigger NO existe';
    END IF;
END $$;

-- ============================================
-- CONSULTAS DE PRUEBA (comentadas)
-- ============================================

/*

-- 1. Ver estructura de viviendas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'viviendas'
ORDER BY ordinal_position;

-- 2. Probar la vista de abonos
SELECT * FROM vista_viviendas_abonos
LIMIT 5;

-- 3. Ver viviendas con cliente asignado
SELECT
    v.numero,
    v.estado,
    c.nombre_completo,
    v.fecha_asignacion
FROM viviendas v
LEFT JOIN clientes c ON v.cliente_id = c.id
WHERE v.cliente_id IS NOT NULL;

-- 4. Probar asignación de cliente (CAMBIAR IDs reales)
UPDATE viviendas
SET cliente_id = '[UUID-CLIENTE-REAL]'
WHERE id = '[UUID-VIVIENDA-REAL]';

-- Verificar que el trigger funcionó
SELECT numero, estado, fecha_asignacion
FROM viviendas
WHERE id = '[UUID-VIVIENDA-REAL]';

*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Script ejecutado exitosamente';
END $$;
