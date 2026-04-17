-- Verificar todos los conflictos potenciales para los 6 nuevos nombres
SELECT c.id, c.nombre, c.user_id, c.es_sistema, c.modulos_permitidos
FROM categorias_documento c
WHERE c.nombre IN (
  'Documento de Identidad',
  'Certificado de Tradición',
  'Escritura Pública',
  'Carta de Aprobación',
  'Comprobante de Pago',
  'Otro Documento'
)
-- Excluir las propias filas del sistema que tienen esos UUIDs
AND c.id NOT IN (
  'b795b842-f035-42ce-9ab9-7fef2e1c5f24',
  'bd49740e-d46d-43c8-973f-196f1418765c',
  'a82ca714-b191-4976-a089-66c031ff1496',
  '4898e798-c188-4f02-bfcf-b2b15be48e34',
  'f84ec757-2f11-4245-a487-5091176feec5',
  'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade'
)
ORDER BY nombre;
