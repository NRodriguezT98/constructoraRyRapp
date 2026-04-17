-- ============================================================
-- Fix: UNIQUE constraint en carpetas_documentos con padre_id nullable
-- ============================================================
-- El problema: UNIQUE (entidad_id, tipo_entidad, padre_id, nombre)
-- no funciona cuando padre_id es NULL, porque en PostgreSQL
-- NULL != NULL en constraints UNIQUE.
--
-- Solución: reemplazar el CONSTRAINT TABLE por un UNIQUE INDEX
-- funcional que use COALESCE(padre_id, uuid_nil).
-- ============================================================

-- 1. Eliminar el constraint original
ALTER TABLE carpetas_documentos
  DROP CONSTRAINT IF EXISTS uq_carpeta_nombre_nivel;

-- 2. Crear índice único funcional con COALESCE
--    Usamos uuid_nil ('00000000-0000-0000-0000-000000000000') como
--    valor centinela para padre_id = NULL (raíz).
CREATE UNIQUE INDEX uq_carpeta_nombre_nivel
  ON carpetas_documentos (
    entidad_id,
    tipo_entidad,
    COALESCE(padre_id, '00000000-0000-0000-0000-000000000000'::uuid),
    lower(nombre)   -- Case-insensitive: "Contratos" = "contratos"
  );
