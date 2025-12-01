-- ============================================
-- PROTEGER CATEGORÍAS DEL SISTEMA
-- ============================================
-- Fecha: 2025-12-01
-- Problema: Categorías críticas (Documentos de Identidad, Cartas de Aprobación)
--           pueden ser eliminadas por error, rompiendo funcionalidad del sistema
-- Solución: Agregar columna es_sistema y proteger con trigger
-- ============================================

-- =====================================================
-- PASO 1: Agregar columna es_sistema
-- =====================================================

ALTER TABLE categorias_documento
ADD COLUMN IF NOT EXISTS es_sistema BOOLEAN DEFAULT false;

COMMENT ON COLUMN categorias_documento.es_sistema IS
'Indica si la categoría es del sistema (no eliminable/no editable). Ejemplos: Documentos de Identidad, Cartas de Aprobación';

-- =====================================================
-- PASO 2: Marcar categorías existentes del sistema
-- =====================================================

UPDATE categorias_documento
SET es_sistema = true
WHERE nombre IN (
  'Documentos de Identidad',
  'Cartas de Aprobación',
  'Identidad',
  'Cédula',
  'Documentos Legales'
);

-- =====================================================
-- PASO 3: Crear trigger para prevenir eliminación
-- =====================================================

CREATE OR REPLACE FUNCTION prevenir_eliminacion_categoria_sistema()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevenir DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.es_sistema = true THEN
      RAISE EXCEPTION 'No se puede eliminar la categoría "%" porque es una categoría del sistema', OLD.nombre
        USING HINT = 'Las categorías del sistema son necesarias para el funcionamiento de la aplicación';
    END IF;
  END IF;

  -- Prevenir UPDATE del nombre o es_sistema (solo admin debería poder)
  IF TG_OP = 'UPDATE' THEN
    IF OLD.es_sistema = true THEN
      -- Permitir cambios en: descripcion, color, icono, orden
      -- Prohibir cambios en: nombre, es_sistema, es_global, modulos_permitidos
      IF NEW.nombre != OLD.nombre THEN
        RAISE EXCEPTION 'No se puede cambiar el nombre de la categoría del sistema "%"', OLD.nombre
          USING HINT = 'El nombre de las categorías del sistema es fijo';
      END IF;

      IF NEW.es_sistema != OLD.es_sistema THEN
        RAISE EXCEPTION 'No se puede modificar el flag es_sistema de la categoría "%"', OLD.nombre
          USING HINT = 'Solo administradores pueden cambiar este atributo';
      END IF;

      IF NEW.es_global != OLD.es_global THEN
        RAISE EXCEPTION 'No se puede modificar el flag es_global de la categoría del sistema "%"', OLD.nombre
          USING HINT = 'Las categorías del sistema deben permanecer globales';
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_proteger_categoria_sistema ON categorias_documento;

CREATE TRIGGER trigger_proteger_categoria_sistema
  BEFORE DELETE OR UPDATE ON categorias_documento
  FOR EACH ROW
  EXECUTE FUNCTION prevenir_eliminacion_categoria_sistema();

COMMENT ON FUNCTION prevenir_eliminacion_categoria_sistema() IS
'Previene la eliminación o modificación de categorías críticas del sistema';

-- =====================================================
-- PASO 4: Actualizar RLS policies (protección adicional)
-- =====================================================

-- Policy para DELETE (solo si NO es_sistema)
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus categorías no-sistema" ON categorias_documento;

CREATE POLICY "Usuarios pueden eliminar sus categorías no-sistema"
ON categorias_documento
FOR DELETE
USING (
  user_id = auth.uid()
  AND es_sistema = false  -- ✅ Solo permitir eliminar categorías NO sistema
);

-- Policy para UPDATE (permitir solo ciertos campos en categorías sistema)
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus categorías" ON categorias_documento;

CREATE POLICY "Usuarios pueden actualizar sus categorías"
ON categorias_documento
FOR UPDATE
USING (user_id = auth.uid() OR es_global = true)
WITH CHECK (
  user_id = auth.uid() OR es_global = true
);

-- =====================================================
-- PASO 5: Verificar resultado
-- =====================================================

-- Mostrar categorías del sistema
SELECT
  id,
  nombre,
  es_sistema,
  es_global,
  modulos_permitidos
FROM categorias_documento
WHERE es_sistema = true
ORDER BY nombre;

-- Contar categorías protegidas
SELECT
  COUNT(*) as total_categorias_sistema,
  COUNT(*) FILTER (WHERE es_global = true) as globales,
  COUNT(*) FILTER (WHERE es_global = false) as no_globales
FROM categorias_documento
WHERE es_sistema = true;
