-- ================================================================
-- MIGRACIÓN: Sistema de Validación de Fuentes de Pago
-- ================================================================
-- Fecha: 2025-12-11
-- Autor: Sistema RyR
-- Descripción: Sistema de validación de requisitos para desembolsos
--
-- ✅ VERIFICADO CONTRA: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
-- ================================================================

-- ================================================================
-- TABLA: pasos_fuente_pago
-- ================================================================

CREATE TABLE IF NOT EXISTS public.pasos_fuente_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fuente_pago_id UUID NOT NULL REFERENCES public.fuentes_pago(id) ON DELETE CASCADE,

  -- Identificación del paso
  paso VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,

  -- Nivel de validación
  nivel_validacion VARCHAR(50) NOT NULL CHECK (nivel_validacion IN (
    'DOCUMENTO_OBLIGATORIO',
    'DOCUMENTO_OPCIONAL',
    'SOLO_CONFIRMACION'
  )),

  -- Metadata de documento requerido
  tipo_documento_requerido VARCHAR(100),
  categoria_documento_requerida VARCHAR(100),

  -- Estado
  completado BOOLEAN DEFAULT FALSE NOT NULL,
  completado_automaticamente BOOLEAN DEFAULT FALSE NOT NULL,
  fecha_completado TIMESTAMPTZ,
  usuario_completado UUID REFERENCES auth.users(id),

  -- Vinculación con documento
  documento_id UUID REFERENCES public.documentos_cliente(id) ON DELETE SET NULL,

  -- Observaciones
  observaciones TEXT,

  -- Auditoría
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(fuente_pago_id, paso)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pasos_fuente_pago_fuente
  ON public.pasos_fuente_pago(fuente_pago_id);

CREATE INDEX IF NOT EXISTS idx_pasos_fuente_pago_completado
  ON public.pasos_fuente_pago(completado)
  WHERE completado = FALSE;

CREATE INDEX IF NOT EXISTS idx_pasos_fuente_pago_documento
  ON public.pasos_fuente_pago(documento_id)
  WHERE documento_id IS NOT NULL;

-- Comentarios
COMMENT ON TABLE public.pasos_fuente_pago IS
  'Pasos de validación requeridos antes de desembolsar una fuente de pago';

COMMENT ON COLUMN public.pasos_fuente_pago.nivel_validacion IS
  'DOCUMENTO_OBLIGATORIO: Requiere documento | DOCUMENTO_OPCIONAL: Documento opcional | SOLO_CONFIRMACION: Solo checkbox';

COMMENT ON COLUMN public.pasos_fuente_pago.completado_automaticamente IS
  'TRUE si fue completado automáticamente por trigger al subir documento';

-- ================================================================
-- TRIGGER 1: Vincular documento con paso automáticamente
-- ================================================================

CREATE OR REPLACE FUNCTION public.vincular_documento_a_paso_fuente()
RETURNS TRIGGER AS $$
DECLARE
  v_fuente_id UUID;
  v_paso_id UUID;
BEGIN
  -- Extraer fuente_pago_id desde metadata del documento
  v_fuente_id := (NEW.metadata->>'fuente_pago_id')::UUID;

  IF v_fuente_id IS NULL THEN
    RETURN NEW; -- No hay metadata de fuente, ignorar
  END IF;

  -- Buscar paso pendiente que coincida con:
  --   1. fuente_pago_id del metadata
  --   2. tipo_documento_requerido = titulo del documento o categoria
  SELECT id INTO v_paso_id
  FROM public.pasos_fuente_pago
  WHERE fuente_pago_id = v_fuente_id
    AND completado = FALSE
    AND (
      tipo_documento_requerido = NEW.titulo
      OR categoria_documento_requerida = (NEW.metadata->>'categoria')::TEXT
    )
  LIMIT 1;

  -- Si encontramos paso pendiente, auto-completarlo
  IF v_paso_id IS NOT NULL THEN
    UPDATE public.pasos_fuente_pago
    SET
      completado = TRUE,
      completado_automaticamente = TRUE,
      documento_id = NEW.id,
      fecha_completado = NOW(),
      fecha_actualizacion = NOW()
    WHERE id = v_paso_id;

    -- Eliminar documentos_pendientes relacionado si existe
    DELETE FROM public.documentos_pendientes
    WHERE fuente_pago_id = v_fuente_id
      AND tipo_documento = NEW.titulo;

    RAISE NOTICE 'Paso % auto-completado para fuente %', v_paso_id, v_fuente_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS trg_vincular_documento_a_paso_fuente ON public.documentos_cliente;

