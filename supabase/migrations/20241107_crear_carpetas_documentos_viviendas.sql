-- ============================================
-- MIGRACIÓN: Sistema de Carpetas para Documentos de Viviendas
-- ============================================
-- Fecha: 2024-11-07
-- Descripción: Crear sistema de carpetas jerárquico estilo Google Drive
--              para organizar documentos de viviendas

-- ============================================
-- 1. CREAR TABLA DE CARPETAS
-- ============================================
CREATE TABLE IF NOT EXISTS carpetas_documentos_viviendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información básica
  nombre TEXT NOT NULL CHECK (char_length(nombre) <= 100),
  descripcion TEXT,

  -- Relaciones
  vivienda_id UUID NOT NULL REFERENCES viviendas(id) ON DELETE CASCADE,
  carpeta_padre_id UUID REFERENCES carpetas_documentos_viviendas(id) ON DELETE CASCADE,

  -- Personalización visual
  color TEXT DEFAULT '#3B82F6' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  icono TEXT DEFAULT 'folder',

  -- Orden y visualización
  orden INTEGER DEFAULT 0,
  es_carpeta_sistema BOOLEAN DEFAULT FALSE, -- Carpetas predefinidas no eliminables

  -- Auditoría
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX idx_carpetas_vivienda ON carpetas_documentos_viviendas(vivienda_id);
CREATE INDEX idx_carpetas_padre ON carpetas_documentos_viviendas(carpeta_padre_id);
CREATE INDEX idx_carpetas_orden ON carpetas_documentos_viviendas(vivienda_id, orden);
CREATE INDEX idx_carpetas_sistema ON carpetas_documentos_viviendas(es_carpeta_sistema) WHERE es_carpeta_sistema = TRUE;

-- ============================================
-- 3. MODIFICAR TABLA DOCUMENTOS (agregar carpeta_id)
-- ============================================
ALTER TABLE documentos_vivienda
ADD COLUMN IF NOT EXISTS carpeta_id UUID REFERENCES carpetas_documentos_viviendas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documentos_carpeta ON documentos_vivienda(carpeta_id);

-- ============================================
-- 4. FUNCIÓN: Actualizar timestamp updated_at
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_carpeta_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_carpetas_updated_at
  BEFORE UPDATE ON carpetas_documentos_viviendas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_carpeta_updated_at();

-- ============================================
-- 5. FUNCIÓN: Validar jerarquía (prevenir ciclos)
-- ============================================
CREATE OR REPLACE FUNCTION validar_jerarquia_carpetas()
RETURNS TRIGGER AS $$
DECLARE
  v_nivel INTEGER := 0;
  v_carpeta_actual UUID;
  v_max_nivel INTEGER := 10; -- Máximo 10 niveles de profundidad
BEGIN
  -- Si no tiene padre, es carpeta raíz
  IF NEW.carpeta_padre_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Verificar que padre existe y pertenece a la misma vivienda
  IF NOT EXISTS (
    SELECT 1 FROM carpetas_documentos_viviendas
    WHERE id = NEW.carpeta_padre_id
    AND vivienda_id = NEW.vivienda_id
  ) THEN
    RAISE EXCEPTION 'La carpeta padre no existe o no pertenece a la misma vivienda';
  END IF;

  -- Prevenir auto-referencia
  IF NEW.id = NEW.carpeta_padre_id THEN
    RAISE EXCEPTION 'Una carpeta no puede ser su propia carpeta padre';
  END IF;

  -- Prevenir ciclos (recorrer hacia arriba)
  v_carpeta_actual := NEW.carpeta_padre_id;

  WHILE v_carpeta_actual IS NOT NULL AND v_nivel < v_max_nivel LOOP
    -- Si encontramos la carpeta actual en la cadena, hay un ciclo
    IF v_carpeta_actual = NEW.id THEN
      RAISE EXCEPTION 'Se detectó un ciclo en la jerarquía de carpetas';
    END IF;

    -- Subir un nivel
    SELECT carpeta_padre_id INTO v_carpeta_actual
    FROM carpetas_documentos_viviendas
    WHERE id = v_carpeta_actual;

    v_nivel := v_nivel + 1;
  END LOOP;

  IF v_nivel >= v_max_nivel THEN
    RAISE EXCEPTION 'Se excedió el nivel máximo de jerarquía (%) niveles', v_max_nivel;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_jerarquia
  BEFORE INSERT OR UPDATE ON carpetas_documentos_viviendas
  FOR EACH ROW
  EXECUTE FUNCTION validar_jerarquia_carpetas();

-- ============================================
-- 6. FUNCIÓN: Crear carpetas predeterminadas
-- ============================================
CREATE OR REPLACE FUNCTION crear_carpetas_predeterminadas_vivienda(p_vivienda_id UUID, p_usuario_id UUID)
RETURNS VOID AS $$
DECLARE
  v_carpeta_legal UUID;
  v_carpeta_tecnica UUID;
  v_carpeta_fotos UUID;
  v_carpeta_financiera UUID;
