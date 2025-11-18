/**
 * @file useReemplazarArchivo.ts
 * @description Hook para reemplazo seguro de archivos (Admin Only, 48h límite)
 * @module viviendas/hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { documentosViviendaService } from '../services/documentos-vivienda.service'

interface ReemplazarArchivoParams {
  documentoId: string
  nuevoArchivo: File
  motivo: string
}

/**
 * Hook para reemplazo seguro de archivos
 * - Solo Admin
 * - Máximo 48 horas desde creación
 * - Crea backup automático
 */
export function useReemplazarArchivo(viviendaId?: string) {
  const queryClient = useQueryClient()

  // ============================================================================
  // REEMPLAZAR ARCHIVO SEGURO
  // ============================================================================

  const reemplazarArchivo = useMutation({
    mutationFn: async ({ documentoId, nuevoArchivo, motivo }: ReemplazarArchivoParams) => {
      await documentosViviendaService.reemplazarArchivoSeguro(
        documentoId,
        nuevoArchivo,
        motivo
      )
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      if (viviendaId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', viviendaId],
        })
        queryClient.invalidateQueries({
          queryKey: ['documento-versiones', variables.documentoId],
        })
      }

      toast.success('Archivo reemplazado exitosamente', {
        description: 'Se creó un backup del archivo original',
        duration: 5000,
      })
    },
    onError: (error: Error) => {
      console.error('❌ Error al reemplazar archivo:', error)

      // Mensajes específicos según el error
      let descripcion = error.message || 'No se pudo reemplazar el archivo'

      if (error.message.includes('48 horas')) {
        descripcion = 'Solo se pueden reemplazar archivos dentro de las primeras 48 horas'
      }

      toast.error('Error al reemplazar archivo', {
        description: descripcion,
        duration: 6000,
      })
    },
  })

  /**
   * Validar si un documento puede ser reemplazado
   * (dentro de las 48 horas desde creación)
   */
  const puedeReemplazar = (fechaCreacion: string): boolean => {
    const fecha = new Date(fechaCreacion)
    const ahora = new Date()
    const horasTranscurridas = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60)
    return horasTranscurridas <= 48
  }

  /**
   * Calcular horas restantes para poder reemplazar
   */
  const horasRestantes = (fechaCreacion: string): number => {
    const fecha = new Date(fechaCreacion)
    const ahora = new Date()
    const horasTranscurridas = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60)
    const restantes = 48 - horasTranscurridas
    return Math.max(0, Math.floor(restantes))
  }

  return {
    // Mutation
    reemplazarArchivo,

    // Loading state
    isReplacing: reemplazarArchivo.isPending,

    // Helpers
    puedeReemplazar,
    horasRestantes,
  }
}
