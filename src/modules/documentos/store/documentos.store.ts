// ============================================
// STORE: Documentos (Zustand)
// ============================================

import { create } from 'zustand'
import { CategoriasService, DocumentosService } from '../services'
import type {
    CategoriaDocumento,
    DocumentoProyecto,
} from '../types'

interface DocumentosState {
  // Datos
  documentos: DocumentoProyecto[]
  categorias: CategoriaDocumento[]
  documentoSeleccionado: DocumentoProyecto | null

  // Filtros y búsqueda
  categoriaFiltro: string | null
  etiquetasFiltro: string[]
  busqueda: string
  soloImportantes: boolean

  // Estados de carga
  cargandoDocumentos: boolean
  cargandoCategorias: boolean
  subiendoDocumento: boolean

  // UI
  modalSubirAbierto: boolean
  modalViewerAbierto: boolean
  modalCategoriasAbierto: boolean

  // Acciones - Documentos
  cargarDocumentos: (proyectoId: string) => Promise<void>
  subirDocumento: (params: any, userId: string) => Promise<void>
  actualizarDocumento: (documentoId: string, updates: any) => Promise<void>
  eliminarDocumento: (documentoId: string) => Promise<void>
  toggleImportante: (documentoId: string) => Promise<void>
  seleccionarDocumento: (documento: DocumentoProyecto | null) => void

  // Acciones - Categorías
  cargarCategorias: (userId: string) => Promise<void>
  crearCategoria: (userId: string, categoria: any) => Promise<void>
  actualizarCategoria: (categoriaId: string, updates: any) => Promise<void>
  eliminarCategoria: (categoriaId: string) => Promise<void>
  inicializarCategoriasDefault: (userId: string) => Promise<void>

  // Acciones - Filtros
  setFiltroCategoria: (categoriaId: string | null) => void
  setFiltroEtiquetas: (etiquetas: string[]) => void
  setBusqueda: (busqueda: string) => void
  toggleSoloImportantes: () => void
  limpiarFiltros: () => void

  // Acciones - UI
  abrirModalSubir: () => void
  cerrarModalSubir: () => void
  abrirModalViewer: (documento: DocumentoProyecto) => void
  cerrarModalViewer: () => void
  abrirModalCategorias: () => void
  cerrarModalCategorias: () => void
}