CREATE TRIGGER trg_vincular_documento_a_paso_fuente
  AFTER INSERT ON public.documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION public.vincular_documento_a_paso_fuente();

COMMENT ON FUNCTION public.vincular_documento_a_paso_fuente() IS
  'Auto-completa pasos cuando se sube un documento con metadata correcta';

-- ================================================================
-- TRIGGER 2: Desvincular documento al eliminarlo
-- ================================================================

CREATE OR REPLACE FUNCTION public.desvincular_documento_de_paso()
RETURNS TRIGGER AS $$
DECLARE
  v_paso RECORD;
BEGIN
  -- Buscar pasos vinculados a este documento
  FOR v_paso IN
    SELECT * FROM public.pasos_fuente_pago
    WHERE documento_id = OLD.id
  LOOP
    -- Marcar paso como incompleto
    UPDATE public.pasos_fuente_pago
    SET
      completado = FALSE,
      documento_id = NULL,
      fecha_completado = NULL,
      completado_automaticamente = FALSE,
      observaciones = COALESCE(observaciones || ' | ', '') ||
        'Documento eliminado el ' || NOW()::DATE::TEXT,
      fecha_actualizacion = NOW()
    WHERE id = v_paso.id;

    -- Recrear documentos_pendientes
    INSERT INTO public.documentos_pendientes (
      id,
      fuente_pago_id,
      cliente_id,
      tipo_documento,
      estado,
      prioridad,
      metadata,
      fecha_creacion
    )
    SELECT
      gen_random_uuid(),
      v_paso.fuente_pago_id,
      n.cliente_id,
      v_paso.titulo,
      'Pendiente',
      'Alta',
      jsonb_build_object(
        'paso_id', v_paso.id,
        'tipo_fuente', fp.tipo,
        'recreado_por_eliminacion', TRUE
      ),
      NOW()
    FROM public.fuentes_pago fp
    JOIN public.negociaciones n ON n.id = fp.negociacion_id
    WHERE fp.id = v_paso.fuente_pago_id
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Paso % desvinculado y marcado como incompleto', v_paso.id;
  END LOOP;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS trg_desvincular_documento_de_paso ON public.documentos_cliente;

CREATE TRIGGER trg_desvincular_documento_de_paso
  AFTER DELETE ON public.documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION public.desvincular_documento_de_paso();

COMMENT ON FUNCTION public.desvincular_documento_de_paso() IS
  'Marca pasos como incompletos cuando se elimina un documento vinculado';

-- ================================================================
-- TRIGGER 3: Invalidar pasos al modificar fuente
-- ================================================================

CREATE OR REPLACE FUNCTION public.invalidar_pasos_fuente_modificada()
RETURNS TRIGGER AS $$
DECLARE
  v_paso_carta UUID;
