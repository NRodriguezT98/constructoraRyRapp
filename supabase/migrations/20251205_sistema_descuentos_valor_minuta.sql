-- =====================================================
-- Migración: Sistema de Descuentos y Valor en Minuta
-- =====================================================
-- Fecha: 2025-12-05
-- Propósito: Implementar descuentos personalizados por cliente
--            y valor diferenciado en escritura pública
-- =====================================================

-- 1. Agregar columna gastos_notariales a viviendas
ALTER TABLE viviendas
ADD COLUMN IF NOT EXISTS gastos_notariales DECIMAL(15,2) DEFAULT 5000000;

COMMENT ON COLUMN viviendas.gastos_notariales IS
'Gastos de escrituración, registro y notaría (valor fijo por vivienda)';

-- 2. Actualizar viviendas existentes con valor por defecto
UPDATE viviendas
SET gastos_notariales = 5000000
WHERE gastos_notariales IS NULL;

-- 3. Agregar campos de descuento y valor escritura a negociaciones
ALTER TABLE negociaciones
ADD COLUMN IF NOT EXISTS descuento_aplicado DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tipo_descuento VARCHAR(50),
ADD COLUMN IF NOT EXISTS motivo_descuento TEXT,
ADD COLUMN IF NOT EXISTS porcentaje_descuento DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_escritura_publica DECIMAL(15,2);

-- 4. Comentarios descriptivos
COMMENT ON COLUMN negociaciones.descuento_aplicado IS
'Monto de descuento aplicado sobre el valor total original (valor_base + gastos_notariales)';

COMMENT ON COLUMN negociaciones.tipo_descuento IS
'Tipo de descuento: trabajador_empresa, cliente_vip, promocion_especial, convenio_institucional, compra_contado, familiar_empleado, otro';

COMMENT ON COLUMN negociaciones.motivo_descuento IS
'Razón específica del descuento aplicado (obligatorio si descuento_aplicado > 0)';

COMMENT ON COLUMN negociaciones.porcentaje_descuento IS
'Porcentaje de descuento calculado automáticamente: (descuento_aplicado / valor_total_original) * 100';

COMMENT ON COLUMN negociaciones.valor_escritura_publica IS
'Valor que figura en escritura pública/minuta de compraventa (puede ser diferente al valor_negociado para facilitar crédito bancario). Valor sugerido: $128.000.000';

-- 5. Constraints de validación
ALTER TABLE negociaciones
ADD CONSTRAINT chk_descuento_no_negativo
  CHECK (descuento_aplicado >= 0),
ADD CONSTRAINT chk_valor_escritura_positivo
  CHECK (valor_escritura_publica IS NULL OR valor_escritura_publica > 0);

-- 6. Trigger para calcular porcentaje de descuento automáticamente
CREATE OR REPLACE FUNCTION calcular_porcentaje_descuento()
RETURNS TRIGGER AS $$
DECLARE
  valor_total_original DECIMAL(15,2);
BEGIN
  -- Calcular valor total original (valor_negociado + descuento_aplicado)
  IF NEW.descuento_aplicado > 0 THEN
    valor_total_original := NEW.valor_negociado + NEW.descuento_aplicado;

    -- Calcular porcentaje
    IF valor_total_original > 0 THEN
      NEW.porcentaje_descuento := ROUND((NEW.descuento_aplicado / valor_total_original) * 100, 2);
    ELSE
      NEW.porcentaje_descuento := 0;
    END IF;
  ELSE
    NEW.porcentaje_descuento := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Calcular antes de INSERT o UPDATE
CREATE TRIGGER trigger_calcular_porcentaje_descuento
BEFORE INSERT OR UPDATE ON negociaciones
FOR EACH ROW
EXECUTE FUNCTION calcular_porcentaje_descuento();

-- 7. Trigger para validar motivo cuando hay descuento
CREATE OR REPLACE FUNCTION validar_motivo_descuento()
RETURNS TRIGGER AS $$
BEGIN
  -- Si hay descuento, motivo es obligatorio
  IF NEW.descuento_aplicado > 0 THEN
    IF NEW.tipo_descuento IS NULL OR NEW.tipo_descuento = '' THEN
      RAISE EXCEPTION 'tipo_descuento es obligatorio cuando hay descuento aplicado';
    END IF;

    IF NEW.motivo_descuento IS NULL OR LENGTH(TRIM(NEW.motivo_descuento)) < 10 THEN
      RAISE EXCEPTION 'motivo_descuento debe tener al menos 10 caracteres cuando hay descuento aplicado';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Validar antes de INSERT o UPDATE
CREATE TRIGGER trigger_validar_motivo_descuento
BEFORE INSERT OR UPDATE ON negociaciones
FOR EACH ROW
EXECUTE FUNCTION validar_motivo_descuento();

-- 8. Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_negociaciones_descuento_aplicado
ON negociaciones(descuento_aplicado)
WHERE descuento_aplicado > 0;

CREATE INDEX IF NOT EXISTS idx_negociaciones_tipo_descuento
ON negociaciones(tipo_descuento)
WHERE tipo_descuento IS NOT NULL;

-- 9. Vista para reportes de descuentos
CREATE OR REPLACE VIEW vista_descuentos_aplicados AS
SELECT
  n.id AS negociacion_id,
  c.nombre_completo AS cliente,
  v.numero AS vivienda,
  COALESCE(m.nombre, 'Sin Manzana') AS manzana,
  p.nombre AS proyecto,
  (n.valor_negociado + n.descuento_aplicado) AS valor_original,
  n.descuento_aplicado,
  n.porcentaje_descuento,
  n.tipo_descuento,
  n.motivo_descuento,
  n.valor_negociado AS valor_final,
  n.valor_escritura_publica,
  COALESCE(n.valor_escritura_publica - n.valor_negociado, 0) AS diferencia_notarial,
  n.fecha_negociacion,
  n.estado
FROM negociaciones n
JOIN clientes c ON n.cliente_id = c.id
JOIN viviendas v ON n.vivienda_id = v.id
LEFT JOIN manzanas m ON v.manzana_id = m.id
LEFT JOIN proyectos p ON m.proyecto_id = p.id
WHERE n.descuento_aplicado > 0
ORDER BY n.descuento_aplicado DESC;

COMMENT ON VIEW vista_descuentos_aplicados IS
'Vista para generar reportes de descuentos aplicados en negociaciones';

-- 10. Función auxiliar para obtener valor total original de una negociación
CREATE OR REPLACE FUNCTION get_valor_total_original(negociacion_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  valor_total DECIMAL(15,2);
BEGIN
  SELECT valor_negociado + COALESCE(descuento_aplicado, 0)
  INTO valor_total
  FROM negociaciones
  WHERE id = negociacion_id;

  RETURN COALESCE(valor_total, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_valor_total_original IS
'Devuelve el valor total original de una negociación (antes de descuento)';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar columnas agregadas
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'negociaciones'
  AND column_name IN (
    'descuento_aplicado',
    'tipo_descuento',
    'motivo_descuento',
    'porcentaje_descuento',
    'valor_escritura_publica'
  )
ORDER BY column_name;

-- Verificar triggers creados
SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'negociaciones'
  AND trigger_name LIKE '%descuento%'
ORDER BY trigger_name;
