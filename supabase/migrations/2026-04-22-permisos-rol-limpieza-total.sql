-- ============================================================
-- MIGRACIÓN: Limpieza total de permisos_rol
-- Fecha: 2026-04-22
--
-- Elimina todas las filas existentes (incluye fantasmas:
-- aprobar, rechazar, exportar, importar, gestionar, generar)
-- y reconstruye la tabla con permisos reales y funcionales.
--
-- Módulos reales del sistema:
--   proyectos, viviendas, clientes, negociaciones, documentos,
--   abonos, renuncias, usuarios, auditorias, reportes, administracion
--
-- Acciones reales:
--   ver, crear, subir (documentos), editar, eliminar, archivar (documentos)
--
-- Regla: Administrador siempre tiene acceso total (bypass en código,
--        no se almacena en esta tabla).
-- ============================================================

BEGIN;

-- 1. Limpiar todo
DELETE FROM permisos_rol;

-- 2. Insertar permisos limpios
--    Formato: (modulo, accion, rol, permitido, descripcion)

-- ── PROYECTOS ─────────────────────────────────────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('proyectos', 'ver',      'Contabilidad',          true,  'Acceder al módulo y ver listado'),
  ('proyectos', 'crear',    'Contabilidad',          true,  'Crear nuevos proyectos'),
  ('proyectos', 'editar',   'Contabilidad',          true,  'Modificar datos del proyecto'),
  ('proyectos', 'eliminar', 'Contabilidad',          false, 'Eliminar proyectos'),
  ('proyectos', 'ver',      'Administrador de Obra', true,  'Acceder al módulo y ver listado'),
  ('proyectos', 'crear',    'Administrador de Obra', false, 'Crear nuevos proyectos'),
  ('proyectos', 'editar',   'Administrador de Obra', false, 'Modificar datos del proyecto'),
  ('proyectos', 'eliminar', 'Administrador de Obra', false, 'Eliminar proyectos'),
  ('proyectos', 'ver',      'Gerencia',              true,  'Acceder al módulo y ver listado'),
  ('proyectos', 'crear',    'Gerencia',              false, 'Crear nuevos proyectos'),
  ('proyectos', 'editar',   'Gerencia',              true,  'Modificar datos del proyecto'),
  ('proyectos', 'eliminar', 'Gerencia',              true,  'Eliminar proyectos');

-- ── VIVIENDAS ─────────────────────────────────────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('viviendas', 'ver',      'Contabilidad',          true,  'Acceder al módulo y ver listado'),
  ('viviendas', 'crear',    'Contabilidad',          true,  'Registrar nuevas viviendas'),
  ('viviendas', 'editar',   'Contabilidad',          true,  'Modificar datos de la vivienda'),
  ('viviendas', 'eliminar', 'Contabilidad',          false, 'Eliminar viviendas'),
  ('viviendas', 'ver',      'Administrador de Obra', true,  'Acceder al módulo y ver listado'),
  ('viviendas', 'crear',    'Administrador de Obra', false, 'Registrar nuevas viviendas'),
  ('viviendas', 'editar',   'Administrador de Obra', false, 'Modificar datos de la vivienda'),
  ('viviendas', 'eliminar', 'Administrador de Obra', false, 'Eliminar viviendas'),
  ('viviendas', 'ver',      'Gerencia',              true,  'Acceder al módulo y ver listado'),
  ('viviendas', 'crear',    'Gerencia',              false, 'Registrar nuevas viviendas'),
  ('viviendas', 'editar',   'Gerencia',              true,  'Modificar datos de la vivienda'),
  ('viviendas', 'eliminar', 'Gerencia',              true,  'Eliminar viviendas');

-- ── CLIENTES ──────────────────────────────────────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('clientes', 'ver',      'Contabilidad',          true,  'Acceder al módulo y ver listado'),
  ('clientes', 'crear',    'Contabilidad',          true,  'Registrar nuevos clientes'),
  ('clientes', 'editar',   'Contabilidad',          true,  'Modificar datos del cliente'),
  ('clientes', 'eliminar', 'Contabilidad',          false, 'Eliminar clientes'),
  ('clientes', 'ver',      'Administrador de Obra', true,  'Acceder al módulo y ver listado'),
  ('clientes', 'crear',    'Administrador de Obra', false, 'Registrar nuevos clientes'),
  ('clientes', 'editar',   'Administrador de Obra', false, 'Modificar datos del cliente'),
  ('clientes', 'eliminar', 'Administrador de Obra', false, 'Eliminar clientes'),
  ('clientes', 'ver',      'Gerencia',              true,  'Acceder al módulo y ver listado'),
  ('clientes', 'crear',    'Gerencia',              true,  'Registrar nuevos clientes'),
  ('clientes', 'editar',   'Gerencia',              true,  'Modificar datos del cliente'),
  ('clientes', 'eliminar', 'Gerencia',              true,  'Eliminar clientes');

