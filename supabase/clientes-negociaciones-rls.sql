-- =====================================================
-- POLÍTICAS RLS PARA MÓDULO DE CLIENTES Y NEGOCIACIONES
-- =====================================================

-- =====================================================
-- HABILITAR RLS
-- =====================================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE negociaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuentes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE procesos_negociacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_proceso ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA: clientes
-- =====================================================

-- Permitir SELECT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver clientes"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir INSERT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear clientes"
  ON clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir UPDATE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar clientes"
  ON clientes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir DELETE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar clientes"
  ON clientes
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- POLÍTICAS PARA: negociaciones
-- =====================================================

-- Permitir SELECT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver negociaciones"
  ON negociaciones
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir INSERT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear negociaciones"
  ON negociaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir UPDATE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar negociaciones"
  ON negociaciones
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir DELETE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar negociaciones"
  ON negociaciones
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- POLÍTICAS PARA: fuentes_pago
-- =====================================================

-- Permitir SELECT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver fuentes de pago"
  ON fuentes_pago
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir INSERT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear fuentes de pago"
  ON fuentes_pago
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir UPDATE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar fuentes de pago"
  ON fuentes_pago
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir DELETE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar fuentes de pago"
  ON fuentes_pago
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- POLÍTICAS PARA: procesos_negociacion
-- =====================================================

-- Permitir SELECT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver procesos"
  ON procesos_negociacion
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir INSERT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear procesos"
  ON procesos_negociacion
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir UPDATE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar procesos"
  ON procesos_negociacion
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir DELETE a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar procesos"
  ON procesos_negociacion
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- POLÍTICAS PARA: plantillas_proceso
-- =====================================================

-- Permitir SELECT a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver plantillas de proceso"
  ON plantillas_proceso
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir INSERT a usuarios autenticados (solo admin en el futuro)
CREATE POLICY "Usuarios autenticados pueden crear plantillas de proceso"
  ON plantillas_proceso
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir UPDATE a usuarios autenticados (solo admin en el futuro)
CREATE POLICY "Usuarios autenticados pueden actualizar plantillas de proceso"
  ON plantillas_proceso
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir DELETE a usuarios autenticados (solo admin en el futuro)
CREATE POLICY "Usuarios autenticados pueden eliminar plantillas de proceso"
  ON plantillas_proceso
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- NOTA SOBRE SEGURIDAD FUTURA
-- =====================================================
-- Estas políticas permiten acceso completo a usuarios autenticados.
-- En producción, considera implementar:
-- 1. Roles de usuario (admin, vendedor, consulta)
-- 2. Políticas basadas en roles
-- 3. Restricciones por proyecto/región
-- 4. Auditoría de cambios críticos
-- =====================================================
