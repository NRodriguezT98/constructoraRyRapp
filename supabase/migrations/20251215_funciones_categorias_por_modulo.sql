-- ============================================
-- FUNCIONES: Verificar categorías por módulo
-- ============================================

-- ========== CLIENTES (6 categorías) ==========
CREATE OR REPLACE FUNCTION verificar_categorias_clientes()
RETURNS TABLE (
  categoria_id uuid,
  categoria_nombre text,
  accion text
) AS $$
BEGIN
  INSERT INTO categorias_documento (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema) VALUES
    ('4898e798-c188-4f02-bfcf-b2b15be48e34'::uuid, 'Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso', 'Cartas de aprobación, promesas de compraventa, actas de entrega, resoluciones, documentos del proceso legal', 'cyan', 'FileSignature', ARRAY['clientes'], true),
    ('bd49740e-d46d-43c8-973f-196f1418765c'::uuid, 'Certificados de Tradición', 'Certificados de tradición y libertad, certificados de dominio y propiedad', 'yellow', 'FileText', ARRAY['clientes'], true),
    ('b795b842-f035-42ce-9ab9-7fef2e1c5f24'::uuid, 'Documentos de Identidad', 'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación', 'green', 'IdCard', ARRAY['clientes'], true),
    ('a82ca714-b191-4976-a089-66c031ff1496'::uuid, 'Escrituras Públicas', 'Minutas de compraventa', 'pink', 'ScrollText', ARRAY['clientes'], true),
    ('f84ec757-2f11-4245-a487-5091176feec5'::uuid, 'Gastos Notariales, Avalúos y Paz y salvos', 'Estudio de títulos, avalúos comerciales, gastos notariales, paz y salvos', '#F59E0B', 'receipt', ARRAY['clientes'], true),
    ('f50f53d6-c1d8-4c42-9993-fddc2f8f5ade'::uuid, 'Otros Documentos', 'Fotos, correspondencia, documentos generales y varios', '#6B7280', 'folder', ARRAY['clientes'], true)
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    color = EXCLUDED.color,
    icono = EXCLUDED.icono,
    modulos_permitidos = EXCLUDED.modulos_permitidos,
    es_sistema = EXCLUDED.es_sistema;

  RETURN QUERY
  SELECT cd.id::uuid, cd.nombre::text, 'Verificada/Creada'::text
  FROM categorias_documento cd
  WHERE cd.es_sistema = true AND 'clientes' = ANY(cd.modulos_permitidos)
  ORDER BY cd.nombre;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verificar_categorias_clientes() TO authenticated;

-- ========== PROYECTOS (5 categorías) ==========
CREATE OR REPLACE FUNCTION verificar_categorias_proyectos()
RETURNS TABLE (
  categoria_id uuid,
  categoria_nombre text,
  accion text
) AS $$
BEGIN
  INSERT INTO categorias_documento (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema) VALUES
    ('06c57b7c-7d68-46f0-94ba-4065e00bbbf0'::uuid, 'Documentos Legales', 'Boletas fiscales, matrículas, paz y salvos', '#8B5CF6', 'scale', ARRAY['proyectos'], false),
    ('a1d04cea-9aa3-4610-b0e0-aa4f89fe2ab5'::uuid, 'Documentos Técnicos', 'Planos, diseños, memorias de cálculo', '#10B981', 'drafting-compass', ARRAY['proyectos'], false),
    ('d290c205-9187-46cd-a450-5463132efa07'::uuid, 'Facturas y Pagos', 'Facturas prediales, comprobantes de pago, recibos', '#F59E0B', 'receipt', ARRAY['proyectos'], false),
    ('347ad2e3-a452-4efd-bc32-4d0448123e25'::uuid, 'Otros Documentos', 'Documentos generales y varios', '#6B7280', 'folder', ARRAY['proyectos'], false),
    ('a32bef8e-7dc8-4bc1-bbca-16dfc6798779'::uuid, 'Permisos, Licencias y Certificados', 'Licencias de construcción, urbanismo y certificados oficiales', 'pink', 'FileSignature', ARRAY['proyectos'], false)
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    color = EXCLUDED.color,
    icono = EXCLUDED.icono,
    modulos_permitidos = EXCLUDED.modulos_permitidos;

  RETURN QUERY
  SELECT cd.id::uuid, cd.nombre::text, 'Verificada/Creada'::text
  FROM categorias_documento cd
  WHERE 'proyectos' = ANY(cd.modulos_permitidos)
  ORDER BY cd.nombre;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verificar_categorias_proyectos() TO authenticated;

-- ========== VIVIENDAS (8 categorías) ==========
CREATE OR REPLACE FUNCTION verificar_categorias_viviendas()
RETURNS TABLE (
  categoria_id uuid,
  categoria_nombre text,
  accion text
) AS $$
BEGIN
  INSERT INTO categorias_documento (id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema) VALUES
    ('3a98c79d-25fc-40f7-b701-c6946995002d'::uuid, 'Avalúos Comerciales', 'Avalúos y valoraciones de la propiedad', '#EF4444', 'DollarSign', ARRAY['viviendas'], false),
    ('e76ff8af-7ff6-4c44-8003-a2dc8eaf9967'::uuid, 'Certificado de Tradición', 'Certificados de tradición y libertad de la propiedad', 'blue', 'Building2', ARRAY['viviendas'], false),
    ('00f70227-fb60-4737-a8ba-2071fcd82cdf'::uuid, 'Contrato de Promesa', 'Contratos de promesa de compraventa', '#EC4899', 'FileContract', ARRAY['viviendas'], false),
    ('9f5fec74-af8b-4105-a4fd-3f3df3568716'::uuid, 'Escrituras Públicas', 'Escrituras de compraventa y documentos notariales', '#8B5CF6', 'FileSignature', ARRAY['viviendas'], false),
    ('d57e28c2-1fdd-4020-879c-732684eaa4c8'::uuid, 'Fotos de Progreso', 'Fotografías del avance y estado de la obra', '#06B6D4', 'Camera', ARRAY['viviendas'], false),
    ('992be01e-693f-4e7b-a583-5a45c125b113'::uuid, 'Licencias y Permisos', 'Licencias de construcción y permisos municipales', '#F59E0B', 'Shield', ARRAY['viviendas'], false),
    ('a619437b-4edb-49e9-8ead-27dc65da38a7'::uuid, 'Planos Arquitectónicos', 'Planos, diseños y renders de la vivienda', '#10B981', 'Ruler', ARRAY['viviendas'], false),
    ('8d6e704b-ce42-44d2-816b-292f2026ad90'::uuid, 'Recibos de Servicios', 'Recibos de servicios públicos y pagos', '#14B8A6', 'Receipt', ARRAY['viviendas'], false)
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    color = EXCLUDED.color,
    icono = EXCLUDED.icono,
    modulos_permitidos = EXCLUDED.modulos_permitidos;

  RETURN QUERY
  SELECT cd.id::uuid, cd.nombre::text, 'Verificada/Creada'::text
  FROM categorias_documento cd
  WHERE 'viviendas' = ANY(cd.modulos_permitidos)
  ORDER BY cd.nombre;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verificar_categorias_viviendas() TO authenticated;

-- Test
SELECT 'CLIENTES:' as modulo, COUNT(*) as total FROM verificar_categorias_clientes()
UNION ALL
SELECT 'PROYECTOS:', COUNT(*) FROM verificar_categorias_proyectos()
UNION ALL
SELECT 'VIVIENDAS:', COUNT(*) FROM verificar_categorias_viviendas();
