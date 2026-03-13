// ============================================
// HOOK: useDocumentosListaCliente (stub)
// ============================================

import { useState } from 'react'

interface UseDocumentosListaClienteParams {
  clienteId: string
}

export function useDocumentosListaCliente({ clienteId: _clienteId }: UseDocumentosListaClienteParams) {
  const [vista, setVista] = useState<'grid' | 'lista'>('lista')

  return {
    vista,
    setVista,
    cargandoDocumentos: false,
    documentosFiltrados: [] as any[],
    categorias: [] as any[],

    // Modales - Renombrar
    modalRenombrarAbierto: false,
    documentoRenombrar: null as any,
    closeModalRenombrar: () => {},
    handleConfirmarRenombrar: async (_nuevoNombre: string) => {},

    // Modales - Categorías
    modalCategoriasAbierto: false,
    documentoParaCategorizar: null as any,
    closeModalCategorias: () => {},
    handleConfirmarCategoria: async (_categoriaId: string) => {},

    // Handlers
    handleView: (_doc: any) => {},
    handleDownload: (_doc: any) => {},
    handleToggleImportante: async (_doc: any) => {},
    handleArchive: async (_doc: any) => {},
    handleDelete: async (_doc: any) => {},
    handleRename: (_doc: any) => {},
    handleAsignarCategoria: (_doc: any) => {},

    getCategoriaByDocumento: (_doc: any) => null as any,
    refrescarDocumentos: async () => {},

    // Filtros
    busqueda: '',
    categoriaFiltro: null as string | null,
    soloImportantes: false,
  }
}
