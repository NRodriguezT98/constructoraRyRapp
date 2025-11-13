/**
 * 🗑️ HOOK: useDocumentosEliminados
 *
 * Lógica de negocio para la Papelera de Documentos (Admin Only)
 * - Cargar documentos eliminados (soft delete)
 * - Restaurar documento (estado = 'activo')
 * - Eliminar definitivo (DELETE físico BD + Storage)
 */

import { useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { DocumentosService } from '../services/documentos.service'

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
  const [proyectoFiltro, setProyectoFiltro] = useState<string>('todos')

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
    queryKey: ['documentos-eliminados'],
    queryFn: () => DocumentosService.obtenerDocumentosEliminados(),
    enabled: perfil?.rol === 'Administrador', // Solo admins
    staleTime: 30 * 1000, // 30 segundos (datos menos críticos)
    gcTime: 5 * 60 * 1000, // 5 minutos
  })

  // ✅ MUTATION: Restaurar documento
  const restaurarMutation = useMutation({
    mutationFn: (documentoId: string) =>
      DocumentosService.restaurarDocumentoEliminado(documentoId),
    onSuccess: async () => {
      toast.success('✅ Documento restaurado correctamente')

      // 🔧 FIX: Usar refetchQueries para forzar recarga INMEDIATA
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['documentos-eliminados'] }),
        queryClient.refetchQueries({ queryKey: ['documentos'] }), // ← Documentos activos (proyectos)
        queryClient.refetchQueries({ queryKey: ['documentos-vivienda'] }), // ← Documentos de viviendas
        queryClient.refetchQueries({ queryKey: ['versiones-documento'] }), // ← Historial de versiones
        queryClient.refetchQueries({ queryKey: ['versiones-eliminadas'] }), // ← Versiones en papelera
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
      DocumentosService.eliminarDefinitivo(documentoId),
    onSuccess: () => {
      toast.success('🗑️ Documento eliminado permanentemente')
      queryClient.invalidateQueries({ queryKey: ['documentos-eliminados'] })
    },
    onError: (error: any) => {
      console.error('Error al eliminar definitivamente:', error)
      toast.error(error?.message || 'Error al eliminar el documento')
    },
  })

  // ✅ FILTROS: Búsqueda y proyecto
  const documentosFiltrados = useMemo(() => {
    let resultado = [...documentos]

    // Filtro por búsqueda (título, categoría, proyecto)
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase()
      resultado = resultado.filter(
        (doc) =>
          doc.titulo?.toLowerCase().includes(termino) ||
          doc.categoria?.nombre?.toLowerCase().includes(termino) ||
          (doc as any).proyectos?.nombre?.toLowerCase().includes(termino)
      )
    }

    // Filtro por proyecto
    if (proyectoFiltro && proyectoFiltro !== 'todos') {
      resultado = resultado.filter((doc) => doc.proyecto_id === proyectoFiltro)
    }

    return resultado
  }, [documentos, busqueda, proyectoFiltro])

  // ✅ ESTADÍSTICAS
  const estadisticas = useMemo(() => {
    return {
      total: documentos.length,
      filtrados: documentosFiltrados.length,
      // Proyectos únicos
      proyectos: Array.from(
        new Set(documentos.map((d) => d.proyecto_id).filter(Boolean))
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
    proyectoFiltro,
    setProyectoFiltro,

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
