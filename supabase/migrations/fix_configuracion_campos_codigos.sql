-- Fix aplicado: 2026-03-14
-- Razón: 20251224_agregar_configuracion_campos_fuentes.sql usó
-- WHERE codigo = 'MAYUSCULAS' pero los códigos en BD son minúsculas.
-- Resultado: 0 filas actualizadas, sin error → bug silencioso.
--
-- Este script usa WHERE nombre = '...' como alternativa segura
-- y aplica solo si configuracion_campos está vacío (idempotente).

-- Cuota Inicial (solo monto)
UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "rol": "monto",
      "label": "Monto Cuota Inicial",
      "placeholder": "Ej: 8.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Ingresa el monto de la cuota inicial con la que el cliente aplicará"
    }
  ]
}'::jsonb
WHERE nombre = 'Cuota Inicial'
  AND (configuracion_campos IS NULL OR configuracion_campos = '{"campos": []}'::jsonb OR jsonb_array_length(configuracion_campos->'campos') = 0);

-- Crédito Hipotecario (monto + banco + radicado)
UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "rol": "monto",
      "label": "Monto Crédito Aprobado",
      "placeholder": "Ej: 80.000.000",
      "requerido": true,
      "orden": 1,
      "ayuda": "Escribe aquí el monto de crédito aprobado del cliente"
    },
    {
      "nombre": "entidad",
      "tipo": "select_banco",
      "rol": "entidad",
      "label": "Banco",
      "placeholder": "Seleccionar...",
      "requerido": true,
      "orden": 2,
      "ayuda": "Selecciona el Banco que aprueba el crédito"
    },
    {
      "nombre": "numero_referencia",
      "tipo": "text",
      "rol": "referencia",
      "label": "Referencia Crédito",
      "placeholder": "SIB_2025_123456",
      "requerido": false,
      "orden": 3,
      "ayuda": "Escribe aquí la referencia del crédito si es que existe."
    }
  ]
}'::jsonb
WHERE nombre = 'Crédito Hipotecario';

-- Subsidio Mi Casa Ya (monto + resolución)
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
      "ayuda": "Número de la resolución del subsidio"
    }
  ]
}'::jsonb
WHERE nombre = 'Subsidio Mi Casa Ya'
  AND (configuracion_campos IS NULL OR configuracion_campos = '{"campos": []}'::jsonb OR jsonb_array_length(configuracion_campos->'campos') = 0);

-- Subsidio Caja Compensación (monto + caja + referencia)
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
      "ayuda": "Monto aprobado por la caja de compensación"
    },
    {
      "nombre": "entidad",
      "tipo": "select_caja",
      "rol": "entidad",
      "label": "Caja de Compensación",
      "placeholder": "Seleccionar...",
      "requerido": true,
      "orden": 2,
      "ayuda": "Selecciona la caja de compensación que aprobó el subsidio"
    },
    {
      "nombre": "numero_referencia",
      "tipo": "text",
      "rol": "referencia",
      "label": "Número de Referencia",
      "placeholder": "Ej: CAJA-2025-456",
      "requerido": false,
      "orden": 3,
      "ayuda": "Número de referencia del subsidio"
    }
  ]
}'::jsonb
WHERE nombre = 'Subsidio Caja Compensación'
  AND (configuracion_campos IS NULL OR configuracion_campos = '{"campos": []}'::jsonb OR jsonb_array_length(configuracion_campos->'campos') = 0);

-- Verificar resultado
SELECT nombre, codigo, jsonb_array_length(configuracion_campos->'campos') AS num_campos
FROM tipos_fuentes_pago
ORDER BY orden;
