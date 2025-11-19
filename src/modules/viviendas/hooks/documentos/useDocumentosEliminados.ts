/**
 * 🗑️ HOOK: useDocumentosEliminados - VIVIENDAS
 *
 * Lógica de negocio para la Papelera de Documentos de Viviendas (Admin Only)
 * - Cargar documentos eliminados (soft delete)
 * - Restaurar documento (estado = 'activo')
 * - Eliminar definitivo (DELETE físico BD + Storage)
 *
 * ADAPTADO DESDE: src/modules/documentos/hooks/useDocumentosEliminados.ts
 */

import { useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { DocumentosViviendaService } from '../../services/documentos'

// Tipos para estado de modales
interface ModalState {
  isOpen: boolean
  documentoId: string
  titulo: string
}

export function useDocumentosEliminados() {
  const { perfil } = useAuth()
  const queryClient = useQueryClient()

  // Estados locales UI
  const [busqueda, setBusqueda] = useState('')
  const [viviendaFiltro, setViviendaFiltro] = useState<string>('todos')

  // 🆕 Estados para modales custom
  const [modalRestaurar, setModalRestaurar] = useState<ModalState>({
    isOpen: false,
    documentoId: '',
    titulo: '',
  })

  const [modalEliminar, setModalEliminar] = useState<ModalState>({
    isOpen: false,
    documentoId: '',
    titulo: '',
  })

  const [confirmacionTexto, setConfirmacionTexto] = useState('')

  // ✅ REACT QUERY: Cargar documentos eliminados
  const {
    data: documentos = [],
    isLoading: cargando,
    error,
    refetch,
  } = useQuery({
    queryKey: ['documentos-vivienda-eliminados'],
    queryFn: () => DocumentosViviendaService.obtenerDocumentosEliminados(),
    enabled: perfil?.rol === 'Administrador', // Solo admins
    staleTime: 30 * 1000, // 30 segundos (datos menos críticos)
    gcTime: 5 * 60 * 1000, // 5 minutos
  })

  // ✅ MUTATION: Restaurar documento
  const restaurarMutation = useMutation({
    mutationFn: (documentoId: string) =>
      DocumentosViviendaService.restaurarDocumentoEliminado(documentoId),
    onSuccess: async () => {
      toast.success('✅ Documento restaurado correctamente')

      // 🔧 FIX: Usar refetchQueries para forzar recarga INMEDIATA
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['documentos-vivienda-eliminados'] }),
        queryClient.refetchQueries({ queryKey: ['documentos-vivienda'] }), // ← Documentos activos de viviendas
        queryClient.refetchQueries({ queryKey: ['versiones-documento-vivienda'] }), // ← Historial de versiones
        queryClient.refetchQueries({ queryKey: ['versiones-eliminadas-vivienda'] }), // ← Versiones en papelera
      ])
    },
    onError: (error: any) => {
      console.error('Error al restaurar documento:', error)
      toast.error(error?.message || 'Error al restaurar el documento')
    },
  })

  // ✅ MUTATION: Eliminar definitivo
  const eliminarDefinitivoMutation = useMutation({
    mutationFn: (documentoId: string) =>
      DocumentosViviendaService.eliminarDefinitivo(documentoId),
    onSuccess: () => {
      toast.success('🗑️ Documento eliminado permanentemente')
      queryClient.invalidateQueries({ queryKey: ['documentos-vivienda-eliminados'] })
    },
    onError: (error: any) => {
      console.error('Error al eliminar definitivamente:', error)
      toast.error(error?.message || 'Error al eliminar el documento')
    },
  })

  // ✅ FILTROS: Búsqueda y vivienda
  const documentosFiltrados = useMemo(() => {
    let resultado = [...documentos]

    // Filtro por búsqueda (título, categoría, vivienda)
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase()
      resultado = resultado.filter(
        (doc) =>
          doc.titulo?.toLowerCase().includes(termino) ||
          doc.categoria?.nombre?.toLowerCase().includes(termino) ||
          (doc as any).viviendas?.codigo?.toLowerCase().includes(termino)
      )
    }

    // Filtro por vivienda
    if (viviendaFiltro && viviendaFiltro !== 'todos') {
      resultado = resultado.filter((doc) => doc.vivienda_id === viviendaFiltro)
    }

    return resultado
  }, [documentos, busqueda, viviendaFiltro])

  // ✅ ESTADÍSTICAS
  const estadisticas = useMemo(() => {
    return {
      total: documentos.length,
      filtrados: documentosFiltrados.length,
      // Viviendas únicas
      viviendas: Array.from(
        new Set(documentos.map((d) => d.vivienda_id).filter(Boolean))
      ),
    }
  }, [documentos, documentosFiltrados])

  // ✅ ACCIONES
  const handleRestaurar = async (documentoId: string, titulo: string) => {
    // Abrir modal de confirmación
    setModalRestaurar({ isOpen: true, documentoId, titulo })
  }

  const confirmarRestaurar = async () => {
    await restaurarMutation.mutateAsync(modalRestaurar.documentoId)
    setModalRestaurar({ isOpen: false, documentoId: '', titulo: '' })
  }

  const handleEliminarDefinitivo = async (documentoId: string, titulo: string) => {
    // Abrir modal de confirmación con prompt
    setModalEliminar({ isOpen: true, documentoId, titulo })
    setConfirmacionTexto('') // Limpiar input
  }

  const confirmarEliminarDefinitivo = async () => {
    if (confirmacionTexto !== 'ELIMINAR') {
      toast.error('❌ Debes escribir "ELIMINAR" en mayúsculas para confirmar')
      return
    }

    await eliminarDefinitivoMutation.mutateAsync(modalEliminar.documentoId)
    setModalEliminar({ isOpen: false, documentoId: '', titulo: '' })
    setConfirmacionTexto('')
  }

  return {
    // Data
    documentos: documentosFiltrados,
    documentosOriginales: documentos,
    cargando,
    error: error as Error | null,
    estadisticas,

    // Filtros
    busqueda,
    setBusqueda,
    viviendaFiltro,
    setViviendaFiltro,

    // Acciones
    handleRestaurar,
    handleEliminarDefinitivo,
    refrescar: refetch,

    // Estados de mutations
    restaurando: restaurarMutation.isPending ? modalRestaurar.documentoId : null,
    eliminando: eliminarDefinitivoMutation.isPending ? modalEliminar.documentoId : null,

    // 🆕 Modales custom
    modalRestaurar,
    setModalRestaurar,
    confirmarRestaurar,
    modalEliminar,
    setModalEliminar,
    confirmarEliminarDefinitivo,
    confirmacionTexto,
    setConfirmacionTexto,
  }
}
