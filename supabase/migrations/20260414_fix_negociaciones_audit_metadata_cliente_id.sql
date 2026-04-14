-- ============================================================
-- MIGRACIÓN: Fix metadata cliente_id en audit_log de negociaciones
-- Fecha: 2026-04-14
-- Problema:
--   La función genérica audit_trigger_func() NO incluía `cliente_id`
--   en el campo metadata del registro de audit_log. Esto hacía que
--   el servicio de historial (historial-cliente.service.ts) no
--   encontrara los eventos de actualización de negociaciones al
--   filtrar con:
--     .contains('metadata', { cliente_id: clienteId })
--   Consecuencia: cambios como "Descuento aplicado", "Suspendida",
--   "Reactivada", etc. nunca aparecían en la tab de Historial del cliente.
-- Solución:
--   Reemplazar el trigger de negociaciones para usar una función
--   especializada que:
--   1. Incluye cliente_id en metadata (clave crítica para el servicio).
--   2. Enriquece metadata con vivienda_id y modulo='negociaciones'.
--   3. Conserva toda la lógica de datos_anteriores/datos_nuevos/cambios.
-- ============================================================

-- ============================================================
-- 1. FUNCIÓN ESPECIALIZADA
-- ============================================================

CREATE OR REPLACE FUNCTION negociaciones_audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario     jsonb;
  v_cambios     jsonb;
  v_registro_id uuid;
  v_row         jsonb;
BEGIN
  -- Usuario actual del JWT
  v_usuario := current_setting('request.jwt.claims', true)::jsonb;

  -- Calcular cambios solo en UPDATE
  IF TG_OP = 'UPDATE' THEN
    v_cambios     := calcular_cambios_json(to_jsonb(OLD), to_jsonb(NEW));
    v_registro_id := NEW.id;
    v_row         := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    v_cambios     := NULL;
    v_registro_id := NEW.id;
    v_row         := to_jsonb(NEW);
  ELSE  -- DELETE
    v_cambios     := NULL;
    v_registro_id := OLD.id;
    v_row         := to_jsonb(OLD);
  END IF;

  -- Insertar en audit_log con metadata ENRIQUECIDA
  INSERT INTO audit_log (
    tabla,
    accion,
    registro_id,
    usuario_id,
    usuario_email,
    datos_anteriores,
    datos_nuevos,
    cambios_especificos,
    ip_address,
    modulo,
    metadata
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    v_registro_id,
    (v_usuario->>'sub')::uuid,
    v_usuario->>'email',
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    v_cambios,
    inet_client_addr(),
    'negociaciones',
    -- ✅ CLAVE: cliente_id en metadata para historial service
    jsonb_build_object(
      'cliente_id',  v_row->>'cliente_id',
      'vivienda_id', v_row->>'vivienda_id',
      'estado',      v_row->>'estado'
    )
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. REEMPLAZAR TRIGGER EN TABLA negociaciones
-- ============================================================

DROP TRIGGER IF EXISTS negociaciones_audit_trigger ON negociaciones;

CREATE TRIGGER negociaciones_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON negociaciones
FOR EACH ROW EXECUTE FUNCTION negociaciones_audit_trigger_func();

COMMENT ON TRIGGER negociaciones_audit_trigger ON negociaciones IS
'Audita INSERT/UPDATE/DELETE en negociaciones. Incluye cliente_id en metadata
para que historial-cliente.service.ts pueda filtrar con .contains(metadata, {cliente_id}).';

-- ============================================================
-- 3. BACKFILL: actualizar registros históricos sin cliente_id en metadata
--    Solo actualiza filas con metadata vacío o sin cliente_id,
--    obteniendo cliente_id desde datos_nuevos / datos_anteriores.
-- ============================================================

UPDATE audit_log al
SET metadata = jsonb_build_object(
  'cliente_id',  COALESCE(
                   al.datos_nuevos->>'cliente_id',
                   al.datos_anteriores->>'cliente_id'
                 ),
  'vivienda_id', COALESCE(
                   al.datos_nuevos->>'vivienda_id',
                   al.datos_anteriores->>'vivienda_id'
                 ),
  'estado',      COALESCE(
                   al.datos_nuevos->>'estado',
                   al.datos_anteriores->>'estado'
                 )
)
WHERE
  al.tabla = 'negociaciones'
  AND (al.metadata IS NULL OR al.metadata = '{}'::jsonb OR al.metadata->>'cliente_id' IS NULL)
  AND COALESCE(
        al.datos_nuevos->>'cliente_id',
        al.datos_anteriores->>'cliente_id'
      ) IS NOT NULL;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_proc
  WHERE proname = 'negociaciones_audit_trigger_func';

  IF v_count = 0 THEN
    RAISE EXCEPTION '❌ Función negociaciones_audit_trigger_func no fue creada';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM pg_trigger
  WHERE tgname = 'negociaciones_audit_trigger';

  IF v_count = 0 THEN
    RAISE EXCEPTION '❌ Trigger negociaciones_audit_trigger no fue creado';
  END IF;

  RAISE NOTICE '✅ negociaciones_audit_trigger_func() creada';
  RAISE NOTICE '✅ negociaciones_audit_trigger activo en tabla negociaciones';
  RAISE NOTICE '✅ Backfill de metadata ejecutado para registros históricos';
END $$;
