-- 🔍 VERIFICAR ESTADO REAL DE FUENTES DE PAGO
-- Ver si las cartas están realmente vinculadas en BD

SELECT
  fp.id,
  fp.entidad,
  fp.tipo,
  fp.monto_aprobado,
  fp.carta_aprobacion_url,
  fp.estado_documentacion,
  CASE
    WHEN fp.carta_aprobacion_url IS NOT NULL THEN '✅ TIENE CARTA'
    ELSE '❌ SIN CARTA'
  END as estado_visual,
  fp.fecha_actualizacion,
  n.cliente_id,
  c.nombres || ' ' || c.apellidos as cliente_nombre
FROM fuentes_pago fp
JOIN negociaciones n ON n.id = fp.negociacion_id
JOIN clientes c ON c.id = n.cliente_id
WHERE fp.entidad IN ('Comfandi', 'Comfenalco')
  OR fp.tipo IN ('Crédito Hipotecario', 'Cuota Inicial')
ORDER BY fp.fecha_creacion DESC
LIMIT 5;