BEGIN
  -- Carpeta: Documentos Legales
  INSERT INTO carpetas_documentos_viviendas (
    vivienda_id, nombre, descripcion, color, icono, orden, es_carpeta_sistema, created_by
  ) VALUES (
    p_vivienda_id,
    'Documentos Legales',
    'Escrituras, certificados y documentos jurídicos',
    '#EF4444',
    'scale',
    1,
    TRUE,
    p_usuario_id
  ) RETURNING id INTO v_carpeta_legal;

  -- Subcarpetas de Documentos Legales
  INSERT INTO carpetas_documentos_viviendas (
    vivienda_id, carpeta_padre_id, nombre, color, icono, orden, es_carpeta_sistema, created_by
  ) VALUES
    (p_vivienda_id, v_carpeta_legal, 'Escrituras', '#DC2626', 'file-text', 1, TRUE, p_usuario_id),
    (p_vivienda_id, v_carpeta_legal, 'Certificados', '#B91C1C', 'award', 2, TRUE, p_usuario_id),
    (p_vivienda_id, v_carpeta_legal, 'Permisos', '#991B1B', 'shield-check', 3, TRUE, p_usuario_id);

  -- Carpeta: Documentos Técnicos
  INSERT INTO carpetas_documentos_viviendas (
    vivienda_id, nombre, descripcion, color, icono, orden, es_carpeta_sistema, created_by
  ) VALUES (
    p_vivienda_id,
    'Documentos Técnicos',
    'Planos, especificaciones y documentación técnica',
    '#3B82F6',
    'compass',
    2,
    TRUE,
    p_usuario_id
  ) RETURNING id INTO v_carpeta_tecnica;

  -- Subcarpetas de Documentos Técnicos
  INSERT INTO carpetas_documentos_viviendas (
    vivienda_id, carpeta_padre_id, nombre, color, icono, orden, es_carpeta_sistema, created_by
  ) VALUES
    (p_vivienda_id, v_carpeta_tecnica, 'Planos', '#2563EB', 'drafting-compass', 1, TRUE, p_usuario_id),
    (p_vivienda_id, v_carpeta_tecnica, 'Especificaciones', '#1D4ED8', 'clipboard-list', 2, TRUE, p_usuario_id);

  -- Carpeta: Fotografías
  INSERT INTO carpetas_documentos_viviendas (
    vivienda_id, nombre, descripcion, color, icono, orden, es_carpeta_sistema, created_by
  ) VALUES (
    p_vivienda_id,
    'Fotografías',
    'Registro fotográfico de avance y estado final',
    '#10B981',
    'camera',
    3,
    TRUE,
    p_usuario_id
  ) RETURNING id INTO v_carpeta_fotos;

  -- Subcarpetas de Fotografías
  INSERT INTO carpetas_documentos_viviendas (
    vivienda_id, carpeta_padre_id, nombre, color, icono, orden, es_carpeta_sistema, created_by
  ) VALUES
    (p_vivienda_id, v_carpeta_fotos, 'Avance Obra', '#059669', 'hammer', 1, TRUE, p_usuario_id),
    (p_vivienda_id, v_carpeta_fotos, 'Estado Final', '#047857', 'check-circle', 2, TRUE, p_usuario_id);

  -- Carpeta: Documentos Financieros
  INSERT INTO carpetas_documentos_viviendas (
    vivienda_id, nombre, descripcion, color, icono, orden, es_carpeta_sistema, created_by
  ) VALUES (
    p_vivienda_id,
    'Documentos Financieros',
    'Contratos, presupuestos y documentación financiera',
    '#F59E0B',
    'banknote',
    4,
    TRUE,
    p_usuario_id
  ) RETURNING id INTO v_carpeta_financiera;

  -- Subcarpetas de Documentos Financieros
  INSERT INTO carpetas_documentos_viviendas (
    vivienda_id, carpeta_padre_id, nombre, color, icono, orden, es_carpeta_sistema, created_by
  ) VALUES
    (p_vivienda_id, v_carpeta_financiera, 'Contratos', '#D97706', 'file-signature', 1, TRUE, p_usuario_id),
    (p_vivienda_id, v_carpeta_financiera, 'Presupuestos', '#B45309', 'calculator', 2, TRUE, p_usuario_id);

  RAISE NOTICE 'Carpetas predeterminadas creadas para vivienda %', p_vivienda_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. RLS (Row Level Security)
-- ============================================
ALTER TABLE carpetas_documentos_viviendas ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Usuarios autenticados pueden ver carpetas de viviendas
CREATE POLICY "Usuarios pueden ver carpetas de viviendas"
  ON carpetas_documentos_viviendas FOR SELECT
  TO authenticated
  USING (true);

-- Policy: INSERT - Usuarios autenticados pueden crear carpetas
CREATE POLICY "Usuarios pueden crear carpetas"
  ON carpetas_documentos_viviendas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: UPDATE - Solo el creador o Administrador puede editar
CREATE POLICY "Usuarios pueden editar sus carpetas"
  ON carpetas_documentos_viviendas FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
    )
  );

-- Policy: DELETE - Solo Administrador puede eliminar carpetas no-sistema
CREATE POLICY "Solo Admin puede eliminar carpetas"
  ON carpetas_documentos_viviendas FOR DELETE
  TO authenticated
  USING (
    es_carpeta_sistema = FALSE AND
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
    )
  );

-- ============================================
-- 8. COMENTARIOS
-- ============================================
COMMENT ON TABLE carpetas_documentos_viviendas IS 'Sistema de carpetas jerárquico para organizar documentos de viviendas estilo Google Drive';
COMMENT ON COLUMN carpetas_documentos_viviendas.carpeta_padre_id IS 'ID de la carpeta padre para jerarquía (NULL = carpeta raíz)';
COMMENT ON COLUMN carpetas_documentos_viviendas.es_carpeta_sistema IS 'TRUE = carpeta predefinida no eliminable por usuarios';
COMMENT ON COLUMN carpetas_documentos_viviendas.orden IS 'Orden de visualización dentro del mismo nivel';

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================
