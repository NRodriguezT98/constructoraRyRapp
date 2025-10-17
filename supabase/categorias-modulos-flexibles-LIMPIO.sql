-- ============================================
-- MIGRACION: Sistema Flexible de Modulos para Categorias
-- Base de datos actual: 8 columnas (id, user_id, nombre, descripcion, color, icono, orden, fecha_creacion)
-- Objetivo: Agregar modulos_permitidos[] y es_global para sistema multi-modulo
-- ============================================

-- ============================================
-- PASO 1: BACKUP DE SEGURIDAD (opcional pero recomendado)
-- ============================================

-- Crear tabla temporal de respaldo antes de migrar
CREATE TABLE IF NOT EXISTS categorias_documento_backup_20251017 AS
SELECT * FROM public.categorias_documento;

COMMENT ON TABLE categorias_documento_backup_20251017 IS
'Backup de categorias_documento antes de migrar a sistema multi-modulo. Fecha: 2025-10-17';

-- ============================================
-- PASO 2: AGREGAR NUEVAS COLUMNAS
-- ============================================

-- Columna: modulos_permitidos (array de strings)
-- Valores posibles: {"proyectos"}, {"clientes"}, {"viviendas"}, {"proyectos","clientes"}, etc.
ALTER TABLE public.categorias_documento
ADD COLUMN IF NOT EXISTS modulos_permitidos TEXT[] DEFAULT '{"proyectos"}'::TEXT[] NOT NULL;

-- Columna: es_global (boolean)
-- Si TRUE, la categoria esta disponible en TODOS los modulos (ignora modulos_permitidos)
ALTER TABLE public.categorias_documento
ADD COLUMN IF NOT EXISTS es_global BOOLEAN DEFAULT FALSE NOT NULL;

-- ============================================
-- PASO 3: MIGRAR DATOS EXISTENTES
-- ============================================

-- Estrategia de migracion inteligente:
-- 1. Categorias genericas (Contratos, Facturas, Fotografias) → es_global = TRUE
-- 2. Categorias especificas de proyectos (Licencias, Planos) → modulos_permitidos = {"proyectos"}
-- 3. Resto → modulos_permitidos = {"proyectos"} (valor por defecto seguro)

-- Marcar categorias genericas como globales (disponibles en todos los modulos)
UPDATE public.categorias_documento
SET es_global = TRUE,
    modulos_permitidos = '{}'::TEXT[]  -- Array vacio porque es_global = TRUE
WHERE LOWER(nombre) IN (
  'contratos',
  'facturas',
  'fotografias',
  'fotografías',
  'fotos',
  'imagenes',
  'imágenes',
  'comprobantes',
  'recibos'
);

-- Categorias especificas de proyectos (mantener solo en proyectos)
UPDATE public.categorias_documento
SET es_global = FALSE,
    modulos_permitidos = '{"proyectos"}'::TEXT[]
WHERE LOWER(nombre) IN (
  'licencias',
  'licencias y permisos',
  'permisos',
  'planos',
  'planos arquitectonicos',
  'planos arquitectónicos',
  'estudios tecnicos',
  'estudios técnicos',
  'informes',
  'actas'
)
AND es_global = FALSE;  -- Solo actualizar las que no son globales

-- El resto de categorias (creadas por usuario) se mantienen con valor default
-- modulos_permitidos = {"proyectos"}, es_global = FALSE
-- El usuario podra cambiarlas desde la UI segun necesite

-- PASO 4: Agregar constraint para validar que modulos_permitidos tenga al menos 1 elemento
ALTER TABLE public.categorias_documento
DROP CONSTRAINT IF EXISTS check_modulos_permitidos_no_vacio;

ALTER TABLE public.categorias_documento
ADD CONSTRAINT check_modulos_permitidos_no_vacio
CHECK (array_length(modulos_permitidos, 1) > 0 OR es_global = TRUE);

-- PASO 5: Crear indice GIN para busquedas eficientes en array
CREATE INDEX IF NOT EXISTS idx_categorias_modulos_permitidos
ON public.categorias_documento USING GIN(modulos_permitidos);

-- PASO 6: Crear indice para es_global
CREATE INDEX IF NOT EXISTS idx_categorias_es_global
ON public.categorias_documento(es_global);

-- PASO 7: Actualizar comentarios
COMMENT ON COLUMN public.categorias_documento.modulos_permitidos IS
'Array de modulos donde esta disponible la categoria: ["proyectos"], ["clientes"], ["viviendas"], ["proyectos","clientes"], etc.';

COMMENT ON COLUMN public.categorias_documento.es_global IS
'Si es TRUE, la categoria esta disponible en TODOS los modulos (ignora modulos_permitidos)';

-- PASO 8: Agregar funcion helper para verificar si categoria aplica a un modulo
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

  IF v_es_global THEN
    RETURN TRUE;
  END IF;

  RETURN p_modulo = ANY(v_modulos);
END;
$$;

COMMENT ON FUNCTION categoria_aplica_a_modulo IS
'Verifica si una categoria aplica a un modulo especifico (considera es_global y modulos_permitidos)';

-- ============================================
-- PASO 9: CREAR CATEGORIAS DE EJEMPLO PARA CADA USUARIO
-- ============================================

