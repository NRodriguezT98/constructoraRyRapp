-- ============================================
-- ACTUALIZAR TIPO ENUM rol_usuario
-- ============================================
-- Descripción: Agregar nuevo rol 'Contador' al enum existente
-- Fecha: 2025-11-14
-- ============================================

-- PostgreSQL no permite modificar ENUMs existentes directamente
-- Estrategia: Agregar valores nuevos uno por uno

-- 1. Agregar 'Contador' (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Contador' AND enumtypid = 'rol_usuario'::regtype) THEN
    ALTER TYPE rol_usuario ADD VALUE 'Contador';
    RAISE NOTICE '✅ Rol Contador agregado';
  ELSE
    RAISE NOTICE '⏭️ Rol Contador ya existe';
  END IF;
END $$;

-- 2. Agregar 'Supervisor' (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Supervisor' AND enumtypid = 'rol_usuario'::regtype) THEN
    ALTER TYPE rol_usuario ADD VALUE 'Supervisor';
    RAISE NOTICE '✅ Rol Supervisor agregado';
  ELSE
    RAISE NOTICE '⏭️ Rol Supervisor ya existe';
  END IF;
END $$;

-- 3. Verificar valores actuales del enum
DO $$
DECLARE
  v_valores TEXT;
BEGIN
  SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) INTO v_valores
  FROM pg_enum
  WHERE enumtypid = 'rol_usuario'::regtype;

  RAISE NOTICE '📋 Valores de rol_usuario: %', v_valores;
END $$;
