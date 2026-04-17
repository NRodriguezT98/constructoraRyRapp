-- ============================================================
-- MIGRACIÓN: Fix completo del sistema de categorías
-- Fecha: 2026-04-18
-- Descripción:
--   1. Eliminar constraint único problemático (uk_categorias_documento_nombre)
--   2. Aplicar renombres de categorías de clientes (bloqueados en 20260417)
--   3. Marcar proyectos/viviendas como es_sistema=true (protección)
--   4. Agregar índice único parcial correcto por módulo
--   5. Actualizar funciones de verificación con nombres nuevos
-- Supersede: 20260417_refactor_categorias_clientes.sql (solo la parte que falló)
-- ============================================================

-- ── 0. Eliminar constraints y índices problemáticos ──────────────────────

ALTER TABLE categorias_documento
  DROP CONSTRAINT IF EXISTS uk_categorias_documento_nombre CASCADE;

ALTER TABLE categorias_documento
  DROP CONSTRAINT IF EXISTS categorias_documento_nombre_key CASCADE;

DROP INDEX IF EXISTS idx_categorias_globales_nombre;
DROP INDEX IF EXISTS idx_categorias_usuario_modulo_nombre;
DROP INDEX IF EXISTS idx_categorias_sistema_nombre_modulo;

-- ── 1. Desactivar triggers de protección personalizados (si existen) ──────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_proteger_categoria_sistema'
      AND tgrelid = 'categorias_documento'::regclass
  ) THEN
    ALTER TABLE categorias_documento DISABLE TRIGGER trigger_proteger_categoria_sistema;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_proteger_categorias_sistema'
      AND tgrelid = 'categorias_documento'::regclass
  ) THEN
    ALTER TABLE categorias_documento DISABLE TRIGGER trigger_proteger_categorias_sistema;
  END IF;
END;
$$;

-- ── 2. Renombrar categorías de CLIENTES (idempotentes por UUID) ────────────

UPDATE categorias_documento SET
  nombre      = 'Documento de Identidad',
  descripcion = 'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación',
  icono       = 'IdCard',
  color       = 'green',
  orden       = 1,
  es_sistema  = true,
  es_global   = true,
  modulos_permitidos = ARRAY['clientes']
WHERE id = 'b795b842-f035-42ce-9ab9-7fef2e1c5f24';

UPDATE categorias_documento SET
  nombre      = 'Certificado de Tradición',
  descripcion = 'Certificado de tradición y libertad, matrícula inmobiliaria, análisis de título, avalúo comercial, estudio de títulos',
  icono       = 'BookMarked',
  color       = 'yellow',
  orden       = 2,
  es_sistema  = true,
  es_global   = true,
  modulos_permitidos = ARRAY['clientes']
WHERE id = 'bd49740e-d46d-43c8-973f-196f1418765c';

-- Promesa de Compraventa (ya insertada con nombre correcto, solo actualizar orden)
UPDATE categorias_documento SET
  nombre      = 'Promesa de Compraventa',
  descripcion = 'Promesa de compraventa (borrador y firmada), minuta borrador, contrato de reserva',
  icono       = 'FilePen',
  color       = 'indigo',
  orden       = 3,
  es_sistema  = true,
  es_global   = true,
  modulos_permitidos = ARRAY['clientes']
WHERE id = 'c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a';

-- ⚠️ CRÍTICA: UUID '4898e798-...' usado en triggers y documentos pendientes
UPDATE categorias_documento SET
  nombre      = 'Carta de Aprobación',
  descripcion = 'Carta de aprobación crédito hipotecario, carta de asignación subsidio (Mi Casa Ya, Caja de Compensación), carta de ratificación',
  icono       = 'BadgeCheck',
  color       = 'cyan',
  orden       = 4,
  es_sistema  = true,
  es_global   = true,
  modulos_permitidos = ARRAY['clientes']
WHERE id = '4898e798-c188-4f02-bfcf-b2b15be48e34';

-- Acta de Entrega (ya insertada con nombre correcto, solo actualizar orden)
UPDATE categorias_documento SET
  nombre      = 'Acta de Entrega',
  descripcion = 'Acta de entrega física del inmueble (borrador y firmada)',
  icono       = 'ClipboardCheck',
  color       = 'teal',
  orden       = 5,
  es_sistema  = true,
  es_global   = true,
  modulos_permitidos = ARRAY['clientes']
WHERE id = 'd8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b';

