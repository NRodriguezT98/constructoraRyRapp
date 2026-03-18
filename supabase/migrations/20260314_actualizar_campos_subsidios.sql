-- Migración: 2026-03-14 - Actualizar campos de Subsidio Caja y Mi Casa Ya
--
-- Cambios:
--   Subsidio Caja Compensación: numero_referencia → numero_acta + fecha_acta
--   Mi Casa Ya: agregar fecha_resolucion al campo de número de resolución existente

-- ── Subsidio Caja Compensación ─────────────────────────────────────────────
-- Reemplaza "Referencia" por "Número de Acta" + "Fecha del Acta"
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
      "nombre": "numero_acta",
      "tipo": "text",
      "rol": "referencia",
      "label": "Número de Acta",
      "placeholder": "Ej: ACTA-2025-001",
      "requerido": false,
      "orden": 3,
      "ayuda": "Número del acta de aprobación del subsidio"
    },
    {
      "nombre": "fecha_acta",
      "tipo": "date",
      "rol": "informativo",
      "label": "Fecha del Acta",
      "placeholder": "",
      "requerido": false,
      "orden": 4,
      "ayuda": "Fecha del acta de aprobación del subsidio"
    }
  ]
}'::jsonb
WHERE nombre = 'Subsidio Caja Compensación';

-- ── Subsidio Mi Casa Ya ────────────────────────────────────────────────────
-- Agrega campo "Fecha de la Resolución" (tipo date)
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
    },
    {
      "nombre": "fecha_resolucion",
      "tipo": "date",
      "rol": "informativo",
      "label": "Fecha de la Resolución",
      "placeholder": "",
      "requerido": false,
      "orden": 3,
      "ayuda": "Fecha de expedición de la resolución del subsidio"
    }
  ]
}'::jsonb
WHERE nombre = 'Subsidio Mi Casa Ya';
