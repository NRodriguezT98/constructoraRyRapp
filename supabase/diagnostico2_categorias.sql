-- Buscar todas las filas con nombres conflictivos
SELECT id, nombre, user_id, es_sistema, modulos_permitidos
FROM categorias_documento
WHERE nombre IN (
  'Documento de Identidad',
  'Certificado de Tradición',
  'Escritura Pública',
  'Carta de Aprobación',
  'Comprobante de Pago',
  'Otro Documento'
)
ORDER BY nombre;
