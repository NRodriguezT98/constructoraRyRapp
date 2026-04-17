-- ============================================
-- CATEGORÍAS POR DEFECTO PARA MÓDULO CLIENTES
-- ============================================
-- Descripción: Crea categorías base para gestión documental de clientes
-- Autor: Sistema
-- Fecha: 2025-12-01
-- Actualizado: 2026-04-17 — 9 categorías específicas y singulares

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
      es_sistema,
      orden
    ) VALUES
      -- 1. Documento de Identidad
      (
        'b795b842-f035-42ce-9ab9-7fef2e1c5f24',
        p_user_id,
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
        'bd49740e-d46d-43c8-973f-196f1418765c',
        p_user_id,
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
        'c7a1e2f3-4b5c-4d6e-8f7a-1b2c3d4e5f6a',
        p_user_id,
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
        '4898e798-c188-4f02-bfcf-b2b15be48e34',
        p_user_id,
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
        'd8b2f3a4-5c6d-4e7f-9a8b-2c3d4e5f6a7b',
        p_user_id,
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
        'a82ca714-b191-4976-a089-66c031ff1496',
        p_user_id,
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
        'e9c3a4b5-6d7e-4f8a-ab9c-3d4e5f6a7b8c',
        p_user_id,
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
        'f84ec757-2f11-4245-a487-5091176feec5',
        p_user_id,
        'Comprobante de Pago',
        'Boleta de registro, factura notarial, recibos de pago boleta fiscal, pago estudio de títulos, paz y salvos',
        'emerald',
        'Receipt',
        ARRAY['clientes'],
        true,
        true,
        8
      ),

      -- 9. Otro Documento
      (
        'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade',
        p_user_id,
        'Otro Documento',
        'Fotos de vivienda, correspondencia, documentos varios',
        '#6B7280',
        'FolderOpen',
        ARRAY['clientes'],
        true,
        true,
        9
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
'Crea 9 categorías predeterminadas para módulo clientes con IDs fijos si el usuario no tiene ninguna';
