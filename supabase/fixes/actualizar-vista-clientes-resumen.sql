-- Actualizar vista para incluir nombres y apellidos por separado
DROP VIEW IF EXISTS public.vista_clientes_resumen CASCADE;

CREATE VIEW public.vista_clientes_resumen AS
SELECT
  c.id,
  c.nombres,
  c.apellidos,
  c.nombre_completo,
  c.tipo_documento,
  c.numero_documento,
  c.telefono,
  c.email,
  c.estado,
  c.fecha_creacion,
  COUNT(n.id) as total_negociaciones,
  COUNT(CASE WHEN n.estado = 'Activa' THEN 1 END) as negociaciones_activas,
  COUNT(CASE WHEN n.estado = 'Completada' THEN 1 END) as negociaciones_completadas,
  MAX(n.fecha_creacion) as ultima_negociacion
FROM public.clientes c
LEFT JOIN public.negociaciones n ON c.id = n.cliente_id
GROUP BY c.id;
