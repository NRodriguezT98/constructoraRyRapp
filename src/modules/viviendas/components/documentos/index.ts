/**
 * 📦 Barrel Export - Componentes de Documentos de Viviendas
 */

// Lista y Grid
export { DocumentosLista } from './lista/documentos-lista'
export { DocumentosFiltros } from './lista/documentos-filtros'
export { DocumentoCard } from './lista/documento-card'

// Viewer
export { DocumentoViewer } from './viewer/documento-viewer'

// Upload
export { DocumentoUpload } from './upload/documento-upload'

// Modals
export { DocumentoEditarMetadatosModal } from './modals/DocumentoEditarMetadatosModal'
export { DocumentoNuevaVersionModal } from './modals/DocumentoNuevaVersionModal'
export { DocumentoReemplazarArchivoModal } from './modals/DocumentoReemplazarArchivoModal'
export { MarcarEstadoVersionModal } from './modals/MarcarEstadoVersionModal'
export type { AccionEstado, MarcarEstadoVersionModalProps } from './modals/MarcarEstadoVersionModal'
export { ConfirmarCambiosDocumentoModal } from './modals/ConfirmarCambiosDocumentoModal'

// Shared Components
export { CategoriaIcon } from './shared/categoria-icon'
export { EstadoVersionBadge } from './shared/EstadoVersionBadge'
