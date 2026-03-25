-- =====================================================
-- MIGRACIÓN 030: Fix columna monto_desembolsado → monto_recibido
-- en RPC registrar_renuncia_completa
-- =====================================================
-- Problema: La función usa COALESCE(monto_desembolsado, 0) pero esa
-- columna no existe en fuentes_pago. La columna correcta es monto_recibido.
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_renuncia_completa(
  p_negociacion_id UUID,
  p_motivo TEXT,
  p_retencion_monto NUMERIC DEFAULT 0,
  p_retencion_motivo TEXT DEFAULT NULL,
  p_notas TEXT DEFAULT NULL,
  p_usuario_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_negociacion RECORD;
  v_cliente RECORD;
  v_vivienda RECORD;
  v_proyecto_nombre TEXT;
  v_tiene_desembolso BOOLEAN;
  v_renuncia_existente UUID;
  v_snapshot_abonos JSONB;
  v_snapshot_cliente JSONB;
  v_snapshot_vivienda JSONB;
  v_snapshot_negociacion JSONB;
  v_renuncia_id UUID;
  v_renuncia RECORD;
BEGIN
  -- ═══════════════════════════════════════
  -- VALIDACIÓN 1: Negociación existe y estado válido
  -- ═══════════════════════════════════════
  SELECT n.*, c.id AS cli_id, v.id AS viv_id
  INTO v_negociacion
  FROM negociaciones n
  INNER JOIN clientes c ON c.id = n.cliente_id
  INNER JOIN viviendas v ON v.id = n.vivienda_id
  WHERE n.id = p_negociacion_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Negociación no encontrada: %', p_negociacion_id;
  END IF;

  IF v_negociacion.estado NOT IN ('Activa', 'Suspendida') THEN
    RAISE EXCEPTION 'Solo se pueden renunciar negociaciones Activas o Suspendidas. Estado actual: %', v_negociacion.estado;
  END IF;

  -- ═══════════════════════════════════════
  -- VALIDACIÓN 2: Sin renuncia previa
  -- ═══════════════════════════════════════
  SELECT id INTO v_renuncia_existente
  FROM renuncias
  WHERE negociacion_id = p_negociacion_id;

  IF FOUND THEN
    RAISE EXCEPTION 'Ya existe una renuncia para esta negociación';
  END IF;

  -- ═══════════════════════════════════════
  -- VALIDACIÓN 3: Sin desembolsos bloqueantes
  -- (monto_recibido en lugar de monto_desembolsado que no existe)
  -- ═══════════════════════════════════════
  SELECT EXISTS(
    SELECT 1
    FROM fuentes_pago
    WHERE negociacion_id = p_negociacion_id
      AND tipo IN ('Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Caja de Compensación')
      AND COALESCE(monto_recibido, 0) > 0
  ) INTO v_tiene_desembolso;

  IF v_tiene_desembolso THEN
    RAISE EXCEPTION 'No se puede renunciar: existen fuentes con desembolsos realizados (Crédito Hipotecario, Subsidio o Caja de Compensación)';
  END IF;

  -- ═══════════════════════════════════════
  -- VALIDACIÓN 4: Retención con justificación
  -- ═══════════════════════════════════════
  IF COALESCE(p_retencion_monto, 0) > 0 AND (p_retencion_motivo IS NULL OR TRIM(p_retencion_motivo) = '') THEN
    RAISE EXCEPTION 'Si la retención es mayor a 0, debe proporcionar una justificación';
  END IF;

  -- ═══════════════════════════════════════
  -- OBTENER SNAPSHOTS
  -- ═══════════════════════════════════════

  -- Snapshot de abonos (fuentes de pago)
  v_snapshot_abonos := obtener_snapshot_abonos(p_negociacion_id);

  -- Snapshot del cliente
  SELECT jsonb_build_object(
    'id', c.id,
    'nombre_completo', c.nombre_completo,
    'numero_documento', c.numero_documento,
    'tipo_documento', c.tipo_documento,
    'telefono', c.telefono,
    'email', c.email,
    'estado', c.estado
  ) INTO v_snapshot_cliente
  FROM clientes c
  WHERE c.id = v_negociacion.cliente_id;

  -- Snapshot de vivienda
  SELECT jsonb_build_object(
    'id', v.id,
    'numero', v.numero,
    'estado', v.estado,
    'valor_total', v.valor_total,
    'area', v.area,
    'manzana', m.nombre,
    'proyecto', p.nombre
  ) INTO v_snapshot_vivienda
  FROM viviendas v
  INNER JOIN manzanas m ON m.id = v.manzana_id
  INNER JOIN proyectos p ON p.id = m.proyecto_id
  WHERE v.id = v_negociacion.vivienda_id;

  -- Extraer nombre de proyecto
  v_proyecto_nombre := v_snapshot_vivienda->>'proyecto';

  -- Snapshot de negociación
  SELECT jsonb_build_object(
    'id', n.id,
    'estado', n.estado,
    'valor_total', n.valor_total,
    'saldo_pendiente', n.saldo_pendiente,
    'fecha_creacion', n.fecha_creacion
  ) INTO v_snapshot_negociacion
  FROM negociaciones n
  WHERE n.id = p_negociacion_id;

  -- ═══════════════════════════════════════
  -- INSERT RENUNCIA (trigger calcula montos)
  -- ═══════════════════════════════════════
  INSERT INTO renuncias (
    negociacion_id,
    vivienda_id,
    cliente_id,
    motivo,
    fecha_renuncia,
    retencion_monto,
    retencion_motivo,
    notas_cierre,
    vivienda_valor_snapshot,
    vivienda_datos_snapshot,
    cliente_datos_snapshot,
    negociacion_datos_snapshot,
    abonos_snapshot,
    usuario_registro
  ) VALUES (
    p_negociacion_id,
    v_negociacion.vivienda_id,
    v_negociacion.cliente_id,
    TRIM(p_motivo),
    NOW(),
    COALESCE(p_retencion_monto, 0),
    CASE WHEN COALESCE(p_retencion_monto, 0) > 0 THEN TRIM(p_retencion_motivo) ELSE NULL END,
    TRIM(NULLIF(p_notas, '')),
    (v_snapshot_vivienda->>'valor_total')::NUMERIC,
    v_snapshot_vivienda,
    v_snapshot_cliente,
    v_snapshot_negociacion,
    v_snapshot_abonos,
    p_usuario_id
  )
  RETURNING id INTO v_renuncia_id;

  -- ═══════════════════════════════════════
  -- CASCADA: Actualizar negociación
  -- ═══════════════════════════════════════
  UPDATE negociaciones
  SET estado = 'Cerrada por Renuncia',
      fecha_renuncia_efectiva = NOW(),
      fecha_actualizacion = NOW()
  WHERE id = p_negociacion_id;

  -- ═══════════════════════════════════════
  -- CASCADA: Liberar vivienda
  -- ═══════════════════════════════════════
  UPDATE viviendas
  SET estado = 'Disponible',
      cliente_id = NULL,
      negociacion_id = NULL,
      fecha_actualizacion = NOW()
  WHERE id = v_negociacion.vivienda_id;

  -- ═══════════════════════════════════════
  -- CASCADA: Inactivar fuentes de pago
  -- ═══════════════════════════════════════
  UPDATE fuentes_pago
  SET estado = 'Inactiva',
      fecha_actualizacion = NOW()
  WHERE negociacion_id = p_negociacion_id;

  -- ═══════════════════════════════════════
  -- AUDITORÍA
  -- ═══════════════════════════════════════
  INSERT INTO audit_log (
    tabla,
    registro_id,
    accion,
    usuario_id,
    datos_nuevos,
    metadata,
    fecha
  ) VALUES (
    'renuncias',
    v_renuncia_id,
    'RENUNCIA_REGISTRADA',
    p_usuario_id,
    jsonb_build_object(
      'negociacion_id', p_negociacion_id,
      'cliente_id', v_negociacion.cliente_id,
      'vivienda_id', v_negociacion.vivienda_id,
      'motivo', p_motivo,
      'retencion_monto', p_retencion_monto
    ),
    jsonb_build_object(
      'proyecto', v_proyecto_nombre,
      'cliente_nombre', v_snapshot_cliente->>'nombre_completo',
      'vivienda_numero', v_snapshot_vivienda->>'numero'
    ),
    NOW()
  );

  -- ═══════════════════════════════════════
  -- RETORNAR RENUNCIA COMPLETA
  -- ═══════════════════════════════════════
  SELECT * INTO v_renuncia
  FROM renuncias
  WHERE id = v_renuncia_id;

  RETURN jsonb_build_object(
    'id', v_renuncia.id,
    'negociacion_id', v_renuncia.negociacion_id,
    'vivienda_id', v_renuncia.vivienda_id,
    'cliente_id', v_renuncia.cliente_id,
    'motivo', v_renuncia.motivo,
    'fecha_renuncia', v_renuncia.fecha_renuncia,
    'estado', v_renuncia.estado,
    'monto_a_devolver', v_renuncia.monto_a_devolver,
    'requiere_devolucion', v_renuncia.requiere_devolucion,
    'retencion_monto', v_renuncia.retencion_monto,
    'retencion_motivo', v_renuncia.retencion_motivo
  );
END;
$$;

COMMENT ON FUNCTION registrar_renuncia_completa IS
'RPC atómica: valida, genera snapshots, inserta renuncia, y ejecuta cascada (negociación, vivienda, fuentes, auditoría). Todo o nada.';
