-- ============================================================
-- Migración: Unificar RLS con sistema RBAC dinámico
--
-- PROBLEMA ANTERIOR:
--   Las políticas RLS tenían el rol 'Administrador' hardcodeado.
--   El admin podía configurar permisos en la UI (permisos_rol),
--   pero la base de datos seguía usando sus propias reglas fijas.
--   → Cambio en UI no tenía efecto en BD.
--
-- SOLUCIÓN:
--   Reemplazar TODOS los chequeos de rol hardcodeado en operaciones
--   de escritura por tiene_permiso(auth.uid(), 'modulo', 'accion').
--   La función lee permisos_rol en tiempo real → UI y BD sincronizados.
--
-- ACCIÓN → MÓDULO+ACCION EN permisos_rol:
--   abonos UPDATE anular  → abonos.anular
--   abonos UPDATE editar  → abonos.editar
--   renuncias INSERT      → negociaciones.renunciar  (misma acción del UI)
--   renuncias UPDATE      → renuncias.editar
--   notas UPDATE/DELETE   → admin bypass usa clientes.editar / clientes.eliminar
--   viviendas_historial   → viviendas.editar
--
-- INTENCIONAL — se mantienen hardcodeados:
--   audit_log SELECT                 → solo Administrador (datos sensibles de auditoría)
--   documento_reemplazos_admin       → operación destructiva, siempre admin
--   permisos_rol UPDATE/DELETE       → CRÍTICO: no puede ser dinámico
--   usuarios modificación            → gestión de cuentas, siempre admin
-- ============================================================

BEGIN;

-- ============================================================
-- 1. abonos_historial — UPDATE anular
--    Antes: (auth.jwt() ->> 'user_rol') = 'Administrador'
--    Ahora: tiene_permiso(auth.uid(), 'abonos', 'anular')
-- ============================================================

DROP POLICY IF EXISTS "abonos_update_anular_admin"   ON abonos_historial;
DROP POLICY IF EXISTS "abonos_update_anular_rbac"    ON abonos_historial;

CREATE POLICY "abonos_update_anular_rbac"
  ON abonos_historial
  FOR UPDATE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'abonos', 'anular')
    AND estado = 'Activo'
  )
  WITH CHECK (
    tiene_permiso(auth.uid(), 'abonos', 'anular')
    AND estado = 'Anulado'
  );

-- ============================================================
-- 2. abonos_historial — UPDATE editar campos activos
--    Antes: (auth.jwt() ->> 'user_rol') = 'Administrador'
--    Ahora: tiene_permiso(auth.uid(), 'abonos', 'editar')
-- ============================================================

DROP POLICY IF EXISTS "abonos_update_editar_admin" ON abonos_historial;
DROP POLICY IF EXISTS "abonos_update_editar_rbac"  ON abonos_historial;

CREATE POLICY "abonos_update_editar_rbac"
  ON abonos_historial
  FOR UPDATE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'abonos', 'editar')
    AND estado = 'Activo'
  )
  WITH CHECK (
    tiene_permiso(auth.uid(), 'abonos', 'editar')
    AND estado = 'Activo'
  );

-- ============================================================
-- 3. abonos_historial — DELETE
--    Antes: (auth.jwt() ->> 'user_rol') = 'Administrador'
--    Ahora: tiene_permiso(auth.uid(), 'abonos', 'eliminar')
-- ============================================================

DROP POLICY IF EXISTS "abonos_delete_admin" ON abonos_historial;
DROP POLICY IF EXISTS "abonos_delete_rbac"  ON abonos_historial;

CREATE POLICY "abonos_delete_rbac"
  ON abonos_historial
  FOR DELETE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'abonos', 'eliminar')
  );

-- ============================================================
-- 4. renuncias — INSERT
--    Antes: subquery rol = 'Administrador' AND estado = 'Activo'
--    Ahora: tiene_permiso(auth.uid(), 'negociaciones', 'renunciar')
--    Nota: tiene_permiso() ya valida estado = 'Activo' internamente
-- ============================================================

DROP POLICY IF EXISTS "renuncias_insert_admin" ON public.renuncias;
DROP POLICY IF EXISTS "renuncias_insert_rbac"  ON public.renuncias;

CREATE POLICY "renuncias_insert_rbac"
  ON public.renuncias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tiene_permiso(auth.uid(), 'negociaciones', 'renunciar')
  );

-- ============================================================
-- 5. renuncias — UPDATE
--    Antes: subquery rol = 'Administrador' AND estado = 'Activo'
--    Ahora: tiene_permiso(auth.uid(), 'renuncias', 'editar')
--    Default: ningún rol no-admin tiene renuncias.editar seeded
--    → comportamiento idéntico hasta que admin lo configure en UI
-- ============================================================

DROP POLICY IF EXISTS "renuncias_update_admin" ON public.renuncias;
DROP POLICY IF EXISTS "renuncias_update_rbac"  ON public.renuncias;

CREATE POLICY "renuncias_update_rbac"
  ON public.renuncias
  FOR UPDATE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'renuncias', 'editar')
  );

-- ============================================================
-- 6. notas_historial_cliente — UPDATE
--    Regla: el creador siempre puede editar su propia nota.
--    Admin bypass: antes subquery rol = 'Administrador'.
--    Ahora admin bypass usa tiene_permiso('clientes', 'editar').
-- ============================================================

DROP POLICY IF EXISTS "Creador o Admin pueden editar notas"    ON notas_historial_cliente;
DROP POLICY IF EXISTS "Creador o Admin pueden editar notas v2" ON notas_historial_cliente;

CREATE POLICY "Creador o Admin pueden editar notas v2"
    ON notas_historial_cliente FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = creado_por
        OR tiene_permiso(auth.uid(), 'clientes', 'editar')
    )
    WITH CHECK (
        auth.uid() = actualizado_por
    );

-- ============================================================
-- 7. notas_historial_cliente — DELETE
--    Regla: el creador siempre puede eliminar su propia nota.
--    Admin bypass: antes subquery rol = 'Administrador'.
--    Ahora admin bypass usa tiene_permiso('clientes', 'eliminar').
-- ============================================================

DROP POLICY IF EXISTS "Creador o Admin pueden eliminar notas"    ON notas_historial_cliente;
DROP POLICY IF EXISTS "Creador o Admin pueden eliminar notas v2" ON notas_historial_cliente;

CREATE POLICY "Creador o Admin pueden eliminar notas v2"
    ON notas_historial_cliente FOR DELETE
    TO authenticated
    USING (
        auth.uid() = creado_por
        OR tiene_permiso(auth.uid(), 'clientes', 'eliminar')
    );

-- ============================================================
-- 8. viviendas_historial_estados — INSERT
--    NOTA: tabla no existe en la BD actual (migración pendiente).
--    Cuando se cree, aplicar:
--    tiene_permiso(auth.uid(), 'viviendas', 'editar')
-- ============================================================
-- DROP/CREATE omitidos hasta que se cree la tabla

COMMIT;

-- ── Verificación post-migración ───────────────────────────
-- Confirmar que las nuevas políticas existen
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN (
  'abonos_historial',
  'renuncias',
  'notas_historial_cliente',
  'viviendas_historial_estados'
)
ORDER BY tablename, cmd;
