-- ============================================
-- FIX: Actualizar constraint y poblar permisos
-- ============================================
-- Descripción: Ejecuta migración 027 + seed 021 con roles correctos
-- Fecha: 2025-01-XX
-- Problema: seed 021 tiene 'Gerencia' pero constraint actual requiere 'Gerente'
-- Solución: Actualizar constraint + insertar con rol correcto
-- ============================================

-- PASO 1: Eliminar constraint antiguo
ALTER TABLE permisos_rol DROP CONSTRAINT IF EXISTS permisos_rol_rol_check;

-- PASO 2: Crear constraint nuevo con 'Gerente' (no 'Gerencia')
ALTER TABLE permisos_rol
ADD CONSTRAINT permisos_rol_rol_check
CHECK (rol IN ('Administrador', 'Contador', 'Supervisor', 'Gerente'));

-- PASO 3: Limpiar tabla para seed limpio
TRUNCATE TABLE permisos_rol;

-- PASO 4: Seed de permisos (con 'Gerente' en lugar de 'Gerencia')

-- ============================================
-- 1. ADMINISTRADOR - ACCESO TOTAL
-- ============================================

INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion) VALUES
  -- Proyectos
  ('Administrador', 'proyectos', 'ver', true, 'Ver lista y detalles de proyectos'),
  ('Administrador', 'proyectos', 'crear', true, 'Crear nuevos proyectos'),
  ('Administrador', 'proyectos', 'editar', true, 'Modificar proyectos existentes'),
  ('Administrador', 'proyectos', 'eliminar', true, 'Eliminar proyectos'),
  ('Administrador', 'proyectos', 'exportar', true, 'Exportar datos de proyectos'),

  -- Viviendas
  ('Administrador', 'viviendas', 'ver', true, 'Ver lista y detalles de viviendas'),
  ('Administrador', 'viviendas', 'crear', true, 'Crear nuevas viviendas'),
  ('Administrador', 'viviendas', 'editar', true, 'Modificar viviendas existentes'),
  ('Administrador', 'viviendas', 'eliminar', true, 'Eliminar viviendas'),
  ('Administrador', 'viviendas', 'exportar', true, 'Exportar datos de viviendas'),

  -- Clientes
  ('Administrador', 'clientes', 'ver', true, 'Ver lista y detalles de clientes'),
  ('Administrador', 'clientes', 'crear', true, 'Registrar nuevos clientes'),
  ('Administrador', 'clientes', 'editar', true, 'Modificar datos de clientes'),
  ('Administrador', 'clientes', 'eliminar', true, 'Eliminar clientes'),
  ('Administrador', 'clientes', 'exportar', true, 'Exportar base de clientes'),

  -- Documentos
  ('Administrador', 'documentos', 'ver', true, 'Ver documentos del sistema'),
  ('Administrador', 'documentos', 'crear', true, 'Subir nuevos documentos'),
  ('Administrador', 'documentos', 'editar', true, 'Modificar documentos'),
  ('Administrador', 'documentos', 'eliminar', true, 'Eliminar documentos'),
  ('Administrador', 'documentos', 'exportar', true, 'Descargar documentos'),

  -- Negociaciones
  ('Administrador', 'negociaciones', 'ver', true, 'Ver negociaciones'),
  ('Administrador', 'negociaciones', 'crear', true, 'Crear negociaciones'),
  ('Administrador', 'negociaciones', 'editar', true, 'Modificar negociaciones'),
  ('Administrador', 'negociaciones', 'eliminar', true, 'Eliminar negociaciones'),
  ('Administrador', 'negociaciones', 'aprobar', true, 'Aprobar negociaciones'),

  -- Abonos
  ('Administrador', 'abonos', 'ver', true, 'Ver lista de abonos'),
  ('Administrador', 'abonos', 'crear', true, 'Registrar nuevos abonos'),
  ('Administrador', 'abonos', 'editar', true, 'Modificar abonos'),
  ('Administrador', 'abonos', 'eliminar', true, 'Eliminar abonos'),
  ('Administrador', 'abonos', 'aprobar', true, 'Aprobar abonos pendientes'),
  ('Administrador', 'abonos', 'exportar', true, 'Exportar reporte de abonos'),

  -- Usuarios
  ('Administrador', 'usuarios', 'ver', true, 'Ver usuarios del sistema'),
  ('Administrador', 'usuarios', 'crear', true, 'Crear nuevos usuarios'),
  ('Administrador', 'usuarios', 'editar', true, 'Modificar usuarios'),
  ('Administrador', 'usuarios', 'eliminar', true, 'Eliminar usuarios'),
  ('Administrador', 'usuarios', 'gestionar', true, 'Gestión completa de usuarios'),

  -- Auditorías
  ('Administrador', 'auditorias', 'ver', true, 'Ver registros de auditoría'),
  ('Administrador', 'auditorias', 'exportar', true, 'Exportar auditorías'),

  -- Reportes
  ('Administrador', 'reportes', 'ver', true, 'Ver todos los reportes'),
  ('Administrador', 'reportes', 'generar', true, 'Generar reportes personalizados'),
  ('Administrador', 'reportes', 'exportar', true, 'Exportar reportes');

