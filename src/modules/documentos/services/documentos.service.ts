// ============================================
// SERVICE: Documentos - Fachada Principal
// ============================================
// Este archivo actúa como punto único de entrada para mantener
// compatibilidad con el código existente. Delega a servicios especializados.
// ============================================

import { DocumentosBaseService } from './documentos-base.service'
import { DocumentosEliminacionService } from './documentos-eliminacion.service'
import { DocumentosEstadosService } from './documentos-estados.service'
import { DocumentosReemplazoService } from './documentos-reemplazo.service'
import { DocumentosStorageService } from './documentos-storage.service'
import { DocumentosVersionesService } from './documentos-versiones.service'

interface SubirDocumentoParams {
  proyecto_id: string
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
 * Fachada principal del servicio de documentos
 * Mantiene compatibilidad con código existente delegando a servicios especializados
 */
export class DocumentosService {
  // ============================================
  // CRUD BÁSICO → documentos-base.service.ts
  // ============================================

  // ✅ GENÉRICOS (nuevos)
  static obtenerDocumentosPorEntidad = DocumentosBaseService.obtenerDocumentosPorEntidad

  // ⚠️ LEGACY (mantener compatibilidad)
  static obtenerDocumentosPorProyecto = DocumentosBaseService.obtenerDocumentosPorProyecto
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

  static marcarVersionComoErronea = DocumentosEstadosService.marcarVersionComoErronea
  static marcarVersionComoObsoleta = DocumentosEstadosService.marcarVersionComoObsoleta
  static restaurarEstadoVersion = DocumentosEstadosService.restaurarEstadoVersion

  // ============================================
  // REEMPLAZO → documentos-reemplazo.service.ts (GENÉRICO)
  // ============================================

  /**
   * Wrapper para mantener compatibilidad - usa servicio genérico
   * Por defecto asume 'proyecto' para mantener compatibilidad con código existente
   */
  static async reemplazarArchivoSeguro(
    documentoId: string,
    nuevoArchivo: File,
    motivo: string,
    password: string,
    tipoEntidad: 'proyecto' | 'vivienda' | 'cliente' = 'proyecto'
  ) {
    return DocumentosReemplazoService.reemplazarArchivoSeguro(
      documentoId,
      nuevoArchivo,
      motivo,
      password,
      tipoEntidad
    )
  }

  // ============================================
  // ELIMINACIÓN → documentos-eliminacion.service.ts (GENÉRICO)
  // ============================================

  /**
   * ✅ GENÉRICO: Archivar documento (con default para compatibilidad)
   */
  static async archivarDocumento(
    documentoId: string,
    tipoEntidad: 'proyecto' | 'vivienda' | 'cliente' = 'proyecto'
  ) {
    return DocumentosEliminacionService.archivarDocumento(documentoId, tipoEntidad)
  }

  /**
   * ✅ GENÉRICO: Restaurar documento archivado
   */
  static async restaurarDocumento(
    documentoId: string,
    tipoEntidad: 'proyecto' | 'vivienda' | 'cliente' = 'proyecto'
  ) {
    return DocumentosEliminacionService.restaurarDocumentoArchivado(documentoId, tipoEntidad)
  }

  /**
   * ✅ GENÉRICO: Obtener documentos archivados
   */
  static async obtenerDocumentosArchivados(
    entidadId: string,
    tipoEntidad: 'proyecto' | 'vivienda' | 'cliente' = 'proyecto'
  ) {
    return DocumentosEliminacionService.obtenerDocumentosArchivados(entidadId, tipoEntidad)
  }

  /**
   * ✅ GENÉRICO: Eliminar documento (soft delete)
   */
  static async eliminarDocumento(
    documentoId: string,
    tipoEntidad: 'proyecto' | 'vivienda' | 'cliente' = 'proyecto'
  ) {
    return DocumentosEliminacionService.eliminarDocumento(documentoId, tipoEntidad)
  }

  /**
   * ✅ GENÉRICO: Obtener documentos eliminados (papelera)
   */
  static async obtenerDocumentosEliminados(
    tipoEntidad?: 'proyecto' | 'vivienda' | 'cliente'
  ) {
    return DocumentosEliminacionService.obtenerDocumentosEliminados(tipoEntidad)
  }

  /**
   * ✅ GENÉRICO: Restaurar documento eliminado
   */
  static async restaurarDocumentoEliminado(
    documentoId: string,
    tipoEntidad: 'proyecto' | 'vivienda' | 'cliente' = 'proyecto'
  ) {
    return DocumentosEliminacionService.restaurarDocumentoEliminado(documentoId, tipoEntidad)
  }

  /**
   * ✅ GENÉRICO: Eliminar definitivo (hard delete)
   */
  static async eliminarDefinitivo(
    documentoId: string,
    tipoEntidad: 'proyecto' | 'vivienda' | 'cliente' = 'proyecto'
  ) {
    return DocumentosEliminacionService.eliminarDefinitivo(documentoId, tipoEntidad)
  }
}

// Re-exportar servicios especializados para uso directo (opcional)
export {
    DocumentosBaseService, DocumentosEliminacionService, DocumentosEstadosService,
    DocumentosReemplazoService, DocumentosStorageService, DocumentosVersionesService
}

// Mantener compatibilidad con singleton (si se usaba)
export const documentosService = DocumentosService
