-- ===================================================================
-- SOLUCIÓN: Sincronizar documento_identidad_url desde documentos_cliente
-- ===================================================================
-- Fecha: 2025-12-01
-- Problema: Campo documento_identidad_url en NULL aunque documento existe

-- 1. VERIFICAR estado actual
SELECT
  c.id,
  c.nombres,
  c.apellidos,
  c.documento_identidad_url as url_en_clientes,
  d.url_storage as url_en_documentos,
  d.es_documento_identidad,
  d.titulo
FROM clientes c
LEFT JOIN documentos_cliente d ON c.id = d.cliente_id
  AND d.es_documento_identidad = true
WHERE c.id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a';

-- 2. ACTUALIZAR campo documento_identidad_url
UPDATE clientes
SET documento_identidad_url = (
  SELECT url_storage
  FROM documentos_cliente
  WHERE cliente_id = clientes.id
    AND es_documento_identidad = true
  ORDER BY fecha_creacion DESC
  LIMIT 1
)
WHERE id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
  AND documento_identidad_url IS NULL;

-- 3. VERIFICAR corrección
SELECT
  id,
  nombres,
  apellidos,
  documento_identidad_url
FROM clientes
WHERE id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a';

-- 4. BONUS: Corregir TODOS los clientes con este problema
UPDATE clientes
SET documento_identidad_url = subquery.url_storage,
    fecha_actualizacion = NOW()
FROM (
  SELECT DISTINCT ON (cliente_id)
    cliente_id,
    url_storage
  FROM documentos_cliente
  WHERE es_documento_identidad = true
  ORDER BY cliente_id, fecha_creacion DESC
) AS subquery
WHERE clientes.id = subquery.cliente_id
  AND clientes.documento_identidad_url IS NULL;

-- 5. REPORTE: Cuántos clientes se corrigieron
SELECT
  COUNT(*) as clientes_corregidos,
  COUNT(DISTINCT subquery.cliente_id) as total_con_cedula
FROM (
  SELECT DISTINCT cliente_id
  FROM documentos_cliente
  WHERE es_documento_identidad = true
) AS subquery
JOIN clientes ON clientes.id = subquery.cliente_id
WHERE clientes.documento_identidad_url IS NOT NULL;
