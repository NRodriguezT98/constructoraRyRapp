/**
 * Hook para reemplazo seguro de archivos de documentos de proyecto
 * Implementa validación de ventana de 48 horas y creación de backups
 */

import { DocumentosService } from '@/modules/documentos/services/documentos.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

export interface ReemplazarArchivoParams {
  documentoId: string
  nuevoArchivo: File
  motivo: string
  password: string
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useReemplazarArchivoProyecto(proyectoId?: string) {
  const queryClient = useQueryClient()

  // ============================================================================
  // REEMPLAZAR ARCHIVO
  // ============================================================================

  const reemplazarArchivo = useMutation({
    mutationFn: async ({
      documentoId,
      nuevoArchivo,
      motivo,
      password,
    }: ReemplazarArchivoParams) => {
      await DocumentosService.reemplazarArchivoSeguro(
        documentoId,
        nuevoArchivo,
        motivo,
        password,
        'proyecto' // ✅ Tipo de entidad
      )
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      if (proyectoId) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-proyecto', proyectoId],
        })
      }
      queryClient.invalidateQueries({
        queryKey: ['documento-versiones', variables.documentoId],
      })

      toast.success('Archivo reemplazado', {
        description: 'El archivo ha sido reemplazado correctamente. Se ha creado un backup del archivo original.',
      })
    },
    onError: (error: Error) => {
      console.error('❌ Error al reemplazar archivo:', error)
      toast.error('Error al reemplazar archivo', {
        description: error.message,
      })
    },
  })

  return {
    reemplazarArchivo,
    isPending: reemplazarArchivo.isPending,
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Calcula si un documento puede ser reemplazado (dentro de 48 horas)
 */
export function puedeReemplazarArchivo(fechaCreacion: string | Date): boolean {
  const fecha = new Date(fechaCreacion)
  const ahora = new Date()
  const horasTranscurridas = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60)
  return horasTranscurridas <= 48
}

/**
 * Calcula las horas restantes para poder reemplazar un archivo
 */
export function horasRestantesParaReemplazo(fechaCreacion: string | Date): number {
  const fecha = new Date(fechaCreacion)
  const ahora = new Date()
  const horasTranscurridas = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60)
  const horasRestantes = 48 - horasTranscurridas
  return Math.max(0, Math.floor(horasRestantes))
}
