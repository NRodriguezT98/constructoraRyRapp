-- ================================================================
-- MIGRACIÓN: Sistema de Validación de Fuentes de Pago
-- ================================================================
-- Fecha: 2025-12-11
-- Autor: Sistema RyR
-- Descripción:
--   - Tabla para pasos de validación por fuente de pago
--   - Triggers automáticos de vinculación con documentos
--   - Integración con sistema de documentos pendientes
--
-- Funcionalidades:
--   1. Progreso visual por fuente de pago
--   2. Vinculación automática documento -> paso
--   3. Recreación de pendientes al eliminar documento
--   4. Invalidación de pasos al modificar fuente
-- ================================================================

-- ================================================================
-- TABLA: pasos_fuente_pago
-- ================================================================

CREATE TABLE IF NOT EXISTS public.pasos_fuente_pago (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fuente_pago_negociacion_id UUID NOT NULL REFERENCES public.fuentes_pago(id) ON DELETE CASCADE,

  -- Identificación del paso
  paso VARCHAR(50) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  nivel_validacion VARCHAR(50) NOT NULL CHECK (nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL', 'SOLO_CONFIRMACION')),
  orden INT NOT NULL,

  -- Estado
  completado BOOLEAN DEFAULT FALSE,
  fecha_completado TIMESTAMP WITH TIME ZONE,

  -- Vinculación con sistema de documentos
  tipo_documento_requerido VARCHAR(100),
  categoria_documento VARCHAR(50),
  documento_id UUID REFERENCES public.documentos_proyecto(id) ON DELETE SET NULL,

  -- Metadata
  observaciones TEXT,
  completado_automaticamente BOOLEAN DEFAULT FALSE,
  usuario_completo_id UUID REFERENCES auth.users(id),

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(fuente_pago_negociacion_id, paso)
);

-- Índices para performance
CREATE INDEX idx_pasos_fuente_pago_fuente ON public.pasos_fuente_pago(fuente_pago_negociacion_id);
CREATE INDEX idx_pasos_fuente_pago_completado ON public.pasos_fuente_pago(completado);
CREATE INDEX idx_pasos_fuente_pago_documento ON public.pasos_fuente_pago(documento_id) WHERE documento_id IS NOT NULL;

-- Comentarios
COMMENT ON TABLE public.pasos_fuente_pago IS 'Pasos de validación que deben completarse antes de desembolsar una fuente de pago';
COMMENT ON COLUMN public.pasos_fuente_pago.nivel_validacion IS 'DOCUMENTO_OBLIGATORIO: debe subir doc | DOCUMENTO_OPCIONAL: doc opcional | SOLO_CONFIRMACION: solo marcar checkbox';
COMMENT ON COLUMN public.pasos_fuente_pago.completado_automaticamente IS 'TRUE si fue completado por trigger al subir documento';

-- ================================================================
-- FUNCIÓN: Vincular documento subido con paso de fuente de pago
-- ================================================================

CREATE OR REPLACE FUNCTION public.vincular_documento_a_paso_fuente()
RETURNS TRIGGER AS $$
DECLARE
  v_fuente_id UUID;
  v_paso_id UUID;
  v_tipo_fuente VARCHAR(100);
BEGIN
  -- Solo procesar documentos relevantes para fuentes de pago
  IF NEW.tipo_documento NOT IN (
    'Carta de Aprobación Crédito',
    'Carta Asignación Subsidio',
    'Avalúo',
    'Factura Notaría',
    'Boleta de Registro',
    'Solicitud Desembolso'
  ) THEN
    RETURN NEW;
  END IF;

  -- Mapear tipo de documento a tipo de fuente
  v_tipo_fuente := CASE
    WHEN NEW.tipo_documento = 'Carta de Aprobación Crédito' THEN 'Crédito Hipotecario'
    WHEN NEW.tipo_documento = 'Carta Asignación Subsidio' AND NEW.metadata->>'entidad' LIKE '%Caja%' THEN 'Subsidio Caja de Compensación'
    WHEN NEW.tipo_documento = 'Carta Asignación Subsidio' THEN 'Subsidio Mi Casa Ya'
    ELSE NULL
  END;

  IF v_tipo_fuente IS NULL THEN
    RETURN NEW; -- No se puede mapear
  END IF;

  -- Buscar fuente de pago activa más reciente que coincida
  SELECT fp.id INTO v_fuente_id
  FROM public.fuentes_pago fp
  JOIN public.negociaciones n ON n.id = fp.negociacion_id
  WHERE n.cliente_id = NEW.cliente_id
    AND fp.tipo = v_tipo_fuente
    AND n.estado = 'Activa'
  ORDER BY fp.created_at DESC
  LIMIT 1;

  IF v_fuente_id IS NULL THEN
    RETURN NEW; -- No hay fuente de pago para vincular
  END IF;

  -- Buscar paso pendiente que espera este tipo de documento
  SELECT id INTO v_paso_id
  FROM public.pasos_fuente_pago
  WHERE fuente_pago_negociacion_id = v_fuente_id
    AND tipo_documento_requerido = NEW.tipo_documento
    AND (documento_id IS NULL OR NOT completado)
  ORDER BY orden ASC
  LIMIT 1;

  IF v_paso_id IS NOT NULL THEN
    -- ⭐ ACTUALIZAR PASO AUTOMÁTICAMENTE
    UPDATE public.pasos_fuente_pago
    SET
      documento_id = NEW.id,
      completado = TRUE,
      fecha_completado = NOW(),
      completado_automaticamente = TRUE,
      updated_at = NOW()
    WHERE id = v_paso_id;

    -- ⭐ ELIMINAR DOCUMENTO PENDIENTE (ya se subió)
    DELETE FROM public.documentos_pendientes
    WHERE cliente_id = NEW.cliente_id
      AND tipo_documento = NEW.tipo_documento
      AND fuente_pago_id = v_fuente_id;

    -- Log de auditoría
    INSERT INTO public.audit_log (
      tabla_afectada,
      accion,
      registro_id,
      detalles,
      usuario_id,
      fecha
    ) VALUES (
      'pasos_fuente_pago',
      'COMPLETADO_AUTOMATICO',
      v_paso_id,
      jsonb_build_object(
        'paso_id', v_paso_id,
        'documento_id', NEW.id,
        'tipo_documento', NEW.tipo_documento,
        'fuente_pago_id', v_fuente_id,
        'mensaje', 'Paso completado automáticamente al subir documento'
      ),
      auth.uid(),
      NOW()
    );

    RAISE NOTICE 'Paso % completado automáticamente para fuente %', v_paso_id, v_fuente_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se ejecuta DESPUÉS de insertar un documento
DROP TRIGGER IF EXISTS trg_vincular_documento_a_paso ON public.documentos_proyecto;
CREATE TRIGGER trg_vincular_documento_a_paso
  AFTER INSERT ON public.documentos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION public.vincular_documento_a_paso_fuente();

-- ================================================================
-- FUNCIÓN: Desvincular documento de paso al eliminarlo
-- ================================================================

CREATE OR REPLACE FUNCTION public.desvincular_documento_de_paso()
RETURNS TRIGGER AS $$
DECLARE
  v_paso RECORD;
  v_cliente_id UUID;
BEGIN
  -- Buscar todos los pasos vinculados a este documento
  FOR v_paso IN
    SELECT pf.*, fp.negociacion_id
    FROM public.pasos_fuente_pago pf
    JOIN public.fuentes_pago fp ON fp.id = pf.fuente_pago_negociacion_id
    WHERE pf.documento_id = OLD.id
  LOOP
    -- Obtener cliente_id
    SELECT cliente_id INTO v_cliente_id
    FROM public.negociaciones
    WHERE id = v_paso.negociacion_id;

    -- Marcar paso como incompleto solo si es obligatorio
    IF v_paso.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN
      UPDATE public.pasos_fuente_pago
      SET
        documento_id = NULL,
        completado = FALSE,
        fecha_completado = NULL,
        completado_automaticamente = FALSE,
        observaciones = CONCAT(
          COALESCE(observaciones || E'\n', ''),
          '⚠️ Documento eliminado el ',
          TO_CHAR(NOW(), 'DD-MM-YYYY HH24:MI'),
          ' - Paso marcado como pendiente'
        ),
        updated_at = NOW()
      WHERE id = v_paso.id;

      -- Recrear documento pendiente
      INSERT INTO public.documentos_pendientes (
        cliente_id,
        tipo_documento,
        categoria,
        fuente_pago_id,
        prioridad,
        motivo,
        created_at
      ) VALUES (
        v_cliente_id,
        v_paso.tipo_documento_requerido,
        v_paso.categoria_documento,
        v_paso.fuente_pago_negociacion_id,
        'Alta',
        'Documento eliminado - requiere resubir',
        NOW()
      )
      ON CONFLICT (cliente_id, tipo_documento, fuente_pago_id) DO NOTHING;

      -- Log de auditoría
      INSERT INTO public.audit_log (
        tabla_afectada,
        accion,
        registro_id,
        detalles,
        usuario_id,
        fecha
      ) VALUES (
        'pasos_fuente_pago',
        'DESVINCULADO',
        v_paso.id,
        jsonb_build_object(
          'paso_id', v_paso.id,
          'documento_eliminado_id', OLD.id,
          'tipo_documento', OLD.tipo_documento,
          'motivo', 'Documento eliminado por usuario',
          'pendiente_recreado', TRUE
        ),
        auth.uid(),
        NOW()
      );
    END IF;
  END LOOP;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se ejecuta ANTES de eliminar un documento
DROP TRIGGER IF EXISTS trg_desvincular_documento_de_paso ON public.documentos_proyecto;
CREATE TRIGGER trg_desvincular_documento_de_paso
  BEFORE DELETE ON public.documentos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION public.desvincular_documento_de_paso();

-- ================================================================
-- FUNCIÓN: Invalidar pasos al modificar fuente de pago
-- ================================================================

CREATE OR REPLACE FUNCTION public.invalidar_pasos_fuente_modificada()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_requiere_nueva_carta BOOLEAN := FALSE;
  v_motivo TEXT;
BEGIN
  -- Detectar si requiere nueva carta de aprobación
  IF (OLD.monto != NEW.monto AND ABS(OLD.monto - NEW.monto) > 1000000) THEN
    v_requiere_nueva_carta := TRUE;
    v_motivo := FORMAT('Monto modificado de $%s a $%s',
      TO_CHAR(OLD.monto, 'FM999,999,999'),
      TO_CHAR(NEW.monto, 'FM999,999,999')
    );
  ELSIF (OLD.entidad IS DISTINCT FROM NEW.entidad) THEN
    v_requiere_nueva_carta := TRUE;
    v_motivo := FORMAT('Entidad modificada de "%s" a "%s"',
      COALESCE(OLD.entidad, 'N/A'),
      COALESCE(NEW.entidad, 'N/A')
    );
  END IF;

  IF v_requiere_nueva_carta AND NEW.tipo != 'Cuota Inicial' THEN
    -- Obtener cliente_id
    SELECT cliente_id INTO v_cliente_id
    FROM public.negociaciones
    WHERE id = NEW.negociacion_id;

    -- Invalidar paso de carta de aprobación
    UPDATE public.pasos_fuente_pago
    SET
      completado = FALSE,
      fecha_completado = NULL,
      documento_id = NULL,
      observaciones = CONCAT(
        COALESCE(observaciones || E'\n', ''),
        '⚠️ ', v_motivo, ' - Requiere nueva carta de aprobación'
      ),
      updated_at = NOW()
    WHERE fuente_pago_negociacion_id = NEW.id
      AND paso IN ('carta_aprobacion', 'carta_asignacion');

    -- Recrear documento pendiente
    INSERT INTO public.documentos_pendientes (
      cliente_id,
      tipo_documento,
      categoria,
      fuente_pago_id,
      prioridad,
      motivo,
      created_at
    ) VALUES (
      v_cliente_id,
      CASE
        WHEN NEW.tipo = 'Crédito Hipotecario' THEN 'Carta de Aprobación Crédito'
        WHEN NEW.tipo LIKE 'Subsidio%' THEN 'Carta Asignación Subsidio'
      END,
      'credito-hipotecario',
      NEW.id,
      'Alta',
      v_motivo,
      NOW()
    )
    ON CONFLICT (cliente_id, tipo_documento, fuente_pago_id) DO NOTHING;

    -- Log de auditoría
    INSERT INTO public.audit_log (
      tabla_afectada,
      accion,
      registro_id,
      detalles,
      usuario_id,
      fecha
    ) VALUES (
      'fuentes_pago',
      'MODIFICACION_REQUIERE_NUEVA_CARTA',
      NEW.id,
      jsonb_build_object(
        'fuente_id', NEW.id,
        'tipo_fuente', NEW.tipo,
        'motivo', v_motivo,
        'monto_anterior', OLD.monto,
        'monto_nuevo', NEW.monto,
        'entidad_anterior', OLD.entidad,
        'entidad_nueva', NEW.entidad
      ),
      auth.uid(),
      NOW()
    );

    RAISE NOTICE 'Fuente % modificada: %', NEW.id, v_motivo;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se ejecuta DESPUÉS de actualizar una fuente
DROP TRIGGER IF EXISTS trg_invalidar_pasos_fuente_modificada ON public.fuentes_pago;
CREATE TRIGGER trg_invalidar_pasos_fuente_modificada
  AFTER UPDATE ON public.fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION public.invalidar_pasos_fuente_modificada();

-- ================================================================
-- POLÍTICAS RLS
-- ================================================================

ALTER TABLE public.pasos_fuente_pago ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Ver pasos de fuentes de negociaciones accesibles
CREATE POLICY "Usuarios pueden ver pasos de sus fuentes"
  ON public.pasos_fuente_pago
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.fuentes_pago fp
      JOIN public.negociaciones n ON n.id = fp.negociacion_id
      WHERE fp.id = fuente_pago_negociacion_id
    )
  );

