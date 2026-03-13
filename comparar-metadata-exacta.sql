-- 🔍 COMPARAR EXACTAMENTE PENDIENTE VS SUBIDO
-- Ver si hay match exacto entre metadata

WITH pendiente AS (
  SELECT
    dp.id as pendiente_id,
    dp.fuente_pago_id as pendiente_fuente_id,
    dp.metadata->>'tipo_fuente' as pendiente_tipo_fuente,
    dp.metadata->>'entidad' as pendiente_entidad,
    dp.cliente_id as pendiente_cliente_id
  FROM documentos_pendientes dp
  WHERE dp.id = 'a87dedc0-dc9f-4dec-8c92-0094227de63e'
),
subido AS (
  SELECT
    dc.id as documento_id,
    dc.metadata->>'fuente_pago_id' as subido_fuente_id,
    dc.metadata->>'tipo_fuente' as subido_tipo_fuente,
    dc.metadata->>'entidad' as subido_entidad,
    dc.cliente_id as subido_cliente_id
  FROM documentos_cliente dc
  WHERE dc.id = 'd4aa2a76-95c9-4adc-96e0-ef0b68978bc9'
)
SELECT
  p.*,
  s.*,
  CASE
    WHEN p.pendiente_fuente_id = s.subido_fuente_id::uuid THEN 'MATCH ✅'
    ELSE 'NO MATCH ❌'
  END as fuente_pago_match,
  CASE
    WHEN p.pendiente_cliente_id = s.subido_cliente_id THEN 'MATCH ✅'
    ELSE 'NO MATCH ❌'
  END as cliente_match
FROM pendiente p
CROSS JOIN subido s;