export const useDocumentosStore = create<DocumentosState>((set, get) => ({
  // Estado inicial
  documentos: [],
  categorias: [],
  documentoSeleccionado: null,

  categoriaFiltro: null,
  etiquetasFiltro: [],
  busqueda: '',
  soloImportantes: false,

  cargandoDocumentos: true,
  cargandoCategorias: true,
  subiendoDocumento: false,

  modalSubirAbierto: false,
  modalViewerAbierto: false,
  modalCategoriasAbierto: false,

  // ============================================
  // ACCIONES - DOCUMENTOS
  // ============================================

  cargarDocumentos: async (proyectoId: string) => {
    set({ cargandoDocumentos: true })
    try {
      const documentos =
        await DocumentosService.obtenerDocumentosPorProyecto(proyectoId)
      set({ documentos })
    } catch (error) {
      console.error('Error cargando documentos:', error)
    } finally {
      set({ cargandoDocumentos: false })
    }
  },

  subirDocumento: async (params: any, userId: string) => {
    set({ subiendoDocumento: true })
    try {
      const nuevoDocumento = await DocumentosService.subirDocumento(
        params,
        userId
      )
      set(state => ({
        documentos: [nuevoDocumento, ...state.documentos],
        modalSubirAbierto: false,
      }))
    } catch (error) {
      console.error('Error subiendo documento:', error)
      throw error
    } finally {
      set({ subiendoDocumento: false })
    }
  },

  actualizarDocumento: async (documentoId: string, updates: any) => {
    try {
      const documentoActualizado = await DocumentosService.actualizarDocumento(
        documentoId,
        updates
      )
      set(state => ({
        documentos: state.documentos.map(doc =>
          doc.id === documentoId ? documentoActualizado : doc
        ),
        documentoSeleccionado:
          state.documentoSeleccionado?.id === documentoId
            ? documentoActualizado
            : state.documentoSeleccionado,
      }))
    } catch (error) {
      console.error('Error actualizando documento:', error)
      throw error
    }
  },

  eliminarDocumento: async (documentoId: string) => {
    try {
      await DocumentosService.eliminarDocumento(documentoId)
      set(state => ({
        documentos: state.documentos.filter(doc => doc.id !== documentoId),
        documentoSeleccionado: null,
        modalViewerAbierto: false,
      }))
    } catch (error) {
      console.error('Error eliminando documento:', error)
      throw error
    }
  },

  toggleImportante: async (documentoId: string) => {
    try {
      const documento = get().documentos.find(doc => doc.id === documentoId)
      if (!documento) return

      const documentoActualizado = await DocumentosService.toggleImportante(
        documentoId,
        !documento.es_importante
      )

      set(state => ({
        documentos: state.documentos.map(doc =>
          doc.id === documentoId ? documentoActualizado : doc
        ),
      }))
    } catch (error) {
      console.error('Error toggle importante:', error)
      throw error
    }
  },

  seleccionarDocumento: (documento: DocumentoProyecto | null) => {
    set({ documentoSeleccionado: documento })
  },

  // ============================================
  // ACCIONES - CATEGORÍAS
  // ============================================

  cargarCategorias: async (userId: string) => {
    set({ cargandoCategorias: true })
    try {
      const categorias = await CategoriasService.obtenerCategorias(userId)
      set({ categorias })
    } catch (error) {
      console.error('Error cargando categorías:', error)
    } finally {
      set({ cargandoCategorias: false })
    }
  },

  crearCategoria: async (userId: string, categoria: any) => {
    try {
      const nuevaCategoria = await CategoriasService.crearCategoria(
        userId,
        categoria
      )
      set(state => ({
        categorias: [...state.categorias, nuevaCategoria],
      }))
    } catch (error) {
      console.error('Error creando categoría:', error)
      throw error
    }
  },

  actualizarCategoria: async (categoriaId: string, updates: any) => {
    try {
      const categoriaActualizada = await CategoriasService.actualizarCategoria(
        categoriaId,
        updates
      )
      set(state => ({
        categorias: state.categorias.map(cat =>
          cat.id === categoriaId ? categoriaActualizada : cat
        ),
      }))
    } catch (error) {
      console.error('Error actualizando categoría:', error)
      throw error
    }
  },

  eliminarCategoria: async (categoriaId: string) => {
    try {
      await CategoriasService.eliminarCategoria(categoriaId)
      set(state => ({
        categorias: state.categorias.filter(cat => cat.id !== categoriaId),
      }))
    } catch (error) {
      console.error('Error eliminando categoría:', error)
      throw error
    }
  },

  inicializarCategoriasDefault: async (userId: string) => {
    try {
      const categorias = await CategoriasService.crearCategoriasDefault(userId)
      set({ categorias })
    } catch (error) {
      console.error('Error inicializando categorías:', error)
      throw error
    }
  },

  // ============================================
  // ACCIONES - FILTROS
  // ============================================

  setFiltroCategoria: (categoriaId: string | null) => {
    set({ categoriaFiltro: categoriaId })
  },

  setFiltroEtiquetas: (etiquetas: string[]) => {
    set({ etiquetasFiltro: etiquetas })
  },

  setBusqueda: (busqueda: string) => {
    set({ busqueda })
  },

  toggleSoloImportantes: () => {
    set(state => ({ soloImportantes: !state.soloImportantes }))
  },

  limpiarFiltros: () => {
    set({
      categoriaFiltro: null,
      etiquetasFiltro: [],
      busqueda: '',
      soloImportantes: false,
    })
  },

  // ============================================
  // ACCIONES - UI
  // ============================================

  abrirModalSubir: () => {
    set({ modalSubirAbierto: true })
  },

  cerrarModalSubir: () => {
    set({ modalSubirAbierto: false })
  },

  abrirModalViewer: (documento: DocumentoProyecto) => {
    set({
      documentoSeleccionado: documento,
      modalViewerAbierto: true,
    })
  },

  cerrarModalViewer: () => {
    set({
      modalViewerAbierto: false,
      documentoSeleccionado: null,
    })
  },

  abrirModalCategorias: () => {
    set({ modalCategoriasAbierto: true })
  },

  cerrarModalCategorias: () => {
    set({ modalCategoriasAbierto: false })
  },
}))

// ============================================
// SELECTORES
// ============================================

// Documentos filtrados
export const selectDocumentosFiltrados = (state: DocumentosState) => {
  let documentos = state.documentos

  // Filtro por categoría
  if (state.categoriaFiltro) {
    documentos = documentos.filter(
      doc => doc.categoria_id === state.categoriaFiltro
    )
  }

  // Filtro por etiquetas
  if (state.etiquetasFiltro.length > 0) {
    documentos = documentos.filter(doc =>
      state.etiquetasFiltro.some(etiqueta => doc.etiquetas?.includes(etiqueta))
    )
  }

  // Filtro solo importantes
  if (state.soloImportantes) {
    documentos = documentos.filter(doc => doc.es_importante)
  }

  // Búsqueda por texto
  if (state.busqueda) {
    const busquedaLower = state.busqueda.toLowerCase()
    documentos = documentos.filter(
      doc =>
        doc.titulo.toLowerCase().includes(busquedaLower) ||
        doc.nombre_original.toLowerCase().includes(busquedaLower) ||
        doc.descripcion?.toLowerCase().includes(busquedaLower)
    )
  }

  return documentos
}

// Estadísticas
export const selectEstadisticas = (state: DocumentosState) => {
  const total = state.documentos.length
  const importantes = state.documentos.filter(doc => doc.es_importante).length
  const porVencer = state.documentos.filter(doc => {
    if (!doc.fecha_vencimiento) return false
    const fechaVenc = new Date(doc.fecha_vencimiento)
    const hoy = new Date()
    const diasDiff =
      (fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    return diasDiff > 0 && diasDiff <= 30
  }).length

  const porCategoria = state.categorias.map(cat => ({
    categoria: cat,
    count: state.documentos.filter(doc => doc.categoria_id === cat.id).length,
  }))

  return {
    total,
    importantes,
    porVencer,
    porCategoria,
  }
}
