-- ============================================================
-- MIGRACIÓN: Refactor categorías de clientes
-- Fecha: 2026-04-17
-- Descripción:
--   1. Renombrar categorías existentes (singular, nombres específicos)
--   2. Mejorar iconos y colores
--   3. Insertar 3 categorías nuevas (Promesa de Compraventa,
--      Acta de Entrega, Documento de Desembolso)
--   4. Reasignar documentos existentes con tipo_documento_sistema
--      que ahora tienen categoría propia
-- Nota: Se desactiva trigger protector temporalmente para poder renombrar
-- ============================================================

-- ── 0. Desactivar trigger de protección temporalmente ────────
ALTER TABLE categorias_documento DISABLE TRIGGER trigger_proteger_categoria_sistema;

UPDATE categorias_documento SET
  nombre      = 'Documento de Identidad',
  descripcion = 'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación',
  icono       = 'IdCard',
  color       = 'green'
WHERE id = 'b795b842-f035-42ce-9ab9-7fef2e1c5f24';

UPDATE categorias_documento SET
  nombre      = 'Certificado de Tradición',
  descripcion = 'Certificado de tradición y libertad, matrícula inmobiliaria, análisis de título, avalúo comercial, estudio de títulos',
  icono       = 'BookMarked',
  color       = 'yellow'
WHERE id = 'bd49740e-d46d-43c8-973f-196f1418765c';

UPDATE categorias_documento SET
  nombre      = 'Escritura Pública',
  descripcion = 'Escritura pública de compraventa protocolizada, hojas de escritura, minuta final',
  icono       = 'ScrollText',
  color       = 'pink'
WHERE id = 'a82ca714-b191-4976-a089-66c031ff1496';

-- ⚠️ CRÍTICA: UUID usado en triggers y sistema de documentos pendientes
UPDATE categorias_documento SET
  nombre      = 'Carta de Aprobación',
  descripcion = 'Carta de aprobación crédito hipotecario, carta de asignación subsidio (Mi Casa Ya, Caja de Compensación), carta de ratificación',
  icono       = 'BadgeCheck',
  color       = 'cyan'
WHERE id = '4898e798-c188-4f02-bfcf-b2b15be48e34';

UPDATE categorias_documento SET
  nombre      = 'Comprobante de Pago',
  descripcion = 'Boleta de registro, factura notarial, recibos de pago boleta fiscal, pago estudio de títulos, paz y salvos',
  icono       = 'Receipt',
  color       = 'emerald'
WHERE id = 'f84ec757-2f11-4245-a487-5091176feec5';

UPDATE categorias_documento SET
  nombre      = 'Otro Documento',
  descripcion = 'Fotos de vivienda, correspondencia, documentos varios',
  icono       = 'FolderOpen',
  color       = '#6B7280'
WHERE id = 'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade';

-- ── 2. Insertar nuevas categorías ────────────────────────────

INSERT INTO categorias_documento (
  id, nombre, descripcion, color, icono,
  modulos_permitidos, es_sistema, es_global, orden
) VALUES
  (
    'c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a',
    'Promesa de Compraventa',
    'Promesa de compraventa (borrador y firmada), minuta borrador, contrato de reserva',
    'indigo',
    'FilePen',
    ARRAY['clientes'],
    true,
    true,
    3
  ),
  (
    'd8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b',
    'Acta de Entrega',
    'Acta de entrega física del inmueble (borrador y firmada)',
    'teal',
    'ClipboardCheck',
    ARRAY['clientes'],
    true,
    true,
    5
  ),
  (
    'e9c3a4b5-6d7e-4f8a-ab9c-3d4e5f6a7b8c',
    'Documento de Desembolso',
    'Autorización de desembolso, cuenta de cobro, carta remisoria, certificación bancaria, formato de existencia',
    'sky',
    'Landmark',
    ARRAY['clientes'],
    true,
    true,
    7
  )
ON CONFLICT (id) DO UPDATE SET
  nombre      = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  color       = EXCLUDED.color,
  icono       = EXCLUDED.icono,
  es_sistema  = EXCLUDED.es_sistema;

-- ── 3. Actualizar orden de categorías existentes ─────────────

UPDATE categorias_documento SET orden = 1 WHERE id = 'b795b842-f035-42ce-9ab9-7fef2e1c5f24';
UPDATE categorias_documento SET orden = 2 WHERE id = 'bd49740e-d46d-43c8-973f-196f1418765c';
-- 3 = Promesa de Compraventa (nueva)
UPDATE categorias_documento SET orden = 4 WHERE id = '4898e798-c188-4f02-bfcf-b2b15be48e34';
-- 5 = Acta de Entrega (nueva)
UPDATE categorias_documento SET orden = 6 WHERE id = 'a82ca714-b191-4976-a089-66c031ff1496';
-- 7 = Documento de Desembolso (nueva)
UPDATE categorias_documento SET orden = 8 WHERE id = 'f84ec757-2f11-4245-a487-5091176feec5';
UPDATE categorias_documento SET orden = 9 WHERE id = 'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade';

-- ── 4. Reasignar documentos con tipo_documento_sistema conocido ──

-- Promesas de compraventa que estaban en cat-4 (Carta de Aprobación)
UPDATE documentos_proyecto
SET categoria_id = 'c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a'
WHERE tipo_documento_sistema = 'promesa_compraventa'
  AND categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34';

-- Actas de entrega que estaban en cat-4
UPDATE documentos_proyecto
SET categoria_id = 'd8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b'
WHERE tipo_documento_sistema = 'acta_entrega'
  AND categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34';

-- Boletas de registro que estaban incorrectamente en cat-4
UPDATE documentos_proyecto
SET categoria_id = 'f84ec757-2f11-4245-a487-5091176feec5'
WHERE tipo_documento_sistema = 'boleta_registro'
  AND categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34';

-- Avalúos y estudios de título → Certificado de Tradición
UPDATE documentos_proyecto
SET categoria_id = 'bd49740e-d46d-43c8-973f-196f1418765c'
WHERE tipo_documento_sistema IN ('avaluo_vivienda', 'estudio_titulos')
  AND categoria_id = 'f84ec757-2f11-4245-a487-5091176feec5';

-- ── 5. Reactivar trigger de protección ──────────────────────
ALTER TABLE categorias_documento ENABLE TRIGGER trigger_proteger_categoria_sistema;

-- ── 6. Verificación ──────────────────────────────────────────

SELECT id, nombre, icono, color, orden, es_sistema
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
  AND es_sistema = true
ORDER BY orden;
