-- ============================================
-- SEED: Categorías de Sistema con UUIDs Fijos
-- ============================================
-- Propósito: Garantizar que las categorías críticas tengan UUIDs consistentes
-- Estas categorías son usadas por el sistema de requisitos de fuentes de pago
-- Si se eliminan accidentalmente, se pueden recrear con los mismos UUIDs
-- Actualizado: 2026-04-17 — 9 categorías específicas y singulares

-- Usar INSERT ... ON CONFLICT para insertar o actualizar
INSERT INTO categorias_documento (
  id,
  nombre,
  descripcion,
  color,
  icono,
  modulos_permitidos,
  es_sistema,
  es_global,
  orden
) VALUES
  -- 1. Documento de Identidad
  (
    'b795b842-f035-42ce-9ab9-7fef2e1c5f24'::uuid,
    'Documento de Identidad',
    'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación',
    'green',
    'IdCard',
    ARRAY['clientes'],
    true,
    true,
    1
  ),
  -- 2. Certificado de Tradición
  (
    'bd49740e-d46d-43c8-973f-196f1418765c'::uuid,
    'Certificado de Tradición',
    'Certificado de tradición y libertad, matrícula inmobiliaria, análisis de título, avalúo comercial, estudio de títulos',
    'yellow',
    'BookMarked',
    ARRAY['clientes'],
    true,
    true,
    2
  ),
  -- 3. Promesa de Compraventa (nueva)
  (
    'c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a'::uuid,
    'Promesa de Compraventa',
    'Promesa de compraventa (borrador y firmada), minuta borrador, contrato de reserva',
    'indigo',
    'FilePen',
    ARRAY['clientes'],
    true,
    true,
    3
  ),
  -- 4. Carta de Aprobación (⚠️ UUID CRÍTICO — usado en triggers)
  (
    '4898e798-c188-4f02-bfcf-b2b15be48e34'::uuid,
    'Carta de Aprobación',
    'Carta de aprobación crédito hipotecario, carta de asignación subsidio (Mi Casa Ya, Caja de Compensación), carta de ratificación',
    'cyan',
    'BadgeCheck',
    ARRAY['clientes'],
    true,
    true,
    4
  ),
  -- 5. Acta de Entrega (nueva)
  (
    'd8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b'::uuid,
    'Acta de Entrega',
    'Acta de entrega física del inmueble (borrador y firmada)',
    'teal',
    'ClipboardCheck',
    ARRAY['clientes'],
    true,
    true,
    5
  ),
  -- 6. Escritura Pública
  (
    'a82ca714-b191-4976-a089-66c031ff1496'::uuid,
    'Escritura Pública',
    'Escritura pública de compraventa protocolizada, hojas de escritura, minuta final',
    'pink',
    'ScrollText',
    ARRAY['clientes'],
    true,
    true,
    6
  ),
  -- 7. Documento de Desembolso (nueva)
  (
    'e9c3a4b5-6d7e-4f8a-ab9c-3d4e5f6a7b8c'::uuid,
    'Documento de Desembolso',
    'Autorización de desembolso, cuenta de cobro, carta remisoria, certificación bancaria, formato de existencia',
    'sky',
    'Landmark',
    ARRAY['clientes'],
    true,
    true,
    7
  ),
  -- 8. Comprobante de Pago
  (
    'f84ec757-2f11-4245-a487-5091176feec5'::uuid,
    'Comprobante de Pago',
    'Boleta de registro, factura notarial, recibos de pago boleta fiscal, pago estudio de títulos, paz y salvos',
    'emerald',
    'Receipt',
    ARRAY['clientes'],
    true,
    true,
    8
  ),
  -- 9. Otro Documento (genérico)
  (
    'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade'::uuid,
    'Otro Documento',
    'Fotos de vivienda, correspondencia, documentos varios',
    '#6B7280',
    'FolderOpen',
    ARRAY['clientes'],
    true,
    true,
    9
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
