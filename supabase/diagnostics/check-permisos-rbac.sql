-- ==========================================================
-- DIAGNÓSTICO RBAC: Estado actual de permisos en BD
-- Ejecutar con: npm run db:exec supabase/diagnostics/check-permisos-rbac.sql
--
-- Qué verifica:
--   1. Roles configurados en permisos_rol (¿coinciden con la app?)
--   2. Cobertura de módulos y acciones
--   3. Matriz completa por rol (quién puede qué)
--   4. Acciones usadas en políticas RLS — ¿tienen seed?
--   5. Blind spots — acciones RLS sin ningún registro en permisos_rol
--   6. Simulación de tiene_permiso() para cada rol no-admin
-- ==========================================================

-- ──────────────────────────────────────────────────────────
-- BLOQUE 1: Roles distintos en permisos_rol
-- ESPERADO: Administrador, Contabilidad, Administrador de Obra, Gerencia
-- ──────────────────────────────────────────────────────────
SELECT
  '== BLOQUE 1: Roles configurados en permisos_rol ==' AS diagnostico;

SELECT
  rol,
  COUNT(*) AS total_permisos,
  COUNT(*) FILTER (WHERE permitido = true)  AS permisos_activos,
  COUNT(*) FILTER (WHERE permitido = false) AS permisos_desactivados
FROM permisos_rol
GROUP BY rol
ORDER BY rol;


-- ──────────────────────────────────────────────────────────
-- BLOQUE 2: Módulos y acciones — ¿cuántos roles tienen cada una?
-- ──────────────────────────────────────────────────────────
SELECT
  '== BLOQUE 2: Cobertura de módulos y acciones ==' AS diagnostico;

SELECT
  modulo,
  accion,
  COUNT(*)                                                        AS roles_total,
  COUNT(*) FILTER (WHERE permitido = true)                        AS roles_con_acceso,
  STRING_AGG(rol || '=' || (CASE WHEN permitido THEN '✓' ELSE '✗' END), ' | ' ORDER BY rol) AS detalle
FROM permisos_rol
GROUP BY modulo, accion
ORDER BY modulo, accion;


-- ──────────────────────────────────────────────────────────
-- BLOQUE 3: Matriz completa — quién puede qué
-- ──────────────────────────────────────────────────────────
SELECT
  '== BLOQUE 3: Matriz de permisos por rol ==' AS diagnostico;

SELECT
  modulo,
  accion,
  MAX(CASE WHEN rol = 'Administrador'         THEN (CASE WHEN permitido THEN '✓' ELSE '✗' END) END) AS "Administrador",
  MAX(CASE WHEN rol = 'Contabilidad'          THEN (CASE WHEN permitido THEN '✓' ELSE '✗' END) END) AS "Contabilidad",
  MAX(CASE WHEN rol = 'Administrador de Obra' THEN (CASE WHEN permitido THEN '✓' ELSE '✗' END) END) AS "Admin_Obra",
  MAX(CASE WHEN rol = 'Gerencia'              THEN (CASE WHEN permitido THEN '✓' ELSE '✗' END) END) AS "Gerencia"
FROM permisos_rol
GROUP BY modulo, accion
ORDER BY modulo, accion;


-- ──────────────────────────────────────────────────────────
-- BLOQUE 4: Acciones activas en políticas RLS
-- Verifica que cada acción usada en RLS tiene al menos 1 rol configurado
-- ──────────────────────────────────────────────────────────
SELECT
  '== BLOQUE 4: Cobertura de acciones usadas en políticas RLS ==' AS diagnostico;

WITH acciones_rls (modulo, accion, tabla_rls, operacion) AS (
  VALUES
    -- notas_historial_cliente
    ('clientes',      'ver_historial',   'notas_historial_cliente',  'SELECT'),
    ('clientes',      'anotar_historial','notas_historial_cliente',  'INSERT'),
    ('clientes',      'editar',          'notas_historial_cliente',  'UPDATE'),
    ('clientes',      'eliminar',        'notas_historial_cliente',  'DELETE'),
    -- abonos_historial
    ('abonos',        'registrar',       'abonos_historial',         'INSERT'),
    ('abonos',        'anular',          'abonos_historial',         'UPDATE'),
    ('abonos',        'editar',          'abonos_historial',         'UPDATE'),
    ('abonos',        'eliminar',        'abonos_historial',         'DELETE'),
    -- renuncias
    ('negociaciones', 'renunciar',       'renuncias',                'INSERT'),
    ('renuncias',     'editar',          'renuncias',                'UPDATE'),
    -- documentos (mantienen lógica app, no tiene_permiso directo en RLS)
    ('documentos',    'subir',           'documentos_proyecto',      'INSERT'),
    ('documentos',    'eliminar',        'documentos_proyecto',      'DELETE')
)
SELECT
  a.modulo,
  a.accion,
  a.tabla_rls,
  a.operacion,
  COUNT(p.rol)                                        AS roles_configurados,
  COALESCE(
    STRING_AGG(p.rol || '=' || (CASE WHEN p.permitido THEN '✓' ELSE '✗' END), ' | ' ORDER BY p.rol),
    '⚠️  SIN CONFIGURAR — tiene_permiso() retorna FALSE para todos los no-admins'
  )                                                   AS estado
