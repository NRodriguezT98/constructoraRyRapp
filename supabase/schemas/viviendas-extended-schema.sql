-- ============================================
-- EXTENSIÓN SCHEMA: Viviendas Completo
-- Descripción: Campos adicionales para gestión completa de viviendas
-- Fecha: 2025-10-15
-- ============================================

-- Primero eliminamos la tabla viviendas existente si queremos recrearla
-- O usamos ALTER TABLE para agregar columnas

-- OPCIÓN 1: Agregar columnas a la tabla existente (RECOMENDADO)
-- ============================================

-- Agregar campos de Linderos
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS lindero_norte TEXT CHECK (length(lindero_norte) >= 10 AND length(lindero_norte) <= 500);
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS lindero_sur TEXT CHECK (length(lindero_sur) >= 10 AND length(lindero_sur) <= 500);
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS lindero_oriente TEXT CHECK (length(lindero_oriente) >= 10 AND length(lindero_oriente) <= 500);
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS lindero_occidente TEXT CHECK (length(lindero_occidente) >= 10 AND length(lindero_occidente) <= 500);

-- Agregar campos de Información Legal
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS matricula_inmobiliaria VARCHAR(20) CHECK (length(matricula_inmobiliaria) >= 7); -- Formato: 373-123456
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS nomenclatura VARCHAR(150) CHECK (length(nomenclatura) >= 5); -- Formato: Calle 4A Sur # 4 - 05
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS area_lote NUMERIC(10, 2) CHECK (area_lote >= 1 AND area_lote <= 10000); -- Hasta 2 decimales
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS area_construida NUMERIC(10, 2) CHECK (area_construida >= 1 AND area_construida <= 10000); -- Hasta 2 decimales
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS tipo_vivienda VARCHAR(20) CHECK (tipo_vivienda IN ('Regular', 'Irregular'));
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS certificado_tradicion_url TEXT; -- URL en Supabase Storage

-- Constraint de unicidad para matrícula inmobiliaria
CREATE UNIQUE INDEX IF NOT EXISTS idx_matricula_inmobiliaria_unica ON public.viviendas(matricula_inmobiliaria) WHERE matricula_inmobiliaria IS NOT NULL;

-- Agregar campos Financieros
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS valor_base BIGINT NOT NULL DEFAULT 0 CHECK (valor_base >= 1000000); -- Solo enteros, sin decimales
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS es_esquinera BOOLEAN DEFAULT false;
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS recargo_esquinera BIGINT DEFAULT 0; -- Solo enteros
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS gastos_notariales BIGINT DEFAULT 5000000; -- Valor por defecto 5M, solo enteros
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS valor_total BIGINT GENERATED ALWAYS AS (valor_base + gastos_notariales + recargo_esquinera) STORED;

-- Agregar campos de Asignación de Cliente
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL;
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS fecha_asignacion TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.viviendas ADD COLUMN IF NOT EXISTS fecha_pago_completo TIMESTAMP WITH TIME ZONE;

-- Índice para mejorar búsquedas por cliente
CREATE INDEX IF NOT EXISTS idx_viviendas_cliente_id ON public.viviendas(cliente_id) WHERE cliente_id IS NOT NULL;

-- Renombrar/ajustar columnas existentes
-- La columna 'precio' es redundante, ahora usamos 'valor_total' que se calcula automáticamente
-- Podemos mantener 'precio' por compatibilidad o eliminarla
-- ALTER TABLE public.viviendas DROP COLUMN IF EXISTS precio;

-- La columna 'area' se puede mapear a area_construida
-- UPDATE public.viviendas SET area_construida = area WHERE area_construida IS NULL;
-- ALTER TABLE public.viviendas DROP COLUMN IF EXISTS area;

-- ============================================
-- TABLA: Configuración de Recargos (para valores variables)
-- ============================================
CREATE TABLE IF NOT EXISTS public.configuracion_recargos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL UNIQUE, -- 'esquinera_5M', 'esquinera_10M', 'gastos_notariales'
    nombre VARCHAR(100) NOT NULL,
    valor NUMERIC(15, 2) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar valores por defecto