-- ============================================
-- 2. CONTADOR - CREAR/EDITAR (sin Eliminar)
-- ============================================

INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion) VALUES
  -- Proyectos
  ('Contador', 'proyectos', 'ver', true, 'Ver lista y detalles de proyectos'),
  ('Contador', 'proyectos', 'crear', true, 'Crear nuevos proyectos'),
  ('Contador', 'proyectos', 'editar', true, 'Modificar proyectos existentes'),
  ('Contador', 'proyectos', 'eliminar', false, 'No puede eliminar proyectos'),
  ('Contador', 'proyectos', 'exportar', true, 'Exportar datos de proyectos'),

  -- Viviendas
  ('Contador', 'viviendas', 'ver', true, 'Ver lista y detalles de viviendas'),
  ('Contador', 'viviendas', 'crear', true, 'Crear nuevas viviendas'),
  ('Contador', 'viviendas', 'editar', true, 'Modificar viviendas existentes'),
  ('Contador', 'viviendas', 'eliminar', false, 'No puede eliminar viviendas'),
  ('Contador', 'viviendas', 'exportar', true, 'Exportar datos de viviendas'),

  -- Clientes
  ('Contador', 'clientes', 'ver', true, 'Ver lista y detalles de clientes'),
  ('Contador', 'clientes', 'crear', true, 'Registrar nuevos clientes'),
  ('Contador', 'clientes', 'editar', true, 'Modificar datos de clientes'),
  ('Contador', 'clientes', 'eliminar', false, 'No puede eliminar clientes'),
  ('Contador', 'clientes', 'exportar', true, 'Exportar base de clientes'),

  -- Documentos
  ('Contador', 'documentos', 'ver', true, 'Ver documentos del sistema'),
  ('Contador', 'documentos', 'crear', true, 'Subir nuevos documentos'),
  ('Contador', 'documentos', 'editar', true, 'Modificar documentos'),
  ('Contador', 'documentos', 'eliminar', false, 'No puede eliminar documentos'),
  ('Contador', 'documentos', 'exportar', true, 'Descargar documentos'),

  -- Negociaciones
  ('Contador', 'negociaciones', 'ver', true, 'Ver negociaciones'),
  ('Contador', 'negociaciones', 'crear', true, 'Crear negociaciones'),
  ('Contador', 'negociaciones', 'editar', true, 'Modificar negociaciones'),
  ('Contador', 'negociaciones', 'eliminar', false, 'No puede eliminar negociaciones'),
  ('Contador', 'negociaciones', 'aprobar', false, 'No puede aprobar negociaciones'),

  -- Abonos
  ('Contador', 'abonos', 'ver', true, 'Ver lista de abonos'),
  ('Contador', 'abonos', 'crear', true, 'Registrar nuevos abonos'),
  ('Contador', 'abonos', 'editar', true, 'Modificar abonos'),
  ('Contador', 'abonos', 'eliminar', false, 'No puede eliminar abonos'),
  ('Contador', 'abonos', 'aprobar', false, 'No puede aprobar abonos'),
  ('Contador', 'abonos', 'exportar', true, 'Exportar reporte de abonos'),

  -- Usuarios
  ('Contador', 'usuarios', 'ver', true, 'Ver usuarios del sistema'),
  ('Contador', 'usuarios', 'crear', false, 'No puede crear usuarios'),
  ('Contador', 'usuarios', 'editar', false, 'No puede modificar usuarios'),
  ('Contador', 'usuarios', 'eliminar', false, 'No puede eliminar usuarios'),
  ('Contador', 'usuarios', 'gestionar', false, 'No puede gestionar usuarios'),

  -- Auditorías
  ('Contador', 'auditorias', 'ver', true, 'Ver registros de auditoría'),
  ('Contador', 'auditorias', 'exportar', true, 'Exportar auditorías'),

  -- Reportes
  ('Contador', 'reportes', 'ver', true, 'Ver reportes estándar'),
  ('Contador', 'reportes', 'generar', true, 'Generar reportes básicos'),
  ('Contador', 'reportes', 'exportar', true, 'Exportar reportes');

-- ============================================
-- 3. SUPERVISOR - SOLO LECTURA
-- ============================================

INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion) VALUES
  -- Proyectos
  ('Supervisor', 'proyectos', 'ver', true, 'Ver lista y detalles de proyectos'),
  ('Supervisor', 'proyectos', 'crear', false, 'No puede crear proyectos'),
  ('Supervisor', 'proyectos', 'editar', false, 'No puede modificar proyectos'),
  ('Supervisor', 'proyectos', 'eliminar', false, 'No puede eliminar proyectos'),
  ('Supervisor', 'proyectos', 'exportar', false, 'No puede exportar datos'),

  -- Viviendas
  ('Supervisor', 'viviendas', 'ver', true, 'Ver lista y detalles de viviendas'),
  ('Supervisor', 'viviendas', 'crear', false, 'No puede crear viviendas'),
  ('Supervisor', 'viviendas', 'editar', false, 'No puede modificar viviendas'),
  ('Supervisor', 'viviendas', 'eliminar', false, 'No puede eliminar viviendas'),
  ('Supervisor', 'viviendas', 'exportar', false, 'No puede exportar datos'),

  -- Clientes
  ('Supervisor', 'clientes', 'ver', true, 'Ver lista y detalles de clientes'),
  ('Supervisor', 'clientes', 'crear', false, 'No puede registrar clientes'),
  ('Supervisor', 'clientes', 'editar', false, 'No puede modificar clientes'),
  ('Supervisor', 'clientes', 'eliminar', false, 'No puede eliminar clientes'),
  ('Supervisor', 'clientes', 'exportar', false, 'No puede exportar datos'),

  -- Documentos
  ('Supervisor', 'documentos', 'ver', true, 'Ver documentos del sistema'),
  ('Supervisor', 'documentos', 'crear', false, 'No puede subir documentos'),
  ('Supervisor', 'documentos', 'editar', false, 'No puede modificar documentos'),
  ('Supervisor', 'documentos', 'eliminar', false, 'No puede eliminar documentos'),
  ('Supervisor', 'documentos', 'exportar', true, 'Descargar documentos'),

  -- Negociaciones
  ('Supervisor', 'negociaciones', 'ver', true, 'Ver negociaciones'),
  ('Supervisor', 'negociaciones', 'crear', false, 'No puede crear negociaciones'),
  ('Supervisor', 'negociaciones', 'editar', false, 'No puede modificar negociaciones'),
  ('Supervisor', 'negociaciones', 'eliminar', false, 'No puede eliminar negociaciones'),
  ('Supervisor', 'negociaciones', 'aprobar', false, 'No puede aprobar negociaciones'),

  -- Abonos
  ('Supervisor', 'abonos', 'ver', true, 'Ver lista de abonos'),
  ('Supervisor', 'abonos', 'crear', false, 'No puede registrar abonos'),
  ('Supervisor', 'abonos', 'editar', false, 'No puede modificar abonos'),
  ('Supervisor', 'abonos', 'eliminar', false, 'No puede eliminar abonos'),
  ('Supervisor', 'abonos', 'aprobar', false, 'No puede aprobar abonos'),
  ('Supervisor', 'abonos', 'exportar', false, 'No puede exportar datos'),

  -- Usuarios
  ('Supervisor', 'usuarios', 'ver', false, 'No puede ver usuarios'),
  ('Supervisor', 'usuarios', 'crear', false, 'No puede crear usuarios'),
  ('Supervisor', 'usuarios', 'editar', false, 'No puede modificar usuarios'),
  ('Supervisor', 'usuarios', 'eliminar', false, 'No puede eliminar usuarios'),
  ('Supervisor', 'usuarios', 'gestionar', false, 'No puede gestionar usuarios'),

  -- Auditorías
  ('Supervisor', 'auditorias', 'ver', false, 'No puede ver auditorías'),
  ('Supervisor', 'auditorias', 'exportar', false, 'No puede exportar auditorías'),

  -- Reportes
  ('Supervisor', 'reportes', 'ver', true, 'Ver reportes estándar'),
  ('Supervisor', 'reportes', 'generar', false, 'No puede generar reportes'),
  ('Supervisor', 'reportes', 'exportar', false, 'No puede exportar reportes');

-- ============================================
-- 4. GERENTE - LECTURA + REPORTES AVANZADOS (era 'Gerencia')
-- ============================================

INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion) VALUES
  -- Proyectos
  ('Gerente', 'proyectos', 'ver', true, 'Ver lista y detalles de proyectos'),
  ('Gerente', 'proyectos', 'crear', false, 'No puede crear proyectos'),
  ('Gerente', 'proyectos', 'editar', false, 'No puede modificar proyectos'),
  ('Gerente', 'proyectos', 'eliminar', false, 'No puede eliminar proyectos'),
  ('Gerente', 'proyectos', 'exportar', true, 'Exportar datos de proyectos'),

  -- Viviendas
  ('Gerente', 'viviendas', 'ver', true, 'Ver lista y detalles de viviendas'),
  ('Gerente', 'viviendas', 'crear', false, 'No puede crear viviendas'),
  ('Gerente', 'viviendas', 'editar', false, 'No puede modificar viviendas'),
  ('Gerente', 'viviendas', 'eliminar', false, 'No puede eliminar viviendas'),
  ('Gerente', 'viviendas', 'exportar', true, 'Exportar datos de viviendas'),

  -- Clientes
  ('Gerente', 'clientes', 'ver', true, 'Ver lista y detalles de clientes'),
  ('Gerente', 'clientes', 'crear', false, 'No puede registrar clientes'),
  ('Gerente', 'clientes', 'editar', false, 'No puede modificar clientes'),
  ('Gerente', 'clientes', 'eliminar', false, 'No puede eliminar clientes'),
  ('Gerente', 'clientes', 'exportar', true, 'Exportar base de clientes'),

  -- Documentos
  ('Gerente', 'documentos', 'ver', true, 'Ver documentos del sistema'),
  ('Gerente', 'documentos', 'crear', false, 'No puede subir documentos'),
  ('Gerente', 'documentos', 'editar', false, 'No puede modificar documentos'),
  ('Gerente', 'documentos', 'eliminar', false, 'No puede eliminar documentos'),
  ('Gerente', 'documentos', 'exportar', true, 'Descargar documentos'),

  -- Negociaciones
  ('Gerente', 'negociaciones', 'ver', true, 'Ver negociaciones'),
  ('Gerente', 'negociaciones', 'crear', false, 'No puede crear negociaciones'),
  ('Gerente', 'negociaciones', 'editar', false, 'No puede modificar negociaciones'),
  ('Gerente', 'negociaciones', 'eliminar', false, 'No puede eliminar negociaciones'),
  ('Gerente', 'negociaciones', 'aprobar', true, 'Aprobar negociaciones importantes'),

  -- Abonos
  ('Gerente', 'abonos', 'ver', true, 'Ver lista de abonos'),
  ('Gerente', 'abonos', 'crear', false, 'No puede registrar abonos'),
  ('Gerente', 'abonos', 'editar', false, 'No puede modificar abonos'),
  ('Gerente', 'abonos', 'eliminar', false, 'No puede eliminar abonos'),
  ('Gerente', 'abonos', 'aprobar', true, 'Aprobar abonos pendientes'),
  ('Gerente', 'abonos', 'exportar', true, 'Exportar reporte de abonos'),

  -- Usuarios
  ('Gerente', 'usuarios', 'ver', true, 'Ver usuarios del sistema'),
  ('Gerente', 'usuarios', 'crear', false, 'No puede crear usuarios'),
  ('Gerente', 'usuarios', 'editar', false, 'No puede modificar usuarios'),
  ('Gerente', 'usuarios', 'eliminar', false, 'No puede eliminar usuarios'),
  ('Gerente', 'usuarios', 'gestionar', false, 'No puede gestionar usuarios'),

  -- Auditorías
  ('Gerente', 'auditorias', 'ver', true, 'Ver registros de auditoría'),
  ('Gerente', 'auditorias', 'exportar', true, 'Exportar auditorías'),

  -- Reportes
  ('Gerente', 'reportes', 'ver', true, 'Ver todos los reportes'),
  ('Gerente', 'reportes', 'generar', true, 'Generar reportes avanzados'),
  ('Gerente', 'reportes', 'exportar', true, 'Exportar reportes');

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

DO $$
DECLARE
  v_total_permisos INTEGER;
  v_total_admin INTEGER;
  v_total_contador INTEGER;
  v_total_supervisor INTEGER;
  v_total_gerente INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_permisos FROM permisos_rol;
  SELECT COUNT(*) INTO v_total_admin FROM permisos_rol WHERE rol = 'Administrador';
  SELECT COUNT(*) INTO v_total_contador FROM permisos_rol WHERE rol = 'Contador';
  SELECT COUNT(*) INTO v_total_supervisor FROM permisos_rol WHERE rol = 'Supervisor';
  SELECT COUNT(*) INTO v_total_gerente FROM permisos_rol WHERE rol = 'Gerente';

  RAISE NOTICE '';
  RAISE NOTICE '✅ ==================================';
  RAISE NOTICE '✅ PERMISOS POBLADOS EXITOSAMENTE';
  RAISE NOTICE '✅ ==================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Total de permisos: %', v_total_permisos;
  RAISE NOTICE '👤 Administrador: % permisos', v_total_admin;
  RAISE NOTICE '👤 Contador: % permisos', v_total_contador;
  RAISE NOTICE '👤 Supervisor: % permisos', v_total_supervisor;
  RAISE NOTICE '👤 Gerente: % permisos', v_total_gerente;
  RAISE NOTICE '';
END $$;
