-- ============================================
-- MIGRACIÓN: Agregar motivo de archivado a documentos
-- ============================================
-- Autor: Sistema RyR
-- Fecha: 2025-12-04
-- Descripción: Agrega campos para registrar por qué se archiva
--              un documento en las 3 tablas de documentos
-- ============================================

-- 1️⃣ DOCUMENTOS DE PROYECTOS
ALTER TABLE documentos_proyecto
ADD COLUMN IF NOT EXISTS motivo_categoria VARCHAR(100),
ADD COLUMN IF NOT EXISTS motivo_detalle TEXT;

COMMENT ON COLUMN documentos_proyecto.motivo_categoria IS
  'Categoría predefinida del motivo de archivado';
COMMENT ON COLUMN documentos_proyecto.motivo_detalle IS
  'Observaciones adicionales sobre el archivado';

-- 2️⃣ DOCUMENTOS DE VIVIENDAS
ALTER TABLE documentos_vivienda
ADD COLUMN IF NOT EXISTS motivo_categoria VARCHAR(100),
ADD COLUMN IF NOT EXISTS motivo_detalle TEXT;

COMMENT ON COLUMN documentos_vivienda.motivo_categoria IS
  'Categoría predefinida del motivo de archivado';
COMMENT ON COLUMN documentos_vivienda.motivo_detalle IS
  'Observaciones adicionales sobre el archivado';

-- 3️⃣ DOCUMENTOS DE CLIENTES
ALTER TABLE documentos_cliente
ADD COLUMN IF NOT EXISTS motivo_categoria VARCHAR(100),
ADD COLUMN IF NOT EXISTS motivo_detalle TEXT;

COMMENT ON COLUMN documentos_cliente.motivo_categoria IS
  'Categoría predefinida del motivo de archivado';
COMMENT ON COLUMN documentos_cliente.motivo_detalle IS
  'Observaciones adicionales sobre el archivado';

-- ============================================
-- VALORES PERMITIDOS (Documentación)
-- ============================================
-- motivo_categoria (opciones predefinidas):
--   - 'Fuente de pago reemplazada'
--   - 'Documento vencido o desactualizado'
--   - 'Documento duplicado'
--   - 'Documento incorrecto'
--   - 'Cambio en el proyecto'
--   - 'Otro'
--
-- motivo_detalle: Texto libre con observaciones adicionales
-- ============================================
