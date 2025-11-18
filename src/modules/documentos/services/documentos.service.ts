// ============================================
// SERVICE: Documentos - Fachada Principal
// ============================================
// Este archivo actúa como punto único de entrada para mantener
// compatibilidad con el código existente. Delega a servicios especializados.
// ============================================

import type { DocumentoProyecto } from '../types/documento.types'
import { DocumentosBaseService } from './documentos-base.service'
import { DocumentosVersionesService } from './documentos-versiones.service'
import { DocumentosStorageService } from './documentos-storage.service'
import { DocumentosEstadosService } from './documentos-estados.service'
import { DocumentosReemplazoService } from './documentos-reemplazo.service'
import { DocumentosEliminacionService } from './documentos-eliminacion.service'

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
  // REEMPLAZO → documentos-reemplazo.service.ts
  // ============================================

  static reemplazarArchivoSeguro = DocumentosReemplazoService.reemplazarArchivoSeguro

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
  DocumentosBaseService,
  DocumentosVersionesService,
  DocumentosStorageService,
  DocumentosEstadosService,
  DocumentosReemplazoService,
  DocumentosEliminacionService
}

// Mantener compatibilidad con singleton (si se usaba)
export const documentosService = DocumentosService
