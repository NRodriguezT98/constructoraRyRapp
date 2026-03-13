/**
 * Migración: Configuración Dinámica de Campos en Fuentes de Pago
 *
 * Permite definir qué campos mostrar en el formulario por cada tipo de fuente
 * sin necesidad de hardcodear en el código frontend.
 *
 * Casos de uso:
 * - Cuota Inicial: Solo monto
 * - Crédito Hipotecario: Monto + banco + radicado
 * - Subsidios: Monto + entidad + referencia + campos custom
 * - Fuentes custom futuras: Configuración personalizada
 */

-- ============================================
-- 1. AGREGAR COLUMNA DE CONFIGURACIÓN
-- ============================================

ALTER TABLE tipos_fuentes_pago
ADD COLUMN IF NOT EXISTS configuracion_campos JSONB DEFAULT '{
  "campos": []
}'::jsonb;

COMMENT ON COLUMN tipos_fuentes_pago.configuracion_campos IS
'Configuración JSON de los campos del formulario. Define qué campos mostrar, su tipo, validaciones, etc.';

-- ============================================
-- 2. SEED: CONFIGURACIONES PARA FUENTES OFICIALES
-- ============================================

-- Cuota Inicial (solo monto)
UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "label": "Monto de Cuota Inicial",
      "placeholder": "Ej: 20.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Monto que el cliente pagará como cuota inicial"
    }
  ]
}'::jsonb
WHERE codigo = 'CUOTA_INICIAL';

-- Crédito Hipotecario (monto + banco + radicado)
UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "label": "Monto Aprobado",
      "placeholder": "Ej: 80.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Monto total aprobado por el banco"
    },
    {
      "nombre": "entidad",
      "tipo": "select_banco",
      "label": "Banco",
      "placeholder": "Seleccionar banco...",
      "requerido": true,
      "orden": 2,
      "ayuda": "Entidad bancaria que aprobó el crédito"
    },
    {
      "nombre": "numero_referencia",
      "tipo": "text",
      "label": "Radicado/Número de Crédito",
      "placeholder": "Ej: #BCO-2025-789456",
      "requerido": false,
      "orden": 3,
      "ayuda": "Número de radicado o referencia del crédito"
    }
  ]
}'::jsonb
WHERE codigo = 'CREDITO_HIPOTECARIO';

-- Subsidio Mi Casa Ya (monto + número resolución)
UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "label": "Monto del Subsidio",
      "placeholder": "Ej: 30.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Monto aprobado del subsidio Mi Casa Ya"
    },
    {
      "nombre": "numero_referencia",
      "tipo": "text",
      "label": "Número de Resolución",
      "placeholder": "Ej: RES-2025-12345",
      "requerido": false,
      "orden": 2,
      "ayuda": "Número de la resolución del subsidio"
    }
  ]
}'::jsonb
WHERE codigo = 'SUBSIDIO_MI_CASA_YA';

-- Subsidio Caja Compensación (monto + caja + referencia)
UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "label": "Monto del Subsidio",
      "placeholder": "Ej: 15.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Monto aprobado por la caja de compensación"
    },
    {
      "nombre": "entidad",
      "tipo": "select_caja",
      "label": "Caja de Compensación",
      "placeholder": "Seleccionar caja...",
      "requerido": true,
      "orden": 2,
      "ayuda": "Caja de compensación que aprobó el subsidio"
    },
    {
      "nombre": "numero_referencia",
      "tipo": "text",
      "label": "Número de Referencia",
      "placeholder": "Ej: CAJA-2025-456",
      "requerido": false,
      "orden": 3,
      "ayuda": "Número de referencia del subsidio"
    }
  ]
}'::jsonb
WHERE codigo = 'SUBSIDIO_CAJA_COMPENSACION';

-- ============================================
-- 3. ÍNDICE PARA BÚSQUEDAS EN JSON
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tipos_fuentes_pago_configuracion_campos
ON tipos_fuentes_pago USING GIN (configuracion_campos);

COMMENT ON INDEX idx_tipos_fuentes_pago_configuracion_campos IS
'Índice GIN para búsquedas eficientes en la configuración JSON de campos';

-- ============================================
-- 4. FUNCIÓN AUXILIAR: Validar estructura JSON
-- ============================================

CREATE OR REPLACE FUNCTION validar_configuracion_campos()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que tenga estructura mínima
  IF NEW.configuracion_campos IS NOT NULL THEN
    IF NOT (NEW.configuracion_campos ? 'campos') THEN
      RAISE EXCEPTION 'configuracion_campos debe tener la propiedad "campos"';
    END IF;

    IF jsonb_typeof(NEW.configuracion_campos->'campos') != 'array' THEN
      RAISE EXCEPTION '"campos" debe ser un array';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar en INSERT/UPDATE
DROP TRIGGER IF EXISTS trigger_validar_configuracion_campos ON tipos_fuentes_pago;
CREATE TRIGGER trigger_validar_configuracion_campos
  BEFORE INSERT OR UPDATE OF configuracion_campos
  ON tipos_fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION validar_configuracion_campos();

COMMENT ON FUNCTION validar_configuracion_campos() IS
'Valida que la configuración de campos tenga la estructura JSON correcta';
