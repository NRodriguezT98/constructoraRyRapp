-- Diagnóstico: Ver estado actual de fuentes de pago
SELECT
  id,
  tipo,
  entidad as "Campo entidad (puede ser UUID o nombre)",
  entidad_financiera_id as "FK a entidades_financieras",
  CASE
    WHEN entidad_financiera_id IS NOT NULL THEN 'Tiene FK (correcto)'
    WHEN entidad ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'Entidad es UUID (ERROR)'
    WHEN entidad IS NULL THEN 'Sin entidad'
    ELSE 'Entidad es texto (legacy)'
  END as "Estado",
  estado_fuente
FROM public.fuentes_pago
WHERE estado_fuente = 'activa'
ORDER BY tipo;
