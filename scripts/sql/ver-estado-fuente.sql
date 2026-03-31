-- Ver el campo estado_fuente de TODAS las fuentes del cliente
SELECT
  fp.tipo,
  fp.entidad,
  fp.monto_aprobado::numeric,
  fp.estado_fuente,
  CASE
    WHEN fp.estado_fuente = 'activa' THEN '✅ VISIBLE en UI'
    ELSE '❌ OCULTA en UI'
  END as visibilidad,
  fp.id::text
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE n.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND n.estado = 'Activa'
ORDER BY fp.fecha_creacion;
