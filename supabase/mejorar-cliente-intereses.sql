-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A cliente_intereses
-- =====================================================
-- Mejora la tabla existente con campos para seguimiento completo
-- =====================================================

-- 1️⃣ Agregar columnas de información del interés
ALTER TABLE cliente_intereses
  ADD COLUMN IF NOT EXISTS valor_estimado DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS origen VARCHAR(50) CHECK (origen IN (
    'Visita Presencial',
    'Llamada Telefónica',
    'WhatsApp',
    'Email',
    'Redes Sociales',
    'Referido',
    'Sitio Web',
    'Otro'
  )),
  ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) CHECK (prioridad IN ('Alta', 'Media', 'Baja')) DEFAULT 'Media';

-- 2️⃣ Agregar columnas de seguimiento
ALTER TABLE cliente_intereses
  ADD COLUMN IF NOT EXISTS fecha_ultimo_contacto TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS proximo_seguimiento TIMESTAMP WITH TIME ZONE;

-- 3️⃣ Agregar columnas de conversión a negociación
ALTER TABLE cliente_intereses
  ADD COLUMN IF NOT EXISTS negociacion_id UUID REFERENCES negociaciones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fecha_conversion TIMESTAMP WITH TIME ZONE;

-- 4️⃣ Modificar el CHECK del estado para incluir más opciones
ALTER TABLE cliente_intereses DROP CONSTRAINT IF EXISTS cliente_intereses_estado_check;

ALTER TABLE cliente_intereses
  ADD CONSTRAINT cliente_intereses_estado_check
  CHECK (estado IN (
    'Activo',           -- Compatible con el valor actual por defecto
    'Pendiente',        -- Nuevo: Acaba de expresar interés
    'Contactado',       -- Nuevo: Ya se contactó al cliente
    'En Seguimiento',   -- Nuevo: En proceso de seguimiento
    'Negociación',      -- Nuevo: Se convirtió en negociación formal
    'Descartado',       -- Ya existe implícitamente
    'Perdido'           -- Nuevo: No se logró contactar
  ));

-- 5️⃣ Crear índices para rendimiento (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_cliente_intereses_estado ON cliente_intereses(estado);
CREATE INDEX IF NOT EXISTS idx_cliente_intereses_fecha_interes ON cliente_intereses(fecha_interes DESC);
CREATE INDEX IF NOT EXISTS idx_cliente_intereses_prioridad ON cliente_intereses(prioridad);
CREATE INDEX IF NOT EXISTS idx_cliente_intereses_proximo_seguimiento ON cliente_intereses(proximo_seguimiento)
  WHERE estado IN ('Pendiente', 'Contactado', 'En Seguimiento', 'Activo');

-- 6️⃣ Agregar comentarios para documentación
COMMENT ON COLUMN cliente_intereses.valor_estimado IS 'Valor aproximado que el cliente mencionó o esperaba';
COMMENT ON COLUMN cliente_intereses.origen IS 'Cómo se originó el contacto/interés del cliente';
COMMENT ON COLUMN cliente_intereses.prioridad IS 'Nivel de prioridad del seguimiento (Alta, Media, Baja)';
COMMENT ON COLUMN cliente_intereses.fecha_ultimo_contacto IS 'Última vez que se contactó al cliente';
COMMENT ON COLUMN cliente_intereses.proximo_seguimiento IS 'Fecha programada para el próximo seguimiento';
COMMENT ON COLUMN cliente_intereses.negociacion_id IS 'ID de la negociación si el interés se convirtió en negociación formal';
COMMENT ON COLUMN cliente_intereses.fecha_conversion IS 'Fecha en que el interés se convirtió en negociación';

-- 7️⃣ Actualizar registros existentes con valores por defecto
UPDATE cliente_intereses
SET
  prioridad = 'Media',
  origen = 'Otro'
WHERE prioridad IS NULL OR origen IS NULL;

-- 8️⃣ Verificar que todo se aplicó correctamente
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'cliente_intereses'
ORDER BY ordinal_position;

-- =====================================================
-- ✅ RESULTADO ESPERADO:
-- =====================================================
-- Deberías ver las nuevas columnas:
-- - valor_estimado
-- - origen
-- - prioridad
-- - fecha_ultimo_contacto
-- - proximo_seguimiento
-- - negociacion_id
-- - fecha_conversion
-- =====================================================

-- =====================================================
-- 📊 VER ÍNDICES CREADOS
-- =====================================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'cliente_intereses'
ORDER BY indexname;

-- =====================================================
-- ✅ EJECUTAR EN SUPABASE DASHBOARD → SQL EDITOR
-- =====================================================
