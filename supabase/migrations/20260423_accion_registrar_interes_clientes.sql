-- ============================================================
-- MIGRACIÓN: Agregar acción 'registrar_interes' al módulo clientes
-- ============================================================
-- Fecha: 2026-04-23
-- Descripción: Crea permiso específico para registrar/descartar intereses
--              de un cliente en proyectos/viviendas.
--              Antes se controlaba con 'clientes.editar' (demasiado genérico).
-- ============================================================

-- Administrador: siempre habilitado
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Administrador', 'clientes', 'registrar_interes', true, 'Registrar y descartar intereses de clientes en viviendas')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = true;

-- Contabilidad: habilitado por defecto (tiene editar)
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Contabilidad', 'clientes', 'registrar_interes', true, 'Registrar y descartar intereses de clientes en viviendas')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = true;

-- Administrador de Obra: habilitado por defecto
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Administrador de Obra', 'clientes', 'registrar_interes', true, 'Registrar y descartar intereses de clientes en viviendas')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = true;

-- Gerencia: solo lectura por defecto (puede habilitarse desde UI)
INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
VALUES ('Gerencia', 'clientes', 'registrar_interes', false, 'Registrar y descartar intereses de clientes en viviendas')
ON CONFLICT (rol, modulo, accion) DO UPDATE SET permitido = EXCLUDED.permitido;