BEGIN
  -- Solo actuar si cambió monto_aprobado o entidad
  IF OLD.monto_aprobado IS DISTINCT FROM NEW.monto_aprobado
     OR OLD.entidad IS DISTINCT FROM NEW.entidad THEN

    -- Invalidar paso 'carta_aprobacion' si existe
    SELECT id INTO v_paso_carta
    FROM public.pasos_fuente_pago
    WHERE fuente_pago_id = NEW.id
      AND paso = 'carta_aprobacion';

    IF v_paso_carta IS NOT NULL THEN
      -- Marcar como incompleto
      UPDATE public.pasos_fuente_pago
      SET
        completado = FALSE,
        documento_id = NULL,
        fecha_completado = NULL,
        observaciones = COALESCE(observaciones || ' | ', '') ||
          'Invalidado por cambio en monto/entidad el ' || NOW()::DATE::TEXT,
        fecha_actualizacion = NOW()
      WHERE id = v_paso_carta;

      -- Recrear documentos_pendientes
      INSERT INTO public.documentos_pendientes (
        id,
        fuente_pago_id,
        cliente_id,
        tipo_documento,
        estado,
        prioridad,
        metadata,
        fecha_creacion
      )
      SELECT
        gen_random_uuid(),
        NEW.id,
        n.cliente_id,
        'Carta de Aprobación',
        'Pendiente',
        'Crítica',
        jsonb_build_object(
          'paso_id', v_paso_carta,
          'tipo_fuente', NEW.tipo,
          'razon', 'Cambio en monto o entidad',
          'monto_anterior', OLD.monto_aprobado,
          'monto_nuevo', NEW.monto_aprobado,
          'entidad_anterior', OLD.entidad,
          'entidad_nueva', NEW.entidad
        ),
        NOW()
      FROM public.negociaciones n
      WHERE n.id = NEW.negociacion_id
      ON CONFLICT DO NOTHING;

      RAISE NOTICE 'Paso carta_aprobacion invalidado para fuente %', NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS trg_invalidar_pasos_fuente_modificada ON public.fuentes_pago;

CREATE TRIGGER trg_invalidar_pasos_fuente_modificada
  AFTER UPDATE ON public.fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION public.invalidar_pasos_fuente_modificada();

COMMENT ON FUNCTION public.invalidar_pasos_fuente_modificada() IS
  'Invalida pasos cuando cambia el monto o entidad de la fuente';

-- ================================================================
-- RPC FUNCTION: Calcular progreso de fuente de pago
-- ================================================================

CREATE OR REPLACE FUNCTION public.calcular_progreso_fuente_pago(p_fuente_id UUID)
RETURNS TABLE (
  total_pasos INT,
  completados INT,
  pendientes INT,
  porcentaje NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT AS total_pasos,
    COUNT(*) FILTER (WHERE completado = TRUE)::INT AS completados,
    COUNT(*) FILTER (WHERE completado = FALSE)::INT AS pendientes,
    CASE
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(*) FILTER (WHERE completado = TRUE)::NUMERIC / COUNT(*) * 100), 2)
    END AS porcentaje
  FROM public.pasos_fuente_pago
  WHERE fuente_pago_id = p_fuente_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.calcular_progreso_fuente_pago(UUID) IS
  'Calcula el progreso de validación de una fuente de pago (0-100%)';

-- ================================================================
-- RLS POLICIES
-- ================================================================

ALTER TABLE public.pasos_fuente_pago ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir todas las operaciones para usuarios autenticados
-- (RLS simplificado - ajustar según roles si es necesario)
CREATE POLICY "Usuarios autenticados pueden gestionar pasos"
  ON public.pasos_fuente_pago
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ================================================================
-- GRANTS
-- ================================================================

-- Permitir acceso a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pasos_fuente_pago TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pasos_fuente_pago TO service_role;

-- Permitir ejecución de función RPC
GRANT EXECUTE ON FUNCTION public.calcular_progreso_fuente_pago(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calcular_progreso_fuente_pago(UUID) TO service_role;

-- ================================================================
-- VERIFICACIÓN
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada exitosamente';
  RAISE NOTICE '📊 Tabla creada: pasos_fuente_pago';
  RAISE NOTICE '🔄 Triggers creados: 3 (vincular, desvincular, invalidar)';
  RAISE NOTICE '📈 RPC function creada: calcular_progreso_fuente_pago()';
  RAISE NOTICE '🔒 RLS habilitado con policies básicas';
END $$;