UPDATE categorias_documento SET
  nombre      = 'Escritura Pública',
  descripcion = 'Escritura pública de compraventa protocolizada, hojas de escritura, minuta final',
  icono       = 'ScrollText',
  color       = 'pink',
  orden       = 6,
  es_sistema  = true,
  es_global   = true,
  modulos_permitidos = ARRAY['clientes']
WHERE id = 'a82ca714-b191-4976-a089-66c031ff1496';

-- Documento de Desembolso (ya insertado con nombre correcto, solo actualizar orden)
UPDATE categorias_documento SET
  nombre      = 'Documento de Desembolso',
  descripcion = 'Autorización de desembolso, cuenta de cobro, carta remisoria, certificación bancaria, formato de existencia',
  icono       = 'Landmark',
  color       = 'sky',
  orden       = 7,
  es_sistema  = true,
  es_global   = true,
  modulos_permitidos = ARRAY['clientes']
WHERE id = 'e9c3a4b5-6d7e-4f8a-ab9c-3d4e5f6a7b8c';

UPDATE categorias_documento SET
  nombre      = 'Comprobante de Pago',
  descripcion = 'Boleta de registro, factura notarial, recibos de pago boleta fiscal, pago estudio de títulos, paz y salvos',
  icono       = 'Receipt',
  color       = 'emerald',
  orden       = 8,
  es_sistema  = true,
  es_global   = true,
  modulos_permitidos = ARRAY['clientes']
WHERE id = 'f84ec757-2f11-4245-a487-5091176feec5';

UPDATE categorias_documento SET
  nombre      = 'Otro Documento',
  descripcion = 'Fotos de vivienda, correspondencia, documentos varios',
  icono       = 'FolderOpen',
  color       = '#6B7280',
  orden       = 9,
  es_sistema  = true,
  es_global   = true,
  modulos_permitidos = ARRAY['clientes']
WHERE id = 'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade';

-- ── 3. Insertar / actualizar categorías de PROYECTOS (es_sistema=true) ────

INSERT INTO categorias_documento
  (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema, es_global, orden)
VALUES
  ('06c57b7c-7d68-46f0-94ba-4065e00bbbf0',
   'Documentos Legales',
   'Boletas fiscales, matrículas, paz y salvos',
   '#8B5CF6', 'Scale', ARRAY['proyectos'], true, true, 1),

  ('a1d04cea-9aa3-4610-b0e0-aa4f89fe2ab5',
   'Documentos Técnicos',
   'Planos, diseños, memorias de cálculo',
   '#10B981', 'Compass', ARRAY['proyectos'], true, true, 2),

  ('d290c205-9187-46cd-a450-5463132efa07',
   'Facturas y Pagos',
   'Facturas prediales, comprobantes de pago, recibos',
   '#F59E0B', 'Receipt', ARRAY['proyectos'], true, true, 3),

  ('a32bef8e-7dc8-4bc1-bbca-16dfc6798779',
   'Permisos, Licencias y Certificados',
   'Licencias de construcción, urbanismo y certificados oficiales',
   '#EC4899', 'FileSignature', ARRAY['proyectos'], true, true, 4),

  ('347ad2e3-a452-4efd-bc32-4d0448123e25',
   'Otros Documentos',
   'Documentos generales y varios',
   '#6B7280', 'FolderOpen', ARRAY['proyectos'], true, true, 5)

ON CONFLICT (id) DO UPDATE SET
  nombre             = EXCLUDED.nombre,
  descripcion        = EXCLUDED.descripcion,
  color              = EXCLUDED.color,
  icono              = EXCLUDED.icono,
  modulos_permitidos = EXCLUDED.modulos_permitidos,
  es_sistema         = EXCLUDED.es_sistema,
  es_global          = EXCLUDED.es_global,
  orden              = EXCLUDED.orden;

-- ── 4. Insertar / actualizar categorías de VIVIENDAS (es_sistema=true) ────
-- Nota: 'Certificado de Tradición' viviendas ≠ 'Certificado de Tradición' clientes
--       porque modulos_permitidos[1] difiere → no viola el índice único parcial

INSERT INTO categorias_documento
  (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema, es_global, orden)