-- Policy: INSERT - Crear pasos (sistema automático + admin)
CREATE POLICY "Sistema puede crear pasos"
  ON public.pasos_fuente_pago
  FOR INSERT
  WITH CHECK (true);

-- Policy: UPDATE - Actualizar pasos
CREATE POLICY "Usuarios pueden actualizar pasos"
  ON public.pasos_fuente_pago
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.fuentes_pago fp
      JOIN public.negociaciones n ON n.id = fp.negociacion_id
      WHERE fp.id = fuente_pago_negociacion_id
    )
  );

-- Policy: DELETE - Solo admin puede eliminar pasos
CREATE POLICY "Solo admin puede eliminar pasos"
  ON public.pasos_fuente_pago
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );

-- ================================================================
-- FUNCIÓN AUXILIAR: Calcular progreso de fuente de pago
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
    COUNT(*) FILTER (WHERE completado)::INT AS completados,
    COUNT(*) FILTER (WHERE NOT completado)::INT AS pendientes,
    ROUND(
      (COUNT(*) FILTER (WHERE completado)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      0
    ) AS porcentaje
  FROM public.pasos_fuente_pago
  WHERE fuente_pago_negociacion_id = p_fuente_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================================
-- DATOS INICIALES: Crear pasos para fuentes existentes
-- ================================================================
-- Esto se ejecutará en el servicio de negociaciones
-- No crear datos aquí para evitar inconsistencias

-- ================================================================
-- FIN DE MIGRACIÓN
-- ================================================================
