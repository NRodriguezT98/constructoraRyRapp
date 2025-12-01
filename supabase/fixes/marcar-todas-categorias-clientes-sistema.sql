-- ============================================
-- MARCAR TODAS LAS CATEGORÍAS POR DEFECTO COMO SISTEMA
-- ============================================
-- Las 6 categorías creadas automáticamente para clientes
-- no deben poder eliminarse (solo las personalizadas del usuario)
-- ============================================

-- Desactivar trigger temporalmente
ALTER TABLE categorias_documento DISABLE TRIGGER trigger_proteger_categoria_sistema;

-- Marcar las 6 categorías por defecto de clientes como sistema
UPDATE categorias_documento
SET es_sistema = true
WHERE id IN (
  'b795b842-f035-42ce-9ab9-7fef2e1c5f24',  -- Documentos de Identidad
  'bd49740e-d46d-43c8-973f-196f1418765c',  -- Certificados de Tradición
  'a82ca714-b191-4976-a089-66c031ff1496',  -- Escrituras Públicas
  '4898e798-c188-4f02-bfcf-b2b15be48e34',  -- Cartas de aprobación... (CRÍTICA)
  'f84ec757-2f11-4245-a487-5091176feec5',  -- Gastos Notariales...
  'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade'   -- Otros Documentos
);

-- Reactivar trigger
ALTER TABLE categorias_documento ENABLE TRIGGER trigger_proteger_categoria_sistema;

-- Verificar resultado
SELECT
  nombre,
  es_sistema,
  es_global,
  orden
FROM categorias_documento
WHERE 'clientes' = ANY(modulos_permitidos)
ORDER BY orden;
