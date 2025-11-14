-- ============================================
-- SEED: Permisos Iniciales por Rol
-- ============================================
-- Descripción: Inserta permisos base para 4 roles según estructura de empresa
-- Fecha: 2025-11-14
-- Autor: Sistema RyR
-- Versión: 1.0
-- ============================================

-- ESTRUCTURA DE ROLES:
-- 1. Administrador (Cali) - Control total del sistema
-- 2. Contador (Equipo contable) - Crear/Editar sin Eliminar
-- 3. Supervisor (Admin obra Guacarí) - Solo Lectura
-- 4. Gerencia (Ejecutivos) - Solo Lectura + Reportes avanzados

-- ============================================
-- LIMPIAR PERMISOS EXISTENTES (si existen)
-- ============================================

TRUNCATE TABLE permisos_rol;

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
  ('Administrador', 'reportes', 'ver', true, 'Ver reportes del sistema'),
  ('Administrador', 'reportes', 'exportar', true, 'Exportar reportes'),

  -- Administración
  ('Administrador', 'administracion', 'ver', true, 'Acceso panel administración'),
  ('Administrador', 'administracion', 'gestionar', true, 'Configuración del sistema');

-- ============================================
-- 2. CONTADOR - CREAR/EDITAR SIN ELIMINAR
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

  -- Abonos (CRÍTICO para contadores)
  ('Contador', 'abonos', 'ver', true, 'Ver lista de abonos'),
  ('Contador', 'abonos', 'crear', true, 'Registrar nuevos abonos'),
  ('Contador', 'abonos', 'editar', true, 'Modificar abonos'),
  ('Contador', 'abonos', 'eliminar', false, 'No puede eliminar abonos'),
  ('Contador', 'abonos', 'aprobar', true, 'Puede aprobar abonos pendientes'),
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
  ('Contador', 'reportes', 'ver', true, 'Ver reportes del sistema'),
  ('Contador', 'reportes', 'exportar', true, 'Exportar reportes'),

  -- Administración
  ('Contador', 'administracion', 'ver', false, 'Sin acceso a administración'),
  ('Contador', 'administracion', 'gestionar', false, 'No puede configurar sistema');

-- ============================================
-- 3. SUPERVISOR - SOLO LECTURA
-- ============================================

INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion) VALUES
  -- Proyectos
  ('Supervisor', 'proyectos', 'ver', true, 'Ver lista y detalles de proyectos'),
  ('Supervisor', 'proyectos', 'crear', false, 'No puede crear proyectos'),
  ('Supervisor', 'proyectos', 'editar', false, 'No puede modificar proyectos'),
  ('Supervisor', 'proyectos', 'eliminar', false, 'No puede eliminar proyectos'),
  ('Supervisor', 'proyectos', 'exportar', true, 'Puede exportar datos'),

  -- Viviendas
  ('Supervisor', 'viviendas', 'ver', true, 'Ver lista y detalles de viviendas'),
  ('Supervisor', 'viviendas', 'crear', false, 'No puede crear viviendas'),
  ('Supervisor', 'viviendas', 'editar', false, 'No puede modificar viviendas'),
  ('Supervisor', 'viviendas', 'eliminar', false, 'No puede eliminar viviendas'),
  ('Supervisor', 'viviendas', 'exportar', true, 'Puede exportar datos'),

  -- Clientes
  ('Supervisor', 'clientes', 'ver', true, 'Ver lista y detalles de clientes'),
  ('Supervisor', 'clientes', 'crear', false, 'No puede registrar clientes'),
  ('Supervisor', 'clientes', 'editar', false, 'No puede modificar clientes'),
  ('Supervisor', 'clientes', 'eliminar', false, 'No puede eliminar clientes'),
  ('Supervisor', 'clientes', 'exportar', true, 'Puede exportar base'),

  -- Documentos
  ('Supervisor', 'documentos', 'ver', true, 'Ver documentos del sistema'),
  ('Supervisor', 'documentos', 'crear', false, 'No puede subir documentos'),
  ('Supervisor', 'documentos', 'editar', false, 'No puede modificar documentos'),
  ('Supervisor', 'documentos', 'eliminar', false, 'No puede eliminar documentos'),
  ('Supervisor', 'documentos', 'exportar', true, 'Puede descargar documentos'),

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
  ('Supervisor', 'abonos', 'exportar', true, 'Puede exportar reportes'),

  -- Usuarios
  ('Supervisor', 'usuarios', 'ver', false, 'No puede ver usuarios'),
  ('Supervisor', 'usuarios', 'crear', false, 'No puede crear usuarios'),
  ('Supervisor', 'usuarios', 'editar', false, 'No puede modificar usuarios'),
  ('Supervisor', 'usuarios', 'eliminar', false, 'No puede eliminar usuarios'),
  ('Supervisor', 'usuarios', 'gestionar', false, 'No puede gestionar usuarios'),

  -- Auditorías
  ('Supervisor', 'auditorias', 'ver', false, 'Sin acceso a auditorías'),
  ('Supervisor', 'auditorias', 'exportar', false, 'No puede exportar auditorías'),

  -- Reportes (Lectura básica)
  ('Supervisor', 'reportes', 'ver', true, 'Ver reportes básicos'),
  ('Supervisor', 'reportes', 'exportar', true, 'Exportar reportes básicos'),

  -- Administración
  ('Supervisor', 'administracion', 'ver', false, 'Sin acceso a administración'),
  ('Supervisor', 'administracion', 'gestionar', false, 'No puede configurar sistema');

