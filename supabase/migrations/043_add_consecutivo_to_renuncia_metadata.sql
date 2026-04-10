-- =====================================================
-- MIGRACIÓN 043: Agregar consecutivo al metadata de renuncias
-- =====================================================
-- MOTIVO:
--   El renderer del historial necesita poder enlazar al
--   expediente de la renuncia (/renuncias/REN-2026-001).
--   La URL usa el campo `consecutivo`, que ya está disponible
--   en v_renuncia (leído post-trigger desde migración 042).
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
  v_tienen_desembolso BOOLEAN;
  v_renuncia_existente UUID;
  v_snapshot_abonos JSONB;
  v_snapshot_cliente JSONB;
  v_snapshot_vivienda JSONB;
  v_snapshot_negociacion JSONB;
  v_renuncia_id UUID;
  v_renuncia RECORD;
  v_proyecto_nombre TEXT;
  v_usuario_label TEXT;
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
  -- ═══════════════════════════════════════
  SELECT EXISTS(
    SELECT 1
    FROM fuentes_pago
    WHERE negociacion_id = p_negociacion_id
      AND tipo IN ('Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Caja de Compensación')
      AND COALESCE(monto_recibido, 0) > 0
  ) INTO v_tienen_desembolso;

  IF v_tienen_desembolso THEN
    RAISE EXCEPTION 'No se puede renunciar: existen fuentes con desembolsos realizados (Crédito Hipotecario, Subsidio o Caja de Compensación)';
  END IF;

  -- ═══════════════════════════════════════
  -- VALIDACIÓN 4: Retención con justificación
  -- ═══════════════════════════════════════
  IF COALESCE(p_retencion_monto, 0) > 0 AND (p_retencion_motivo IS NULL OR TRIM(p_retencion_motivo) = '') THEN
    RAISE EXCEPTION 'Si la retención es mayor a 0, debe proporcionar una justificación';
  END IF;

  -- ═══════════════════════════════════════
  -- RESOLVER NOMBRE + ROL DEL USUARIO
  -- ═══════════════════════════════════════
  SELECT nombres || ' ' || apellidos || ' (' || rol || ')'
    INTO v_usuario_label
    FROM usuarios
    WHERE id = p_usuario_id;

  IF v_usuario_label IS NULL THEN
    SELECT email INTO v_usuario_label FROM auth.users WHERE id = p_usuario_id;
  END IF;

  -- ═══════════════════════════════════════
  -- OBTENER SNAPSHOTS
  -- ═══════════════════════════════════════
  v_snapshot_abonos := obtener_snapshot_abonos(p_negociacion_id);

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

  v_proyecto_nombre := v_snapshot_vivienda->>'proyecto';

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
  -- INSERT RENUNCIA (trigger calcula monto y cierra si = 0)
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
    v_usuario_label
  )
  RETURNING id INTO v_renuncia_id;

  -- ═══════════════════════════════════════
  -- CIERRE AUTOMÁTICO: asignar usuario_cierre
  -- ═══════════════════════════════════════
  UPDATE renuncias
  SET usuario_cierre = v_usuario_label
  WHERE id = v_renuncia_id
    AND estado = 'Cerrada'
    AND usuario_cierre IS NULL;

  -- ═══════════════════════════════════════
  -- CASCADA: Cerrar negociación
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
  -- CASCADA: Actualizar estado del cliente
  -- ═══════════════════════════════════════
  UPDATE clientes
  SET estado = 'Renunció',
      fecha_actualizacion = NOW()
  WHERE id = v_negociacion.cliente_id;

  -- ═══════════════════════════════════════
  -- LEER RENUNCIA POST-TRIGGER
  -- (captura monto_a_devolver calculado + consecutivo asignado)
  -- ═══════════════════════════════════════
  SELECT * INTO v_renuncia
  FROM renuncias
  WHERE id = v_renuncia_id;

  -- ═══════════════════════════════════════
  -- AUDITORÍA (metadata completa con consecutivo)
  -- ═══════════════════════════════════════
  INSERT INTO audit_log (
    tabla,
    registro_id,
    accion,
    usuario_id,
    usuario_email,
    datos_nuevos,
    metadata
  ) VALUES (
    'renuncias',
    v_renuncia_id,
    'CREATE',
    p_usuario_id,
    COALESCE(auth.email(), 'sistema@ryrconstrucciones.com'),
    jsonb_build_object(
      'negociacion_id', p_negociacion_id,
      'cliente_id', v_negociacion.cliente_id,
      'vivienda_id', v_negociacion.vivienda_id,
      'motivo', p_motivo,
      'retencion_monto', p_retencion_monto,
      'monto_a_devolver', v_renuncia.monto_a_devolver,
      'requiere_devolucion', v_renuncia.requiere_devolucion
    ),
    jsonb_build_object(
      -- ✅ CLAVE: cliente_id en metadata para historial service
      'cliente_id', v_negociacion.cliente_id,
      'evento', 'RENUNCIA_REGISTRADA',
      -- ✅ NUEVO: consecutivo para enlace al expediente
      'consecutivo', v_renuncia.consecutivo,
      'motivo', p_motivo,
      'proyecto_nombre', v_proyecto_nombre,
      'vivienda_numero', v_snapshot_vivienda->>'numero',
      'manzana_nombre', v_snapshot_vivienda->>'manzana',
      'cliente_nombre', v_snapshot_cliente->>'nombre_completo',
      'retencion_monto', COALESCE(p_retencion_monto, 0),
      'retencion_motivo', p_retencion_motivo,
      'monto_a_devolver', v_renuncia.monto_a_devolver,
      'requiere_devolucion', v_renuncia.requiere_devolucion,
      'estado_renuncia', v_renuncia.estado
    )
  );

  -- ═══════════════════════════════════════
  -- RETORNO
  -- ═══════════════════════════════════════
  RETURN jsonb_build_object(
    'success', true,
    'renuncia_id', v_renuncia_id,
    'consecutivo', v_renuncia.consecutivo,
    'estado', v_renuncia.estado,
    'monto_a_devolver', v_renuncia.monto_a_devolver,
    'requiere_devolucion', v_renuncia.requiere_devolucion
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
