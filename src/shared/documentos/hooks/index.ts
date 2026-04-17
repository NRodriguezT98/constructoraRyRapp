// ============================================
// BARREL EXPORT: Documentos Hooks
// ============================================

// React Query hooks (nuevos)
export * from './useCarpetasQuery'
export { useDocumentosEliminados } from './useDocumentosEliminados'
export * from './useDocumentosQuery'
export { usePapeleraCount } from './usePapeleraCount'
export { useVersionesEliminadasCard } from './useVersionesEliminadasCard'

// Hooks de UI/Lógica
export { useCategoriasManager } from './useCategoriasManager'
export { useDocumentoCard } from './useDocumentoCard'
export { useDocumentoEditar } from './useDocumentoEditar'
export { useDocumentoReemplazarArchivo } from './useDocumentoReemplazarArchivo'
export { useDocumentosLista } from './useDocumentosLista'
export type { SortCol } from './useDocumentosLista'
export { useDocumentoThumbnail } from './useDocumentoThumbnail'
export { useDocumentoUpload } from './useDocumentoUpload'
export { useMarcarEstadoVersion } from './useMarcarEstadoVersion' // ✅ Hook de estados de versión
export { useReemplazarArchivoForm } from './useReemplazarArchivoForm'

// Hook de detección de cambios
export { useDetectarCambiosDocumento } from './useDetectarCambiosDocumento'
export type {
  CambioDocumentoDetectado,
  ResumenCambiosDocumento,
} from './useDetectarCambiosDocumento'
export { useDocumentoEditarMetadatosModal } from './useDocumentoEditarMetadatosModal'
