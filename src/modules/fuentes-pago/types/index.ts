/**
 * ============================================
 * TYPES: Sistema de Fuentes de Pago
 * ============================================
 *
 * Tipos TypeScript para el sistema de requisitos de fuentes de pago.
 * El sistema antiguo (pasos_fuente_pago) ha sido eliminado.
 * El sistema nuevo usa: requisitos_fuentes_pago_config + vista_documentos_pendientes_fuentes
 *
 * @version 2.0.0 - 2026-03-14 (limpieza sistema viejo)
 */

// ============================================
// ENUMS
// ============================================

/**
 * Nivel de validación para requisitos de fuentes de pago
 * Usado en: requisitos_fuentes_pago_config.nivel_validacion
 */
export enum NivelValidacion {
  DOCUMENTO_OBLIGATORIO = 'DOCUMENTO_OBLIGATORIO',
  DOCUMENTO_OPCIONAL = 'DOCUMENTO_OPCIONAL',
  SOLO_CONFIRMACION = 'SOLO_CONFIRMACION',
}
