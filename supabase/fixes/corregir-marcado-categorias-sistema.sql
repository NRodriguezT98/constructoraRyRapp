-- ============================================
-- CORREGIR: Marcar categoría correcta como sistema
-- ============================================

-- Desmarcar las que se marcaron incorrectamente
UPDATE categorias_documento
SET es_sistema = false
WHERE nombre IN (
  'Avalúos Comerciales',
  'Certificado de Tradición',
  'Contrato de Promesa',
  'Escrituras Públicas',
  'Identidad',
  'Cédula'
) AND es_sistema = true;

-- Marcar SOLO la categoría crítica de clientes que usamos para cartas de aprobación
UPDATE categorias_documento
SET es_sistema = true
WHERE id = '4898e798-c188-4f02-bfcf-b2b15be48e34'; -- Cartas de aprobación

-- Verificar resultado
SELECT
  id,
  nombre,
  es_sistema,
  modulos_permitidos
FROM categorias_documento
WHERE es_sistema = true
ORDER BY nombre;
