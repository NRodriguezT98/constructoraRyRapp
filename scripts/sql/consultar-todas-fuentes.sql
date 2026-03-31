-- Consultar todas las fuentes de pago (incluyendo prueba)
SELECT
  id,
  nombre,
  descripcion,
  activo,
  orden,
  CASE
    WHEN configuracion_campos IS NULL THEN 'NULL'
    WHEN configuracion_campos::text = '{"campos": []}' THEN 'VACÍO'
    ELSE jsonb_array_length((configuracion_campos->'campos')::jsonb)::text || ' campos'
  END as num_campos
FROM tipos_fuentes_pago
ORDER BY orden, nombre;
