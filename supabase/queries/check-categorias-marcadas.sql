-- Verificar categorías marcadas como sistema
SELECT
  nombre,
  es_sistema
FROM categorias_documento
ORDER BY nombre;
