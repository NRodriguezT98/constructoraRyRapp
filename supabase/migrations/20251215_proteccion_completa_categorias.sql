-- ============================================
-- PROTECCIÓN: Evitar eliminación de categorías de sistema
-- ============================================

-- 1. Constraint: No permitir eliminar categorías de sistema
CREATE OR REPLACE FUNCTION proteger_categorias_sistema()
RETURNS TRIGGER AS $$
BEGIN
  -- Si intentan eliminar una categoría de sistema, rechazar
  IF OLD.es_sistema = true THEN
    RAISE EXCEPTION 'No se puede eliminar una categoría de sistema. ID: %, Nombre: %',
      OLD.id, OLD.nombre
      USING HINT = 'Las categorías de sistema son críticas para el funcionamiento de la aplicación';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_proteger_categorias_sistema ON categorias_documento;

CREATE TRIGGER trigger_proteger_categorias_sistema
  BEFORE DELETE ON categorias_documento
  FOR EACH ROW
  EXECUTE FUNCTION proteger_categorias_sistema();

-- 2. Función pública para verificar y crear categorías faltantes
CREATE OR REPLACE FUNCTION verificar_categorias_sistema()
RETURNS TABLE (
  categoria_id uuid,
  categoria_nombre text,
  accion text
) AS $$
DECLARE
  v_count integer;
BEGIN
  -- Insertar/actualizar categorías críticas
  INSERT INTO categorias_documento (
    id, nombre, descripcion, color, icono, modulos_permitidos, es_sistema
  ) VALUES
    ('4898e798-c188-4f02-bfcf-b2b15be48e34'::uuid,
     'Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso',
     'Cartas de aprobación, promesas de compraventa, actas de entrega, resoluciones, documentos del proceso legal',
     'cyan', 'FileSignature', ARRAY['clientes'], true),
    ('b795b842-f035-42ce-9ab9-7fef2e1c5f24'::uuid,
     'Documentos de Identidad',
     'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación',
     'green', 'IdCard', ARRAY['clientes'], true),
    ('a82ca714-b191-4976-a089-66c031ff1496'::uuid,
     'Escrituras Públicas',
     'Minutas de compraventa',
     'pink', 'ScrollText', ARRAY['clientes'], true),
    ('bd49740e-d46d-43c8-973f-196f1418765c'::uuid,
     'Certificados de Tradición',
     'Certificados de tradición y libertad, certificados de dominio y propiedad',
     'yellow', 'FileText', ARRAY['clientes'], true),
    ('f84ec757-2f11-4245-a487-5091176feec5'::uuid,
     'Gastos Notariales, Avalúos y Paz y salvos',
     'Estudio de títulos, avalúos comerciales, gastos notariales, paz y salvos',
     '#F59E0B', 'receipt', ARRAY['clientes'], true),
    ('f50f53d6-c1d8-4c42-9993-fddc2f8f5ade'::uuid,
     'Otros Documentos',
     'Fotos, correspondencia, documentos generales y varios',
     '#6B7280', 'folder', ARRAY['clientes'], true)
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    color = EXCLUDED.color,
    icono = EXCLUDED.icono,
    modulos_permitidos = EXCLUDED.modulos_permitidos,
    es_sistema = EXCLUDED.es_sistema;

  -- Retornar resultado
  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY
  SELECT
    cd.id::uuid as categoria_id,
    cd.nombre::text as categoria_nombre,
    'Verificada/Creada'::text as accion
  FROM categorias_documento cd
  WHERE cd.es_sistema = true
  ORDER BY cd.nombre;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hacer la función accesible para usuarios autenticados
GRANT EXECUTE ON FUNCTION verificar_categorias_sistema() TO authenticated;

COMMENT ON FUNCTION verificar_categorias_sistema() IS
  'Verifica y crea automáticamente las categorías de sistema si faltan. Puede ser llamada desde la UI sin permisos especiales.';

-- Test
SELECT * FROM verificar_categorias_sistema();
