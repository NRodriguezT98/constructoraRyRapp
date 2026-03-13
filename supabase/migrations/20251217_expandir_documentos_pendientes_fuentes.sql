-- ============================================
-- MIGRACIÓN: Expandir Documentos Pendientes para TODOS los Requisitos
-- ============================================
-- Crea pendientes para TODOS los documentos requeridos configurados
-- en requisitos_fuentes_pago_config, no solo cartas de aprobación
-- ============================================

-- 1. REEMPLAZAR función de crear pendientes
CREATE OR REPLACE FUNCTION crear_documentos_pendientes_fuente_completos()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_requisito RECORD;
BEGIN
  -- Solo para INSERT de fuentes que tienen requisitos configurados
  IF TG_OP = 'INSERT' THEN

    -- Obtener cliente_id desde negociacion
    SELECT n.cliente_id INTO v_cliente_id
    FROM negociaciones n
    WHERE n.id = NEW.negociacion_id;

    -- Si no se puede obtener el cliente, salir
    IF v_cliente_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Recorrer TODOS los requisitos configurados para este tipo de fuente
    FOR v_requisito IN
      SELECT
        rfc.id,
        rfc.tipo_documento_sistema,
        rfc.titulo,
        rfc.nivel_validacion,
        rfc.prioridad
      FROM requisitos_fuentes_pago_config rfc
      WHERE rfc.tipo_fuente_id = NEW.tipo_fuente_id
        AND rfc.activo = true
        AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
      ORDER BY
        CASE rfc.nivel_validacion
          WHEN 'DOCUMENTO_OBLIGATORIO' THEN 1
          WHEN 'DOCUMENTO_OPCIONAL' THEN 2
        END,
        rfc.prioridad DESC
    LOOP

      -- Verificar si ya existe un documento subido para este requisito
      -- (usando fuente_pago_relacionada)
      IF NOT EXISTS (
        SELECT 1
        FROM documentos_cliente dc
        WHERE dc.cliente_id = v_cliente_id
          AND dc.fuente_pago_relacionada = NEW.id
          AND dc.tipo_documento = v_requisito.tipo_documento_sistema
          AND dc.estado = 'Activo'
      ) THEN

        -- Insertar pendiente
        INSERT INTO documentos_pendientes (
          fuente_pago_id,
          cliente_id,
          tipo_documento,
          categoria_id, -- Usar ID fijo de categoría apropiada
          metadata,
          prioridad
        ) VALUES (
          NEW.id,
          v_cliente_id,
          v_requisito.titulo, -- Usar título descriptivo del requisito
          '4898e798-c188-4f02-bfcf-b2b15be48e34', -- ID de categoría por defecto
          jsonb_build_object(
            'tipo_fuente', NEW.tipo,
            'entidad', COALESCE(NEW.entidad, ''),
            'monto_aprobado', NEW.monto_aprobado,
            'tipo_documento_sistema', v_requisito.tipo_documento_sistema,
            'nivel_validacion', v_requisito.nivel_validacion,
            'requisito_config_id', v_requisito.id
          ),
          CASE v_requisito.nivel_validacion
            WHEN 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
            WHEN 'DOCUMENTO_OPCIONAL' THEN 'Media'
            ELSE 'Baja'
          END
        )
        ON CONFLICT DO NOTHING; -- Evitar duplicados

      END IF;

    END LOOP;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Reemplazar trigger
DROP TRIGGER IF EXISTS trigger_crear_documento_pendiente ON fuentes_pago;
CREATE TRIGGER trigger_crear_documento_pendiente
  AFTER INSERT ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION crear_documentos_pendientes_fuente_completos();

-- 3. ACTUALIZAR función de vinculación automática
CREATE OR REPLACE FUNCTION vincular_documento_subido_a_pendiente_mejorado()
RETURNS TRIGGER AS $$
DECLARE
  v_pendiente RECORD;
BEGIN
  -- Verificar si el documento tiene fuente_pago_relacionada definida
  IF NEW.fuente_pago_relacionada IS NOT NULL THEN

    -- PRIORIDAD 1: Buscar pendiente por vinculación directa UUID
    SELECT * INTO v_pendiente
    FROM documentos_pendientes dp
    WHERE dp.fuente_pago_id = NEW.fuente_pago_relacionada
      AND dp.cliente_id = NEW.entidad_id
      AND dp.estado = 'Pendiente'
      AND (
        -- Coincidencia exacta por tipo_documento_sistema
        dp.metadata->>'tipo_documento_sistema' = NEW.tipo_documento
        OR
        -- O coincidencia flexible por título similar
        dp.tipo_documento ILIKE '%' || NEW.tipo_documento || '%'
      )
    LIMIT 1;

    -- Si encontró coincidencia → marcar como completado
    IF FOUND THEN

      UPDATE documentos_pendientes
      SET
        estado = 'Completado',
        fecha_completado = NOW(),
        completado_por = auth.uid()
      WHERE id = v_pendiente.id;

      -- Registrar en auditoría
      INSERT INTO audit_log (
        tabla_afectada,
        accion,
        id_registro,
        metadata
      ) VALUES (
        'documentos_pendientes',
        'VINCULACION_AUTOMATICA_UUID',
        v_pendiente.id::TEXT,
        jsonb_build_object(
          'documento_id', NEW.id,
          'fuente_pago_id', NEW.fuente_pago_relacionada,
          'tipo_documento', NEW.tipo_documento
        )
      );

    END IF;

  ELSE

    -- PRIORIDAD 2: Fallback a detección por metadata (método anterior)
    -- Solo si NO tiene fuente_pago_relacionada explícita
    IF NEW.metadata IS NOT NULL AND NEW.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34' THEN

      SELECT * INTO v_pendiente
      FROM documentos_pendientes dp
      WHERE dp.cliente_id = NEW.entidad_id
        AND dp.estado = 'Pendiente'
        AND (dp.metadata->>'tipo_fuente') = (NEW.metadata->>'tipo_fuente')
        AND (
          (dp.metadata->>'entidad') = ''
          OR (dp.metadata->>'entidad') = (NEW.metadata->>'entidad')
        )
      LIMIT 1;

      IF FOUND THEN

        UPDATE documentos_pendientes
        SET
          estado = 'Completado',
          fecha_completado = NOW(),
          completado_por = auth.uid()
        WHERE id = v_pendiente.id;

        -- Registrar con método alternativo
        INSERT INTO audit_log (
          tabla_afectada,
          accion,
          id_registro,
          metadata
        ) VALUES (
          'documentos_pendientes',
          'VINCULACION_AUTOMATICA_METADATA',
          v_pendiente.id::TEXT,
          jsonb_build_object(
            'documento_id', NEW.id,
            'tipo_fuente', NEW.metadata->>'tipo_fuente'
          )
        );

      END IF;

    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reemplazar trigger
