-- ============================================================
-- Migración: Hardening RLS — Reforzar políticas débiles
--
-- PROBLEMA: Varias tablas tenían RLS que solo verificaba
-- autenticación (TO authenticated) sin validar permisos RBAC.
-- Un usuario autenticado podía llamar Supabase directamente
-- y saltarse los controles del UI.
--
-- SOLUCIÓN: Reemplazar WITH CHECK (true) / USING (true) por
-- tiene_permiso(auth.uid(), 'modulo', 'accion') en las
-- operaciones de escritura sensibles.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. notas_historial_cliente — INSERT
-- Antes: cualquier usuario autenticado podía crear notas
-- Ahora: requiere permiso clientes.anotar_historial en BD
-- ============================================================

DROP POLICY IF EXISTS "Usuarios pueden crear notas" ON notas_historial_cliente;

CREATE POLICY "Usuarios con permiso pueden crear notas"
    ON notas_historial_cliente FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = creado_por
        AND tiene_permiso(auth.uid(), 'clientes', 'anotar_historial')
    );

-- ============================================================
-- 2. abonos_historial — INSERT
-- Antes: cualquier usuario autenticado podía registrar abonos
-- Ahora: requiere permiso abonos.registrar en BD
-- ============================================================

DROP POLICY IF EXISTS "abonos_insert_authenticated" ON abonos_historial;

CREATE POLICY "abonos_insert_con_permiso"
    ON abonos_historial FOR INSERT
    TO authenticated
    WITH CHECK (
        tiene_permiso(auth.uid(), 'abonos', 'registrar')
    );

-- ============================================================
-- 3. notas_historial_cliente — SELECT
-- Antes: todos los autenticados veían todas las notas
-- Ahora: requiere permiso clientes.ver_historial
-- (Administrador siempre tiene acceso via tiene_permiso bypass)
-- ============================================================

DROP POLICY IF EXISTS "Usuarios pueden ver notas de clientes" ON notas_historial_cliente;

CREATE POLICY "Usuarios con permiso pueden ver notas"
    ON notas_historial_cliente FOR SELECT
    TO authenticated
    USING (
        tiene_permiso(auth.uid(), 'clientes', 'ver_historial')
    );

COMMIT;

-- ── Verificación post-migración ───────────────────────────
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('notas_historial_cliente', 'abonos_historial')
ORDER BY tablename, cmd;