-- Categorias GLOBALES (disponibles en todos los modulos)
-- Se crean para cada usuario existente que ya tenga categorias
INSERT INTO public.categorias_documento (user_id, nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
SELECT
  DISTINCT cd.user_id,
  nuevas.nombre,
  nuevas.descripcion,
  nuevas.color,
  nuevas.icono,
  nuevas.es_global,
  nuevas.modulos_permitidos::TEXT[],
  nuevas.orden
FROM public.categorias_documento cd
CROSS JOIN (
  VALUES
    ('Contratos', 'Contratos y acuerdos legales', 'green', 'FileSignature', TRUE, '{}', 100),
    ('Facturas', 'Comprobantes y facturas', 'yellow', 'Receipt', TRUE, '{}', 101),
    ('Fotografias', 'Registro fotografico', 'pink', 'Camera', TRUE, '{}', 102)
) AS nuevas(nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categorias_documento
  WHERE user_id = cd.user_id AND nombre = nuevas.nombre
);

-- Categorias SOLO para PROYECTOS
INSERT INTO public.categorias_documento (user_id, nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
SELECT
  DISTINCT cd.user_id,
  nuevas.nombre,
  nuevas.descripcion,
  nuevas.color,
  nuevas.icono,
  nuevas.es_global,
  nuevas.modulos_permitidos::TEXT[],
  nuevas.orden
FROM public.categorias_documento cd
CROSS JOIN (
  VALUES
    ('Licencias y Permisos', 'Documentos legales de obra', 'blue', 'FileCheck', FALSE, '{"proyectos"}', 110),
    ('Planos', 'Planos tecnicos y arquitectonicos', 'purple', 'Drafting', FALSE, '{"proyectos"}', 111),
    ('Estudios Tecnicos', 'Estudios de suelo, estructurales, etc.', 'indigo', 'FileText', FALSE, '{"proyectos"}', 112)
) AS nuevas(nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categorias_documento
  WHERE user_id = cd.user_id AND nombre = nuevas.nombre
);

-- Categorias SOLO para CLIENTES
INSERT INTO public.categorias_documento (user_id, nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
SELECT
  DISTINCT cd.user_id,
  nuevas.nombre,
  nuevas.descripcion,
  nuevas.color,
  nuevas.icono,
  nuevas.es_global,
  nuevas.modulos_permitidos::TEXT[],
  nuevas.orden
FROM public.categorias_documento cd
CROSS JOIN (
  VALUES
    ('Documentos de Identidad', 'Cedulas, pasaportes, etc.', 'blue', 'IdCard', FALSE, '{"clientes"}', 120),
    ('Referencias Laborales', 'Cartas de referencia y comprobantes', 'cyan', 'Briefcase', FALSE, '{"clientes"}', 121),
    ('Historial Crediticio', 'Reportes y certificados crediticios', 'red', 'CreditCard', FALSE, '{"clientes"}', 122)
) AS nuevas(nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categorias_documento
  WHERE user_id = cd.user_id AND nombre = nuevas.nombre
);

-- Categorias para MULTIPLES modulos (proyectos + viviendas)
INSERT INTO public.categorias_documento (user_id, nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
SELECT
  DISTINCT cd.user_id,
  nuevas.nombre,
  nuevas.descripcion,
  nuevas.color,
  nuevas.icono,
  nuevas.es_global,
  nuevas.modulos_permitidos::TEXT[],
  nuevas.orden
FROM public.categorias_documento cd
CROSS JOIN (
  VALUES
    ('Escrituras', 'Escrituras publicas y titulos', 'orange', 'FileKey', FALSE, '{"proyectos","viviendas"}', 130),
    ('Certificados de Calidad', 'Certificaciones ISO, calidad, etc.', 'teal', 'Award', FALSE, '{"proyectos","viviendas"}', 131)
) AS nuevas(nombre, descripcion, color, icono, es_global, modulos_permitidos, orden)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categorias_documento
  WHERE user_id = cd.user_id AND nombre = nuevas.nombre
);

-- ============================================
-- QUERIES DE VERIFICACION
-- ============================================

-- Ver todas las categorias con su configuracion (SIN filtro de user_id)
SELECT
  nombre,
  CASE
    WHEN es_global THEN 'TODOS LOS MODULOS'
    ELSE array_to_string(modulos_permitidos, ', ')
  END as disponible_en,
  color,
  icono,
  orden
FROM public.categorias_documento
ORDER BY orden;

-- Ver categorias por modulo (SIN filtro de user_id)
SELECT
  'PROYECTOS' as modulo,
  COUNT(*) as total_categorias,
  STRING_AGG(nombre, ', ') as categorias
FROM public.categorias_documento
WHERE (es_global = TRUE OR 'proyectos' = ANY(modulos_permitidos))

UNION ALL

SELECT
  'CLIENTES' as modulo,
  COUNT(*) as total_categorias,
  STRING_AGG(nombre, ', ') as categorias
FROM public.categorias_documento
WHERE (es_global = TRUE OR 'clientes' = ANY(modulos_permitidos))

UNION ALL

SELECT
  'VIVIENDAS' as modulo,
  COUNT(*) as total_categorias,
  STRING_AGG(nombre, ', ') as categorias
FROM public.categorias_documento
WHERE (es_global = TRUE OR 'viviendas' = ANY(modulos_permitidos));
