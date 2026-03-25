-- ====================================================================
-- MIGRACIÓN: Fix trigger handle_fuente_inactivada bloquea renuncias
-- ====================================================================
--
-- PROBLEMA:
--   Al registrar una renuncia, registrar_renuncia_completa intenta
--   inactivar las fuentes de pago (UPDATE fuentes_pago SET estado = 'Inactiva').
--   El trigger_sincronizar_estado_fuente convierte esto a estado_fuente = 'inactiva',
--   lo que dispara handle_fuente_inactivada, que bloquea el UPDATE si
--   monto_recibido > 0 con RAISE EXCEPTION 'PROHIBIDO: ...'.
--
-- CAUSA RAÍZ:
--   handle_fuente_inactivada protege contra inactivaciones manuales accidentales,
--   pero NO debe bloquear el proceso de renuncia (que es una operación
--   administrativa legítima con validaciones propias en VALIDACIÓN 3).
--
-- SOLUCIÓN:
--   1. En registrar_renuncia_completa: activar variable de sesión
--      'app.renuncia_en_curso' = 'true' antes del UPDATE fuentes_pago.
--   2. En handle_fuente_inactivada: saltar el RAISE EXCEPTION cuando
--      app.renuncia_en_curso = 'true' (la validación ya la hizo la función).
--
-- La variable es LOCAL a la transacción (set_config(..., true)) → reset
-- automático al finalizar, sin riesgo de bypass en otras operaciones.
--
-- Fecha: 2026-03-25
-- ====================================================================


-- ====================================================================
-- PASO 1: Actualizar handle_fuente_inactivada con bypass de renuncia
-- ====================================================================
CREATE OR REPLACE FUNCTION handle_fuente_inactivada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_documentos_afectados INTEGER;
  v_usuario_email TEXT;
  v_es_renuncia BOOLEAN;
BEGIN
  -- Solo si cambia de activa a inactiva/reemplazada
  IF OLD.estado_fuente = 'activa' AND NEW.estado_fuente IN ('inactiva', 'reemplazada') THEN

    -- ✅ NUEVO: Verificar si estamos en contexto de renuncia
    --    set_config('app.renuncia_en_curso', 'true', true) debe haber sido
    --    llamado antes por registrar_renuncia_completa en la misma transacción.
    v_es_renuncia := current_setting('app.renuncia_en_curso', true) = 'true';

    -- Validar que no tenga dinero recibido
    -- SKIP esta validación si es una renuncia (la función ya hizo sus propias validaciones)
    IF NEW.monto_recibido > 0 AND NOT v_es_renuncia THEN
      RAISE EXCEPTION 'PROHIBIDO: No se puede inactivar una fuente con dinero recibido ($ %)',
        NEW.monto_recibido
        USING HINT = 'Esta fuente ya recibió abonos/desembolsos';
    END IF;

    -- ✅ Obtener email del usuario autenticado
    SELECT COALESCE(
      auth.email(),
      'sistema@constructoraryr.com'
    ) INTO v_usuario_email;

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

    -- Auditar cambio con usuario_email
    INSERT INTO audit_log (
      tabla,
      accion,
      registro_id,
      usuario_email,
      datos_anteriores,
      datos_nuevos,
      metadata
    ) VALUES (
      'fuentes_pago',
      'UPDATE',
      NEW.id,
      v_usuario_email,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'operacion', CASE WHEN v_es_renuncia THEN 'INACTIVACION_POR_RENUNCIA' ELSE 'INACTIVACION' END,
        'razon', NEW.razon_inactivacion,
        'documentos_obsoletos', v_documentos_afectados,
        'tipo', NEW.tipo,
        'monto_aprobado', NEW.monto_aprobado,
        'monto_recibido', NEW.monto_recibido
      )
    );

  END IF;

  RETURN NEW;
END;
$$;


-- ====================================================================
-- PASO 2: Actualizar registrar_renuncia_completa con bypass de sesión
-- ====================================================================
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
  -- VALIDACIÓN 3: Sin desembolsos bloqueantes (fuentes externas)
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
  -- ✅ FIX: Activar bypass de sesión ANTES del UPDATE para que
  --    handle_fuente_inactivada no bloquee fuentes con monto_recibido > 0.
  --    La variable es LOCAL a esta transacción → reset automático al terminar.
  -- ═══════════════════════════════════════
  PERFORM set_config('app.renuncia_en_curso', 'true', true);

  UPDATE fuentes_pago
  SET estado = 'Inactiva',
      razon_inactivacion = 'Renuncia de negociación',
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
  -- AUDITORÍA
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
    'success', true,
    'renuncia_id', v_renuncia_id,
    'estado', v_renuncia.estado,
    'monto_a_devolver', v_renuncia.monto_a_devolver,
    'requiere_devolucion', v_renuncia.requiere_devolucion,
    'retencion_monto', v_renuncia.retencion_monto
  );

END;
$$;


-- ====================================================================
-- Verificación
-- ====================================================================
SELECT
  'OK - handle_fuente_inactivada actualizado con bypass de renuncia' AS status_trigger,
  'OK - registrar_renuncia_completa actualizado con set_config' AS status_funcion;
