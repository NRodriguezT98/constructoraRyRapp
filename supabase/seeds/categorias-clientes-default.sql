-- ============================================
-- CATEGORÍAS POR DEFECTO PARA MÓDULO CLIENTES
-- ============================================
-- Descripción: Crea categorías base para gestión documental de clientes
-- Autor: Sistema
-- Fecha: 2025-12-01
-- Actualizado: Con IDs y configuración exacta del sistema actual

-- Función para crear categorías por defecto si no existen
CREATE OR REPLACE FUNCTION crear_categorias_clientes_default(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_count INT;
BEGIN
  -- Verificar si ya existen categorías para este usuario en módulo clientes
  SELECT COUNT(*) INTO v_count
  FROM categorias_documento
  WHERE user_id = p_user_id
    AND 'clientes' = ANY(modulos_permitidos);

  -- Si no hay categorías, crear las predeterminadas con IDs fijos
  IF v_count = 0 THEN
    INSERT INTO categorias_documento (
      id,
      user_id,
      nombre,
      descripcion,
      color,
      icono,
      modulos_permitidos,
      es_global,
      es_sistema,  -- ✅ Todas las categorías por defecto son del sistema
      orden
    ) VALUES
      -- 1. Documentos de Identidad
      (
        'b795b842-f035-42ce-9ab9-7fef2e1c5f24',
        p_user_id,
        'Documentos de Identidad',
        'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación',
        'green',
        'IdCard',
        ARRAY['clientes'],
        true,
        true,  -- ✅ Categoría del sistema (no eliminable)
        1
      ),

      -- 2. Certificados de Tradición
      (
        'bd49740e-d46d-43c8-973f-196f1418765c',
        p_user_id,
        'Certificados de Tradición',
        'Certificados de tradición y libertad, certificados de dominio y propiedad',
        'yellow',
        'FileText',
        ARRAY['clientes'],
        true,
        true,  -- ✅ Categoría del sistema (no eliminable)
        2
      ),

      -- 3. Escrituras Públicas
      (
        'a82ca714-b191-4976-a089-66c031ff1496',
        p_user_id,
        'Escrituras Públicas',
        'Minutas de compraventa',
        'pink',
        'ScrollText',
        ARRAY['clientes'],
        true,
        true,  -- ✅ Categoría del sistema (no eliminable)
        3
      ),

      -- 4. Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso
      (
        '4898e798-c188-4f02-bfcf-b2b15be48e34',
        p_user_id,
        'Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso',
        'Cartas de aprobación, promesas de compraventa, actas de entrega, resoluciones, documentos del proceso legal',
        'cyan',
        'FileSignature',
        ARRAY['clientes'],
        true,
        true,  -- ✅ Categoría del sistema (no eliminable) - CRÍTICA
        4
      ),

      -- 5. Gastos Notariales, Avalúos y Paz y salvos
      (
        'f84ec757-2f11-4245-a487-5091176feec5',
        p_user_id,
        'Gastos Notariales, Avalúos y Paz y salvos',
        'Estudio de títulos, avalúos comerciales, gastos notariales, paz y salvos',
        '#F59E0B',
        'receipt',
        ARRAY['clientes'],
        true,
        true,  -- ✅ Categoría del sistema (no eliminable)
        5
      ),

      -- 6. Otros Documentos
      (
        'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade',
        p_user_id,
        'Otros Documentos',
        'Fotos, correspondencia, documentos generales y varios',
        '#6B7280',
        'folder',
        ARRAY['clientes'],
        true,
        true,  -- ✅ Categoría del sistema (no eliminable)
        6
      )
    ON CONFLICT (id) DO NOTHING; -- Por si ya existen con esos IDs

    RAISE NOTICE '✅ Categorías por defecto creadas para clientes - usuario %', p_user_id;
  ELSE
    RAISE NOTICE 'ℹ️  El usuario % ya tiene % categoría(s) para clientes', p_user_id, v_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION crear_categorias_clientes_default(UUID) IS
'Crea 6 categorías predeterminadas para módulo clientes con IDs fijos si el usuario no tiene ninguna';
