-- ============================================
-- MIGRACIÓN: Eliminar Sistema de Carpetas Jerárquicas
-- ============================================
-- Fecha: 2024-11-07
-- Descripción: Elimina tabla de carpetas y columna relacionada
--              Simplificando a solo categorías planas

-- 1. Eliminar columna carpeta_id de documentos_vivienda
ALTER TABLE documentos_vivienda
DROP COLUMN IF EXISTS carpeta_id;

-- 2. Eliminar tabla de carpetas primero (esto eliminará los triggers automáticamente)
DROP TABLE IF EXISTS carpetas_documentos_viviendas CASCADE;

-- 3. Eliminar funciones relacionadas con carpetas
DROP FUNCTION IF EXISTS crear_carpetas_predeterminadas_vivienda(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS validar_jerarquia_carpetas() CASCADE;
DROP FUNCTION IF EXISTS actualizar_carpeta_updated_at() CASCADE;
DROP FUNCTION IF EXISTS migrar_documentos_a_carpetas() CASCADE;

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================
-- Sistema simplificado a solo categorías planas
-- Documentos ahora se organizan únicamente por categoría
