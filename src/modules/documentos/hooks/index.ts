// ============================================
// BARREL EXPORT: Documentos Hooks
// ============================================

// React Query hooks (nuevos)
export { useDocumentosEliminados } from './useDocumentosEliminados'
export * from './useDocumentosQuery'
export { useVersionesEliminadasCard } from './useVersionesEliminadasCard'

// Hooks de UI/Lógica
export { useCategoriasManager } from './useCategoriasManager'
export { useDocumentoCard } from './useDocumentoCard'
export { useDocumentoEditar } from './useDocumentoEditar'
export { useDocumentoReemplazarArchivo } from './useDocumentoReemplazarArchivo'
export { useDocumentosLista } from './useDocumentosLista'
export { useDocumentoUpload } from './useDocumentoUpload'
export { useReemplazarArchivoForm } from './useReemplazarArchivoForm'

// Hook de detección de cambios
export { useDetectarCambiosDocumento } from './useDetectarCambiosDocumento'
export type { CambioDocumentoDetectado, ResumenCambiosDocumento } from './useDetectarCambiosDocumento'
