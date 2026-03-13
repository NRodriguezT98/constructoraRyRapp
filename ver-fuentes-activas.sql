-- Ver directamente las fuentes activas
SELECT
  fp.tipo,
  fp.entidad,
  fp.monto_aprobado::numeric,
  CASE
    WHEN fp.carta_aprobacion_url IS NOT NULL THEN 'SI'
    ELSE 'NO'
  END as tiene_carta,
  fp.id::text as fuente_id,
  fp.fecha_creacion::date
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
WHERE n.cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND n.estado = 'Activa'
ORDER BY fp.fecha_creacion;