FROM acciones_rls a
LEFT JOIN permisos_rol p ON p.modulo = a.modulo AND p.accion = a.accion
GROUP BY a.modulo, a.accion, a.tabla_rls, a.operacion
ORDER BY a.modulo, a.accion;


-- ──────────────────────────────────────────────────────────
-- BLOQUE 5: BLIND SPOTS — acciones RLS sin ningún registro en permisos_rol
-- Si este bloque devuelve filas → esas operaciones están bloqueadas
-- para TODOS los roles no-admin sin posibilidad de configurar desde UI
-- ──────────────────────────────────────────────────────────
SELECT
  '== BLOQUE 5: Blind spots (acciones RLS sin seed en permisos_rol) ==' AS diagnostico;

WITH acciones_rls (modulo, accion) AS (
  VALUES
    ('clientes',      'ver_historial'),
    ('clientes',      'anotar_historial'),
    ('clientes',      'editar'),
    ('clientes',      'eliminar'),
    ('abonos',        'registrar'),
    ('abonos',        'anular'),
    ('abonos',        'editar'),
    ('abonos',        'eliminar'),
    ('negociaciones', 'renunciar'),
    ('renuncias',     'editar'),
    ('documentos',    'subir'),
    ('documentos',    'eliminar')
)
SELECT
  a.modulo,
  a.accion,
  'BLIND SPOT: ningún rol no-admin puede ejecutar esta operación en BD' AS problema
FROM acciones_rls a
WHERE NOT EXISTS (
  SELECT 1 FROM permisos_rol p
  WHERE p.modulo = a.modulo AND p.accion = a.accion
);


-- ──────────────────────────────────────────────────────────
-- BLOQUE 6: Verificar función tiene_permiso() con usuarios reales
-- Simula el resultado para cada combinación rol × módulo crítico
-- (no requiere UUID real — usa un subquery por rol)
-- ──────────────────────────────────────────────────────────
SELECT
  '== BLOQUE 6: Simulación tiene_permiso() con un usuario real por rol ==' AS diagnostico;

SELECT
  u.nombres || ' ' || u.apellidos AS usuario,
  u.rol,
  u.estado,
  -- Clientes
  tiene_permiso(u.id, 'clientes', 'ver')              AS "cli.ver",
  tiene_permiso(u.id, 'clientes', 'crear')            AS "cli.crear",
  tiene_permiso(u.id, 'clientes', 'editar')           AS "cli.editar",
  tiene_permiso(u.id, 'clientes', 'eliminar')         AS "cli.eliminar",
  tiene_permiso(u.id, 'clientes', 'ver_historial')    AS "cli.ver_hist",
  tiene_permiso(u.id, 'clientes', 'anotar_historial') AS "cli.anotar",
  -- Abonos
  tiene_permiso(u.id, 'abonos', 'registrar')          AS "abo.registrar",
  tiene_permiso(u.id, 'abonos', 'anular')             AS "abo.anular",
  tiene_permiso(u.id, 'abonos', 'editar')             AS "abo.editar",
  tiene_permiso(u.id, 'abonos', 'eliminar')           AS "abo.eliminar",
  -- Documentos
  tiene_permiso(u.id, 'documentos', 'subir')          AS "doc.subir",
  tiene_permiso(u.id, 'documentos', 'eliminar')       AS "doc.eliminar",
  -- Negociaciones
  tiene_permiso(u.id, 'negociaciones', 'renunciar')   AS "neg.renunciar"
FROM usuarios u
WHERE u.estado = 'Activo'
ORDER BY
  CASE u.rol::text
    WHEN 'Administrador'         THEN 1
    WHEN 'Contabilidad'          THEN 2
    WHEN 'Administrador de Obra' THEN 3
    WHEN 'Gerencia'              THEN 4
  END,
  u.nombres;


-- ──────────────────────────────────────────────────────────
-- BLOQUE 7: Usuarios activos — contexto de prueba
-- Para saber qué usuarios existen y con qué roles
-- ──────────────────────────────────────────────────────────
SELECT
  '== BLOQUE 7: Usuarios activos (contexto de prueba) ==' AS diagnostico;

SELECT
  id,
  email,
  nombres || ' ' || apellidos AS nombre_completo,
  rol::text AS rol,
  estado::text AS estado
FROM usuarios
WHERE estado = 'Activo'
ORDER BY
  CASE rol::text
    WHEN 'Administrador'         THEN 1
    WHEN 'Contabilidad'          THEN 2
    WHEN 'Administrador de Obra' THEN 3
    WHEN 'Gerencia'              THEN 4
  END;
