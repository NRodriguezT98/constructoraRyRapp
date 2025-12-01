-- ============================================
-- MIGRACIÓN: Estado de Documentación en Fuentes de Pago
-- ============================================
-- Permite rastrear si una fuente tiene su carta de aprobación subida
-- Útil para flujo: Agregar fuente → Subir carta después
-- ============================================

-- 1. Agregar columna estado_documentacion
ALTER TABLE fuentes_pago
ADD COLUMN IF NOT EXISTS estado_documentacion VARCHAR(50) DEFAULT 'Completo';

-- 2. Crear índice para filtros rápidos
CREATE INDEX IF NOT EXISTS idx_fuentes_pago_estado_documentacion
ON fuentes_pago(estado_documentacion);

-- 3. Comentar columna
COMMENT ON COLUMN fuentes_pago.estado_documentacion IS 'Estado de documentación: Completo | Pendiente Documentación | Sin Documentación Requerida';

-- 4. Actualizar registros existentes
-- Si tiene carta_aprobacion_url → Completo
-- Si NO tiene Y requiere carta → Pendiente Documentación
-- Si NO requiere carta (Cuota Inicial) → Sin Documentación Requerida

UPDATE fuentes_pago
SET estado_documentacion = CASE
  WHEN tipo = 'Cuota Inicial' THEN 'Sin Documentación Requerida'
  WHEN carta_aprobacion_url IS NOT NULL THEN 'Completo'
  WHEN tipo IN ('Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Subsidio Caja Compensación')
    AND carta_aprobacion_url IS NULL THEN 'Pendiente Documentación'
  ELSE 'Completo'
END;

-- 5. Función para actualizar automáticamente al subir/eliminar carta
CREATE OR REPLACE FUNCTION actualizar_estado_documentacion_fuente()
RETURNS TRIGGER AS $$
BEGIN
  -- Al insertar/actualizar carta
  IF NEW.carta_aprobacion_url IS NOT NULL THEN
    NEW.estado_documentacion := 'Completo';
  -- Al eliminar carta
  ELSIF NEW.carta_aprobacion_url IS NULL AND NEW.tipo IN ('Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Subsidio Caja Compensación') THEN
    NEW.estado_documentacion := 'Pendiente Documentación';
  -- Cuota Inicial nunca requiere documentación
  ELSIF NEW.tipo = 'Cuota Inicial' THEN
    NEW.estado_documentacion := 'Sin Documentación Requerida';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para actualización automática
DROP TRIGGER IF EXISTS trigger_actualizar_estado_documentacion ON fuentes_pago;
CREATE TRIGGER trigger_actualizar_estado_documentacion
  BEFORE INSERT OR UPDATE ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_estado_documentacion_fuente();

-- ============================================
-- TABLA: documentos_pendientes
-- ============================================
-- Rastrea documentos que el sistema espera que el usuario suba
-- Se crea automáticamente al agregar fuente sin carta
-- Se elimina automáticamente al detectar documento subido

CREATE TABLE IF NOT EXISTS documentos_pendientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculación
  fuente_pago_id UUID NOT NULL REFERENCES fuentes_pago(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,

  -- Info del documento esperado
  tipo_documento VARCHAR(100) NOT NULL, -- "Carta Aprobación Subsidio", "Carta Crédito Hipotecario", etc
  categoria_id UUID NOT NULL, -- ID de "Cartas de Aprobación"

  -- Metadata para detección automática
  metadata JSONB DEFAULT '{}', -- { tipo_fuente, entidad, vivienda }

  -- Estado
  estado VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente | Completado | Vencido
  prioridad VARCHAR(20) DEFAULT 'Media', -- Alta | Media | Baja

  -- Notificaciones
  recordatorios_enviados INTEGER DEFAULT 0,
  ultima_notificacion TIMESTAMPTZ,

  -- Timestamps
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_limite TIMESTAMPTZ, -- Opcional: fecha límite para subir
  fecha_completado TIMESTAMPTZ,
  completado_por UUID REFERENCES usuarios(id)
);

-- Índices
CREATE INDEX idx_documentos_pendientes_fuente ON documentos_pendientes(fuente_pago_id);
CREATE INDEX idx_documentos_pendientes_cliente ON documentos_pendientes(cliente_id);
CREATE INDEX idx_documentos_pendientes_estado ON documentos_pendientes(estado);
CREATE INDEX idx_documentos_pendientes_metadata ON documentos_pendientes USING GIN (metadata);

-- Comentarios
COMMENT ON TABLE documentos_pendientes IS 'Rastrea documentos que faltan por subir (vinculados a fuentes de pago)';
COMMENT ON COLUMN documentos_pendientes.metadata IS 'JSON con campos para detección: { tipo_fuente, entidad, vivienda, numero_referencia }';

-- ============================================
-- FUNCIÓN: Crear documento pendiente al agregar fuente sin carta
-- ============================================

