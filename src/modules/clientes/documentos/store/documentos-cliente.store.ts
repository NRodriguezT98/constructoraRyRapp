// ============================================
// STORE: Documentos Cliente
// Zustand store for client document state
// ============================================

import { create } from 'zustand'

import type { CategoriaDocumento } from '@/modules/documentos/types/documento.types'

interface DocumentosClienteState {
  // Categorías
  categorias: CategoriaDocumento[]
  cargandoCategorias: boolean
  cargarCategorias: (userId: string) => Promise<void>

  // Filtros
  categoriaFiltro: string | null
  busqueda: string
  soloImportantes: boolean

  // Setters
  setCategoriaFiltro: (categoria: string | null) => void
  setBusqueda: (busqueda: string) => void
  setSoloImportantes: (solo: boolean) => void
  limpiarFiltros: () => void
}

export const useDocumentosClienteStore = create<DocumentosClienteState>((set) => ({
  categorias: [],
  cargandoCategorias: false,
  cargarCategorias: async (_userId: string) => {
    // Stub — implement with actual service when available
  },

  categoriaFiltro: null,
  busqueda: '',
  soloImportantes: false,

  setCategoriaFiltro: (categoria) => set({ categoriaFiltro: categoria }),
  setBusqueda: (busqueda) => set({ busqueda }),
  setSoloImportantes: (solo) => set({ soloImportantes: solo }),
  limpiarFiltros: () => set({ categoriaFiltro: null, busqueda: '', soloImportantes: false }),
}))
