-- =====================================================
-- Fix: Políticas RLS para creditos_constructora y cuotas_credito
-- Fecha: 2026-03-18
-- Descripción: Las políticas INSERT/UPDATE originales usaban
--   auth.jwt() ->> 'role' IN ('admin', 'superadmin')
--   lo cual siempre falla porque ese campo del JWT contiene 'authenticated',
--   no un rol personalizado. Se reemplaza por políticas para usuarios autenticados,
--   consistente con fuentes_pago y demás tablas subordinadas a negociaciones.
-- =====================================================

-- ==============================
-- creditos_constructora
-- ==============================

DROP POLICY IF EXISTS "Solo admins pueden insertar créditos" ON public.creditos_constructora;
DROP POLICY IF EXISTS "Solo admins pueden actualizar créditos" ON public.creditos_constructora;

CREATE POLICY "Autenticados pueden insertar créditos"
  ON public.creditos_constructora
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden actualizar créditos"
  ON public.creditos_constructora
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================
-- cuotas_credito
-- ==============================

DROP POLICY IF EXISTS "Solo admins pueden insertar cuotas" ON public.cuotas_credito;
DROP POLICY IF EXISTS "Solo admins pueden actualizar cuotas" ON public.cuotas_credito;

CREATE POLICY "Autenticados pueden insertar cuotas"
  ON public.cuotas_credito
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden actualizar cuotas"
  ON public.cuotas_credito
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
