-- =====================================================
-- Datos iniciales para configuracion_recargos
-- =====================================================
-- Insertar valores predeterminados para el año 2025

-- NOTA: Si ya creaste el recargo de Gastos Notariales manualmente,
-- comenta o elimina la primera línea para evitar duplicados

-- 1. Gastos Notariales 2025 (si aún no lo creaste)
-- INSERT INTO configuracion_recargos (tipo, nombre, valor, descripcion, activo)
-- VALUES (
--   'gastos_notariales',
--   'Gastos Notariales 2025',
--   5000000,
--   'Gastos notariales para escrituración año 2025',
--   true
-- );

-- 2. Recargo por Esquinera $5M
INSERT INTO configuracion_recargos (tipo, nombre, valor, descripcion, activo)
VALUES (
  'recargo_esquinera_5m',
  'Recargo Esquinera $5M',
  5000000,
  'Recargo adicional para viviendas en esquina de $5.000.000',
  true
)
ON CONFLICT DO NOTHING;

-- 3. Recargo por Esquinera $10M
INSERT INTO configuracion_recargos (tipo, nombre, valor, descripcion, activo)
VALUES (
  'recargo_esquinera_10m',
  'Recargo Esquinera $10M',
  10000000,
  'Recargo adicional para viviendas en esquina de $10.000.000',
  true
)
ON CONFLICT DO NOTHING;

-- 4. Recargo por Esquinera $12M (opcional)
INSERT INTO configuracion_recargos (tipo, nombre, valor, descripcion, activo)
VALUES (
  'recargo_esquinera_12m',
  'Recargo Esquinera $12M',
  12000000,
  'Recargo adicional para viviendas en esquina de $12.000.000',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Verificación
-- =====================================================
-- Ejecutar para ver los registros creados:
/*
SELECT
  id,
  tipo,
  nombre,
  valor,
  descripcion,
  activo,
  fecha_creacion
FROM configuracion_recargos
ORDER BY tipo, valor;
*/
