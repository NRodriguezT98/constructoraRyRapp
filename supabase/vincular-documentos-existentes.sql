-- ================================================================
-- SCRIPT: Vincular documentos existentes con pasos de validación
-- ================================================================
-- Propósito: Detectar documentos ya subidos y vincularlos con pasos
-- ================================================================

-- PASO 1: Actualizar tipo_documento en documentos existentes que coincidan con patrones
-- ================================================================

-- Carta de aprobación de crédito
UPDATE documentos_cliente dc
SET tipo_documento = 'carta_aprobacion_credito'
WHERE tipo_documento IS NULL
  AND (
    LOWER(dc.titulo) LIKE '%carta%aprobaci%n%cr%dito%'
    OR LOWER(dc.titulo) LIKE '%carta%banco%'
    OR LOWER(dc.titulo) LIKE '%aprobaci%n%cr%dito%'
    OR LOWER(dc.titulo) LIKE '%carta de aprobaci%n%'
  );

-- Boleta de registro
UPDATE documentos_cliente dc
SET tipo_documento = 'boleta_registro'
WHERE tipo_documento IS NULL
  AND (
    LOWER(dc.titulo) LIKE '%boleta%registro%'
    OR LOWER(dc.titulo) LIKE '%registro%vivienda%'
  );

-- Certificado de tradición
UPDATE documentos_cliente dc
SET tipo_documento = 'certificado_tradicion'
WHERE tipo_documento IS NULL
  AND (
    LOWER(dc.titulo) LIKE '%certificado%tradici%n%'
    OR LOWER(dc.titulo) LIKE '%tradici%n%libertad%'
  );

-- Carta de asignación de subsidio
UPDATE documentos_cliente dc
SET tipo_documento = 'carta_asignacion_subsidio'
WHERE tipo_documento IS NULL
  AND (
    LOWER(dc.titulo) LIKE '%carta%subsidio%'
    OR LOWER(dc.titulo) LIKE '%asignaci%n%subsidio%'
    OR LOWER(dc.titulo) LIKE '%mi%casa%ya%'
  );

-- PASO 2: Vincular documentos con pasos pendientes
-- ================================================================

UPDATE pasos_fuente_pago pfp
SET
  completado = true,
  documento_id = subq.documento_id,
  completado_automaticamente = true,
  fecha_completado = NOW()
FROM (
  SELECT DISTINCT ON (pfp.id)
    pfp.id AS paso_id,
    dc.id AS documento_id
  FROM pasos_fuente_pago pfp
  INNER JOIN fuentes_pago fp ON fp.id = pfp.fuente_pago_id
  INNER JOIN negociaciones n ON n.id = fp.negociacion_id
  INNER JOIN documentos_cliente dc ON dc.cliente_id = n.cliente_id
  WHERE pfp.completado = false
    AND pfp.tipo_documento_requerido IS NOT NULL
    AND dc.tipo_documento = pfp.tipo_documento_requerido
  ORDER BY pfp.id, dc.fecha_creacion DESC
) subq
WHERE pfp.id = subq.paso_id;

-- PASO 3: Verificar resultados
-- ================================================================

SELECT
  'Documentos actualizados con tipo_documento' AS accion,
  COUNT(*) AS cantidad
FROM documentos_cliente
WHERE tipo_documento IS NOT NULL;

SELECT
  'Pasos completados automáticamente' AS accion,
  COUNT(*) AS cantidad
FROM pasos_fuente_pago
WHERE completado_automaticamente = true;

SELECT
  fp.tipo AS tipo_fuente,
  COUNT(pfp.id) AS total_pasos,
  SUM(CASE WHEN pfp.completado THEN 1 ELSE 0 END) AS completados,
  SUM(CASE WHEN NOT pfp.completado THEN 1 ELSE 0 END) AS pendientes
FROM fuentes_pago fp
LEFT JOIN pasos_fuente_pago pfp ON pfp.fuente_pago_id = fp.id
GROUP BY fp.tipo
ORDER BY fp.tipo;
