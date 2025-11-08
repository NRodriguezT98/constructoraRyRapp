/**
 * ============================================
 * STORE: Documentos (Zustand - SOLO UI)
 * ============================================
 *
 * REFACTORIZADO: Eliminadas acciones de servidor
 * - ❌ cargarDocumentos, subirDocumento, etc (ahora en React Query)
 * - ✅ Solo estado UI: filtros, modales, búsqueda
 *
 * USAR:
 * - useDocumentosQuery para datos del servidor
 * - useDocumentosStore para estado UI
 */

import { create } from 'zustand'

import type { DocumentoProyecto } from '../types'

interface DocumentosState {
  // ============================================
  // ESTADO UI (Solo esto debe estar aquí)
  // ============================================

  // Filtros y búsqueda
  categoriaFiltro: string | null
  etiquetasFiltro: string[]
  busqueda: string
  soloImportantes: boolean

  // UI Modales
  modalSubirAbierto: boolean
  modalViewerAbierto: boolean
  modalCategoriasAbierto: boolean

  // UI Documento seleccionado
  documentoSeleccionado: DocumentoProyecto | null

  // Módulo actual (para filtrar categorías)
  moduloActual: 'proyectos' | 'clientes' | 'viviendas'

  // ============================================
  // ACCIONES - FILTROS
  // ============================================

  setFiltroCategoria: (categoriaId: string | null) => void
  setFiltroEtiquetas: (etiquetas: string[]) => void
  setBusqueda: (busqueda: string) => void
  toggleSoloImportantes: () => void
  limpiarFiltros: () => void

  // ============================================
  // ACCIONES - UI
  // ============================================

  abrirModalSubir: () => void
  cerrarModalSubir: () => void
  abrirModalViewer: (documento: DocumentoProyecto) => void
  cerrarModalViewer: () => void
  abrirModalCategorias: () => void
  cerrarModalCategorias: () => void
  seleccionarDocumento: (documento: DocumentoProyecto | null) => void
  setModuloActual: (modulo: 'proyectos' | 'clientes' | 'viviendas') => void
}

export const useDocumentosStore = create<DocumentosState>((set) => ({
  // Estado inicial
  categoriaFiltro: null,
  etiquetasFiltro: [],
  busqueda: '',
  soloImportantes: false,

  modalSubirAbierto: false,
  modalViewerAbierto: false,
  modalCategoriasAbierto: false,

  documentoSeleccionado: null,
  moduloActual: 'proyectos',

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
    set((state) => ({ soloImportantes: !state.soloImportantes }))
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

  seleccionarDocumento: (documento: DocumentoProyecto | null) => {
    set({ documentoSeleccionado: documento })
  },

  setModuloActual: (modulo: 'proyectos' | 'clientes' | 'viviendas') => {
    set({ moduloActual: modulo })
  },
}))

// ============================================
// SELECTORES (mantener solo helpers de UI)
// ============================================

// Helper para lógica de filtrado (usado por hooks)
export function filtrarDocumentos(
  documentos: DocumentoProyecto[],
  filtros: {
    categoriaFiltro: string | null
    etiquetasFiltro: string[]
    busqueda: string
    soloImportantes: boolean
  }
): DocumentoProyecto[] {
  let resultado = documentos

  // Filtro por categoría
  if (filtros.categoriaFiltro) {
    resultado = resultado.filter(
      (doc) => doc.categoria_id === filtros.categoriaFiltro
    )
  }

  // Filtro por etiquetas
  if (filtros.etiquetasFiltro.length > 0) {
    resultado = resultado.filter((doc) =>
      filtros.etiquetasFiltro.some((etiqueta) =>
        doc.etiquetas?.includes(etiqueta)
      )
    )
  }

  // Filtro solo importantes
  if (filtros.soloImportantes) {
    resultado = resultado.filter((doc) => doc.es_importante)
  }

  // Búsqueda por texto
  if (filtros.busqueda) {
    const busquedaLower = filtros.busqueda.toLowerCase()
    resultado = resultado.filter(
      (doc) =>
        doc.titulo.toLowerCase().includes(busquedaLower) ||
        doc.nombre_original.toLowerCase().includes(busquedaLower) ||
        doc.descripcion?.toLowerCase().includes(busquedaLower)
    )
  }

  return resultado
}
