-- ============================================================================
-- ACLARACIÓN: Diferencia entre CATÁLOGO vs REQUISITOS
-- ============================================================================

-- 1️⃣ CATÁLOGO OFICIAL (tipos_fuentes_pago) - LA FUENTE ÚNICA DE VERDAD
SELECT
  '1. CATÁLOGO OFICIAL' as tabla,
  id,
  nombre,
  activo
FROM tipos_fuentes_pago
WHERE nombre ILIKE '%subsidio%caja%'
ORDER BY nombre;

-- 2️⃣ REQUISITOS CONFIGURADOS (requisitos_fuentes_pago_config) - REGISTROS HISTÓRICOS
SELECT
  '2. REQUISITOS (históricos)' as tabla,
  id,
  tipo_fuente,
  categoria_documento,
  activo
FROM requisitos_fuentes_pago_config
WHERE tipo_fuente ILIKE '%subsidio%caja%'
ORDER BY tipo_fuente, activo DESC;
