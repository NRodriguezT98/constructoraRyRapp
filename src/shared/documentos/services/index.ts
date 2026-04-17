// ============================================
// BARREL EXPORT: Servicios de Documentos
// ============================================

export * from './carpetas-documentos.service'
export * from './categorias.service'

// Servicios especializados (refactorizados)
export * from './documentos-archivado.service'
export * from './documentos-base.service'
export * from './documentos-eliminacion.service'
export * from './documentos-estados.service'
export * from './documentos-papelera.service'
export * from './documentos-reemplazo.service'
export * from './documentos-storage.service'
export * from './documentos-versiones.service'

// Fachada principal (mantiene compatibilidad con código existente)
export * from './documentos.service'
