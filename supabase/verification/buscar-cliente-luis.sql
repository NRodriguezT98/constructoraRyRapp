-- ================================================
-- DIAGNÓSTICO SIMPLE: Cliente con Documentos
-- ================================================
-- Fecha: 2025-12-01

-- 1. Buscar el cliente problemático
SELECT
  id,
  nombres,
  apellidos,
  numero_documento,
  tipo_documento,
  documento_identidad_url,
  fecha_creacion,
  fecha_actualizacion
FROM clientes
WHERE nombres ILIKE '%Luis%'
   AND apellidos ILIKE '%Salazar%'
ORDER BY fecha_creacion DESC
LIMIT 3;
