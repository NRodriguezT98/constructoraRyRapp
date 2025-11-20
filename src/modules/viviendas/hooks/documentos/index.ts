// ============================================
// BARREL EXPORT: Documentos Viviendas Hooks
// ============================================
// ADAPTADO DESDE: src/modules/documentos/hooks/index.ts

// React Query hooks (documentos viviendas)
export { useDocumentosEliminados } from './useDocumentosEliminados'
export * from './useDocumentosViviendaQuery'
export { useDocumentoVersiones } from './useDocumentoVersiones'
export { useVersionesEliminadasCard } from './useVersionesEliminadasCard'

// Hooks de UI/Lógica
export { useCategoriasManager } from './useCategoriasManager'
export { useDocumentoCard } from './useDocumentoCard'
export { useDocumentoEditar } from './useDocumentoEditar'
export { useDocumentoReemplazarArchivo } from './useDocumentoReemplazarArchivo'
export { useDocumentosLista } from './useDocumentosLista'
export { useDocumentoUpload } from './useDocumentoUpload'
export { useEstadosVersionVivienda } from './useEstadosVersionVivienda'
export { useMarcarEstadoVersion } from './useMarcarEstadoVersion'; // ✅ Hook de estados (mutations)
export { useReemplazarArchivoForm } from './useReemplazarArchivoForm'

// Hook de detección de cambios
export { useDetectarCambiosDocumento } from './useDetectarCambiosDocumento'
export type { CambioDocumentoDetectado, ResumenCambiosDocumento } from './useDetectarCambiosDocumento'
