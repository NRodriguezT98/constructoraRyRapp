-- =====================================================
-- Migración: Agregar configuración de fuentes aplicables por entidad
-- Fecha: 2025-12-22
-- Descripción: Permite configurar en qué tipos de fuentes de pago
--              es aplicable cada entidad financiera (relación N:M)
-- =====================================================

-- =====================================================
-- 1. AGREGAR COLUMNA: tipos_fuentes_aplicables
-- =====================================================
-- Array de UUIDs de tipos_fuentes_pago donde esta entidad es aplicable
ALTER TABLE public.entidades_financieras
ADD COLUMN IF NOT EXISTS tipos_fuentes_aplicables UUID[] DEFAULT '{}';

-- Comentario descriptivo
COMMENT ON COLUMN public.entidades_financieras.tipos_fuentes_aplicables IS
'Array de IDs de tipos_fuentes_pago donde esta entidad es aplicable. Permite configurar que Bancolombia aparezca solo en "Crédito Hipotecario" y "Leasing", mientras Comfandi solo en "Subsidio Cajas".';

-- =====================================================
-- 2. ÍNDICE PARA PERFORMANCE (búsquedas con ANY)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_entidades_financieras_fuentes_aplicables
ON public.entidades_financieras USING GIN (tipos_fuentes_aplicables);

-- =====================================================
-- 3. FUNCIÓN HELPER: Obtener entidades por tipo fuente
-- =====================================================
-- Función optimizada para filtrar entidades aplicables a un tipo de fuente
CREATE OR REPLACE FUNCTION get_entidades_por_tipo_fuente(
  p_tipo_fuente_id UUID,
  p_solo_activas BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  nombre VARCHAR,
  codigo VARCHAR,
  tipo VARCHAR,
  color VARCHAR,
  orden INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ef.id,
    ef.nombre,
    ef.codigo,
    ef.tipo,
    ef.color,
    ef.orden
  FROM public.entidades_financieras ef
  WHERE
    p_tipo_fuente_id = ANY(ef.tipos_fuentes_aplicables) -- ✅ Usa índice GIN
    AND (NOT p_solo_activas OR ef.activo = true)
  ORDER BY ef.orden ASC, ef.nombre ASC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_entidades_por_tipo_fuente IS
'Obtiene entidades financieras aplicables a un tipo de fuente específico. Ejemplo: get_entidades_por_tipo_fuente(''uuid-credito-hipotecario'', true)';

-- =====================================================
-- 4. SEED DATA: Configurar fuentes existentes
-- =====================================================

-- Obtener IDs de tipos de fuentes (asumiendo que existen)
DO $$
DECLARE
  v_credito_hipotecario_id UUID;
  v_subsidio_cajas_id UUID;
  v_leasing_id UUID;
  v_ahorro_programado_id UUID;
BEGIN
  -- Buscar IDs por códigos conocidos (ajustar según tus datos reales)
  SELECT id INTO v_credito_hipotecario_id FROM tipos_fuentes_pago WHERE codigo = 'credito_hipotecario' LIMIT 1;
  SELECT id INTO v_subsidio_cajas_id FROM tipos_fuentes_pago WHERE codigo = 'subsidio_cajas' LIMIT 1;
  SELECT id INTO v_leasing_id FROM tipos_fuentes_pago WHERE codigo = 'leasing' LIMIT 1;
  SELECT id INTO v_ahorro_programado_id FROM tipos_fuentes_pago WHERE codigo = 'ahorro_programado' LIMIT 1;

  -- Configurar BANCOS (aplican para créditos, leasing, ahorro)
  UPDATE public.entidades_financieras
  SET tipos_fuentes_aplicables = ARRAY[v_credito_hipotecario_id, v_leasing_id, v_ahorro_programado_id]::UUID[]
  WHERE tipo = 'Banco'
    AND v_credito_hipotecario_id IS NOT NULL
    AND v_leasing_id IS NOT NULL
    AND v_ahorro_programado_id IS NOT NULL;

  -- Configurar CAJAS DE COMPENSACIÓN (solo subsidios)
  UPDATE public.entidades_financieras
  SET tipos_fuentes_aplicables = ARRAY[v_subsidio_cajas_id]::UUID[]
  WHERE tipo = 'Caja de Compensación' AND v_subsidio_cajas_id IS NOT NULL;

  -- Log de configuración
  RAISE NOTICE 'Configuración inicial completada:';
  RAISE NOTICE '- Bancos: % entidades', (SELECT COUNT(*) FROM entidades_financieras WHERE tipo = 'Banco');
  RAISE NOTICE '- Cajas: % entidades', (SELECT COUNT(*) FROM entidades_financieras WHERE tipo = 'Caja de Compensación');
END $$;

-- =====================================================
-- 5. VALIDACIONES Y CONSTRAINTS
-- =====================================================

-- Validar que solo contenga UUIDs existentes (opcional, puede ser costoso en tablas grandes)
-- ALTER TABLE public.entidades_financieras
-- ADD CONSTRAINT entidades_financieras_fuentes_validas
-- CHECK (
--   tipos_fuentes_aplicables <@ ARRAY(SELECT id FROM tipos_fuentes_pago)::UUID[]
-- );

-- =====================================================
-- 6. VISTA OPTIMIZADA: Entidades con nombres de fuentes
-- =====================================================
CREATE OR REPLACE VIEW vista_entidades_con_fuentes AS
SELECT
  ef.id,
  ef.nombre,
  ef.codigo,
  ef.tipo,
  ef.color,
  ef.orden,
  ef.activo,
  ef.tipos_fuentes_aplicables,
  ARRAY_AGG(tfp.nombre ORDER BY tfp.nombre) FILTER (WHERE tfp.id IS NOT NULL) AS fuentes_aplicables_nombres,
  ARRAY_AGG(tfp.codigo ORDER BY tfp.codigo) FILTER (WHERE tfp.id IS NOT NULL) AS fuentes_aplicables_codigos
FROM public.entidades_financieras ef
LEFT JOIN LATERAL UNNEST(ef.tipos_fuentes_aplicables) AS fuente_id ON true
LEFT JOIN public.tipos_fuentes_pago tfp ON tfp.id = fuente_id
GROUP BY ef.id, ef.nombre, ef.codigo, ef.tipo, ef.color, ef.orden, ef.activo, ef.tipos_fuentes_aplicables;

COMMENT ON VIEW vista_entidades_con_fuentes IS
'Vista que muestra entidades con nombres legibles de las fuentes aplicables. Útil para admin UI.';

-- =====================================================
-- 7. EJEMPLO DE USO
-- =====================================================
-- Obtener entidades para "Crédito Hipotecario":
--   SELECT * FROM get_entidades_por_tipo_fuente('uuid-del-tipo', true);
--
-- Verificar configuración de Comfandi:
--   SELECT nombre, fuentes_aplicables_nombres FROM vista_entidades_con_fuentes WHERE codigo = 'comfandi';
--
-- Agregar fuente a Bancolombia:
--   UPDATE entidades_financieras
--   SET tipos_fuentes_aplicables = array_append(tipos_fuentes_aplicables, 'uuid-nuevo-tipo')
--   WHERE codigo = 'bancolombia';
