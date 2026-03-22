-- ============================================
-- MIGRACIÓN 030: Seguridad Manzanas y Viviendas
-- ============================================
-- Descripción: Triggers de capacidad, UNIQUE index, y RLS para manzanas
-- Fecha: 2025
-- Autor: Sistema RyR - Auditoría de seguridad
--
-- FIXES:
--   1. Trigger: Impedir INSERT en viviendas si manzana está llena
--   2. Trigger: Impedir reducir numero_viviendas por debajo del conteo real
--   3. UNIQUE INDEX: (manzana_id, numero) en viviendas
--   4. RLS manzanas: Agregar políticas basadas en tiene_permiso()
-- ============================================

BEGIN;

-- ============================================
-- 1. TRIGGER: Verificar capacidad de manzana antes de insertar vivienda
-- ============================================

CREATE OR REPLACE FUNCTION verificar_capacidad_manzana()
RETURNS TRIGGER AS $$
DECLARE
  v_capacidad INTEGER;
  v_conteo_actual INTEGER;
BEGIN
  -- Obtener la capacidad máxima de la manzana
  SELECT numero_viviendas INTO v_capacidad
  FROM manzanas
  WHERE id = NEW.manzana_id;

  IF v_capacidad IS NULL THEN
    RAISE EXCEPTION 'Manzana con id % no existe', NEW.manzana_id;
  END IF;

  -- Contar viviendas actuales en la manzana
  SELECT COUNT(*) INTO v_conteo_actual
  FROM viviendas
  WHERE manzana_id = NEW.manzana_id;

  -- Verificar que no exceda la capacidad
  IF v_conteo_actual >= v_capacidad THEN
    RAISE EXCEPTION 'La manzana ha alcanzado su capacidad máxima (% de % viviendas)',
      v_conteo_actual, v_capacidad;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe y recrear
DROP TRIGGER IF EXISTS trg_verificar_capacidad_manzana ON viviendas;

CREATE TRIGGER trg_verificar_capacidad_manzana
  BEFORE INSERT ON viviendas
  FOR EACH ROW
  EXECUTE FUNCTION verificar_capacidad_manzana();

COMMENT ON FUNCTION verificar_capacidad_manzana IS
  'Impide crear viviendas si la manzana ya alcanzó su capacidad (numero_viviendas)';

-- ============================================
-- 2. TRIGGER: Impedir reducir numero_viviendas por debajo del conteo real
-- ============================================

CREATE OR REPLACE FUNCTION verificar_reduccion_manzana()
RETURNS TRIGGER AS $$
DECLARE
  v_conteo_actual INTEGER;
BEGIN
  -- Solo validar si se está reduciendo el número
  IF NEW.numero_viviendas < OLD.numero_viviendas THEN
    SELECT COUNT(*) INTO v_conteo_actual
    FROM viviendas
    WHERE manzana_id = NEW.id;

    IF NEW.numero_viviendas < v_conteo_actual THEN
      RAISE EXCEPTION 'No se puede reducir a % viviendas: ya existen % viviendas creadas en esta manzana',
        NEW.numero_viviendas, v_conteo_actual;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verificar_reduccion_manzana ON manzanas;

CREATE TRIGGER trg_verificar_reduccion_manzana
  BEFORE UPDATE ON manzanas
  FOR EACH ROW
  EXECUTE FUNCTION verificar_reduccion_manzana();

COMMENT ON FUNCTION verificar_reduccion_manzana IS
  'Impide reducir numero_viviendas de manzana por debajo del conteo real de viviendas existentes';

-- ============================================
-- 3. UNIQUE INDEX: Prevenir números de vivienda duplicados en una manzana
-- ============================================

-- Crear índice único (si ya existe, no falla)
CREATE UNIQUE INDEX IF NOT EXISTS idx_vivienda_manzana_numero_unico
  ON viviendas (manzana_id, numero);

COMMENT ON INDEX idx_vivienda_manzana_numero_unico IS
  'Garantiza que no existan dos viviendas con el mismo número dentro de una manzana';

-- ============================================
-- 4. RLS MANZANAS: Agregar políticas basadas en permisos
-- ============================================
-- NOTA: Ya existen políticas owner-based (schema.sql) y "allow_select_manzanas" (fix-rls-abonos).
-- Agregamos políticas permission-based para INSERT/UPDATE/DELETE
-- (las permissive OR se unen, dando acceso si cumple ALGUNA).

-- Primero eliminar si existen para idempotencia
DROP POLICY IF EXISTS "Usuarios pueden crear manzanas con permisos" ON manzanas;
DROP POLICY IF EXISTS "Usuarios pueden editar manzanas con permisos" ON manzanas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar manzanas con permisos" ON manzanas;

CREATE POLICY "Usuarios pueden crear manzanas con permisos"
  ON manzanas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tiene_permiso(auth.uid(), 'proyectos', 'crear')
  );

CREATE POLICY "Usuarios pueden editar manzanas con permisos"
  ON manzanas
  FOR UPDATE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'proyectos', 'editar')
  )
  WITH CHECK (
    tiene_permiso(auth.uid(), 'proyectos', 'editar')
  );

CREATE POLICY "Usuarios pueden eliminar manzanas con permisos"
  ON manzanas
  FOR DELETE
  TO authenticated
  USING (
    tiene_permiso(auth.uid(), 'proyectos', 'eliminar')
  );

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger verificar_capacidad_manzana creado en viviendas';
  RAISE NOTICE '✅ Trigger verificar_reduccion_manzana creado en manzanas';
  RAISE NOTICE '✅ UNIQUE INDEX idx_vivienda_manzana_numero_unico creado';
  RAISE NOTICE '✅ Políticas RLS permission-based para manzanas creadas';
END $$;
