/**
 * @file useDocumentosVivienda.ts
 * @description Hook de React Query para gestión de documentos de viviendas
 * @module viviendas/hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'

/**
 * DEPRECATED: Usar hooks de documentos/useDocumentosViviendaQuery.ts
 * Este archivo se mantiene por compatibilidad temporal
 */

/**
 * Hook para gestionar documentos de una vivienda
 */
export function useDocumentosVivienda(viviendaId: string) {
  const { user, perfil } = useAuth()
  const queryClient = useQueryClient()

  // ✅ QUERY: Obtener documentos
  const {
    data: documentos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['documentos-vivienda', viviendaId],
    queryFn: () => documentosViviendaService.obtenerDocumentos(viviendaId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos en caché
    enabled: !!viviendaId, // Solo ejecutar si hay ID
  })

  // ✅ MUTATION: Subir documento
  const subirMutation = useMutation({
    mutationFn: (params: SubirDocumentoParams) =>
      documentosViviendaService.subirDocumento(params),
    onMutate: () => {
      toast.loading('Subiendo documento...', { id: 'upload-doc' })
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['documentos-vivienda', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['estadisticas-documentos-vivienda', viviendaId],
      })

      toast.success(`Documento "${data.titulo}" subido correctamente`, {
        id: 'upload-doc',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al subir documento', {
        id: 'upload-doc',
      })
    },
  })

  // ✅ MUTATION: Actualizar documento
  const actualizarMutation = useMutation({
    mutationFn: (params: ActualizarDocumentoParams) =>
      documentosViviendaService.actualizarDocumento(params),
    onMutate: () => {
      toast.loading('Actualizando documento...', { id: 'update-doc' })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['documentos-vivienda', viviendaId],
      })

      toast.success(`Documento "${data.titulo}" actualizado`, {
        id: 'update-doc',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar', {
        id: 'update-doc',
      })
    },
  })

  // ✅ MUTATION: Eliminar documento
  const eliminarMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      if (!user || !perfil) {
        throw new Error('Debe iniciar sesión')
      }
      return documentosViviendaService.eliminarDocumento(id, user.id, perfil.rol, motivo)
    },
    onMutate: () => {
      toast.loading('Eliminando documento...', { id: 'delete-doc' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['documentos-vivienda', viviendaId],
      })
      queryClient.invalidateQueries({
        queryKey: ['estadisticas-documentos-vivienda', viviendaId],
      })
      // ✅ IMPORTANTE: Invalidar papelera para mostrar documentos eliminados
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados', viviendaId],
      })

      toast.success('Documento eliminado correctamente', {
        id: 'delete-doc',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar', {
        id: 'delete-doc',
      })
    },
  })

  // ✅ MUTATION: Descargar documento
  const descargarMutation = useMutation({
    mutationFn: async ({
      id,
      nombreOriginal,
    }: {
      id: string
      nombreOriginal: string
    }) => {
      const blob = await documentosViviendaService.descargarDocumento(id)

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = nombreOriginal
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    },
    onMutate: () => {
      toast.loading('Descargando documento...', { id: 'download-doc' })
    },
    onSuccess: () => {
      toast.success('Descarga iniciada', { id: 'download-doc' })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al descargar', {
        id: 'download-doc',
      })
    },
  })

  // ✅ MUTATION: Ver documento (obtener URL firmada)
  const verDocumentoMutation = useMutation({
    mutationFn: async (id: string) => {
      const url = await documentosViviendaService.obtenerUrlFirmada(id, 3600) // 1 hora
      return url
    },
    onSuccess: (url) => {
      // Abrir en nueva pestaña
      window.open(url, '_blank', 'noopener,noreferrer')
      toast.success('Abriendo documento en nueva pestaña...', {
        duration: 2000,
      })
    },
    onError: (error: Error) => {
      const message = error.message || 'Error al abrir documento'

      // Mostrar mensaje más amigable si el archivo no existe
      if (message.includes('no existe en Storage')) {
        toast.error(
          'El archivo físico no se encuentra disponible. Podría haber sido eliminado.',
          {
            duration: 5000,
            description: 'Contacta al administrador si necesitas recuperar este documento.',
          }
        )
      } else {
        toast.error(message, {
          duration: 4000,
        })
      }
    },
  })

  return {
    // Data
    documentos,
    isLoading,
    error,

    // Actions
    subirDocumento: subirMutation.mutateAsync,
    actualizarDocumento: actualizarMutation.mutateAsync,
    eliminarDocumento: eliminarMutation.mutateAsync,
    descargarDocumento: descargarMutation.mutateAsync,
    verDocumento: verDocumentoMutation.mutateAsync,
    refetch,

    // States
    isSubiendo: subirMutation.isPending,
    isActualizando: actualizarMutation.isPending,
    isEliminando: eliminarMutation.isPending,
    isDescargando: descargarMutation.isPending,
    isViendoDocumento: verDocumentoMutation.isPending,
  }
}

/**
 * Hook para obtener estadísticas de documentos
 */
export function useEstadisticasDocumentosVivienda(viviendaId: string) {
  return useQuery({
    queryKey: ['estadisticas-documentos-vivienda', viviendaId],
    queryFn: () =>
      documentosViviendaService.obtenerEstadisticas(viviendaId),
    staleTime: 1000 * 60 * 5,
    enabled: !!viviendaId,
  })
}
