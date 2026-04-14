-- ============================================================
-- MIGRACIÓN: Fix accion en negociaciones_audit_trigger_func
-- Fecha: 2026-04-14
-- Problema:
--   La función negociaciones_audit_trigger_func() usa TG_OP directamente
--   como valor de `accion`, lo cual inserta 'INSERT', 'UPDATE' o 'DELETE'.
--   El constraint valid_accion en audit_log solo acepta:
--     ('CREATE', 'UPDATE', 'DELETE')
--   Por tanto todo INSERT en negociaciones falla con:
--     "new row for relation "audit_log" violates check constraint valid_accion"
-- Solución:
--   Mapear TG_OP → accion:
--     'INSERT' → 'CREATE'
--     'UPDATE' → 'UPDATE'  (ya coincide, pero se mapea explícitamente)
--     'DELETE' → 'DELETE'  (ya coincide)
-- ============================================================

CREATE OR REPLACE FUNCTION negociaciones_audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario     jsonb;
  v_cambios     jsonb;
  v_registro_id uuid;
  v_row         jsonb;
  v_accion      text;
BEGIN
  -- Usuario actual del JWT
  v_usuario := current_setting('request.jwt.claims', true)::jsonb;

  -- Mapear TG_OP al valor permitido por el constraint valid_accion
  v_accion := CASE TG_OP
    WHEN 'INSERT' THEN 'CREATE'
    WHEN 'UPDATE' THEN 'UPDATE'
    WHEN 'DELETE' THEN 'DELETE'
    ELSE 'CREATE'
  END;

  -- Calcular campos según operación
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

  -- Insertar en audit_log con accion correcta y metadata enriquecida
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
    v_accion,                             -- ← 'CREATE' / 'UPDATE' / 'DELETE'
    v_registro_id,
    (v_usuario->>'sub')::uuid,
    v_usuario->>'email',
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    v_cambios,
    inet_client_addr(),
    'negociaciones',
    jsonb_build_object(
      'cliente_id',  v_row->>'cliente_id',
      'vivienda_id', v_row->>'vivienda_id',
      'estado',      v_row->>'estado'
    )
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'negociaciones_audit_trigger_func'
  ) THEN
    RAISE EXCEPTION '❌ Función negociaciones_audit_trigger_func no fue creada';
  END IF;
  RAISE NOTICE '✅ negociaciones_audit_trigger_func actualizada: TG_OP → accion válida';
END $$;
