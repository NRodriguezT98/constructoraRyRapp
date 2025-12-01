-- Crear un documento de prueba eliminado para verificar que la papelera funciona

-- 1. Insertar documento de prueba
INSERT INTO documentos_cliente (
  cliente_id,
  titulo,
  nombre_archivo,
  nombre_original,
  url_storage,
  tipo_mime,
  tamano_bytes,
  categoria_id,
  estado,
  es_version_actual,
  es_documento_identidad,
  version,
  subido_por,
  fecha_documento
)
VALUES (
  (SELECT id FROM clientes LIMIT 1),
  'DOCUMENTO DE PRUEBA - PAPELERA',
  'prueba-papelera.pdf',
  'prueba-papelera.pdf',
  'clientes/prueba/prueba-papelera.pdf',
  'application/pdf',
  1024,
  (SELECT id FROM categorias_documento WHERE nombre = 'Otros' LIMIT 1),
  'Eliminado',
  true,
  false,
  1,
  'b40e463e-fda3-4c59-9ddd-f1a2ef44b9ad',
  CURRENT_DATE
)
RETURNING id, titulo, estado;
