-- ARREGLAR TRIGGER: Remover referencia a fecha_pago_completo (columna inexistente)
CREATE OR REPLACE FUNCTION actualizar_estado_vivienda()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se asigna un cliente y no tiene fecha de asignación, establecerla
  IF NEW.cliente_id IS NOT NULL AND (OLD.cliente_id IS NULL OR OLD.cliente_id IS DISTINCT FROM NEW.cliente_id) THEN
    NEW.fecha_asignacion := NOW();
    NEW.estado := 'Asignada';
    RAISE NOTICE 'Vivienda % asignada a cliente %', NEW.id, NEW.cliente_id;
  END IF;

  -- Si se remueve el cliente, volver a Disponible
  IF NEW.cliente_id IS NULL AND OLD.cliente_id IS NOT NULL THEN
    NEW.estado := 'Disponible';
    NEW.fecha_asignacion := NULL;
    -- ❌ REMOVIDO: NEW.fecha_pago_completo := NULL; (columna no existe)
    RAISE NOTICE 'Vivienda % liberada (cliente removido)', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
