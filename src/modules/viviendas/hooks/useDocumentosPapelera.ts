/**
 * 🗑️ HOOK: useDocumentosPapelera
 *
 * Lógica de negocio para gestión de documentos eliminados (papelera)
 * - Listar documentos eliminados
 * - Restaurar documentos
 * - Eliminar permanentemente
 */

import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { documentosViviendaService } from '@/modules/viviendas/services/documentos-vivienda.service'


interface UseDocumentosPapeleraParams {
  viviendaId: string
}

export function useDocumentosPapelera({ viviendaId }: UseDocumentosPapeleraParams) {
  const { user, perfil } = useAuth()
  const queryClient = useQueryClient()

  // ✅ QUERY: Obtener documentos eliminados
  const {
    data: documentosEliminados = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['documentos-eliminados', viviendaId],
    queryFn: () => documentosViviendaService.obtenerDocumentosEliminados(viviendaId),
    enabled: perfil?.rol === 'Administrador', // Solo Admin puede ver
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // ✅ Contar total de documentos raíz (no versiones)
  const cantidadEliminados = documentosEliminados.length

  // ✅ MUTATION: Restaurar documento
  const restaurarMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user || !perfil) {
        throw new Error('Debe iniciar sesión')
      }
      return documentosViviendaService.restaurarDocumento(id, user.id, perfil.rol)
    },
    onMutate: () => {
      toast.loading('Restaurando documento...', { id: 'restore-doc' })
    },
    onSuccess: () => {
      // Invalidar queries
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['documentos-vivienda', viviendaId],
      })

      toast.success('Documento restaurado correctamente', {
        id: 'restore-doc',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al restaurar', {
        id: 'restore-doc',
      })
    },
  })

  // ✅ MUTATION: Eliminar permanentemente
  const eliminarPermanenteMutation = useMutation({
    mutationFn: async ({ id, motivo, soloEstaVersion = false }: { id: string; motivo: string; soloEstaVersion?: boolean }) => {
      if (!user || !perfil) {
        throw new Error('Debe iniciar sesión')
      }
      return documentosViviendaService.eliminarPermanente(id, user.id, perfil.rol, motivo, soloEstaVersion)
    },
    onMutate: () => {
      toast.loading('Eliminando permanentemente...', { id: 'delete-permanent' })
    },
    onSuccess: () => {
      // Invalidar query de papelera
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados', viviendaId],
      })

      toast.success('Documento eliminado permanentemente', {
        id: 'delete-permanent',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar permanentemente', {
        id: 'delete-permanent',
      })
    },
  })

  // ✅ Handler: Restaurar documento
  const handleRestaurar = useCallback(
    async (id: string, titulo: string) => {
      const confirmado = window.confirm(
        `¿Restaurar el documento "${titulo}"?\n\nEl documento volverá a estar activo con todas sus versiones.`
      )

      if (!confirmado) return

      try {
        await restaurarMutation.mutateAsync(id)
      } catch (error) {
        console.error('❌ Error al restaurar documento:', error)
      }
    },
    [restaurarMutation]
  )

  // ✅ Handler: Eliminar permanentemente
  const handleEliminarPermanente = useCallback(
    async (id: string, titulo: string, soloEstaVersion: boolean = false) => {
      // 1. Primera confirmación
      const mensaje = soloEstaVersion
        ? `⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE\n\n` +
          `Vas a eliminar PERMANENTEMENTE esta versión:\n` +
          `"${titulo}"\n\n` +
          `Se eliminarán:\n` +
          `- El registro de esta versión\n` +
          `- El archivo físico de Storage\n\n` +
          `¿Estás ABSOLUTAMENTE seguro?`
        : `⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE\n\n` +
          `Vas a eliminar PERMANENTEMENTE:\n` +
          `"${titulo}" y TODAS sus versiones\n\n` +
          `Se eliminarán:\n` +
          `- Todos los registros de la base de datos\n` +
          `- Todos los archivos físicos de Storage\n\n` +
          `¿Estás ABSOLUTAMENTE seguro?`

      const confirmado = window.confirm(mensaje)

      if (!confirmado) return

      // 2. Solicitar motivo
      const motivo = window.prompt(
        `Proporciona el motivo de eliminación PERMANENTE (mínimo 20 caracteres):`
      )

      if (!motivo) return

      if (motivo.trim().length < 20) {
        toast.error('El motivo debe tener al menos 20 caracteres')
        return
      }

      // 3. Segunda confirmación (doble check)
      const confirmadoFinal = window.confirm(
        `🔥 ÚLTIMA CONFIRMACIÓN\n\n` +
        `Eliminarás PERMANENTEMENTE "${titulo}"\n\n` +
        `Motivo: ${motivo}\n\n` +
        `Esta acción NO se puede deshacer.\n` +
        `¿Proceder?`
      )

      if (!confirmadoFinal) return

      try {
        await eliminarPermanenteMutation.mutateAsync({
          id,
          motivo: motivo.trim(),
          soloEstaVersion
        })
      } catch (error) {
        console.error('❌ Error al eliminar permanentemente:', error)
      }
    },
    [eliminarPermanenteMutation]
  )

  return {
    // Data
    documentosEliminados,
    isLoading,
    error: error ? (error as Error).message : null,
    cantidadEliminados,

    // Actions
    handleRestaurar,
    handleEliminarPermanente,
    refetch,

    // States
    isRestaurando: restaurarMutation.isPending,
    isEliminandoPermanente: eliminarPermanenteMutation.isPending,
  }
}
