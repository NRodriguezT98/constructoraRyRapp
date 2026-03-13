-- ============================================
-- SEED: Categorías de Sistema con UUIDs Fijos
-- ============================================
-- Propósito: Garantizar que las categorías críticas tengan UUIDs consistentes
-- Estas categorías son usadas por el sistema de requisitos de fuentes de pago
-- Si se eliminan accidentalmente, se pueden recrear con los mismos UUIDs

-- Usar INSERT ... ON CONFLICT para insertar o ignorar si ya existen
INSERT INTO categorias_documento (
  id,
  nombre,
  descripcion,
  color,
  icono,
  modulos_permitidos,
  es_sistema
) VALUES
  -- ✅ Categoría principal para documentos legales/requisitos
  (
    '4898e798-c188-4f02-bfcf-b2b15be48e34'::uuid,
    'Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso',
    'Cartas de aprobación, promesas de compraventa, actas de entrega, resoluciones, documentos del proceso legal',
    'cyan',
    'FileSignature',
    ARRAY['clientes'],
    true
  ),
  -- ✅ Documentos de Identidad
  (
    'b795b842-f035-42ce-9ab9-7fef2e1c5f24'::uuid,
    'Documentos de Identidad',
    'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación',
    'green',
    'IdCard',
    ARRAY['clientes'],
    true
  ),
  -- ✅ Escrituras Públicas
  (
    'a82ca714-b191-4976-a089-66c031ff1496'::uuid,
    'Escrituras Públicas',
    'Minutas de compraventa',
    'pink',
    'ScrollText',
    ARRAY['clientes'],
    true
  ),
  -- ✅ Certificados de Tradición
  (
    'bd49740e-d46d-43c8-973f-196f1418765c'::uuid,
    'Certificados de Tradición',
    'Certificados de tradición y libertad, certificados de dominio y propiedad',
    'yellow',
    'FileText',
    ARRAY['clientes'],
    true
  ),
  -- ✅ Gastos Notariales
  (
    'f84ec757-2f11-4245-a487-5091176feec5'::uuid,
    'Gastos Notariales, Avalúos y Paz y salvos',
    'Estudio de títulos, avalúos comerciales, gastos notariales, paz y salvos',
    '#F59E0B',
    'receipt',
    ARRAY['clientes'],
    true
  ),
  -- ✅ Otros Documentos (genérico)
  (
    'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade'::uuid,
    'Otros Documentos',
    'Fotos, correspondencia, documentos generales y varios',
    '#6B7280',
    'folder',
    ARRAY['clientes'],
    true
  )
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  color = EXCLUDED.color,
  icono = EXCLUDED.icono,
  modulos_permitidos = EXCLUDED.modulos_permitidos,
  es_sistema = EXCLUDED.es_sistema;

-- Verificar categorías insertadas/actualizadas
SELECT
  id,
  nombre,
  es_sistema,
  modulos_permitidos
FROM categorias_documento
WHERE es_sistema = true
  AND 'clientes' = ANY(modulos_permitidos)
ORDER BY nombre;
