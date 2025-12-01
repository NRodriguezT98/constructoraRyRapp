-- ============================================
-- ELIMINAR DOCUMENTOS DE IDENTIDAD DUPLICADOS
-- ============================================
-- PROBLEMA: Se subieron múltiples documentos de identidad para Juan Carlos
-- SOLUCIÓN: Mantener solo el más reciente, eliminar los duplicados
-- CLIENTE: Juan carlos (ac0d0b96)
-- FECHA: 2025-12-01

-- ============================================
-- 1. VERIFICAR DOCUMENTOS DUPLICADOS
-- ============================================

SELECT
  id,
  titulo,
  fecha_creacion,
  es_documento_identidad,
  cliente_id
FROM documentos_cliente
WHERE cliente_id = (
  SELECT id FROM clientes WHERE LOWER(nombres) = 'juan' AND LOWER(apellidos) LIKE '%carlos%'
)
AND es_documento_identidad = true
ORDER BY fecha_creacion DESC;

-- ============================================
-- 2. ELIMINAR DUPLICADOS (MANTENER EL MÁS RECIENTE)
-- ============================================

-- Eliminar todos los documentos de identidad EXCEPTO el más reciente
WITH documentos_duplicados AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY cliente_id
      ORDER BY fecha_creacion DESC
    ) as rn
  FROM documentos_cliente
  WHERE cliente_id = (
    SELECT id FROM clientes WHERE LOWER(nombres) = 'juan' AND LOWER(apellidos) LIKE '%carlos%'
  )
  AND es_documento_identidad = true
)
DELETE FROM documentos_cliente
WHERE id IN (
  SELECT id FROM documentos_duplicados WHERE rn > 1
);

-- ============================================
-- 3. VERIFICAR QUE SOLO QUEDE 1
-- ============================================

SELECT
  COUNT(*) as documentos_identidad_restantes,
  MAX(fecha_creacion) as fecha_documento_final
FROM documentos_cliente
WHERE cliente_id = (
  SELECT id FROM clientes WHERE LOWER(nombres) = 'juan' AND LOWER(apellidos) LIKE '%carlos%'
)
AND es_documento_identidad = true;

-- ✅ RESULTADO ESPERADO:
-- documentos_identidad_restantes = 1
