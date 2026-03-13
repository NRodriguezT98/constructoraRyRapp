-- =====================================================
-- Fix: Políticas RLS para tipos_fuentes_pago
-- Fecha: 2025-12-11
-- Descripción: Corrige políticas RLS que estaban bloqueando operaciones
-- =====================================================

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "tipos_fuentes_pago_select_all" ON public.tipos_fuentes_pago;
DROP POLICY IF EXISTS "tipos_fuentes_pago_insert_admin" ON public.tipos_fuentes_pago;
DROP POLICY IF EXISTS "tipos_fuentes_pago_update_admin" ON public.tipos_fuentes_pago;
DROP POLICY IF EXISTS "tipos_fuentes_pago_delete_admin" ON public.tipos_fuentes_pago;

-- Crear políticas corregidas
-- Policy: Todos pueden leer (filtro por activo en query)
CREATE POLICY "tipos_fuentes_pago_select_all"
  ON public.tipos_fuentes_pago
  FOR SELECT
  USING (true);

-- Policy: Solo admin puede insertar
CREATE POLICY "tipos_fuentes_pago_insert_admin"
  ON public.tipos_fuentes_pago
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
      AND usuarios.estado = 'Activo'
    )
  );

-- Policy: Solo admin puede actualizar
CREATE POLICY "tipos_fuentes_pago_update_admin"
  ON public.tipos_fuentes_pago
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
      AND usuarios.estado = 'Activo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
      AND usuarios.estado = 'Activo'
    )
  );

-- Policy: Solo admin puede eliminar
CREATE POLICY "tipos_fuentes_pago_delete_admin"
  ON public.tipos_fuentes_pago
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
      AND usuarios.estado = 'Activo'
    )
  );

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'tipos_fuentes_pago';