VALUES
  ('3a98c79d-25fc-40f7-b701-c6946995002d',
   'Avalúo Comercial',
   'Avalúos y valoraciones de la propiedad',
   '#EF4444', 'DollarSign', ARRAY['viviendas'], true, true, 1),

  ('e76ff8af-7ff6-4c44-8003-a2dc8eaf9967',
   'Certificado de Tradición',
   'Certificados de tradición y libertad de la propiedad',
   '#3B82F6', 'BookMarked', ARRAY['viviendas'], true, true, 2),

  ('00f70227-fb60-4737-a8ba-2071fcd82cdf',
   'Contrato de Promesa',
   'Contratos de promesa de compraventa',
   '#EC4899', 'FilePen', ARRAY['viviendas'], true, true, 3),

  ('9f5fec74-af8b-4105-a4fd-3f3df3568716',
   'Escritura Pública',
   'Escrituras de compraventa y documentos notariales',
   '#8B5CF6', 'ScrollText', ARRAY['viviendas'], true, true, 4),

  ('d57e28c2-1fdd-4020-879c-732684eaa4c8',
   'Foto de Progreso',
   'Fotografías del avance y estado de la obra',
   '#06B6D4', 'Camera', ARRAY['viviendas'], true, true, 5),

  ('992be01e-693f-4e7b-a583-5a45c125b113',
   'Licencia y Permiso',
   'Licencias de construcción y permisos municipales',
   '#F59E0B', 'Shield', ARRAY['viviendas'], true, true, 6),

  ('a619437b-4edb-49e9-8ead-27dc65da38a7',
   'Plano Arquitectónico',
   'Planos, diseños y renders de la vivienda',
   '#10B981', 'Ruler', ARRAY['viviendas'], true, true, 7),

  ('8d6e704b-ce42-44d2-816b-292f2026ad90',
   'Recibo de Servicios',
   'Recibos de servicios públicos y pagos',
   '#14B8A6', 'Receipt', ARRAY['viviendas'], true, true, 8)

ON CONFLICT (id) DO UPDATE SET
  nombre             = EXCLUDED.nombre,
  descripcion        = EXCLUDED.descripcion,
  color              = EXCLUDED.color,
  icono              = EXCLUDED.icono,
  modulos_permitidos = EXCLUDED.modulos_permitidos,
  es_sistema         = EXCLUDED.es_sistema,
  es_global          = EXCLUDED.es_global,
  orden              = EXCLUDED.orden;

-- ── 5. Reasignar documentos con tipo_documento_sistema ────────────────────
-- tipo_documento_sistema se guarda en metadata JSONB, no como columna directa

-- Promesas de compraventa que estaban en Carta de Aprobación
UPDATE documentos_proyecto
SET categoria_id = 'c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a'
WHERE (metadata->>'tipo_documento_sistema') = 'promesa_compraventa'
  AND categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34';

-- Actas de entrega que estaban en Carta de Aprobación
UPDATE documentos_proyecto
SET categoria_id = 'd8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b'
WHERE (metadata->>'tipo_documento_sistema') = 'acta_entrega'
  AND categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34';

-- Boletas de registro → Comprobante de Pago
UPDATE documentos_proyecto
SET categoria_id = 'f84ec757-2f11-4245-a487-5091176feec5'
WHERE (metadata->>'tipo_documento_sistema') = 'boleta_registro'
  AND categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34';

-- Avalúos y estudios de título → Certificado de Tradición (clientes)
UPDATE documentos_proyecto
SET categoria_id = 'bd49740e-d46d-43c8-973f-196f1418765c'
WHERE (metadata->>'tipo_documento_sistema') IN ('avaluo_vivienda', 'estudio_titulos')
  AND categoria_id = 'f84ec757-2f11-4245-a487-5091176feec5';

-- ── 6. Re-habilitar triggers de protección ──────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_proteger_categoria_sistema'
      AND tgrelid = 'categorias_documento'::regclass
  ) THEN
    ALTER TABLE categorias_documento ENABLE TRIGGER trigger_proteger_categoria_sistema;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_proteger_categorias_sistema'
      AND tgrelid = 'categorias_documento'::regclass
  ) THEN
    ALTER TABLE categorias_documento ENABLE TRIGGER trigger_proteger_categorias_sistema;
  END IF;
END;
$$;

-- ── 7. Índice único parcial correcto ──────────────────────────────────────
-- Permite mismo nombre en módulos distintos (clientes vs viviendas)
-- Previene duplicados del mismo nombre en el mismo módulo
CREATE UNIQUE INDEX idx_categorias_sistema_nombre_modulo
  ON categorias_documento (nombre, (modulos_permitidos[1]))
  WHERE es_sistema = true;

-- ── 8. Actualizar función verificar_categorias_clientes (nombres nuevos) ──

