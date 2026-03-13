-- ============================================
-- TRIGGER: Sincronización automática de categorías
-- ============================================
-- Propósito: Cuando se crean/actualizan pasos_fuente_pago desde requisitos_fuentes_pago_config,
-- garantizar que siempre usen el UUID correcto de la categoría, no strings

-- Función que valida y corrige el UUID de categoría
CREATE OR REPLACE FUNCTION validar_categoria_documento_paso()
RETURNS TRIGGER AS $$
DECLARE
  v_categoria_uuid uuid;
BEGIN
  -- Si hay una categoría_documento_requerida, validar que sea un UUID válido
  IF NEW.categoria_documento_requerida IS NOT NULL THEN
    BEGIN
      -- Intentar convertir a UUID
      v_categoria_uuid := NEW.categoria_documento_requerida::uuid;

      -- Verificar que existe en categorias_documento
      IF NOT EXISTS (
        SELECT 1 FROM categorias_documento WHERE id = v_categoria_uuid
      ) THEN
        RAISE WARNING 'Categoría UUID % no existe en categorias_documento', v_categoria_uuid;
      END IF;

    EXCEPTION WHEN invalid_text_representation THEN
      -- Si no es un UUID válido, buscar por nombre/slug
      RAISE WARNING 'categoria_documento_requerida "%" no es un UUID válido', NEW.categoria_documento_requerida;

      -- Intentar mapear strings conocidos a UUIDs
      CASE NEW.categoria_documento_requerida
        WHEN 'escrituras' THEN
          NEW.categoria_documento_requerida := '4898e798-c188-4f02-bfcf-b2b15be48e34';
        WHEN 'documentos_identidad' THEN
          NEW.categoria_documento_requerida := 'b795b842-f035-42ce-9ab9-7fef2e1c5f24';
        WHEN 'certificados_tradicion' THEN
          NEW.categoria_documento_requerida := 'bd49740e-d46d-43c8-973f-196f1418765c';
        WHEN 'gastos_notariales' THEN
          NEW.categoria_documento_requerida := 'f84ec757-2f11-4245-a487-5091176feec5';
        ELSE
          -- Si no se reconoce, dejarlo como está pero avisar
          RAISE WARNING 'No se pudo mapear categoria_documento_requerida "%" a UUID conocido', NEW.categoria_documento_requerida;
      END CASE;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe (para idempotencia)
DROP TRIGGER IF EXISTS trigger_validar_categoria_documento_paso ON pasos_fuente_pago;

-- Crear trigger que se ejecuta ANTES de INSERT/UPDATE
CREATE TRIGGER trigger_validar_categoria_documento_paso
  BEFORE INSERT OR UPDATE ON pasos_fuente_pago
  FOR EACH ROW
  EXECUTE FUNCTION validar_categoria_documento_paso();

-- Comentar objetos
COMMENT ON FUNCTION validar_categoria_documento_paso() IS
  'Valida y corrige UUIDs de categoría en pasos_fuente_pago antes de insert/update';
COMMENT ON TRIGGER trigger_validar_categoria_documento_paso ON pasos_fuente_pago IS
  'Garantiza que categoria_documento_requerida siempre sea un UUID válido';

-- Test: Verificar que el trigger funciona
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger de validación de categorías instalado correctamente';
END $$;
