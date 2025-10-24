// ============================================
// STORE: Documentos de Cliente (Zustand)
// ============================================

import { CategoriasService } from '@/modules/documentos/services/categorias.service'
import type { CategoriaDocumento } from '@/modules/documentos/types/documento.types'
import { create } from 'zustand'
import { DocumentosClienteService } from '../services/documentos-cliente.service'
import type { DocumentoCliente } from '../types'

interface DocumentosClienteState {
  // Datos
  documentos: DocumentoCliente[]
  categorias: CategoriaDocumento[]
  documentoSeleccionado: DocumentoCliente | null

  // Filtros
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
  vistaCategoriasActual: 'oculto' | 'visible'

  // Acciones - Documentos
  cargarDocumentos: (clienteId: string) => Promise<void>
  subirDocumento: (params: any, userId: string) => Promise<void>
  eliminarDocumento: (documentoId: string) => Promise<void>
  actualizarDocumento: (documentoId: string, updates: Partial<DocumentoCliente>) => Promise<void>
  actualizarDocumentoLocal: (documentoId: string, updates: Partial<DocumentoCliente>) => void

  // Acciones - Categorías
  cargarCategorias: (userId: string) => Promise<void>

  // Acciones - UI
  abrirModalSubir: () => void
  cerrarModalSubir: () => void
  mostrarCategorias: () => void
  ocultarCategorias: () => void
  abrirModalViewer: (documento: DocumentoCliente) => void
  cerrarModalViewer: () => void
  seleccionarDocumento: (documento: DocumentoCliente | null) => void

  // Acciones - Filtros
  setCategoriaFiltro: (categoriaId: string | null) => void
  setEtiquetasFiltro: (etiquetas: string[]) => void
  setBusqueda: (busqueda: string) => void
  setSoloImportantes: (solo: boolean) => void
  limpiarFiltros: () => void
}

export const useDocumentosClienteStore = create<DocumentosClienteState>((set, get) => ({
  // Estado inicial
  documentos: [],
  categorias: [],
  documentoSeleccionado: null,
  categoriaFiltro: null,
  etiquetasFiltro: [],
  busqueda: '',
  soloImportantes: false,
  cargandoDocumentos: false,
  cargandoCategorias: false,
  subiendoDocumento: false,
  modalSubirAbierto: false,
  modalViewerAbierto: false,
  vistaCategoriasActual: 'oculto',

  // Cargar documentos del cliente
  cargarDocumentos: async (clienteId: string) => {
    set({ cargandoDocumentos: true })
    try {
      const documentos = await DocumentosClienteService.obtenerDocumentosPorCliente(clienteId)
      set({ documentos })
    } catch (error) {
      console.error('Error al cargar documentos:', error)
      throw error
    } finally {
      set({ cargandoDocumentos: false })
    }
  },

  // Subir nuevo documento
  subirDocumento: async (params: any, userId: string) => {
    set({ subiendoDocumento: true })
    try {
      await DocumentosClienteService.subirDocumento(params, userId)
      // Recargar documentos del cliente
      await get().cargarDocumentos(params.cliente_id)
      set({ modalSubirAbierto: false })
    } catch (error) {
      console.error('Error al subir documento:', error)
      throw error
    } finally {
      set({ subiendoDocumento: false })
    }
  },

  // Eliminar documento
  eliminarDocumento: async (documentoId: string) => {
    try {
      const doc = get().documentos.find((d) => d.id === documentoId)
      if (!doc) return

      await DocumentosClienteService.eliminarDocumento(documentoId)

      // Recargar documentos
      await get().cargarDocumentos(doc.cliente_id)
    } catch (error) {
      console.error('Error al eliminar documento:', error)
      throw error
    }
  },

  // Actualizar documento
  actualizarDocumento: async (documentoId: string, updates: Partial<DocumentoCliente>) => {
    try {
      const docActualizado = await DocumentosClienteService.actualizarDocumento(
        documentoId,
        updates
      )

      // Actualizar en el estado local
      set((state) => ({
        documentos: state.documentos.map((d) =>
          d.id === documentoId ? docActualizado : d
        ),
      }))
    } catch (error) {
      console.error('Error al actualizar documento:', error)
      throw error
    }
  },

  // Actualizar documento localmente (sin llamar al servidor)
  // Útil para optimistic updates
  actualizarDocumentoLocal: (documentoId: string, updates: Partial<DocumentoCliente>) => {
    set((state) => ({
      documentos: state.documentos.map((d) =>
        d.id === documentoId ? { ...d, ...updates } : d
      ),
    }))
  },

  // Cargar categorías
  cargarCategorias: async (userId: string) => {
    set({ cargandoCategorias: true })
    try {
      // ✅ Sistema flexible: solo categorías de clientes
      const categorias = await CategoriasService.obtenerCategoriasPorModulo(
        userId,
        'clientes'
      )
      set({ categorias })
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      throw error
    } finally {
      set({ cargandoCategorias: false })
    }
  },

  // UI - Modales y Vistas
  abrirModalSubir: () => set({ modalSubirAbierto: true }),
  cerrarModalSubir: () => set({ modalSubirAbierto: false }),

  mostrarCategorias: () => set({ vistaCategoriasActual: 'visible' }),
  ocultarCategorias: () => set({ vistaCategoriasActual: 'oculto' }),

  abrirModalViewer: (documento: DocumentoCliente) =>
    set({ modalViewerAbierto: true, documentoSeleccionado: documento }),
  cerrarModalViewer: () =>
    set({ modalViewerAbierto: false, documentoSeleccionado: null }),

  seleccionarDocumento: (documento: DocumentoCliente | null) =>
    set({ documentoSeleccionado: documento }),

  // Filtros
  setCategoriaFiltro: (categoriaId: string | null) =>
    set({ categoriaFiltro: categoriaId }),

  setEtiquetasFiltro: (etiquetas: string[]) =>
    set({ etiquetasFiltro: etiquetas }),

  setBusqueda: (busqueda: string) => set({ busqueda }),

  setSoloImportantes: (solo: boolean) => set({ soloImportantes: solo }),

  limpiarFiltros: () =>
    set({
      categoriaFiltro: null,
      etiquetasFiltro: [],
      busqueda: '',
      soloImportantes: false,
    }),
}))

// Selector: Documentos filtrados
export const useDocumentosFiltrados = () => {
  const {
    documentos,
    categoriaFiltro,
    etiquetasFiltro,
    busqueda,
    soloImportantes,
  } = useDocumentosClienteStore()

  return documentos.filter((doc) => {
    // Filtro por categoría
    if (categoriaFiltro && doc.categoria_id !== categoriaFiltro) {
      return false
    }

    // Filtro por etiquetas
    if (
      etiquetasFiltro.length > 0 &&
      !etiquetasFiltro.some((tag) => doc.etiquetas?.includes(tag))
    ) {
      return false
    }

    // Filtro por búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase()
      const coincide =
        doc.titulo.toLowerCase().includes(busquedaLower) ||
        doc.descripcion?.toLowerCase().includes(busquedaLower) ||
        doc.nombre_original.toLowerCase().includes(busquedaLower)

      if (!coincide) return false
    }

    // Filtro por importantes
    if (soloImportantes && !doc.es_importante) {
      return false
    }

    return true
  })
}
