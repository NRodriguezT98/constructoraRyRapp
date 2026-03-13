-- =====================================================
-- FIX PROFESIONAL: Incompatibilidad de tipos VARCHAR/TEXT
-- Fecha: 2025-12-12
-- Error: "Returned type character varying(50) does not match expected type text"
-- =====================================================

/**
 * CONTEXTO:
 * - Tabla fuentes_pago tiene columnas VARCHAR(50/100)
 * - Función SQL retorna TYPE TEXT
 * - PostgreSQL valida estrictamente tipos en RETURNS TABLE
 *
 * SOLUCIÓN APLICADA (Type Safety Pattern):
 * - CAST explícito ::TEXT en SELECT de la función
 * - Garantiza match exacto de tipos
 * - Sin cambios en schema (evita recrear triggers/vistas)
 * - Performance: CAST de VARCHAR a TEXT es operación sin costo
 *
 * NOTA: Idealmente migrar columnas a TEXT (PostgreSQL best practice),
 * pero requiere eliminar/recrear 15 triggers + 4 vistas.
 * Por simplicidad operacional, se mantiene CAST aquí.
 */

CREATE OR REPLACE FUNCTION obtener_estado_documentacion_fuente(p_fuente_pago_id UUID)
RETURNS TABLE(
  fuente_pago_id UUID,
  tipo_fuente TEXT,
  entidad TEXT,
  estado_general TEXT, -- 'completo' | 'advertencia' | 'bloqueado'
  progreso_porcentaje INT,
  validacion JSONB
) AS $$
DECLARE
  v_validacion RECORD;
BEGIN
  -- Obtener validación de requisitos
  SELECT * INTO v_validacion
  FROM validar_requisitos_desembolso(p_fuente_pago_id);

  RETURN QUERY
  SELECT
    fp.id AS fuente_pago_id,
    fp.tipo::TEXT AS tipo_fuente,  -- ✅ Type Safety: VARCHAR(50) → TEXT
    COALESCE(fp.entidad, '')::TEXT AS entidad,  -- ✅ Type Safety: VARCHAR(100) → TEXT
    CASE
      WHEN v_validacion.cumple_requisitos THEN 'completo'
      WHEN v_validacion.puede_continuar THEN 'advertencia'
      ELSE 'bloqueado'
    END AS estado_general,
    CASE
      WHEN v_validacion.total_requisitos > 0 THEN
        ROUND((v_validacion.requisitos_completados::NUMERIC / v_validacion.total_requisitos::NUMERIC) * 100)::INT
      ELSE 100
    END AS progreso_porcentaje,
    jsonb_build_object(
      'cumple_requisitos', v_validacion.cumple_requisitos,
      'puede_continuar', v_validacion.puede_continuar,
      'total_requisitos', v_validacion.total_requisitos,
      'requisitos_completados', v_validacion.requisitos_completados,
      'obligatorios_faltantes', v_validacion.obligatorios_faltantes,
      'opcionales_faltantes', v_validacion.opcionales_faltantes,
      'documentos_faltantes', v_validacion.documentos_faltantes,
      'documentos_completados', v_validacion.documentos_completados
    ) AS validacion
  FROM fuentes_pago fp
  WHERE fp.id = p_fuente_pago_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION obtener_estado_documentacion_fuente IS
'Obtiene estado de validación de requisitos de una fuente de pago.
✅ Type-safe: Explicit CAST para match VARCHAR→TEXT.
🔄 Stable: No modifica datos, permite optimización de queries.';
