-- FIX: Propagar es_documento_identidad de padre a versiones hijas
-- Bug: Al crear nueva versión de cédula, se pierde el flag es_documento_identidad
-- Esto causa que useDocumentoIdentidad NO encuentre documento activo

-- ========================================
-- TABLA: documentos_cliente
-- ========================================

-- Paso 1: Identificar versiones hijas que perdieron el flag
SELECT
  'ANTES (documentos_cliente):' as estado,
  hijo.id as hijo_id,
  hijo.titulo as hijo_titulo,
  hijo.version as hijo_version,
  hijo.es_version_actual as hijo_actual,
  hijo.es_documento_identidad as hijo_es_cedula,
  padre.id as padre_id,
  padre.es_documento_identidad as padre_es_cedula
FROM documentos_cliente hijo
INNER JOIN documentos_cliente padre
  ON hijo.documento_padre_id = padre.id
WHERE
  padre.es_documento_identidad = true
  AND (hijo.es_documento_identidad IS NULL OR hijo.es_documento_identidad = false);

-- Paso 2: Corregir versiones hijas copiando el flag del padre
UPDATE documentos_cliente hijo
SET es_documento_identidad = padre.es_documento_identidad
FROM documentos_cliente padre
WHERE
  hijo.documento_padre_id = padre.id
  AND padre.es_documento_identidad = true
  AND (hijo.es_documento_identidad IS NULL OR hijo.es_documento_identidad = false);

-- Paso 3: Verificar resultados
SELECT
  'DESPUES (documentos_cliente):' as estado,
  hijo.id as hijo_id,
  hijo.titulo as hijo_titulo,
  hijo.version as hijo_version,
  hijo.es_version_actual as hijo_actual,
  hijo.es_documento_identidad as hijo_es_cedula,
  padre.id as padre_id,
  padre.es_documento_identidad as padre_es_cedula
FROM documentos_cliente hijo
INNER JOIN documentos_cliente padre
  ON hijo.documento_padre_id = padre.id
WHERE
  padre.es_documento_identidad = true;
