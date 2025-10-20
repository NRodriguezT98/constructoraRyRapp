-- ============================================
-- MIGRACIÓN: Sistema Flexible de Módulos para Categorías
-- Evolución de tipo_entidad a modulos_permitidos (array)
-- ============================================

-- PASO 1: Agregar nueva columna modulos_permitidos (array de strings)
ALTER TABLE public.categorias_documento
ADD COLUMN IF NOT EXISTS modulos_permitidos TEXT[] DEFAULT '{"proyectos"}';

-- PASO 2: Migrar datos existentes de tipo_entidad a modulos_permitidos
UPDATE public.categorias_documento
SET modulos_permitidos = CASE
  WHEN tipo_entidad = 'proyecto' THEN '{"proyectos"}'::TEXT[]
  WHEN tipo_entidad = 'cliente' THEN '{"clientes"}'::TEXT[]
  WHEN tipo_entidad = 'ambos' THEN '{"proyectos","clientes"}'::TEXT[]
  ELSE '{"proyectos"}'::TEXT[]
END
WHERE modulos_permitidos = '{"proyectos"}'; -- Solo actualiza los que tienen valor default

-- PASO 3: Agregar columna es_global (categoría disponible en todos los módulos)
ALTER TABLE public.categorias_documento
ADD COLUMN IF NOT EXISTS es_global BOOLEAN DEFAULT FALSE;

-- PASO 4: Marcar como globales las categorías que estaban en 'ambos'
UPDATE public.categorias_documento
SET es_global = TRUE
WHERE tipo_entidad = 'ambos';

-- PASO 5: Agregar constraint para validar que modulos_permitidos tenga al menos 1 elemento
ALTER TABLE public.categorias_documento
ADD CONSTRAINT check_modulos_permitidos_no_vacio
CHECK (array_length(modulos_permitidos, 1) > 0 OR es_global = TRUE);

-- PASO 6: Crear índice GIN para búsquedas eficientes en array
CREATE INDEX IF NOT EXISTS idx_categorias_modulos_permitidos
ON public.categorias_documento USING GIN(modulos_permitidos);

-- PASO 7: Crear índice para es_global
CREATE INDEX IF NOT EXISTS idx_categorias_es_global
ON public.categorias_documento(es_global);

-- PASO 8: Actualizar comentarios
COMMENT ON COLUMN public.categorias_documento.modulos_permitidos IS
'Array de módulos donde está disponible la categoría: ["proyectos"], ["clientes"], ["viviendas"], ["proyectos","clientes"], etc.';

COMMENT ON COLUMN public.categorias_documento.es_global IS
'Si es TRUE, la categoría está disponible en TODOS los módulos (ignora modulos_permitidos)';

