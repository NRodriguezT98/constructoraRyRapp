-- ==================================================
-- MIGRACIÓN: Sistema de Historial de Negociaciones
-- Fecha: 2025-12-03
-- Descripción: Versionado, snapshots, y gestión de fuentes obsoletas
-- ==================================================

-- ==================================================
-- 1. AGREGAR COLUMNAS A NEGOCIACIONES
-- ==================================================

-- Versionado y locking
ALTER TABLE negociaciones
  ADD COLUMN IF NOT EXISTS version_actual INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS version_lock INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS fecha_ultima_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Índices para versiones
CREATE INDEX IF NOT EXISTS idx_negociaciones_version
  ON negociaciones(id, version_actual DESC);

-- ==================================================
-- 2. TABLA: negociaciones_historial (Snapshots)
-- ==================================================

CREATE TABLE IF NOT EXISTS negociaciones_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negociacion_id UUID REFERENCES negociaciones(id) ON DELETE CASCADE NOT NULL,

  -- Versión del snapshot
  version INTEGER NOT NULL,

  -- Snapshot completo
  datos_negociacion JSONB NOT NULL,
  fuentes_pago_snapshot JSONB,
  documentos_snapshot JSONB,

  -- Contexto del cambio
  tipo_cambio VARCHAR(100) NOT NULL,
  razon_cambio TEXT NOT NULL,
  campos_modificados TEXT[],

  -- Comparación (para UI rápida)
  datos_anteriores JSONB,
  datos_nuevos JSONB,

  -- Auditoría
  usuario_id UUID,
  fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_negociacion_version UNIQUE(negociacion_id, version)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historial_negociacion
  ON negociaciones_historial(negociacion_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_historial_fecha
  ON negociaciones_historial(fecha_cambio DESC);

CREATE INDEX IF NOT EXISTS idx_historial_tipo
  ON negociaciones_historial(tipo_cambio);

-- ==================================================
-- 3. AGREGAR COLUMNAS A FUENTES_PAGO
-- ==================================================

ALTER TABLE fuentes_pago
  ADD COLUMN IF NOT EXISTS estado_fuente VARCHAR(20) DEFAULT 'activa'
    CHECK (estado_fuente IN ('activa', 'inactiva', 'reemplazada')),
  ADD COLUMN IF NOT EXISTS reemplazada_por UUID REFERENCES fuentes_pago(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS razon_inactivacion TEXT,
  ADD COLUMN IF NOT EXISTS fecha_inactivacion TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS version_negociacion INTEGER DEFAULT 1 NOT NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_fuentes_estado_fuente
  ON fuentes_pago(estado_fuente);

CREATE INDEX IF NOT EXISTS idx_fuentes_version
  ON fuentes_pago(negociacion_id, version_negociacion);

-- ⚠️ CONSTRAINT CRÍTICO: No permitir eliminar fuentes con dinero recibido
-- Esto es adicional a la validación en código, para seguridad en BD
CREATE OR REPLACE FUNCTION prevent_delete_fuente_con_dinero()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.monto_recibido > 0 THEN
    RAISE EXCEPTION 'PROHIBIDO: No se puede eliminar una fuente de pago que ha recibido dinero ($ %)',
      OLD.monto_recibido
      USING HINT = 'Debe marcar como inactiva en lugar de eliminar';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_delete_fuente_con_dinero ON fuentes_pago;
CREATE TRIGGER trigger_prevent_delete_fuente_con_dinero
  BEFORE DELETE ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_fuente_con_dinero();

-- ==================================================
-- 4. AGREGAR COLUMNAS A DOCUMENTOS_CLIENTE
-- ==================================================

ALTER TABLE documentos_cliente
  ADD COLUMN IF NOT EXISTS estado_documento VARCHAR(20) DEFAULT 'activo'
    CHECK (estado_documento IN ('activo', 'obsoleto', 'archivado')),
  ADD COLUMN IF NOT EXISTS razon_obsolescencia TEXT,
  ADD COLUMN IF NOT EXISTS fuente_pago_relacionada UUID REFERENCES fuentes_pago(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fecha_obsolescencia TIMESTAMP WITH TIME ZONE;

-- Índices
CREATE INDEX IF NOT EXISTS idx_documentos_estado_doc
  ON documentos_cliente(estado_documento);

CREATE INDEX IF NOT EXISTS idx_documentos_fuente_pago
  ON documentos_cliente(fuente_pago_relacionada);

-- Migrar datos existentes: Vincular documentos con fuentes
-- (Usando metadata.fuente_pago_id si existe)
UPDATE documentos_cliente
SET fuente_pago_relacionada = (metadata->>'fuente_pago_id')::uuid
WHERE metadata->>'fuente_pago_id' IS NOT NULL
  AND fuente_pago_relacionada IS NULL;

-- ==================================================
-- 5. TRIGGER: Incrementar version_lock en cada UPDATE
-- ==================================================

CREATE OR REPLACE FUNCTION incrementar_version_lock()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_lock := OLD.version_lock + 1;
  NEW.fecha_ultima_modificacion := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_version_lock ON negociaciones;
CREATE TRIGGER trigger_version_lock
  BEFORE UPDATE ON negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION incrementar_version_lock();

-- ==================================================
-- 6. TRIGGER: Crear Snapshot Automático
-- ==================================================

CREATE OR REPLACE FUNCTION crear_snapshot_negociacion()
RETURNS TRIGGER AS $$
DECLARE
  v_fuentes JSONB;
  v_documentos JSONB;
  v_campos_modificados TEXT[];
  v_tipo_cambio VARCHAR(100);
BEGIN
  -- Solo si hay cambios significativos
  IF (
    OLD.valor_negociado IS DISTINCT FROM NEW.valor_negociado OR
    OLD.descuento_aplicado IS DISTINCT FROM NEW.descuento_aplicado OR
    OLD.estado IS DISTINCT FROM NEW.estado OR
    OLD.vivienda_id IS DISTINCT FROM NEW.vivienda_id
  ) THEN

    -- Incrementar versión
    NEW.version_actual := OLD.version_actual + 1;

    -- Obtener fuentes actuales
    SELECT COALESCE(jsonb_agg(to_jsonb(f)), '[]'::jsonb)
    INTO v_fuentes
    FROM fuentes_pago f
    WHERE f.negociacion_id = NEW.id;

    -- Obtener documentos actuales del cliente
    SELECT COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
    INTO v_documentos
    FROM documentos_cliente d
    WHERE d.cliente_id = NEW.cliente_id
      AND d.estado_documento = 'activo';

    -- Detectar campos modificados
    v_campos_modificados := ARRAY[]::TEXT[];

    IF OLD.valor_negociado IS DISTINCT FROM NEW.valor_negociado THEN
      v_campos_modificados := array_append(v_campos_modificados, 'valor_negociado');
    END IF;

    IF OLD.descuento_aplicado IS DISTINCT FROM NEW.descuento_aplicado THEN
      v_campos_modificados := array_append(v_campos_modificados, 'descuento_aplicado');
    END IF;

    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
      v_campos_modificados := array_append(v_campos_modificados, 'estado');
    END IF;

    IF OLD.vivienda_id IS DISTINCT FROM NEW.vivienda_id THEN
      v_campos_modificados := array_append(v_campos_modificados, 'vivienda_id');
    END IF;

    -- Determinar tipo de cambio
    v_tipo_cambio := CASE
      WHEN 'vivienda_id' = ANY(v_campos_modificados) THEN 'Cambio de Vivienda'
      WHEN 'valor_negociado' = ANY(v_campos_modificados) THEN 'Modificación de Valor'
      WHEN 'descuento_aplicado' = ANY(v_campos_modificados) THEN 'Modificación de Descuento'
      WHEN 'estado' = ANY(v_campos_modificados) THEN 'Cambio de Estado'
      ELSE 'Modificación General'
    END;

    -- Crear snapshot en historial
    INSERT INTO negociaciones_historial (
      negociacion_id,
      version,
      datos_negociacion,
      fuentes_pago_snapshot,
      documentos_snapshot,
      tipo_cambio,
      razon_cambio,
      campos_modificados,
      datos_anteriores,
      datos_nuevos,
      usuario_id,
      fecha_cambio
    ) VALUES (
      NEW.id,
      OLD.version_actual,
      to_jsonb(OLD),
      v_fuentes,
      v_documentos,
      v_tipo_cambio,
      COALESCE(NEW.metadata->>'razon_cambio', 'Sin razón especificada'),
      v_campos_modificados,
      jsonb_build_object(
        'valor_negociado', OLD.valor_negociado,
        'descuento_aplicado', OLD.descuento_aplicado,
        'estado', OLD.estado,
        'vivienda_id', OLD.vivienda_id
      ),
      jsonb_build_object(
        'valor_negociado', NEW.valor_negociado,
        'descuento_aplicado', NEW.descuento_aplicado,
        'estado', NEW.estado,
        'vivienda_id', NEW.vivienda_id
      ),
      NEW.actualizado_por,
      NOW()
    );

    -- Actualizar versión en fuentes_pago
    UPDATE fuentes_pago
    SET version_negociacion = NEW.version_actual
    WHERE negociacion_id = NEW.id
      AND estado_fuente = 'activa';

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_snapshot_negociacion ON negociaciones;
CREATE TRIGGER trigger_snapshot_negociacion
  BEFORE UPDATE ON negociaciones
  FOR EACH ROW
  EXECUTE FUNCTION crear_snapshot_negociacion();

-- ==================================================
-- 7. TRIGGER: Marcar Documentos Obsoletos
-- ==================================================

CREATE OR REPLACE FUNCTION handle_fuente_inactivada()
RETURNS TRIGGER AS $$
DECLARE
  v_documentos_afectados INTEGER;
BEGIN
  -- Solo si cambia de activa a inactiva/reemplazada
  IF OLD.estado_fuente = 'activa' AND NEW.estado_fuente IN ('inactiva', 'reemplazada') THEN

    -- Validar que no tenga dinero recibido
    IF NEW.monto_recibido > 0 THEN
      RAISE EXCEPTION 'PROHIBIDO: No se puede inactivar una fuente con dinero recibido ($ %)',
        NEW.monto_recibido
        USING HINT = 'Esta fuente ya recibió abonos/desembolsos';
    END IF;

    -- Marcar documentos relacionados como obsoletos
    UPDATE documentos_cliente
    SET
      estado_documento = 'obsoleto',
      razon_obsolescencia = COALESCE(
        NEW.razon_inactivacion,
        'Fuente de pago eliminada o reemplazada'
      ),
      fecha_obsolescencia = NOW()
    WHERE
      fuente_pago_relacionada = NEW.id
      AND estado_documento = 'activo';

    GET DIAGNOSTICS v_documentos_afectados = ROW_COUNT;

    -- Auditar cambio en audit_log
    INSERT INTO audit_log (
      tabla_afectada,
      accion,
      registro_id,
      datos_anteriores,
      datos_nuevos,
      metadata
    ) VALUES (
      'fuentes_pago',
      'INACTIVACION',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'razon', NEW.razon_inactivacion,
        'documentos_obsoletos', v_documentos_afectados,
        'tipo', NEW.tipo,
        'monto_aprobado', NEW.monto_aprobado
      )
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_fuente_inactivada ON fuentes_pago;
CREATE TRIGGER trigger_fuente_inactivada
  AFTER UPDATE ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION handle_fuente_inactivada();

-- ==================================================
-- COMENTARIOS
-- ==================================================

COMMENT ON COLUMN negociaciones.version_actual IS 'Versión actual de la negociación (incrementa con cada cambio significativo)';
COMMENT ON COLUMN negociaciones.version_lock IS 'Versión para optimistic locking (evitar conflictos de edición concurrente)';

COMMENT ON COLUMN fuentes_pago.estado_fuente IS 'Estado: activa, inactiva (eliminada con historial), reemplazada (por otra fuente)';
COMMENT ON COLUMN fuentes_pago.reemplazada_por IS 'ID de la nueva fuente que reemplaza a esta (ej: Caja → Mi Casa Ya)';
COMMENT ON COLUMN fuentes_pago.razon_inactivacion IS 'Razón por la cual se inactivó esta fuente';

COMMENT ON COLUMN documentos_cliente.estado_documento IS 'activo: vigente, obsoleto: ya no aplica pero conservado, archivado: guardado sin mostrar';
COMMENT ON COLUMN documentos_cliente.fuente_pago_relacionada IS 'Foreign key a fuente_pago si es carta de aprobación/asignación';

COMMENT ON TABLE negociaciones_historial IS 'Snapshots completos de negociaciones en cada cambio significativo';

-- ==================================================
-- FUNCIONES HELPER
-- ==================================================

-- Función para obtener historial de una negociación
CREATE OR REPLACE FUNCTION obtener_historial_negociacion(p_negociacion_id UUID)
RETURNS TABLE (
  version INTEGER,
  fecha_cambio TIMESTAMP WITH TIME ZONE,
  tipo_cambio VARCHAR(100),
  razon_cambio TEXT,
  campos_modificados TEXT[],
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_nombre TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    nh.version,
    nh.fecha_cambio,
    nh.tipo_cambio,
    nh.razon_cambio,
    nh.campos_modificados,
    nh.datos_anteriores,
    nh.datos_nuevos,
    COALESCE(u.nombres || ' ' || u.apellidos, 'Sistema') as usuario_nombre
  FROM negociaciones_historial nh
  LEFT JOIN usuarios u ON nh.usuario_id = u.id
  WHERE nh.negociacion_id = p_negociacion_id
  ORDER BY nh.version DESC;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- ✅ MIGRACIÓN COMPLETADA
-- ==================================================

-- Verificar tablas creadas
DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de historial de negociaciones instalado';
  RAISE NOTICE '   - Tabla negociaciones_historial creada';
  RAISE NOTICE '   - Triggers de versionado activados';
  RAISE NOTICE '   - Constraint: No eliminar fuentes con dinero';
  RAISE NOTICE '   - Optimistic locking habilitado';
END $$;
