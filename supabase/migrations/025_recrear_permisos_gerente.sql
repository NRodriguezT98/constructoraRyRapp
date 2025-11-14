-- Eliminar permisos de "Gerencia" y recrear con "Gerente"

-- 1. Eliminar permisos de Gerencia
DELETE FROM permisos_rol WHERE rol = 'Gerencia';

-- 2. Insertar permisos para Gerente (Ejecutivos) - Solo Lectura + Reportes avanzados
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
  ('Gerente', 'documentos', 'exportar', true, 'Exportar lista de documentos'),

  -- Abonos (PUEDE APROBAR) ✅
  ('Gerente', 'abonos', 'ver', true, 'Ver lista de abonos'),
  ('Gerente', 'abonos', 'crear', false, 'No puede registrar abonos'),
  ('Gerente', 'abonos', 'editar', false, 'No puede modificar abonos'),
  ('Gerente', 'abonos', 'eliminar', false, 'No puede eliminar abonos'),
  ('Gerente', 'abonos', 'aprobar', true, 'Aprobar abonos de clientes'), -- ⭐
  ('Gerente', 'abonos', 'exportar', true, 'Exportar registros de pagos'),

  -- Negociaciones (PUEDE APROBAR) ✅
  ('Gerente', 'negociaciones', 'ver', true, 'Ver negociaciones'),
  ('Gerente', 'negociaciones', 'crear', false, 'No puede crear negociaciones'),
  ('Gerente', 'negociaciones', 'editar', false, 'No puede modificar negociaciones'),
  ('Gerente', 'negociaciones', 'eliminar', false, 'No puede eliminar negociaciones'),
  ('Gerente', 'negociaciones', 'aprobar', true, 'Aprobar negociaciones'), -- ⭐
  ('Gerente', 'negociaciones', 'rechazar', false, 'Rechazar negociaciones'),

  -- Auditorías (ACCESO COMPLETO) ✅
  ('Gerente', 'auditorias', 'ver', true, 'Ver historial de auditoría completo'), -- ⭐
  ('Gerente', 'auditorias', 'exportar', true, 'Exportar logs de auditoría'), -- ⭐

  -- Reportes (ACCESO COMPLETO) ✅
  ('Gerente', 'reportes', 'ver', true, 'Ver reportes avanzados'), -- ⭐
  ('Gerente', 'reportes', 'exportar', true, 'Exportar reportes'), -- ⭐

  -- Usuarios (CONSULTA LIMITADA)
  ('Gerente', 'usuarios', 'ver', true, 'Ver lista de usuarios'), -- Solo lectura
  ('Gerente', 'usuarios', 'crear', false, 'No puede crear usuarios'),
  ('Gerente', 'usuarios', 'editar', false, 'No puede modificar usuarios'),
  ('Gerente', 'usuarios', 'eliminar', false, 'No puede eliminar usuarios'),
  ('Gerente', 'usuarios', 'gestionar', false, 'No puede gestionar roles y permisos'),

  -- Administración
  ('Gerente', 'administracion', 'ver', true, 'Ver configuración del sistema');

-- Verificar resultado
SELECT rol, COUNT(*) as cantidad_permisos
FROM permisos_rol
GROUP BY rol
ORDER BY rol;