-- PASO 9: Agregar función helper para verificar si categoría aplica a un módulo
CREATE OR REPLACE FUNCTION categoria_aplica_a_modulo(
  p_categoria_id UUID,
  p_modulo TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_es_global BOOLEAN;
  v_modulos TEXT[];
BEGIN
  SELECT es_global, modulos_permitidos
  INTO v_es_global, v_modulos
  FROM public.categorias_documento
  WHERE id = p_categoria_id;

  -- Si es global, siempre aplica
  IF v_es_global THEN
    RETURN TRUE;
  END IF;

  -- Verificar si el módulo está en el array
  RETURN p_modulo = ANY(v_modulos);
END;
$$;

COMMENT ON FUNCTION categoria_aplica_a_modulo IS
'Verifica si una categoría aplica a un módulo específico (considera es_global y modulos_permitidos)';

-- ============================================
-- DATOS DE PRUEBA: Categorías con diferentes configuraciones
-- ============================================

-- Categorías GLOBALES (todos los módulos)
INSERT INTO public.categorias_documento (user_id, nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
VALUES
  (auth.uid(), 'Contratos', 'Contratos y acuerdos legales', 'green', 'FileSignature', TRUE, '{}', 1),
  (auth.uid(), 'Facturas', 'Comprobantes y facturas', 'yellow', 'Receipt', TRUE, '{}', 2),
  (auth.uid(), 'Fotografías', 'Registro fotográfico', 'pink', 'Camera', TRUE, '{}', 3)
ON CONFLICT DO NOTHING;

-- Categorías SOLO para PROYECTOS
INSERT INTO public.categorias_documento (user_id, nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
VALUES
  (auth.uid(), 'Licencias y Permisos', 'Documentos legales de obra', 'blue', 'FileCheck', FALSE, '{"proyectos"}', 10),
  (auth.uid(), 'Planos', 'Planos técnicos y arquitectónicos', 'purple', 'Drafting', FALSE, '{"proyectos"}', 11),
  (auth.uid(), 'Estudios Técnicos', 'Estudios de suelo, estructurales, etc.', 'indigo', 'FileText', FALSE, '{"proyectos"}', 12)
ON CONFLICT DO NOTHING;

-- Categorías SOLO para CLIENTES
INSERT INTO public.categorias_documento (user_id, nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
VALUES
  (auth.uid(), 'Documentos de Identidad', 'Cédulas, pasaportes, etc.', 'blue', 'IdCard', FALSE, '{"clientes"}', 20),
  (auth.uid(), 'Referencias Laborales', 'Cartas de referencia y comprobantes', 'cyan', 'Briefcase', FALSE, '{"clientes"}', 21),
  (auth.uid(), 'Historial Crediticio', 'Reportes y certificados crediticios', 'red', 'CreditCard', FALSE, '{"clientes"}', 22)
ON CONFLICT DO NOTHING;

-- Categorías para MÚLTIPLES módulos específicos (proyectos + viviendas)
INSERT INTO public.categorias_documento (user_id, nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
VALUES
  (auth.uid(), 'Escrituras', 'Escrituras públicas y títulos', 'orange', 'FileKey', FALSE, '{"proyectos","viviendas"}', 30),
  (auth.uid(), 'Certificados de Calidad', 'Certificaciones ISO, calidad, etc.', 'teal', 'Award', FALSE, '{"proyectos","viviendas"}', 31)
ON CONFLICT DO NOTHING;

-- ============================================
-- QUERIES DE VERIFICACIÓN
-- ============================================

-- Ver todas las categorías con su configuración
SELECT
  nombre,
  CASE
    WHEN es_global THEN '🌍 TODOS LOS MÓDULOS'
    ELSE array_to_string(modulos_permitidos, ', ')
  END as disponible_en,
  color,
  icono,
  orden
FROM public.categorias_documento
WHERE user_id = auth.uid()
ORDER BY orden;

-- Ver categorías por módulo
SELECT
  'PROYECTOS' as modulo,
  COUNT(*) as total_categorias,
  STRING_AGG(nombre, ', ') as categorias
FROM public.categorias_documento
WHERE user_id = auth.uid()
  AND (es_global = TRUE OR 'proyectos' = ANY(modulos_permitidos))

UNION ALL

SELECT
  'CLIENTES' as modulo,
  COUNT(*) as total_categorias,
  STRING_AGG(nombre, ', ') as categorias
FROM public.categorias_documento
WHERE user_id = auth.uid()
  AND (es_global = TRUE OR 'clientes' = ANY(modulos_permitidos))

UNION ALL

SELECT
  'VIVIENDAS' as modulo,
  COUNT(*) as total_categorias,
  STRING_AGG(nombre, ', ') as categorias
FROM public.categorias_documento
WHERE user_id = auth.uid()
  AND (es_global = TRUE OR 'viviendas' = ANY(modulos_permitidos));

-- ============================================
-- LIMPIAR DATOS DE PRUEBA (opcional)
-- ============================================

/*
-- Si quieres eliminar las categorías de prueba creadas arriba:
DELETE FROM public.categorias_documento
WHERE user_id = auth.uid()
  AND nombre IN (
    'Contratos', 'Facturas', 'Fotografías',
    'Licencias y Permisos', 'Planos', 'Estudios Técnicos',
    'Documentos de Identidad', 'Referencias Laborales', 'Historial Crediticio',
    'Escrituras', 'Certificados de Calidad'
  );
*/

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
✅ COMPLETADO:
1. Columna modulos_permitidos (TEXT[]) - Múltiples módulos simultáneamente
2. Columna es_global (BOOLEAN) - Disponible en todos los módulos
3. Migración automática desde tipo_entidad antiguo
4. Índices GIN para búsquedas eficientes
5. Función helper categoria_aplica_a_modulo()
6. Datos de prueba con diferentes configuraciones

🎯 VENTAJAS:
- Flexibilidad total: 1 módulo, 2 módulos, 3+, o todos (global)
- Escalable: agregar "proveedores" en futuro es trivial
- Performance: índices GIN optimizados para arrays
- Migración segura: datos existentes preservados

📋 SIGUIENTE PASO:
Regenerar tipos TypeScript:
npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad > src/lib/supabase/database.types.ts
*/
