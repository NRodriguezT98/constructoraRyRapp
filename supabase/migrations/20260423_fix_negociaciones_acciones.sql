-- ============================================================
-- Migración: Limpiar y corregir acciones del módulo negociaciones
-- Fecha: 2026-04-23
-- Problema: Las acciones 'crear', 'editar' y 'eliminar' para el
--   módulo negociaciones no corresponden a ninguna operación real
--   en la UI. Se reemplazan por acciones semánticamente correctas.
--
-- Mapeo de cambios:
--   crear   → asignar  (asignar vivienda a un cliente)
--   editar  → [eliminado] (no existe "editar negociación" en la UI)
--   eliminar → [eliminado] (no existe "eliminar negociación" en la UI)
--
-- Acciones que quedan para negociaciones:
--   ver, asignar, trasladar, renunciar, descuento, escritura, ajustar
-- ============================================================

-- 1. Eliminar las acciones que no corresponden a ninguna operación real
DELETE FROM permisos_rol
WHERE modulo = 'negociaciones'
  AND accion IN ('crear', 'editar', 'eliminar');

-- 2. Insertar 'asignar' (reemplaza a 'crear') para los roles no-Admin
--    Contabilidad puede asignar viviendas por defecto
--    Administrador de Obra y Gerencia no pueden por defecto
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES
  ('Contabilidad',          'negociaciones', 'asignar', TRUE,  'Puede asignar una vivienda a un cliente'),
  ('Administrador de Obra', 'negociaciones', 'asignar', FALSE, 'No puede asignar viviendas por defecto'),
  ('Gerencia',              'negociaciones', 'asignar', FALSE, 'No puede asignar viviendas por defecto')
ON CONFLICT (rol, modulo, accion) DO NOTHING;

-- 3. Asegurarse de que las 5 acciones específicas existen
--    (pueden venir de la migración anterior 20260423_negociaciones_acciones_especiales.sql)
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
SELECT r.rol, 'negociaciones', a.accion, FALSE, a.descripcion
FROM (VALUES
  ('Contabilidad'),
  ('Administrador de Obra'),
  ('Gerencia')
) AS r(rol)
CROSS JOIN (VALUES
  ('trasladar', 'Puede trasladar la vivienda asignada a otra disponible'),
  ('renunciar',  'Puede registrar la renuncia del cliente a la negociación'),
  ('descuento',  'Puede aplicar, modificar o quitar descuentos'),
  ('escritura',  'Puede editar el valor de escritura pública'),
  ('ajustar',    'Puede ajustar el cierre financiero (rebalanceo de fuentes)')
) AS a(accion, descripcion)
ON CONFLICT (rol, modulo, accion) DO NOTHING;

-- Verificar resultado final
SELECT rol, modulo, accion, permitido, descripcion
FROM permisos_rol
WHERE modulo = 'negociaciones'
ORDER BY rol, accion;
