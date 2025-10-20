-- ============================================
-- CONSULTA PREVIA: Obtener datos de Laura
-- ============================================
-- Ejecuta esto PRIMERO para obtener su ID

SELECT
  id,
  nombres,
  apellidos,
  numero_documento,
  documento_identidad_url
FROM clientes
WHERE nombres ILIKE '%laura%'
   OR apellidos ILIKE '%duque%';

-- Copia el "id" del resultado y úsalo en PARTE-3