CREATE OR REPLACE FUNCTION verificar_categorias_clientes()
RETURNS TABLE (categoria_id uuid, categoria_nombre text, accion text)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO categorias_documento
    (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema, es_global, orden)
  VALUES
    ('b795b842-f035-42ce-9ab9-7fef2e1c5f24',
     'Documento de Identidad',
     'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación',
     'green', 'IdCard', ARRAY['clientes'], true, true, 1),
    ('bd49740e-d46d-43c8-973f-196f1418765c',
     'Certificado de Tradición',
     'Certificado de tradición y libertad, matrícula inmobiliaria, análisis de título, avalúo comercial, estudio de títulos',
     'yellow', 'BookMarked', ARRAY['clientes'], true, true, 2),
    ('c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a',
     'Promesa de Compraventa',
     'Promesa de compraventa (borrador y firmada), minuta borrador, contrato de reserva',
     'indigo', 'FilePen', ARRAY['clientes'], true, true, 3),
    ('4898e798-c188-4f02-bfcf-b2b15be48e34',
     'Carta de Aprobación',
     'Carta de aprobación crédito hipotecario, carta de asignación subsidio, carta de ratificación',
     'cyan', 'BadgeCheck', ARRAY['clientes'], true, true, 4),
    ('d8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b',
     'Acta de Entrega',
     'Acta de entrega física del inmueble (borrador y firmada)',
     'teal', 'ClipboardCheck', ARRAY['clientes'], true, true, 5),
    ('a82ca714-b191-4976-a089-66c031ff1496',
     'Escritura Pública',
     'Escritura pública de compraventa protocolizada, hojas de escritura, minuta final',
     'pink', 'ScrollText', ARRAY['clientes'], true, true, 6),
    ('e9c3a4b5-6d7e-4f8a-ab9c-3d4e5f6a7b8c',
     'Documento de Desembolso',
     'Autorización de desembolso, cuenta de cobro, carta remisoria, certificación bancaria, formato de existencia',
     'sky', 'Landmark', ARRAY['clientes'], true, true, 7),
    ('f84ec757-2f11-4245-a487-5091176feec5',
     'Comprobante de Pago',
     'Boleta de registro, factura notarial, recibos de pago boleta fiscal, pago estudio de títulos, paz y salvos',
     'emerald', 'Receipt', ARRAY['clientes'], true, true, 8),
    ('f50f53d6-c1d8-4c42-9993-fddc2f8f5ade',
     'Otro Documento',
     'Fotos de vivienda, correspondencia, documentos varios',
     '#6B7280', 'FolderOpen', ARRAY['clientes'], true, true, 9)
  ON CONFLICT (id) DO UPDATE SET
    nombre             = EXCLUDED.nombre,
    descripcion        = EXCLUDED.descripcion,
    color              = EXCLUDED.color,
    icono              = EXCLUDED.icono,
    modulos_permitidos = EXCLUDED.modulos_permitidos,
    es_sistema         = EXCLUDED.es_sistema,
    es_global          = EXCLUDED.es_global,
    orden              = EXCLUDED.orden;

  RETURN QUERY
    SELECT cd.id::uuid, cd.nombre::text, 'Verificada/Creada'::text
    FROM categorias_documento cd
    WHERE cd.es_sistema = true AND 'clientes' = ANY(cd.modulos_permitidos)
    ORDER BY cd.orden;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_categorias_clientes() TO authenticated;

-- ── 9. Actualizar función verificar_categorias_proyectos (es_sistema=true) ─

CREATE OR REPLACE FUNCTION verificar_categorias_proyectos()
RETURNS TABLE (categoria_id uuid, categoria_nombre text, accion text)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO categorias_documento
    (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema, es_global, orden)
  VALUES
    ('06c57b7c-7d68-46f0-94ba-4065e00bbbf0',
     'Documentos Legales',
     'Boletas fiscales, matrículas, paz y salvos',
     '#8B5CF6', 'Scale', ARRAY['proyectos'], true, true, 1),
    ('a1d04cea-9aa3-4610-b0e0-aa4f89fe2ab5',
     'Documentos Técnicos',
     'Planos, diseños, memorias de cálculo',
     '#10B981', 'Compass', ARRAY['proyectos'], true, true, 2),
    ('d290c205-9187-46cd-a450-5463132efa07',
     'Facturas y Pagos',
     'Facturas prediales, comprobantes de pago, recibos',
     '#F59E0B', 'Receipt', ARRAY['proyectos'], true, true, 3),
    ('a32bef8e-7dc8-4bc1-bbca-16dfc6798779',
     'Permisos, Licencias y Certificados',
     'Licencias de construcción, urbanismo y certificados oficiales',
     '#EC4899', 'FileSignature', ARRAY['proyectos'], true, true, 4),
    ('347ad2e3-a452-4efd-bc32-4d0448123e25',
     'Otros Documentos',
     'Documentos generales y varios',
     '#6B7280', 'FolderOpen', ARRAY['proyectos'], true, true, 5)
  ON CONFLICT (id) DO UPDATE SET
    nombre             = EXCLUDED.nombre,
    descripcion        = EXCLUDED.descripcion,
    color              = EXCLUDED.color,
    icono              = EXCLUDED.icono,
    modulos_permitidos = EXCLUDED.modulos_permitidos,
    es_sistema         = EXCLUDED.es_sistema,
    es_global          = EXCLUDED.es_global,
    orden              = EXCLUDED.orden;

  RETURN QUERY
    SELECT cd.id::uuid, cd.nombre::text, 'Verificada/Creada'::text
    FROM categorias_documento cd
    WHERE cd.es_sistema = true AND 'proyectos' = ANY(cd.modulos_permitidos)
    ORDER BY cd.orden;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_categorias_proyectos() TO authenticated;