DROP TRIGGER IF EXISTS trigger_vincular_documento_automatico ON documentos_cliente;
CREATE TRIGGER trigger_vincular_documento_automatico
  AFTER INSERT ON documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION vincular_documento_subido_a_pendiente_mejorado();

-- 4. Función helper para regenerar pendientes de fuente existente
CREATE OR REPLACE FUNCTION regenerar_pendientes_fuente(p_fuente_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_fuente RECORD;
  v_cliente_id UUID;
  v_requisito RECORD;
  v_insertados INTEGER := 0;
BEGIN
  -- Obtener datos de la fuente
  SELECT fp.*, n.cliente_id INTO v_fuente
  FROM fuentes_pago fp
  JOIN negociaciones n ON n.id = fp.negociacion_id
  WHERE fp.id = p_fuente_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  v_cliente_id := v_fuente.cliente_id;

  -- Recorrer requisitos y crear pendientes faltantes
  FOR v_requisito IN
    SELECT
      rfc.id,
      rfc.tipo_documento_sistema,
      rfc.titulo,
      rfc.nivel_validacion
    FROM requisitos_fuentes_pago_config rfc
    WHERE rfc.tipo_fuente_id = v_fuente.tipo_fuente_id
      AND rfc.activo = true
      AND rfc.nivel_validacion IN ('DOCUMENTO_OBLIGATORIO', 'DOCUMENTO_OPCIONAL')
  LOOP

    -- Solo crear si no existe documento subido Y no existe pendiente
    IF NOT EXISTS (
      SELECT 1
      FROM documentos_cliente dc
      WHERE dc.cliente_id = v_cliente_id
        AND dc.fuente_pago_relacionada = p_fuente_id
        AND dc.tipo_documento = v_requisito.tipo_documento_sistema
        AND dc.estado = 'Activo'
    ) AND NOT EXISTS (
      SELECT 1
      FROM documentos_pendientes dp
      WHERE dp.fuente_pago_id = p_fuente_id
        AND dp.metadata->>'tipo_documento_sistema' = v_requisito.tipo_documento_sistema
        AND dp.estado = 'Pendiente'
    ) THEN

      INSERT INTO documentos_pendientes (
        fuente_pago_id,
        cliente_id,
        tipo_documento,
        categoria_id,
        metadata,
        prioridad
      ) VALUES (
        p_fuente_id,
        v_cliente_id,
        v_requisito.titulo,
        '4898e798-c188-4f02-bfcf-b2b15be48e34',
        jsonb_build_object(
          'tipo_fuente', v_fuente.tipo,
          'entidad', COALESCE(v_fuente.entidad, ''),
          'tipo_documento_sistema', v_requisito.tipo_documento_sistema,
          'nivel_validacion', v_requisito.nivel_validacion
        ),
        CASE v_requisito.nivel_validacion
          WHEN 'DOCUMENTO_OBLIGATORIO' THEN 'Alta'
          ELSE 'Media'
        END
      );

      v_insertados := v_insertados + 1;

    END IF;

  END LOOP;

  RETURN v_insertados;
END;
$$ LANGUAGE plpgsql;

-- 5. Regenerar pendientes para fuentes existentes (migración de datos)
DO $$
DECLARE
  v_fuente RECORD;
  v_total INTEGER := 0;
BEGIN
  FOR v_fuente IN
    SELECT id FROM fuentes_pago WHERE estado = 'Activa'
  LOOP
    v_total := v_total + regenerar_pendientes_fuente(v_fuente.id);
  END LOOP;

  RAISE NOTICE 'Se crearon % documentos pendientes para fuentes existentes', v_total;
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver pendientes agrupados por fuente
SELECT
  fp.tipo as tipo_fuente,
  fp.entidad,
  dp.tipo_documento,
  dp.prioridad,
  dp.metadata->>'nivel_validacion' as nivel,
  COUNT(*) as cantidad
FROM documentos_pendientes dp
JOIN fuentes_pago fp ON fp.id = dp.fuente_pago_id
WHERE dp.estado = 'Pendiente'
GROUP BY fp.tipo, fp.entidad, dp.tipo_documento, dp.prioridad, dp.metadata->>'nivel_validacion'
ORDER BY fp.tipo, dp.prioridad DESC;
