/**
 * Script: Agregar Roles a Campos Existentes
 *
 * Actualiza los campos existentes en configuracion_campos para incluir
 * el nuevo campo `rol` que identifica el propósito de cada campo.
 *
 * Roles:
 * - monto: Campo con valor monetario principal
 * - entidad: Banco, caja o cooperativa
 * - referencia: Número de radicado/referencia
 * - informativo: Otros campos sin propósito crítico
 */

-- ============================================
-- CUOTA INICIAL
-- ============================================

UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "rol": "monto",
      "label": "Monto de Cuota Inicial",
      "placeholder": "Ej: 20.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Monto que el cliente pagará como cuota inicial"
    }
  ]
}'::jsonb
WHERE codigo = 'CUOTA_INICIAL';

-- ============================================
-- CRÉDITO HIPOTECARIO
-- ============================================

UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "rol": "monto",
      "label": "Monto Aprobado",
      "placeholder": "Ej: 80.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Monto total aprobado por el banco"
    },
    {
      "nombre": "entidad",
      "tipo": "select_banco",
      "rol": "entidad",
      "label": "Banco",
      "placeholder": "Seleccionar banco...",
      "requerido": true,
      "orden": 2,
      "ayuda": "Entidad bancaria que aprobó el crédito"
    },
    {
      "nombre": "numero_referencia",
      "tipo": "text",
      "rol": "referencia",
      "label": "Radicado/Número de Crédito",
      "placeholder": "Ej: #BCO-2025-789456",
      "requerido": false,
      "orden": 3,
      "ayuda": "Número de radicado o referencia del crédito"
    }
  ]
}'::jsonb
WHERE codigo = 'CREDITO_HIPOTECARIO';

-- ============================================
-- SUBSIDIO MI CASA YA
-- ============================================

UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "rol": "monto",
      "label": "Monto del Subsidio",
      "placeholder": "Ej: 30.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Monto aprobado del subsidio Mi Casa Ya"
    },
    {
      "nombre": "numero_referencia",
      "tipo": "text",
      "rol": "referencia",
      "label": "Número de Resolución",
      "placeholder": "Ej: RES-2025-12345",
      "requerido": false,
      "orden": 2,
      "ayuda": "Número de resolución del subsidio"
    }
  ]
}'::jsonb
WHERE codigo = 'SUBSIDIO_MI_CASA_YA';

-- ============================================
-- SUBSIDIO CAJA COMPENSACIÓN
-- ============================================

UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "rol": "monto",
      "label": "Monto del Subsidio",
      "placeholder": "Ej: 15.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Monto aprobado del subsidio de caja"
    },
    {
      "nombre": "entidad",
      "tipo": "select_caja",
      "rol": "entidad",
      "label": "Caja de Compensación",
      "placeholder": "Seleccionar caja...",
      "requerido": true,
      "orden": 2,
      "ayuda": "Caja de compensación que otorgó el subsidio"
    },
    {
      "nombre": "numero_referencia",
      "tipo": "text",
      "rol": "referencia",
      "label": "Número de Subsidio",
      "placeholder": "Ej: #SUB-2025-456",
      "requerido": false,
      "orden": 3,
      "ayuda": "Número de referencia o radicado del subsidio"
    }
  ]
}'::jsonb
WHERE codigo = 'SUBSIDIO_CAJA';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Consultar tipos actualizados con roles
SELECT
  id,
  nombre,
  codigo,
  jsonb_pretty(configuracion_campos) as configuracion
FROM tipos_fuentes_pago
WHERE activo = true
ORDER BY orden;
