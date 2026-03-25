-- =====================================================
-- MIGRACIÓN 033: Fix valid_accion constraint en audit INSERT
-- =====================================================
-- Problema: RPC usa accion='RENUNCIA_REGISTRADA' pero el constraint
--   valid_accion solo permite ('CREATE', 'UPDATE', 'DELETE')
-- Fix: usar accion='CREATE' y poner identificador en metadata
--
-- Estado verificado de la BD (diagnosticar-renuncia-union.sql):
--   - valid_accion: ('CREATE', 'UPDATE', 'DELETE') ← único cambio necesario
--   - renuncias triggers: calcular_monto_devolver (BEFORE INSERT) ← OK
--   - negociaciones estado: Activa|Suspendida|Cerrada por Renuncia|Completada ← OK
--   - usuario_email: NOT NULL ← OK (ya corregido en 032 con COALESCE)
--   - renuncias_audit_trigger: NO existe en live DB ← no interfiere
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
  -- Columna real: monto_recibido (monto_desembolsado no existe)
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
  -- OBTENER SNAPSHOTS
  -- Columnas verificadas contra schema real:
  --   clientes: nombre_completo, numero_documento, tipo_documento, telefono, email, estado
  --   viviendas: numero, estado, valor_total, area → manzanas.nombre → proyectos.nombre
  --   negociaciones: estado, valor_total, saldo_pendiente, fecha_creacion
  --   fuentes_pago (snapshot): fecha_resolucion, fecha_completado (NO fecha_aprobacion/fecha_desembolso)
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
  -- INSERT RENUNCIA
  -- Trigger calcular_monto_devolver (BEFORE INSERT) calcula:
  --   monto_a_devolver, requiere_devolucion, estado, fecha_cierre
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
  -- CASCADA: Cerrar negociación
  -- Estado 'Cerrada por Renuncia' está en el constraint de negociaciones ✅
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
  -- Constraint valid_accion: solo ('CREATE', 'UPDATE', 'DELETE')
  -- → usar 'CREATE' (es una creación del registro de renuncia)
  -- → identificar como renuncia vía campo "evento" en metadata
  -- fecha_evento tiene DEFAULT now() → no incluir
  -- usuario_email es NOT NULL → COALESCE con fallback
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
      'retencion_monto', p_retencion_monto
    ),
    jsonb_build_object(
      'evento', 'RENUNCIA_REGISTRADA',
      'proyecto', v_proyecto_nombre,
      'cliente_nombre', v_snapshot_cliente->>'nombre_completo',
      'vivienda_numero', v_snapshot_vivienda->>'numero'
    )
  );

  -- ═══════════════════════════════════════
  -- RETORNO
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
'RPC atómica: valida, genera snapshots, inserta renuncia, y ejecuta cascada (negociación→Cerrada por Renuncia, vivienda→Disponible, fuentes→Inactiva, auditoría). Migración 033: columnas verificadas, accion=CREATE, evento en metadata.';