-- ── 10. Actualizar función verificar_categorias_viviendas (es_sistema=true) ─

CREATE OR REPLACE FUNCTION verificar_categorias_viviendas()
RETURNS TABLE (categoria_id uuid, categoria_nombre text, accion text)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO categorias_documento
    (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema, es_global, orden)
  VALUES
    ('3a98c79d-25fc-40f7-b701-c6946995002d',
     'Avalúo Comercial',
     'Avalúos y valoraciones de la propiedad',
     '#EF4444', 'DollarSign', ARRAY['viviendas'], true, true, 1),
    ('e76ff8af-7ff6-4c44-8003-a2dc8eaf9967',
     'Certificado de Tradición',
     'Certificados de tradición y libertad de la propiedad',
     '#3B82F6', 'BookMarked', ARRAY['viviendas'], true, true, 2),
    ('00f70227-fb60-4737-a8ba-2071fcd82cdf',
     'Contrato de Promesa',
     'Contratos de promesa de compraventa',
     '#EC4899', 'FilePen', ARRAY['viviendas'], true, true, 3),
    ('9f5fec74-af8b-4105-a4fd-3f3df3568716',
     'Escritura Pública',
     'Escrituras de compraventa y documentos notariales',
     '#8B5CF6', 'ScrollText', ARRAY['viviendas'], true, true, 4),
    ('d57e28c2-1fdd-4020-879c-732684eaa4c8',
     'Foto de Progreso',
     'Fotografías del avance y estado de la obra',
     '#06B6D4', 'Camera', ARRAY['viviendas'], true, true, 5),
    ('992be01e-693f-4e7b-a583-5a45c125b113',
     'Licencia y Permiso',
     'Licencias de construcción y permisos municipales',
     '#F59E0B', 'Shield', ARRAY['viviendas'], true, true, 6),
    ('a619437b-4edb-49e9-8ead-27dc65da38a7',
     'Plano Arquitectónico',
     'Planos, diseños y renders de la vivienda',
     '#10B981', 'Ruler', ARRAY['viviendas'], true, true, 7),
    ('8d6e704b-ce42-44d2-816b-292f2026ad90',
     'Recibo de Servicios',
     'Recibos de servicios públicos y pagos',
     '#14B8A6', 'Receipt', ARRAY['viviendas'], true, true, 8)
  ON CONFLICT (id) DO UPDATE SET
    nombre             = EXCLUDED.nombre,
    descripcion        = EXCLUDED.descripcion,
    color              = EXCLUDED.color,
    icono              = EXCLUDED.icono,
    modulos_permitidos = EXCLUDED.modulos_permitidos,
    es_sistema         = EXCLUDED.es_sistema,
    es_global          = EXCLUDED.es_global,
    orden              = EXCLUDED.orden;

  RETURN QUERY
    SELECT cd.id::uuid, cd.nombre::text, 'Verificada/Creada'::text
    FROM categorias_documento cd
    WHERE cd.es_sistema = true AND 'viviendas' = ANY(cd.modulos_permitidos)
    ORDER BY cd.orden;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_categorias_viviendas() TO authenticated;

-- ── 11. Verificación final ────────────────────────────────────────────────

SELECT
  modulos_permitidos[1] AS modulo,
  id,
  nombre,
  icono,
  color,
  orden,
  es_sistema,
  es_global
FROM categorias_documento
WHERE es_sistema = true
ORDER BY modulos_permitidos[1], orden;
