-- ============================================
-- FIX COMPLETO: vincular_documento_pendiente_automatico
-- ============================================
--
-- Problemas encontrados:
-- 1. Usa NEW.categoria (texto) → Real: NEW.categoria_id (UUID)
-- 2. Usa NEW.url → Real: NEW.url_storage
-- 3. Busca negociacion_id → Real: usa fuente_pago_id directamente
-- 4. Compara tipo_documento == 'carta_aprobacion' → Real: 'Carta de Aprobación'
--
-- Solución: Reescribir función con nombres correctos del schema
-- ============================================

-- Recrear función completamente corregida
CREATE OR REPLACE FUNCTION vincular_documento_pendiente_automatico()
RETURNS TRIGGER AS $$
DECLARE
  v_metadata JSONB;
  v_fuente_pago_id_metadata UUID;
  v_tipo_fuente_metadata TEXT;
  v_entidad_metadata TEXT;
  v_pendiente RECORD;
BEGIN
  -- 1️⃣ Extraer metadata del documento subido
  v_metadata := NEW.metadata;

  -- 2️⃣ Verificar que tiene los campos necesarios para vinculación
  IF v_metadata IS NULL THEN
    RETURN NEW;
  END IF;

  -- Obtener valores de metadata
  BEGIN
    v_fuente_pago_id_metadata := (v_metadata->>'fuente_pago_id')::UUID;
    v_tipo_fuente_metadata := v_metadata->>'tipo_fuente';
    v_entidad_metadata := v_metadata->>'entidad';
  EXCEPTION WHEN OTHERS THEN
    -- Si falla el cast, no es un documento vinculable
    RETURN NEW;
  END;

  -- 3️⃣ Solo continuar si tiene fuente_pago_id en metadata
  IF v_fuente_pago_id_metadata IS NULL THEN
    RETURN NEW;
  END IF;

  -- 4️⃣ Buscar documento pendiente coincidente
  SELECT *
  INTO v_pendiente
  FROM documentos_pendientes
  WHERE estado = 'Pendiente'
    AND fuente_pago_id = v_fuente_pago_id_metadata
    AND cliente_id = NEW.cliente_id
    AND (
      -- Match por tipo_fuente (si existe en ambos)
      (metadata->>'tipo_fuente' = v_tipo_fuente_metadata)
      OR
      -- Match por entidad (si existe en ambos)
      (metadata->>'entidad' = v_entidad_metadata)
    )
  LIMIT 1;

  -- 5️⃣ Si encontró coincidencia → vincular automáticamente
  IF FOUND THEN

    -- A. Actualizar fuente_pago con URL del documento
    UPDATE fuentes_pago
    SET
      carta_aprobacion_url = NEW.url_storage,  -- ✅ Nombre correcto
      estado_documentacion = 'Completo',
      fecha_actualizacion = NOW()
    WHERE id = v_pendiente.fuente_pago_id;

    -- B. Marcar pendiente como completado
    UPDATE documentos_pendientes
    SET
      estado = 'Completado',
      fecha_completado = NOW(),
      completado_por = NEW.subido_por  -- ✅ Nombre correcto
    WHERE id = v_pendiente.id;

    -- C. Registrar en auditoría
    INSERT INTO audit_log (
      tabla,
      accion,
      registro_id,
      usuario_email,
      metadata
    ) VALUES (
      'fuentes_pago',
      'UPDATE',  -- ✅ Acción válida permitida
      v_pendiente.fuente_pago_id,  -- ✅ UUID directo (NO ::TEXT)
      COALESCE(auth.email(), 'sistema'),
      jsonb_build_object(
        'documento_id', NEW.id,
        'documento_url', NEW.url_storage,
        'tipo_fuente', v_tipo_fuente_metadata,
        'entidad', v_entidad_metadata,
        'pendiente_id', v_pendiente.id,
        'cliente_id', NEW.cliente_id,
        'vinculacion_automatica', true
      )
    );

    RAISE NOTICE 'Vinculación automática exitosa: documento % → fuente_pago %',
      NEW.id, v_pendiente.fuente_pago_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================

-- Ver definición completa de la función
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'vincular_documento_pendiente_automatico';

-- Verificar que el trigger existe
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'Enabled ✅'
    WHEN 'D' THEN 'Disabled ❌'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'documentos_cliente'
  AND p.proname = 'vincular_documento_pendiente_automatico';
