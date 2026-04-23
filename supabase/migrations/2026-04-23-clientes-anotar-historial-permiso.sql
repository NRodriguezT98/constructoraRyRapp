-- ============================================================
-- Migración: Nueva acción clientes.anotar_historial
-- Permite controlar quién puede agregar notas manuales
-- en el historial de un cliente.
--
-- Decisión inicial de negocio (configurable desde UI de permisos):
--   Administrador         → true  (siempre, via esAdmin bypass)
--   Contabilidad          → true  (gestiona documentación de clientes)
--   Administrador de Obra → true  (registra incidencias en campo)
--   Gerencia              → false (rol de consulta, no anotación)
-- ============================================================

BEGIN;

INSERT INTO permisos_rol (modulo, accion, rol, permitido, descripcion)
VALUES
  ('clientes', 'anotar_historial', 'Contabilidad',          true,  'Agregar notas manuales en el historial del cliente'),
  ('clientes', 'anotar_historial', 'Administrador de Obra', true,  'Agregar notas manuales en el historial del cliente'),
  ('clientes', 'anotar_historial', 'Gerencia',              false, 'Agregar notas manuales en el historial del cliente')
ON CONFLICT DO NOTHING;

COMMIT;

-- ── Verificación post-migración ───────────────────────────
SELECT
  modulo,
  accion,
  rol,
  permitido
FROM permisos_rol
WHERE modulo = 'clientes' AND accion = 'anotar_historial'
ORDER BY rol;
