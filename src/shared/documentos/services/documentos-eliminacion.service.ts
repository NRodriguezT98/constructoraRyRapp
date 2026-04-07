// ============================================
// SERVICE: Documentos - Eliminacion (Fachada)
// ============================================
// Delega a:
//   documentos-archivado.service.ts  -> archivar / restaurar del archivo
//   documentos-papelera.service.ts   -> soft-delete / restaurar / hard-delete

export { DocumentosArchivadoService } from './documentos-archivado.service'
export { DocumentosPapeleraService } from './documentos-papelera.service'

import type { DocumentoProyecto } from '../types/documento.types'
import type { TipoEntidad } from '../types/entidad.types'

import { DocumentosArchivadoService } from './documentos-archivado.service'
import { DocumentosPapeleraService } from './documentos-papelera.service'

/** Fachada delegadora - mantiene el contrato publico original. */
export class DocumentosEliminacionService {
  static async archivarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad,
    motivoCategoria?: string,
    motivoDetalle?: string
  ): Promise<void> {
    return DocumentosArchivadoService.archivarDocumento(
      documentoId,
      tipoEntidad,
      motivoCategoria,
      motivoDetalle
    )
  }

  static async restaurarDocumentoArchivado(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    return DocumentosArchivadoService.restaurarDocumentoArchivado(
      documentoId,
      tipoEntidad
    )
  }

  static async obtenerDocumentosArchivados(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    return DocumentosArchivadoService.obtenerDocumentosArchivados(
      entidadId,
      tipoEntidad
    )
  }

  static async eliminarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    return DocumentosPapeleraService.eliminarDocumento(documentoId, tipoEntidad)
  }

  static async obtenerDocumentosEliminados(
    tipoEntidad?: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    return DocumentosPapeleraService.obtenerDocumentosEliminados(tipoEntidad)
  }

  static async obtenerVersionesEliminadas(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    return DocumentosPapeleraService.obtenerVersionesEliminadas(
      documentoId,
      tipoEntidad
    )
  }

  static async restaurarVersionesSeleccionadas(
    versionIds: string[],
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    return DocumentosPapeleraService.restaurarVersionesSeleccionadas(
      versionIds,
      tipoEntidad
    )
  }

  static async restaurarDocumentoEliminado(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    return DocumentosPapeleraService.restaurarDocumentoEliminado(
      documentoId,
      tipoEntidad
    )
  }

  static async eliminarDefinitivo(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    return DocumentosPapeleraService.eliminarDefinitivo(
      documentoId,
      tipoEntidad
    )
  }
}
