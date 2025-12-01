-- ============================================
-- ACTUALIZAR CATEGORÍAS DE CLIENTES (MEJORADAS)
-- ============================================
-- Descripción: Ajusta categorías para mayor consistencia con Viviendas
--              y mejor organización de documentos
-- Fecha: 2025-11-24

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obtener el primer usuario
  SELECT id INTO v_user_id
  FROM auth.users
  LIMIT 1;

  -- Eliminar categorías existentes de clientes
  DELETE FROM categorias_documento
  WHERE user_id = v_user_id
    AND 'clientes' = ANY(modulos_permitidos);

  RAISE NOTICE 'Categorías antiguas eliminadas';

  -- Crear las nuevas categorías mejoradas (6 categorías)
  INSERT INTO categorias_documento (user_id, nombre, descripcion, color, icono, modulos_permitidos, es_global, orden)
  VALUES
    -- 1. Documentos de Identidad (MANTIENE)
    (v_user_id, 'Documentos de Identidad', 'Cédula del cliente, cédula del cónyuge, pasaporte, documentos de identificación', '#3B82F6', 'id-card', ARRAY['clientes'], true, 1),

    -- 2. Certificados de Tradición (MÁS ESPECÍFICO)
    (v_user_id, 'Certificados de Tradición', 'Certificados de tradición y libertad, certificados de dominio y propiedad', '#10B981', 'file-badge', ARRAY['clientes'], true, 2),

    -- 3. Escrituras Públicas (NUEVO - SEPARADO)
    (v_user_id, 'Escrituras Públicas', 'Escrituras de compraventa, minutas notariales, documentos protocolizados', '#8B5CF6', 'FileSignature', ARRAY['clientes'], true, 3),

    -- 4. Promesas y Documentos del Proceso (RENOMBRADO - SIN MINUTAS)
    (v_user_id, 'Promesas y Documentos del Proceso', 'Promesas de compraventa, actas de entrega, resoluciones, documentos del proceso legal', '#6366F1', 'scale', ARRAY['clientes'], true, 4),

    -- 5. Gastos Notariales y Avalúos (MANTIENE)
    (v_user_id, 'Gastos Notariales y Avalúos', 'Estudio de títulos, avalúos comerciales, gastos notariales, paz y salvos', '#F59E0B', 'receipt', ARRAY['clientes'], true, 5),

    -- 6. Otros Documentos (MANTIENE)
    (v_user_id, 'Otros Documentos', 'Fotos, correspondencia, documentos generales y varios', '#6B7280', 'folder', ARRAY['clientes'], true, 6);

  RAISE NOTICE 'Nuevas categorías creadas (6 categorías mejoradas)';
END $$;

-- Verificar resultado
SELECT
  orden,
  nombre,
  descripcion,
  color,
  icono
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
ORDER BY orden;
