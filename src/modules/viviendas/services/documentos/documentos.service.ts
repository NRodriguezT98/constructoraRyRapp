// ============================================
// SERVICE: Documentos Vivienda - Fachada Principal
// ============================================
// Este archivo actúa como punto único de entrada para mantener
// compatibilidad con el código existente. Delega a servicios especializados.
// ============================================

import { DocumentosBaseService } from './documentos-base.service'
import { DocumentosEliminacionService } from './documentos-eliminacion.service'
import { DocumentosEstadosService } from './documentos-estados.service'
import { DocumentosReemplazoService as DocumentosReemplazoServiceGenerico } from '@/modules/documentos/services/documentos-reemplazo.service'
import { DocumentosStorageService } from './documentos-storage.service'
import { DocumentosVersionesService } from './documentos-versiones.service'

interface SubirDocumentoParams {
  vivienda_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  archivo: File
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  metadata?: Record<string, any>
}

/**
 * Fachada principal del servicio de documentos de vivienda
 * Mantiene compatibilidad con código existente delegando a servicios especializados
 */
export class DocumentosViviendaService {
  // ============================================
  // CRUD BÁSICO → documentos-base.service.ts
  // ============================================

  static obtenerDocumentosPorVivienda = DocumentosBaseService.obtenerDocumentosPorVivienda
  static obtenerDocumentosPorCategoria = DocumentosBaseService.obtenerDocumentosPorCategoria
  static obtenerDocumentosProximosAVencer =
    DocumentosBaseService.obtenerDocumentosProximosAVencer
  static subirDocumento = DocumentosBaseService.subirDocumento
  static actualizarDocumento = DocumentosBaseService.actualizarDocumento
  static buscarDocumentos = DocumentosBaseService.buscarDocumentos
  static obtenerDocumentosImportantes = DocumentosBaseService.obtenerDocumentosImportantes
  static toggleImportante = DocumentosBaseService.toggleImportante

  // ============================================
  // VERSIONES → documentos-versiones.service.ts
  // ============================================

  static crearNuevaVersion = DocumentosVersionesService.crearNuevaVersion
  static obtenerVersiones = DocumentosVersionesService.obtenerVersiones
  static restaurarVersion = DocumentosVersionesService.restaurarVersion
  static eliminarVersion = DocumentosVersionesService.eliminarVersion
  static contarVersionesActivas = DocumentosVersionesService.contarVersionesActivas
  static obtenerVersionesEliminadas = DocumentosVersionesService.obtenerVersionesEliminadas
  static restaurarVersionesSeleccionadas =
    DocumentosVersionesService.restaurarVersionesSeleccionadas

  // ============================================
  // STORAGE → documentos-storage.service.ts
  // ============================================

  static obtenerUrlDescarga = DocumentosStorageService.obtenerUrlDescarga
  static descargarArchivo = DocumentosStorageService.descargarArchivo

  // ============================================
  // ESTADOS → documentos-estados.service.ts
  // ============================================

  static aprobarVersion = DocumentosEstadosService.aprobarVersion
  static rechazarVersion = DocumentosEstadosService.rechazarVersion
  static marcarEstadoVersion = DocumentosEstadosService.marcarEstadoVersion

  // ============================================
  // REEMPLAZO → documentos-reemplazo.service.ts (GENÉRICO)
  // ============================================

  /**
   * Wrapper para mantener compatibilidad - usa servicio genérico
   */
  static async reemplazarArchivoSeguro(
    documentoId: string,
    nuevoArchivo: File,
    motivo: string,
    password: string
  ) {
    return DocumentosReemplazoServiceGenerico.reemplazarArchivoSeguro(
      documentoId,
      nuevoArchivo,
      motivo,
      password,
      'vivienda' // ✅ Tipo de entidad
    )
  }

  // ============================================
  // ELIMINACIÓN → documentos-eliminacion.service.ts
  // ============================================

  static archivarDocumento = DocumentosEliminacionService.archivarDocumento
  static restaurarDocumento = DocumentosEliminacionService.restaurarDocumentoArchivado
  static obtenerDocumentosArchivados = DocumentosEliminacionService.obtenerDocumentosArchivados
  static eliminarDocumento = DocumentosEliminacionService.eliminarDocumento
  static obtenerDocumentosEliminados = DocumentosEliminacionService.obtenerDocumentosEliminados
  static restaurarDocumentoEliminado = DocumentosEliminacionService.restaurarDocumentoEliminado
  static eliminarDefinitivo = DocumentosEliminacionService.eliminarDefinitivo
}

// Re-exportar servicios especializados para uso directo (opcional)
export {
    DocumentosBaseService, DocumentosEliminacionService, DocumentosEstadosService,
    DocumentosStorageService, DocumentosVersionesService
}

// Mantener compatibilidad con singleton (si se usaba)
export const documentosViviendaService = DocumentosViviendaService