CREATE OR REPLACE FUNCTION crear_documento_pendiente_si_falta_carta()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_tipo_doc TEXT;
BEGIN
  -- Solo para INSERT de fuentes que requieren carta
  IF TG_OP = 'INSERT' AND NEW.tipo IN ('Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Subsidio Caja Compensación') THEN

    -- Si NO tiene carta → crear pendiente
    IF NEW.carta_aprobacion_url IS NULL THEN

      -- Obtener cliente_id desde negociacion
      SELECT n.cliente_id INTO v_cliente_id
      FROM negociaciones n
      WHERE n.id = NEW.negociacion_id;

      -- Generar nombre descriptivo
      v_tipo_doc := CASE NEW.tipo
        WHEN 'Crédito Hipotecario' THEN 'Carta Aprobación Crédito Hipotecario'
        WHEN 'Subsidio Mi Casa Ya' THEN 'Carta Aprobación Subsidio Mi Casa Ya'
        WHEN 'Subsidio Caja Compensación' THEN 'Carta Aprobación Subsidio Caja'
      END;

      IF NEW.entidad IS NOT NULL THEN
        v_tipo_doc := v_tipo_doc || ' - ' || NEW.entidad;
      END IF;

      -- Insertar pendiente
      INSERT INTO documentos_pendientes (
        fuente_pago_id,
        cliente_id,
        tipo_documento,
        categoria_id, -- ID fijo de "Cartas de Aprobación"
        metadata,
        prioridad
      ) VALUES (
        NEW.id,
        v_cliente_id,
        v_tipo_doc,
        '4898e798-c188-4f02-bfcf-b2b15be48e34', -- ID de categoría "Cartas Aprobación"
        jsonb_build_object(
          'tipo_fuente', NEW.tipo,
          'entidad', COALESCE(NEW.entidad, ''),
          'monto_aprobado', NEW.monto_aprobado
        ),
        'Alta' -- Prioridad alta porque bloquea completitud
      );

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_crear_documento_pendiente ON fuentes_pago;
CREATE TRIGGER trigger_crear_documento_pendiente
  AFTER INSERT ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION crear_documento_pendiente_si_falta_carta();

-- ============================================
-- FUNCIÓN: Detectar y vincular documento subido automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION vincular_documento_subido_a_fuente_pendiente()
RETURNS TRIGGER AS $$
DECLARE
  v_fuente_pendiente RECORD;
  v_metadata JSONB;
BEGIN
  -- Solo para documentos de clientes con categoría "Cartas Aprobación"
  IF NEW.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34' AND NEW.metadata IS NOT NULL THEN

    v_metadata := NEW.metadata;

    -- Buscar documento pendiente que coincida
    SELECT * INTO v_fuente_pendiente
    FROM documentos_pendientes dp
    WHERE dp.cliente_id = NEW.entidad_id
      AND dp.estado = 'Pendiente'
      AND dp.categoria_id = NEW.categoria_id
      -- Coincidencia por tipo_fuente en metadata
      AND (dp.metadata->>'tipo_fuente') = (v_metadata->>'tipo_fuente')
      -- Coincidencia opcional por entidad (si existe)
      AND (
        (dp.metadata->>'entidad') = ''
        OR (dp.metadata->>'entidad') = (v_metadata->>'entidad')
      )
    LIMIT 1;

    -- Si encontró coincidencia → vincular
    IF FOUND THEN

      -- 1. Actualizar fuente_pago con URL del documento
      UPDATE fuentes_pago
      SET
        carta_aprobacion_url = NEW.url,
        estado_documentacion = 'Completo',
        fecha_actualizacion = NOW()
      WHERE id = v_fuente_pendiente.fuente_pago_id;

      -- 2. Marcar pendiente como completado
      UPDATE documentos_pendientes
      SET
        estado = 'Completado',
        fecha_completado = NOW(),
        completado_por = auth.uid() -- Usuario que subió
      WHERE id = v_fuente_pendiente.id;

      -- 3. Registrar en auditoría (opcional)
      INSERT INTO audit_log (
        tabla_afectada,
        accion,
        id_registro,
        metadata
      ) VALUES (
        'fuentes_pago',
        'VINCULACION_AUTOMATICA_DOCUMENTO',
        v_fuente_pendiente.fuente_pago_id::TEXT,
        jsonb_build_object(
          'documento_id', NEW.id,
          'tipo_fuente', v_metadata->>'tipo_fuente',
          'pendiente_id', v_fuente_pendiente.id
        )
      );

    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para documentos_cliente
DROP TRIGGER IF EXISTS trigger_vincular_documento_automatico ON documentos_cliente;
CREATE TRIGGER trigger_vincular_documento_automatico
  AFTER INSERT ON documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION vincular_documento_subido_a_fuente_pendiente();

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver distribución de estados
SELECT
  tipo,
  estado_documentacion,
  COUNT(*) as cantidad,
  COUNT(*) FILTER (WHERE carta_aprobacion_url IS NOT NULL) as con_carta,
  COUNT(*) FILTER (WHERE carta_aprobacion_url IS NULL) as sin_carta
FROM fuentes_pago
GROUP BY tipo, estado_documentacion
ORDER BY tipo, estado_documentacion;

-- Ver documentos pendientes por cliente
SELECT
  c.nombres || ' ' || c.apellidos as cliente,
  dp.tipo_documento,
  dp.prioridad,
  dp.estado,
  dp.metadata->>'tipo_fuente' as tipo_fuente,
  dp.metadata->>'entidad' as entidad,
  dp.fecha_creacion
FROM documentos_pendientes dp
JOIN clientes c ON c.id = dp.cliente_id
WHERE dp.estado = 'Pendiente'
ORDER BY dp.prioridad DESC, dp.fecha_creacion;
