-- ============================================================
-- MIGRACIÓN: Acciones específicas para módulo abonos
-- ============================================================
-- Fecha: 2026-04-23
-- Descripción: Crea acciones semánticamente correctas para abonos:
--   - registrar: registrar nuevos abonos (reemplaza 'crear' genérico)
--   - anular: anular/revertir un abono registrado (más específico que 'eliminar')
--   Se mantienen 'crear' y 'eliminar' por compatibilidad hacia atrás.
-- ============================================================

-- ── REGISTRAR ABONO ──────────────────────────────────────────

-- Administrador: siempre habilitado
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Administrador', 'abonos', 'registrar', true, 'Registrar nuevos abonos de pago')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = true;

-- Contabilidad: habilitado por defecto
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Contabilidad', 'abonos', 'registrar', true, 'Registrar nuevos abonos de pago')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = true;

-- Administrador de Obra: habilitado por defecto
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Administrador de Obra', 'abonos', 'registrar', true, 'Registrar nuevos abonos de pago')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = true;

-- Gerencia: solo lectura por defecto
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Gerencia', 'abonos', 'registrar', false, 'Registrar nuevos abonos de pago')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = EXCLUDED.permitido;

-- ── ANULAR ABONO ─────────────────────────────────────────────

-- Administrador: siempre habilitado
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Administrador', 'abonos', 'anular', true, 'Anular abonos registrados')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = true;

-- Contabilidad: habilitado por defecto (acción crítica)
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Contabilidad', 'abonos', 'anular', true, 'Anular abonos registrados')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = true;

-- Administrador de Obra: deshabilitado por defecto (acción crítica)
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Administrador de Obra', 'abonos', 'anular', false, 'Anular abonos registrados')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = EXCLUDED.permitido;

-- Gerencia: deshabilitado por defecto
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Gerencia', 'abonos', 'anular', false, 'Anular abonos registrados')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = EXCLUDED.permitido;