INSERT INTO public.configuracion_recargos (tipo, nombre, valor, descripcion) VALUES
    ('esquinera_5M', 'Recargo Esquinera $5.000.000', 5000000, 'Recargo por vivienda en esquina - Opción 1'),
    ('esquinera_10M', 'Recargo Esquinera $10.000.000', 10000000, 'Recargo por vivienda en esquina - Opción 2'),
    ('gastos_notariales', 'Gastos Notariales', 5000000, 'Recargo obligatorio por gastos notariales')
ON CONFLICT (tipo) DO NOTHING;

-- Índice para configuración_recargos
CREATE INDEX idx_configuracion_recargos_tipo ON public.configuracion_recargos(tipo);
CREATE INDEX idx_configuracion_recargos_activo ON public.configuracion_recargos(activo);

-- Trigger para actualización
CREATE TRIGGER update_configuracion_recargos_fecha_actualizacion
    BEFORE UPDATE ON public.configuracion_recargos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS para configuración_recargos
ALTER TABLE public.configuracion_recargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver configuración de recargos"
    ON public.configuracion_recargos FOR SELECT
    USING (true);

CREATE POLICY "Solo administradores pueden modificar recargos"
    ON public.configuracion_recargos FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- FUNCIÓN: Calcular viviendas disponibles en manzana
-- ============================================
CREATE OR REPLACE FUNCTION obtener_viviendas_disponibles_manzana(p_manzana_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_viviendas INTEGER;
    viviendas_creadas INTEGER;
BEGIN
    -- Obtener total de viviendas configuradas en la manzana
    SELECT numero_viviendas INTO total_viviendas
    FROM public.manzanas
    WHERE id = p_manzana_id;

    -- Contar viviendas ya creadas
    SELECT COUNT(*) INTO viviendas_creadas
    FROM public.viviendas
    WHERE manzana_id = p_manzana_id;

    -- Retornar disponibles
    RETURN COALESCE(total_viviendas, 0) - COALESCE(viviendas_creadas, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Obtener siguiente número de vivienda
-- ============================================
CREATE OR REPLACE FUNCTION obtener_siguiente_numero_vivienda(p_manzana_id UUID)
RETURNS INTEGER AS $$
DECLARE
    siguiente_numero INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(numero AS INTEGER)), 0) + 1 INTO siguiente_numero
    FROM public.viviendas
    WHERE manzana_id = p_manzana_id
    AND numero ~ '^\d+$'; -- Solo números

    RETURN siguiente_numero;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTA: Manzanas con disponibilidad
-- ============================================
CREATE OR REPLACE VIEW public.vista_manzanas_disponibilidad AS
SELECT
    m.id,
    m.proyecto_id,
    m.nombre,
    m.numero_viviendas as total_viviendas,
    COUNT(v.id) as viviendas_creadas,
    (m.numero_viviendas - COUNT(v.id)) as viviendas_disponibles,
    CASE
        WHEN (m.numero_viviendas - COUNT(v.id)) > 0 THEN true
        ELSE false
    END as tiene_disponibles
