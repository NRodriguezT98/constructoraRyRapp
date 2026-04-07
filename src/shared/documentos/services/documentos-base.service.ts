/**
 * SERVICE: Documentos � Fachada (backwards-compatible)
 *
 * Delega toda la l�gica a:
 *   documentos-queries.service.ts   ? lecturas
 *   documentos-mutaciones.service.ts ? escrituras
 *
 * Ning�n consumer existente necesita cambiar sus imports.
 */
export { DocumentosMutacionesService } from './documentos-mutaciones.service'
export type {
  SubirDocumentoParams,
  SubirDocumentoProyectoParams,
} from './documentos-mutaciones.service'
export { DocumentosQueriesService } from './documentos-queries.service'

import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'
import type { TipoEntidad } from '@/shared/documentos/types/entidad.types'

import type {
  SubirDocumentoParams,
  SubirDocumentoProyectoParams,
} from './documentos-mutaciones.service'
import { DocumentosMutacionesService } from './documentos-mutaciones.service'
import { DocumentosQueriesService } from './documentos-queries.service'

/** Fachada unificada � mantiene el contrato p�blico original. */
export class DocumentosBaseService {
  // -- Lecturas ------------------------------------------------------------
  static obtenerDocumentosPorEntidad(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    return DocumentosQueriesService.obtenerDocumentosPorEntidad(
      entidadId,
      tipoEntidad
    )
  }

  /** @deprecated Usar obtenerDocumentosPorEntidad con tipoEntidad='proyecto' */
  static obtenerDocumentosPorProyecto(
    proyectoId: string
  ): Promise<DocumentoProyecto[]> {
    return DocumentosQueriesService.obtenerDocumentosPorEntidad(
      proyectoId,
      'proyecto'
    )
  }

  static obtenerDocumentosPorCategoria(
    entidadId: string,
    categoriaId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    return DocumentosQueriesService.obtenerDocumentosPorCategoria(
      entidadId,
      categoriaId,
      tipoEntidad
    )
  }

  static obtenerDocumentosProximosAVencer(
    diasAntes?: number,
    tipoEntidad?: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    return DocumentosQueriesService.obtenerDocumentosProximosAVencer(
      diasAntes,
      tipoEntidad
    )
  }

  static buscarDocumentos(
    entidadId: string,
    query: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    return DocumentosQueriesService.buscarDocumentos(
      entidadId,
      query,
      tipoEntidad
    )
  }

  static obtenerDocumentosImportantes(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    return DocumentosQueriesService.obtenerDocumentosImportantes(
      entidadId,
      tipoEntidad
    )
  }

  static obtenerDocumentosArchivados(
    entidadId: string,
    tipoEntidad: TipoEntidad
  ): Promise<DocumentoProyecto[]> {
    return DocumentosQueriesService.obtenerDocumentosArchivados(
      entidadId,
      tipoEntidad
    )
  }

  // -- Escrituras ----------------------------------------------------------
  static subirDocumento(
    params: SubirDocumentoParams,
    userId: string
  ): Promise<DocumentoProyecto> {
    return DocumentosMutacionesService.subirDocumento(params, userId)
  }

  /** @deprecated Usar subirDocumento con tipoEntidad='proyecto' */
  static subirDocumentoProyecto(
    params: SubirDocumentoProyectoParams,
    userId: string
  ): Promise<DocumentoProyecto> {
    return DocumentosMutacionesService.subirDocumentoProyecto(params, userId)
  }

  static actualizarDocumento(
    documentoId: string,
    updates: {
      titulo?: string
      descripcion?: string
      fecha_documento?: string
      fecha_vencimiento?: string
      categoria_id?: string
      es_importante?: boolean
      anclado_at?: string | null
    },
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    return DocumentosMutacionesService.actualizarDocumento(
      documentoId,
      updates,
      tipoEntidad
    )
  }

  static toggleImportante(
    documentoId: string,
    esImportante: boolean,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    return DocumentosMutacionesService.toggleImportante(
      documentoId,
      esImportante,
      tipoEntidad
    )
  }

  static eliminarDocumento(
    documentoId: string,
    tipoEntidad: TipoEntidad
  ): Promise<void> {
    return DocumentosMutacionesService.eliminarDocumento(
      documentoId,
      tipoEntidad
    )
  }
}

export default DocumentosBaseService
