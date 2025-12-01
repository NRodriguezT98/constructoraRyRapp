/**
 * 🏠 Barrel Export: Servicios de Viviendas
 *
 * Exporta todos los servicios relacionados con viviendas:
 * - ViviendaValidacionService (bloqueo de edición)
 * - ViviendaInactivacionService (soft delete)
 * - ViviendaConflictosService (gestión de duplicados)
 */

export * from './viviendas-conflictos.service'
export * from './viviendas-inactivacion.service'
export * from './viviendas-validacion.service'
