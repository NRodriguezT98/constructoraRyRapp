-- Agregar configuración de campos a "Fuente de Pago Prueba"
UPDATE tipos_fuentes_pago
SET configuracion_campos = '{
  "campos": [
    {
      "nombre": "monto_aprobado",
      "tipo": "currency",
      "label": "Monto Aprobado",
      "placeholder": "Ej: 50.000.000",
      "ayuda": "Monto total aprobado para esta fuente",
      "requerido": true,
      "orden": 1
    }
  ]
}'::jsonb
WHERE nombre = 'Fuente de Pago Prueba';

-- Verificar resultado
SELECT
  id,
  nombre,
  activo,
  orden,
  jsonb_array_length((configuracion_campos->'campos')::jsonb) as num_campos
FROM tipos_fuentes_pago
WHERE nombre = 'Fuente de Pago Prueba';
