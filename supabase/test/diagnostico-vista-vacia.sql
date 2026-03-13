-- Diagnóstico: Por qué la vista está vacía?

-- 1. ¿Hay fuentes activas?
SELECT 'FUENTES ACTIVAS' as diagnostic, COUNT(*) as total
FROM fuentes_pago
WHERE estado = 'Activa';

-- 2. ¿Hay requisitos configurados activos?
SELECT 'REQUISITOS ACTIVOS' as diagnostic, COUNT(*) as total
FROM requisitos_fuentes_pago_config
WHERE activo = true;

-- 3. ¿Los tipos de fuentes coinciden con requisitos?
SELECT
  'TIPOS QUE NO COINCIDEN' as diagnostic,
  fp.tipo as tipo_fuente,
  COUNT(DISTINCT fp.id) as fuentes_con_este_tipo,
  COUNT(DISTINCT rfc.id) as requisitos_para_este_tipo
FROM fuentes_pago fp
LEFT JOIN requisitos_fuentes_pago_config rfc
  ON rfc.tipo_fuente = fp.tipo AND rfc.activo = true
WHERE fp.estado = 'Activa'
GROUP BY fp.tipo;

-- 4. Ejemplo de fuente activa con sus datos
SELECT
  'EJEMPLO FUENTE' as diagnostic,
  id,
  tipo,
  entidad,
  estado,
  negociacion_id
FROM fuentes_pago
WHERE estado = 'Activa'
LIMIT 1;

-- 5. ¿Qué requisitos hay configurados?
SELECT
  'REQUISITOS CONFIGURADOS' as diagnostic,
  tipo_fuente,
  titulo,
  tipo_documento_sugerido,
  nivel_validacion,
  activo
FROM requisitos_fuentes_pago_config
WHERE activo = true
LIMIT 5;
