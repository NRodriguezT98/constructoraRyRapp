-- ================================================================
-- MIGRACIÓN: Historial de Matrículas de Viviendas (Alta Seguridad)
-- Fecha: 2025-11-22
-- Descripción: Auditar cambios de matrícula inmobiliaria (operación crítica - solo Admin)
-- ================================================================

-- 1. Crear tabla de historial de matrículas
CREATE TABLE IF NOT EXISTS viviendas_historial_matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vivienda_id UUID NOT NULL REFERENCES viviendas(id) ON DELETE CASCADE,
  matricula_anterior VARCHAR(100) NOT NULL,
  matricula_nueva VARCHAR(100) NOT NULL,
  fecha_cambio TIMESTAMPTZ DEFAULT NOW(),
  motivo TEXT NOT NULL CHECK (char_length(motivo) >= 100),
  usuario_id UUID REFERENCES usuarios(id),
  nivel_riesgo VARCHAR(20) CHECK (nivel_riesgo IN ('MODERADO', 'CRITICO', 'ALTO')),

  -- Snapshot de relaciones al momento del cambio (preservar contexto)
  negociaciones_snapshot JSONB DEFAULT '[]'::jsonb,
  abonos_snapshot JSONB DEFAULT '[]'::jsonb,
  documentos_snapshot JSONB DEFAULT '[]'::jsonb,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT matriculas_diferentes CHECK (matricula_anterior != matricula_nueva)
);

-- 2. Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_historial_matriculas_vivienda
  ON viviendas_historial_matriculas(vivienda_id);

CREATE INDEX IF NOT EXISTS idx_historial_matriculas_fecha
  ON viviendas_historial_matriculas(fecha_cambio DESC);

CREATE INDEX IF NOT EXISTS idx_historial_matriculas_usuario
  ON viviendas_historial_matriculas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_historial_matriculas_nivel_riesgo
  ON viviendas_historial_matriculas(nivel_riesgo);

-- 3. RLS Policies (Solo Administradores)
ALTER TABLE viviendas_historial_matriculas ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admins pueden ver historial de matrículas
CREATE POLICY "Solo admins pueden ver historial matriculas"
  ON viviendas_historial_matriculas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );

-- Policy: Solo admins pueden insertar historial de matrículas
CREATE POLICY "Solo admins pueden insertar historial matriculas"
  ON viviendas_historial_matriculas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );

-- 4. Función para calcular nivel de riesgo automáticamente
CREATE OR REPLACE FUNCTION calcular_nivel_riesgo_matricula(
  p_vivienda_id UUID,
  p_tiene_negociaciones BOOLEAN,
  p_tiene_abonos BOOLEAN,
  p_negociacion_firmada BOOLEAN
)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
BEGIN
  -- ALTO: Minuta firmada o escritura en curso
  IF p_negociacion_firmada THEN
    RETURN 'ALTO';
  END IF;

  -- CRÍTICO: Tiene abonos pagados
  IF p_tiene_abonos THEN
    RETURN 'CRITICO';
  END IF;

  -- MODERADO: Solo tiene negociaciones activas
  IF p_tiene_negociaciones THEN
    RETURN 'MODERADO';
  END IF;

  -- Por defecto
  RETURN 'MODERADO';
END;
$$;

-- 5. Comentarios
COMMENT ON TABLE viviendas_historial_matriculas IS 'Historial de cambios de matrícula inmobiliaria (operación crítica - solo Admin con justificación extensa)';
COMMENT ON COLUMN viviendas_historial_matriculas.motivo IS 'Justificación exhaustiva del cambio de matrícula (mínimo 100 caracteres)';
COMMENT ON COLUMN viviendas_historial_matriculas.nivel_riesgo IS 'Nivel de riesgo de la operación: MODERADO (sin relaciones), CRÍTICO (con abonos), ALTO (minuta firmada)';
COMMENT ON COLUMN viviendas_historial_matriculas.negociaciones_snapshot IS 'Snapshot JSON de negociaciones activas al momento del cambio';
COMMENT ON COLUMN viviendas_historial_matriculas.abonos_snapshot IS 'Snapshot JSON de abonos pagados al momento del cambio';
COMMENT ON COLUMN viviendas_historial_matriculas.documentos_snapshot IS 'Snapshot JSON de documentos importantes al momento del cambio';

-- 6. Verificar ejecución
SELECT
  COUNT(*) as registros_actuales,
  COUNT(DISTINCT vivienda_id) as viviendas_con_cambios,
  COUNT(*) FILTER (WHERE nivel_riesgo = 'ALTO') as cambios_alto_riesgo,
  COUNT(*) FILTER (WHERE nivel_riesgo = 'CRITICO') as cambios_criticos
FROM viviendas_historial_matriculas;
