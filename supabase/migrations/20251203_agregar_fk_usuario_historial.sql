-- =====================================================
-- AGREGAR FOREIGN KEY: negociaciones_historial.usuario_id → auth.users
-- =====================================================
-- Propósito: Permitir JOINs con auth.users para obtener email
-- Fecha: 2025-12-03
-- =====================================================

-- 1. Agregar foreign key a usuario_id
ALTER TABLE negociaciones_historial
  DROP CONSTRAINT IF EXISTS fk_historial_usuario,
  ADD CONSTRAINT fk_historial_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL;

-- 2. Crear índice para mejorar performance de JOINs
CREATE INDEX IF NOT EXISTS idx_historial_usuario
  ON negociaciones_historial(usuario_id);

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON CONSTRAINT fk_historial_usuario ON negociaciones_historial IS
  'Foreign key hacia auth.users para JOINs de email en historial';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Foreign key agregada: negociaciones_historial.usuario_id → auth.users';
  RAISE NOTICE '✅ Índice creado: idx_historial_usuario';
  RAISE NOTICE '📌 Ahora se puede hacer: .select(''*, usuario:usuario_id(email)'')';
END $$;
