-- Ver estado de Pedro Pérez
SELECT
  id,
  nombres,
  apellidos,
  numero_documento,
  documento_identidad_url,
  estado
FROM clientes
WHERE numero_documento = '12345678';