-- ── NEGOCIACIONES (tab del detalle cliente) ───────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('negociaciones', 'ver',      'Contabilidad',          true,  'Ver tab de negociaciones del cliente'),
  ('negociaciones', 'crear',    'Contabilidad',          true,  'Crear negociaciones'),
  ('negociaciones', 'editar',   'Contabilidad',          true,  'Modificar negociaciones'),
  ('negociaciones', 'eliminar', 'Contabilidad',          false, 'Eliminar negociaciones'),
  ('negociaciones', 'ver',      'Administrador de Obra', false, 'Ver tab de negociaciones del cliente'),
  ('negociaciones', 'crear',    'Administrador de Obra', false, 'Crear negociaciones'),
  ('negociaciones', 'editar',   'Administrador de Obra', false, 'Modificar negociaciones'),
  ('negociaciones', 'eliminar', 'Administrador de Obra', false, 'Eliminar negociaciones'),
  ('negociaciones', 'ver',      'Gerencia',              true,  'Ver tab de negociaciones del cliente'),
  ('negociaciones', 'crear',    'Gerencia',              true,  'Crear negociaciones'),
  ('negociaciones', 'editar',   'Gerencia',              true,  'Modificar negociaciones'),
  ('negociaciones', 'eliminar', 'Gerencia',              true,  'Eliminar negociaciones');

-- ── DOCUMENTOS (tab del detalle cliente/proyecto) ─────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('documentos', 'ver',      'Contabilidad',          true,  'Ver tab de documentos'),
  ('documentos', 'subir',    'Contabilidad',          true,  'Subir nuevos documentos'),
  ('documentos', 'editar',   'Contabilidad',          true,  'Renombrar y editar metadatos'),
  ('documentos', 'eliminar', 'Contabilidad',          false, 'Eliminar documentos'),
  ('documentos', 'archivar', 'Contabilidad',          true,  'Archivar documentos'),
  ('documentos', 'ver',      'Administrador de Obra', true,  'Ver tab de documentos'),
  ('documentos', 'subir',    'Administrador de Obra', true,  'Subir nuevos documentos'),
  ('documentos', 'editar',   'Administrador de Obra', false, 'Renombrar y editar metadatos'),
  ('documentos', 'eliminar', 'Administrador de Obra', false, 'Eliminar documentos'),
  ('documentos', 'archivar', 'Administrador de Obra', false, 'Archivar documentos'),
  ('documentos', 'ver',      'Gerencia',              true,  'Ver tab de documentos'),
  ('documentos', 'subir',    'Gerencia',              true,  'Subir nuevos documentos'),
  ('documentos', 'editar',   'Gerencia',              true,  'Renombrar y editar metadatos'),
  ('documentos', 'eliminar', 'Gerencia',              true,  'Eliminar documentos'),
  ('documentos', 'archivar', 'Gerencia',              true,  'Archivar documentos');

-- ── ABONOS ────────────────────────────────────────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('abonos', 'ver',      'Contabilidad',          true,  'Acceder al módulo y ver listado'),
  ('abonos', 'crear',    'Contabilidad',          true,  'Registrar abonos'),
  ('abonos', 'editar',   'Contabilidad',          true,  'Modificar abonos'),
  ('abonos', 'eliminar', 'Contabilidad',          false, 'Eliminar abonos'),
  ('abonos', 'ver',      'Administrador de Obra', false, 'Acceder al módulo y ver listado'),
  ('abonos', 'crear',    'Administrador de Obra', false, 'Registrar abonos'),
  ('abonos', 'editar',   'Administrador de Obra', false, 'Modificar abonos'),
  ('abonos', 'eliminar', 'Administrador de Obra', false, 'Eliminar abonos'),
  ('abonos', 'ver',      'Gerencia',              true,  'Acceder al módulo y ver listado'),
  ('abonos', 'crear',    'Gerencia',              false, 'Registrar abonos'),
  ('abonos', 'editar',   'Gerencia',              false, 'Modificar abonos'),
  ('abonos', 'eliminar', 'Gerencia',              true,  'Eliminar abonos');

