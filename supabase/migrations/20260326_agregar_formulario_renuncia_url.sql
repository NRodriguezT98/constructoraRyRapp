-- =====================================================
-- MIGRACIÓN: Agregar columna formulario_renuncia_url a renuncias
-- Fecha: 2026-03-26
-- Descripción: Permite almacenar la URL/path del formulario de renuncia
--              que el cliente opcionalmente diligencia al renunciar.
-- =====================================================

-- 1. Agregar columna
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS formulario_renuncia_url TEXT NULL;

-- 2. Comentario descriptivo
COMMENT ON COLUMN public.renuncias.formulario_renuncia_url IS
  'Path en Storage del formulario de renuncia diligenciado por el cliente (opcional). Bucket: renuncias-comprobantes';

-- Nota: La vista v_renuncias_completas usa r.* por lo que el nuevo campo
-- se incluye automáticamente sin necesidad de recrearla.
