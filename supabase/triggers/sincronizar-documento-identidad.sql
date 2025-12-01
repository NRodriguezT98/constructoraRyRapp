-- ===================================================================
-- TRIGGER: Sincronizar documento_identidad_url automáticamente
-- ===================================================================
-- Fecha: 2025-12-01
-- Propósito: Mantener sincronizado documento_identidad_url entre
--            documentos_cliente y clientes automáticamente

-- FUNCIÓN: Actualizar documento_identidad_url cuando se inserta/actualiza documento de identidad
CREATE OR REPLACE FUNCTION sincronizar_documento_identidad()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo si el documento es de identidad
  IF NEW.es_documento_identidad = true THEN
    -- Actualizar cliente con la URL del storage
    UPDATE clientes
    SET documento_identidad_url = NEW.url_storage,
        fecha_actualizacion = NOW()
    WHERE id = NEW.cliente_id;

    RAISE NOTICE 'documento_identidad_url sincronizado para cliente %', NEW.cliente_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: Ejecutar después de INSERT
DROP TRIGGER IF EXISTS trigger_sincronizar_cedula_insert ON documentos_cliente;
CREATE TRIGGER trigger_sincronizar_cedula_insert
  AFTER INSERT ON documentos_cliente
  FOR EACH ROW
  WHEN (NEW.es_documento_identidad = true)
  EXECUTE FUNCTION sincronizar_documento_identidad();

-- TRIGGER: Ejecutar después de UPDATE
DROP TRIGGER IF EXISTS trigger_sincronizar_cedula_update ON documentos_cliente;
CREATE TRIGGER trigger_sincronizar_cedula_update
  AFTER UPDATE ON documentos_cliente
  FOR EACH ROW
  WHEN (NEW.es_documento_identidad = true AND OLD.es_documento_identidad = false)
  EXECUTE FUNCTION sincronizar_documento_identidad();

-- TRIGGER: Limpiar documento_identidad_url cuando se elimina documento de identidad
CREATE OR REPLACE FUNCTION limpiar_documento_identidad()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo si el documento eliminado era de identidad
  IF OLD.es_documento_identidad = true THEN
    -- Verificar si hay otro documento de identidad para este cliente
    IF NOT EXISTS (
      SELECT 1
      FROM documentos_cliente
      WHERE cliente_id = OLD.cliente_id
        AND es_documento_identidad = true
        AND id <> OLD.id
    ) THEN
      -- No hay otro documento de identidad, limpiar el campo
      UPDATE clientes
      SET documento_identidad_url = NULL,
          fecha_actualizacion = NOW()
      WHERE id = OLD.cliente_id;

      RAISE NOTICE 'documento_identidad_url limpiado para cliente %', OLD.cliente_id;
    END IF;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: Ejecutar después de DELETE
DROP TRIGGER IF EXISTS trigger_limpiar_cedula_delete ON documentos_cliente;
CREATE TRIGGER trigger_limpiar_cedula_delete
  AFTER DELETE ON documentos_cliente
  FOR EACH ROW
  WHEN (OLD.es_documento_identidad = true)
  EXECUTE FUNCTION limpiar_documento_identidad();

-- VERIFICACIÓN: Probar con cliente Luis
SELECT
  c.id,
  c.nombres,
  c.documento_identidad_url as url_en_clientes,
  d.url_storage as url_en_documentos
FROM clientes c
LEFT JOIN documentos_cliente d ON c.id = d.cliente_id AND d.es_documento_identidad = true
WHERE c.id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a';