-- ── RENUNCIAS ─────────────────────────────────────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('renuncias', 'ver',      'Contabilidad',          true,  'Acceder al módulo y ver listado'),
  ('renuncias', 'crear',    'Contabilidad',          true,  'Registrar renuncias'),
  ('renuncias', 'editar',   'Contabilidad',          true,  'Modificar renuncias'),
  ('renuncias', 'eliminar', 'Contabilidad',          false, 'Eliminar renuncias'),
  ('renuncias', 'ver',      'Administrador de Obra', false, 'Acceder al módulo y ver listado'),
  ('renuncias', 'crear',    'Administrador de Obra', false, 'Registrar renuncias'),
  ('renuncias', 'editar',   'Administrador de Obra', false, 'Modificar renuncias'),
  ('renuncias', 'eliminar', 'Administrador de Obra', false, 'Eliminar renuncias'),
  ('renuncias', 'ver',      'Gerencia',              true,  'Acceder al módulo y ver listado'),
  ('renuncias', 'crear',    'Gerencia',              true,  'Registrar renuncias'),
  ('renuncias', 'editar',   'Gerencia',              true,  'Modificar renuncias'),
  ('renuncias', 'eliminar', 'Gerencia',              true,  'Eliminar renuncias');

-- ── USUARIOS ──────────────────────────────────────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('usuarios', 'ver',      'Contabilidad',          false, 'Ver lista de usuarios y permisos'),
  ('usuarios', 'crear',    'Contabilidad',          false, 'Crear nuevos usuarios'),
  ('usuarios', 'editar',   'Contabilidad',          false, 'Modificar datos y rol de usuarios'),
  ('usuarios', 'eliminar', 'Contabilidad',          false, 'Desactivar usuarios'),
  ('usuarios', 'ver',      'Administrador de Obra', false, 'Ver lista de usuarios y permisos'),
  ('usuarios', 'crear',    'Administrador de Obra', false, 'Crear nuevos usuarios'),
  ('usuarios', 'editar',   'Administrador de Obra', false, 'Modificar datos y rol de usuarios'),
  ('usuarios', 'eliminar', 'Administrador de Obra', false, 'Desactivar usuarios'),
  ('usuarios', 'ver',      'Gerencia',              true,  'Ver lista de usuarios y permisos'),
  ('usuarios', 'crear',    'Gerencia',              true,  'Crear nuevos usuarios'),
  ('usuarios', 'editar',   'Gerencia',              true,  'Modificar datos y rol de usuarios'),
  ('usuarios', 'eliminar', 'Gerencia',              true,  'Desactivar usuarios');

-- ── AUDITORÍAS ────────────────────────────────────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('auditorias', 'ver', 'Contabilidad',          true,  'Ver registros de auditoría'),
  ('auditorias', 'ver', 'Administrador de Obra', false, 'Ver registros de auditoría'),
  ('auditorias', 'ver', 'Gerencia',              true,  'Ver registros de auditoría');

-- ── REPORTES ──────────────────────────────────────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('reportes', 'ver', 'Contabilidad',          true,  'Ver reportes y estadísticas'),
  ('reportes', 'ver', 'Administrador de Obra', false, 'Ver reportes y estadísticas'),
  ('reportes', 'ver', 'Gerencia',              true,  'Ver reportes y estadísticas');

-- ── ADMINISTRACIÓN ────────────────────────────────────────
INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion) VALUES
  ('administracion', 'ver', 'Contabilidad',          false, 'Acceder al panel de administración'),
  ('administracion', 'ver', 'Administrador de Obra', false, 'Acceder al panel de administración'),
  ('administracion', 'ver', 'Gerencia',              true,  'Acceder al panel de administración');

COMMIT;

-- Verificación rápida post-migración
SELECT
  modulo,
  accion,
  COUNT(*) AS roles_configurados,
  SUM(CASE WHEN permitido THEN 1 ELSE 0 END) AS roles_activos
FROM permisos_rol
GROUP BY modulo, accion
ORDER BY modulo, accion;
