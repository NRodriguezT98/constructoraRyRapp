// ============================================
// BARREL EXPORT: Servicios de Documentos Vivienda
// ============================================

// Servicios especializados (refactorizados)
export * from './documentos-base.service'
export * from './documentos-eliminacion.service'
export * from './documentos-estados.service'
// export * from './documentos-reemplazo.service' // File not yet created
export * from './documentos-storage.service'
export * from './documentos-versiones.service'

// Fachada principal (mantiene compatibilidad con código existente)
export * from './documentos.service'