FROM public.manzanas m
LEFT JOIN public.viviendas v ON m.id = v.manzana_id
GROUP BY m.id, m.proyecto_id, m.nombre, m.numero_viviendas;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON COLUMN public.viviendas.lindero_norte IS 'Lindero Norte de la vivienda';
COMMENT ON COLUMN public.viviendas.lindero_sur IS 'Lindero Sur de la vivienda';
COMMENT ON COLUMN public.viviendas.lindero_oriente IS 'Lindero Oriente de la vivienda';
COMMENT ON COLUMN public.viviendas.lindero_occidente IS 'Lindero Occidente de la vivienda';
COMMENT ON COLUMN public.viviendas.matricula_inmobiliaria IS 'Número de matrícula inmobiliaria';
COMMENT ON COLUMN public.viviendas.nomenclatura IS 'Nomenclatura o dirección oficial';
COMMENT ON COLUMN public.viviendas.area_lote IS 'Área del lote en metros cuadrados';
COMMENT ON COLUMN public.viviendas.area_construida IS 'Área construida en metros cuadrados';
COMMENT ON COLUMN public.viviendas.tipo_vivienda IS 'Tipo: Regular o Irregular';
COMMENT ON COLUMN public.viviendas.certificado_tradicion_url IS 'URL del certificado de tradición en Storage';
COMMENT ON COLUMN public.viviendas.valor_base IS 'Valor base de la vivienda';
COMMENT ON COLUMN public.viviendas.es_esquinera IS 'Indica si la vivienda es esquinera (aplica recargo)';
COMMENT ON COLUMN public.viviendas.recargo_esquinera IS 'Monto del recargo por casa esquinera';
COMMENT ON COLUMN public.viviendas.gastos_notariales IS 'Gastos notariales (recargo obligatorio)';
COMMENT ON COLUMN public.viviendas.valor_total IS 'Valor total calculado automáticamente';
COMMENT ON COLUMN public.viviendas.cliente_id IS 'Cliente asignado a la vivienda (NULL = disponible)';
COMMENT ON COLUMN public.viviendas.fecha_asignacion IS 'Fecha en que se asignó la vivienda al cliente';
COMMENT ON COLUMN public.viviendas.fecha_pago_completo IS 'Fecha en que se completó el pago total';

COMMENT ON TABLE public.configuracion_recargos IS 'Configuración de recargos variables del sistema';
COMMENT ON FUNCTION obtener_viviendas_disponibles_manzana IS 'Calcula cuántas viviendas quedan disponibles en una manzana';
COMMENT ON FUNCTION obtener_siguiente_numero_vivienda IS 'Obtiene el siguiente número de vivienda disponible en una manzana';
COMMENT ON VIEW public.vista_manzanas_disponibilidad IS 'Vista con información de disponibilidad de cada manzana';

-- ============================================
-- VISTA: Viviendas con Cálculos de Abonos
-- ============================================
-- Nota: Si la tabla 'abonos' no tiene columna 'estado', ajustar la consulta
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
  IF NEW.cliente_id IS NOT NULL AND OLD.cliente_id IS NULL THEN
    NEW.fecha_asignacion := NOW();
    NEW.estado := 'Asignada';
  END IF;

  -- Si se completa el pago (saldo = 0), marcar como Pagada
  -- Esto se ejecutará desde un trigger en la tabla abonos

  -- Si se remueve el cliente, volver a Disponible
  IF NEW.cliente_id IS NULL AND OLD.cliente_id IS NOT NULL THEN
    NEW.estado := 'Disponible';
    NEW.fecha_asignacion := NULL;
    NEW.fecha_pago_completo := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_estado_vivienda
BEFORE UPDATE ON public.viviendas
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_vivienda();

COMMENT ON FUNCTION actualizar_estado_vivienda IS 'Actualiza automáticamente el estado de la vivienda según asignación de cliente';

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================
/*

1. EJECUTAR ESTE SCRIPT en Supabase SQL Editor

2. VERIFICAR que las columnas se agregaron:
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'viviendas';

3. CONSULTAR manzanas con disponibilidad:
   SELECT * FROM vista_manzanas_disponibilidad
   WHERE tiene_disponibles = true;

4. OBTENER siguiente número de vivienda:
   SELECT obtener_siguiente_numero_vivienda('[manzana_id]');

5. CONSULTAR viviendas con sus abonos:
   SELECT * FROM vista_viviendas_abonos
   WHERE cliente_id IS NOT NULL
   ORDER BY porcentaje_pagado DESC;

6. ACTUALIZAR recargos desde la aplicación:
   UPDATE configuracion_recargos
   SET valor = 6000000
   WHERE tipo = 'gastos_notariales';

*/
