/**
 * ✅ GENÉRICO: Hook para gestión de versiones de documentos
 *
 * Este hook es genérico y soporta todos los tipos de entidad.
 * Re-exporta el hook existente que ya usa servicios centrales.
 *
 * TODO: En la migración a shared/, mover el hook original aquí
 * y hacer que proyectos re-exporte desde documentos.
 */

import { useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'

import { DocumentosService } from '../services/documentos.service'
import type { DocumentoProyecto } from '../types/documento.types'
import type { TipoEntidad } from '../types/entidad.types'

import { documentosKeys } from './useDocumentosQuery'

interface UseDocumentoVersionesParams {
  documentoId: string
  isOpen: boolean
  onVersionRestaurada?: () => void
  onClose?: () => void
  tipoEntidad?: TipoEntidad
}

export function useDocumentoVersiones({
  documentoId,
  isOpen,
  onVersionRestaurada,
  onClose,
  tipoEntidad = 'proyecto',
}: UseDocumentoVersionesParams) {
  const { user, perfil } = useAuth()
  const queryClient = useQueryClient()
  const [restaurando, setRestaurando] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)

  const [mostrarModalMotivo, setMostrarModalMotivo] = useState(false)
  const [versionARestaurar, setVersionARestaurar] = useState<{
    id: string
    numero: number
  } | null>(null)
  const [motivoRestauracion, setMotivoRestauracion] = useState('')

  const [versionAEliminar, setVersionAEliminar] = useState<{
    id: string
    numero: number
    esActual: boolean
  } | null>(null)
  const [motivoEliminacion, setMotivoEliminacion] = useState('')

  const {
    data: versiones = [],
    isLoading: cargando,
    refetch: cargarVersiones,
  } = useQuery({
    queryKey: ['documento-versiones', documentoId],
    queryFn: async () => {
      if (!documentoId) return []
      return DocumentosService.obtenerVersiones(documentoId, tipoEntidad)
    },
    enabled: isOpen && !!documentoId,
    staleTime: 0,
  })

  const handleVerDocumento = async (documento: DocumentoProyecto) => {
    try {
      const url = await DocumentosService.obtenerUrlDescarga(
        documento.url_storage,
        tipoEntidad
      )
      window.open(url, '_blank')
    } catch (error) {
      logger.error('Error al ver documento:', error)
      toast.error('Error al abrir el documento')
    }
  }

  const handleDescargar = async (documento: DocumentoProyecto) => {
    try {
      const url = await DocumentosService.obtenerUrlDescarga(
        documento.url_storage,
        tipoEntidad
      )
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = documento.nombre_original
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      toast.success('Descarga iniciada')
    } catch (error) {
      logger.error('Error al descargar:', error)
      toast.error('Error al descargar el documento')
    }
  }

  const solicitarRestauracion = (versionId: string, versionNumero: number) => {
    setVersionARestaurar({ id: versionId, numero: versionNumero })
    setMotivoRestauracion('')
    setMostrarModalMotivo(true)
  }

  const cancelarRestauracion = () => {
    setMostrarModalMotivo(false)
    setVersionARestaurar(null)
    setMotivoRestauracion('')
  }

  const handleRestaurar = async (versionId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión')
      return
    }

    if (!motivoRestauracion.trim()) {
      toast.error('Debes proporcionar un motivo para la restauración')
      return
    }

    setRestaurando(versionId)
    try {
      await DocumentosService.restaurarVersion(
        versionId,
        user.id,
        tipoEntidad,
        motivoRestauracion.trim()
      )
      toast.success('Versión restaurada correctamente')

      const docActual = versiones.find(v => v.id === versionId)
      if (docActual) {
        queryClient.invalidateQueries({
          queryKey: documentosKeys.list(docActual.proyecto_id, tipoEntidad),
        })
      }

      queryClient.invalidateQueries({
        queryKey: ['documento-versiones', documentoId],
      })

      onVersionRestaurada?.()
      setMostrarModalMotivo(false)
      setVersionARestaurar(null)
      setMotivoRestauracion('')
    } catch (error) {
      logger.error('Error al restaurar versión:', error)
      toast.error('Error al restaurar la versión')
    } finally {
      setRestaurando(null)
    }
  }

  const handleEliminar = async (versionId: string, versionNumero: number) => {
    if (!user) {
      toast.error('Debes iniciar sesión')
      return
    }

    if (perfil?.rol !== 'Administrador') {
      toast.error('Solo Administradores pueden eliminar versiones')
      return
    }

    const version = versiones.find(v => v.id === versionId)
    setVersionAEliminar({
      id: versionId,
      numero: versionNumero,
      esActual: version?.es_version_actual || false,
    })
  }

  const confirmarEliminacion = async () => {
    if (!user || !versionAEliminar || !perfil) return

    if (motivoEliminacion.length < 20) {
      toast.error('El motivo debe tener mínimo 20 caracteres')
      return
    }

    setEliminando(versionAEliminar.id)
    try {
      await DocumentosService.eliminarVersion(
        versionAEliminar.id,
        user.id,
        perfil.rol,
        tipoEntidad,
        motivoEliminacion
      )
      toast.success('Versión eliminada correctamente')

      const docActual = versiones.find(v => v.id === versionAEliminar.id)
      if (docActual) {
        await Promise.all([
          queryClient.refetchQueries({
            queryKey: documentosKeys.list(docActual.proyecto_id, tipoEntidad),
          }),
          queryClient.refetchQueries({ queryKey: ['documentos-eliminados'] }),
          queryClient.refetchQueries({ queryKey: ['versiones-eliminadas'] }),
        ])
      }

      setVersionAEliminar(null)
      setMotivoEliminacion('')

      await cargarVersiones()

      const versionesActualizadas = await DocumentosService.obtenerVersiones(
        documentoId,
        tipoEntidad
      )
      if (versionesActualizadas.length <= 1 && onClose) {
        setTimeout(() => {
          onClose()
          toast.info('Ya no hay más versiones en el historial')
        }, 500)
      }
    } catch (error: unknown) {
      logger.error('Error al eliminar versión:', error)
      const msg =
        error instanceof Error ? error.message : 'Error al eliminar la versión'
      toast.error(msg)
    } finally {
      setEliminando(null)
    }
  }

  return {
    versiones,
    cargando,
    restaurando,
    eliminando,
    perfil,
    mostrarModalMotivo,
    versionARestaurar,
    motivoRestauracion,
    setMotivoRestauracion,
    versionAEliminar,
    motivoEliminacion,
    setMotivoEliminacion,
    setVersionAEliminar,
    handleVerDocumento,
    handleDescargar,
    solicitarRestauracion,
    cancelarRestauracion,
    handleRestaurar,
    handleEliminar,
    confirmarEliminacion,
  }
}
