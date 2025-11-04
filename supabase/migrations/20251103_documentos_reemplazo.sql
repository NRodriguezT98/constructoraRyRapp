-- =====================================================
-- MIGRACIÓN: Soporte para Reemplazo de Documentos
-- Fecha: 2025-11-03
-- Descripción: Agregar campos para rastrear documentos
--              reemplazados en documentos_cliente
-- =====================================================

-- =====================================================
-- 1. AGREGAR COLUMNAS para rastreo de reemplazos
-- =====================================================

-- Indica si este documento fue reemplazado
ALTER TABLE documentos_cliente
ADD COLUMN IF NOT EXISTS fue_reemplazado BOOLEAN NOT NULL DEFAULT false;

-- ID del documento que reemplazó a este
ALTER TABLE documentos_cliente
ADD COLUMN IF NOT EXISTS reemplazado_por_documento_id UUID REFERENCES documentos_cliente(id) ON DELETE SET NULL;

-- Fecha en que fue reemplazado
ALTER TABLE documentos_cliente
ADD COLUMN IF NOT EXISTS fecha_reemplazo TIMESTAMPTZ;

-- Motivo del reemplazo
ALTER TABLE documentos_cliente
ADD COLUMN IF NOT EXISTS motivo_reemplazo TEXT;

-- Usuario que realizó el reemplazo
ALTER TABLE documentos_cliente
ADD COLUMN IF NOT EXISTS usuario_reemplazo_id UUID REFERENCES auth.users(id);

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_documentos_cliente_fue_reemplazado
  ON documentos_cliente(fue_reemplazado);

CREATE INDEX IF NOT EXISTS idx_documentos_cliente_reemplazado_por
  ON documentos_cliente(reemplazado_por_documento_id);

-- =====================================================
-- 3. CONSTRAINTS
-- =====================================================

-- Si fue_reemplazado = true, debe tener fecha y motivo
ALTER TABLE documentos_cliente
ADD CONSTRAINT IF NOT EXISTS check_reemplazo_completo
CHECK (
  (fue_reemplazado = false)
  OR
  (fue_reemplazado = true AND fecha_reemplazo IS NOT NULL AND motivo_reemplazo IS NOT NULL)
);

-- =====================================================
-- 4. COMENTARIOS
-- =====================================================

COMMENT ON COLUMN documentos_cliente.fue_reemplazado IS
  'Indica si este documento fue reemplazado por otro (documento erróneo corregido)';

COMMENT ON COLUMN documentos_cliente.reemplazado_por_documento_id IS
  'ID del nuevo documento que reemplazó a este';

COMMENT ON COLUMN documentos_cliente.motivo_reemplazo IS
  'Justificación de por qué se reemplazó el documento';

-- =====================================================
-- 5. FUNCIÓN para marcar documento como reemplazado
-- =====================================================

CREATE OR REPLACE FUNCTION marcar_documento_reemplazado(
  p_documento_anterior_id UUID,
  p_documento_nuevo_id UUID,
  p_motivo TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validar motivo
  IF char_length(p_motivo) < 10 THEN
    RAISE EXCEPTION 'El motivo debe tener al menos 10 caracteres';
  END IF;

  -- Marcar documento anterior como reemplazado
  UPDATE documentos_cliente
  SET
    fue_reemplazado = true,
    reemplazado_por_documento_id = p_documento_nuevo_id,
    fecha_reemplazo = NOW(),
    motivo_reemplazo = p_motivo,
    usuario_reemplazo_id = auth.uid()
  WHERE id = p_documento_anterior_id;

  -- Verificar que se actualizó
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Documento anterior no encontrado: %', p_documento_anterior_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION marcar_documento_reemplazado IS
  'Marca un documento como reemplazado y registra el nuevo documento que lo reemplaza';

-- =====================================================
-- 6. VISTA para documentos reemplazados (admin)
-- =====================================================

CREATE OR REPLACE VIEW vista_documentos_reemplazados AS
SELECT
  -- Documento anterior (reemplazado)
  doc_ant.id AS documento_anterior_id,
  doc_ant.nombre_archivo AS documento_anterior_nombre,
  doc_ant.url_storage AS documento_anterior_url,
  doc_ant.fecha_creacion AS documento_anterior_fecha_creacion,
  doc_ant.fecha_reemplazo,
  doc_ant.motivo_reemplazo,

  -- Documento nuevo (reemplazo)
  doc_nvo.id AS documento_nuevo_id,
  doc_nvo.nombre_archivo AS documento_nuevo_nombre,
  doc_nvo.url_storage AS documento_nuevo_url,
  doc_nvo.fecha_creacion AS documento_nuevo_fecha_creacion,

  -- Usuario que hizo el reemplazo
  u.email AS usuario_reemplazo_email,

  -- Información del cliente
  c.id AS cliente_id,
  c.nombres || ' ' || c.apellidos AS cliente_nombre,

  -- Categoría del documento
  cat.nombre AS categoria_nombre

FROM documentos_cliente doc_ant
JOIN documentos_cliente doc_nvo
  ON doc_nvo.id = doc_ant.reemplazado_por_documento_id
JOIN clientes c ON c.id = doc_ant.cliente_id
LEFT JOIN auth.users u ON u.id = doc_ant.usuario_reemplazo_id
LEFT JOIN categorias_documento cat ON cat.id = doc_ant.categoria_id
WHERE doc_ant.fue_reemplazado = true;

COMMENT ON VIEW vista_documentos_reemplazados IS
  'Vista de documentos reemplazados con información completa para auditoría (solo admin)';

-- =====================================================
-- 7. GRANTS
-- =====================================================

GRANT SELECT ON vista_documentos_reemplazados TO authenticated;
GRANT EXECUTE ON FUNCTION marcar_documento_reemplazado TO authenticated;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