-- ============================================
-- 4. GERENCIA - LECTURA + REPORTES AVANZADOS
-- ============================================

INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion) VALUES
  -- Proyectos
  ('Gerencia', 'proyectos', 'ver', true, 'Ver lista y detalles de proyectos'),
  ('Gerencia', 'proyectos', 'crear', false, 'No puede crear proyectos'),
  ('Gerencia', 'proyectos', 'editar', false, 'No puede modificar proyectos'),
  ('Gerencia', 'proyectos', 'eliminar', false, 'No puede eliminar proyectos'),
  ('Gerencia', 'proyectos', 'exportar', true, 'Exportar datos de proyectos'),

  -- Viviendas
  ('Gerencia', 'viviendas', 'ver', true, 'Ver lista y detalles de viviendas'),
  ('Gerencia', 'viviendas', 'crear', false, 'No puede crear viviendas'),
  ('Gerencia', 'viviendas', 'editar', false, 'No puede modificar viviendas'),
  ('Gerencia', 'viviendas', 'eliminar', false, 'No puede eliminar viviendas'),
  ('Gerencia', 'viviendas', 'exportar', true, 'Exportar datos de viviendas'),

  -- Clientes
  ('Gerencia', 'clientes', 'ver', true, 'Ver lista y detalles de clientes'),
  ('Gerencia', 'clientes', 'crear', false, 'No puede registrar clientes'),
  ('Gerencia', 'clientes', 'editar', false, 'No puede modificar clientes'),
  ('Gerencia', 'clientes', 'eliminar', false, 'No puede eliminar clientes'),
  ('Gerencia', 'clientes', 'exportar', true, 'Exportar base de clientes'),

  -- Documentos
  ('Gerencia', 'documentos', 'ver', true, 'Ver documentos del sistema'),
  ('Gerencia', 'documentos', 'crear', false, 'No puede subir documentos'),
  ('Gerencia', 'documentos', 'editar', false, 'No puede modificar documentos'),
  ('Gerencia', 'documentos', 'eliminar', false, 'No puede eliminar documentos'),
  ('Gerencia', 'documentos', 'exportar', true, 'Descargar documentos'),

  -- Negociaciones
  ('Gerencia', 'negociaciones', 'ver', true, 'Ver negociaciones'),
  ('Gerencia', 'negociaciones', 'crear', false, 'No puede crear negociaciones'),
  ('Gerencia', 'negociaciones', 'editar', false, 'No puede modificar negociaciones'),
  ('Gerencia', 'negociaciones', 'eliminar', false, 'No puede eliminar negociaciones'),
  ('Gerencia', 'negociaciones', 'aprobar', true, 'Puede aprobar negociaciones'),

  -- Abonos
  ('Gerencia', 'abonos', 'ver', true, 'Ver lista de abonos'),
  ('Gerencia', 'abonos', 'crear', false, 'No puede registrar abonos'),
  ('Gerencia', 'abonos', 'editar', false, 'No puede modificar abonos'),
  ('Gerencia', 'abonos', 'eliminar', false, 'No puede eliminar abonos'),
  ('Gerencia', 'abonos', 'aprobar', true, 'Puede aprobar abonos pendientes'),
  ('Gerencia', 'abonos', 'exportar', true, 'Exportar reporte de abonos'),

  -- Usuarios
  ('Gerencia', 'usuarios', 'ver', true, 'Ver usuarios del sistema'),
  ('Gerencia', 'usuarios', 'crear', false, 'No puede crear usuarios'),
  ('Gerencia', 'usuarios', 'editar', false, 'No puede modificar usuarios'),
  ('Gerencia', 'usuarios', 'eliminar', false, 'No puede eliminar usuarios'),
  ('Gerencia', 'usuarios', 'gestionar', false, 'No puede gestionar usuarios'),

  -- Auditorías (ACCESO COMPLETO)
  ('Gerencia', 'auditorias', 'ver', true, 'Ver registros de auditoría completos'),
  ('Gerencia', 'auditorias', 'exportar', true, 'Exportar auditorías completas'),

  -- Reportes (ACCESO AVANZADO)
  ('Gerencia', 'reportes', 'ver', true, 'Ver reportes avanzados del sistema'),
  ('Gerencia', 'reportes', 'exportar', true, 'Exportar reportes completos'),

  -- Administración
  ('Gerencia', 'administracion', 'ver', true, 'Ver panel de administración'),
  ('Gerencia', 'administracion', 'gestionar', false, 'No puede modificar configuración');

-- ============================================
-- ✅ SEED COMPLETADO
-- ============================================

DO $$
DECLARE
  v_total_permisos INT;
BEGIN
  SELECT COUNT(*) INTO v_total_permisos FROM permisos_rol;

  RAISE NOTICE '✅ Seed de permisos completado';
  RAISE NOTICE '📊 Total permisos insertados: %', v_total_permisos;
  RAISE NOTICE '👤 Administrador: Control total';
  RAISE NOTICE '💼 Contador: Crear/Editar sin Eliminar';
  RAISE NOTICE '👁️ Supervisor: Solo Lectura';
  RAISE NOTICE '📈 Gerencia: Lectura + Reportes avanzados';
  RAISE NOTICE '⏭️ Ejecutar: npm run types:generate';
END $$;
