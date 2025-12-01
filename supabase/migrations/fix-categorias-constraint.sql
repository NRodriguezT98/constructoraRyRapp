-- ============================================
-- FIX: Permitir nombres duplicados de categorías entre módulos
-- ============================================
-- Descripción: Elimina constraint único de nombre para permitir
--              que diferentes módulos usen los mismos nombres de categorías
-- Fecha: 2025-11-24

-- 1. Eliminar el constraint que impide nombres duplicados
ALTER TABLE categorias_documento
DROP CONSTRAINT IF EXISTS idx_categorias_globales_nombre;

-- 2. Crear un constraint compuesto que permita mismo nombre en diferentes módulos
-- (pero no permite duplicados dentro del mismo módulo para el mismo usuario)
CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_usuario_modulo_nombre
ON categorias_documento (user_id, nombre, (modulos_permitidos[1]))
WHERE es_global = true;

-- Comentario explicativo
COMMENT ON INDEX idx_categorias_usuario_modulo_nombre IS
'Permite mismo nombre de categoría en diferentes módulos, pero no duplicados dentro del mismo módulo para un usuario';
