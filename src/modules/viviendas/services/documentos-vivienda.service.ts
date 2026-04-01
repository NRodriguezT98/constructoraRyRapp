/**
 * Stub service for vivienda documents
 * Delegates to the modular documentos service
 */

// Local type definitions (re-export not available from documentos module)
export type SubirDocumentoParams = {
  archivo: File
  titulo: string
  descripcion?: string
  categoriaId?: string
  fechaDocumento?: string
  fechaVencimiento?: string
  esImportante?: boolean
  userId?: string
}

export type ActualizarDocumentoParams = {
  id: string
  titulo?: string
  descripcion?: string
  categoriaId?: string
  esImportante?: boolean
}

class DocumentosViviendaService {
  async obtenerDocumentos(_viviendaId: string): Promise<unknown[]> {
    return []
  }

  async subirDocumento(_params: SubirDocumentoParams): Promise<unknown> {
    throw new Error('Not implemented')
  }

  async actualizarDocumento(_params: ActualizarDocumentoParams): Promise<unknown> {
    throw new Error('Not implemented')
  }

  async eliminarDocumento(_id: string, _userId: string, _rol: string, _motivo: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async obtenerDocumentosEliminados(_viviendaId: string): Promise<Array<{
    id: string
    titulo: string
    version: number
    documento_padre_id: string | null
    metadata: Record<string, unknown>
    fecha_creacion: string
  }>> {
    return []
  }

  async restaurarDocumento(_id: string, _userId: string, _rol: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async eliminarPermanente(_id: string, _userId: string, _rol: string, _motivo: string, _soloEstaVersion?: boolean): Promise<void> {
    throw new Error('Not implemented')
  }

  async marcarVersionComoErronea(_documentoId: string, _motivo: string, _versionCorrectaId?: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async marcarVersionComoObsoleta(_documentoId: string, _motivo: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async restaurarEstadoVersion(_documentoId: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async descargarDocumento(_id: string): Promise<Blob> {
    throw new Error('Not implemented')
  }

  async obtenerUrlFirmada(_id: string, _expiresIn?: number): Promise<string> {
    throw new Error('Not implemented')
  }

  async obtenerEstadisticas(_viviendaId: string): Promise<unknown> {
    return {}
  }
}

export const documentosViviendaService = new DocumentosViviendaService()
