/**
 * 🔄 HOOK: useDocumentoVersiones
 *
 * Lógica de negocio para gestión de versiones de documentos de PROYECTOS
 * - Cargar historial de versiones
 * - Ver/Descargar versiones
 * - Restaurar versión anterior (con invalidación de caché)
 * - Eliminar versión (soft delete, solo Admin)
 */

import { useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'
import { documentosKeys } from '@/modules/documentos/hooks/useDocumentosQuery'
import { DocumentosService } from '@/modules/documentos/services/documentos.service'
import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'

interface UseDocumentoVersionesProps {
  documentoId: string
  isOpen: boolean
  onVersionRestaurada?: () => void
  onClose?: () => void // ✅ Callback para cerrar modal después de eliminar
  tipoEntidad?: 'proyecto' | 'vivienda' | 'cliente' // 🆕 Tipo de entidad para queries genéricas
}

export function useDocumentoVersiones({
  documentoId,
  isOpen,
  onVersionRestaurada,
  onClose,
  tipoEntidad = 'proyecto', // 🆕 Default a proyecto para mantener compatibilidad
}: UseDocumentoVersionesProps) {
  const { user, perfil } = useAuth()
  const queryClient = useQueryClient()
  const [restaurando, setRestaurando] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)

  // Estado del modal de confirmación de restauración
  const [mostrarModalMotivo, setMostrarModalMotivo] = useState(false)
  const [versionARestaurar, setVersionARestaurar] = useState<{
    id: string
    numero: number
  } | null>(null)
  const [motivoRestauracion, setMotivoRestauracion] = useState('')

  // Estado del modal de confirmación de eliminación
  const [versionAEliminar, setVersionAEliminar] = useState<{
    id: string
    numero: number
    esActual: boolean
  } | null>(null)
  const [motivoEliminacion, setMotivoEliminacion] = useState('')

  // ✅ USAR REACT QUERY para cargar versiones (auto-refetch cuando se invalida)
  const {
    data: versiones = [],
    isLoading: cargando,
    refetch: cargarVersiones,
  } = useQuery({
    queryKey: ['documento-versiones', documentoId],
    queryFn: async () => {
      if (!documentoId) {
        return []
      }
      const data = await DocumentosService.obtenerVersiones(
        documentoId,
        tipoEntidad
      )
      return data
    },
    enabled: isOpen && !!documentoId, // Solo cargar cuando modal está abierto
    staleTime: 0, // Siempre refetch al invalidar
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

      // ✅ Invalidar caché de React Query para actualizar la lista
      const docActual = versiones.find(v => v.id === versionId)
      if (docActual) {
        queryClient.invalidateQueries({
          queryKey: documentosKeys.list(docActual.proyecto_id, tipoEntidad), // ✅ Key correcta
        })
      }

      // ✅ Invalidar query de versiones para refetch automático
      queryClient.invalidateQueries({
        queryKey: ['documento-versiones', documentoId],
      })

      onVersionRestaurada?.()
      // Limpiar estado
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

    // ✅ Validar rol de Administrador
    if (perfil?.rol !== 'Administrador') {
      toast.error('Solo Administradores pueden eliminar versiones')
      return
    }

    // ✅ Abrir modal de confirmación premium
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

      // 🔧 FIX: Usar refetchQueries para forzar recarga INMEDIATA en Papelera
      const docActual = versiones.find(v => v.id === versionAEliminar.id)
      if (docActual) {
        await Promise.all([
          queryClient.refetchQueries({
            queryKey: documentosKeys.list(docActual.proyecto_id, tipoEntidad),
          }),
          queryClient.refetchQueries({ queryKey: ['documentos-eliminados'] }), // ← Papelera
          queryClient.refetchQueries({ queryKey: ['versiones-eliminadas'] }), // ← Versiones en papelera
        ])
      }

      setVersionAEliminar(null)
      setMotivoEliminacion('')

      // ✅ Recargar versiones del modal
      await cargarVersiones()

      // ✅ Si solo queda 1 versión después de eliminar, cerrar el modal automáticamente
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
    // Data
    versiones,
    cargando,
    restaurando,
    eliminando,
    perfil, // ✅ Exportar perfil para validación de rol en componente

    // Modal de motivo de restauración
    mostrarModalMotivo,
    versionARestaurar,
    motivoRestauracion,
    setMotivoRestauracion,

    // Modal de motivo de eliminación
    versionAEliminar,
    motivoEliminacion,
    setMotivoEliminacion,
    setVersionAEliminar,

    // Acciones
    handleVerDocumento,
    handleDescargar,
    solicitarRestauracion,
    cancelarRestauracion,
    handleRestaurar,
    handleEliminar,
    confirmarEliminacion,
    cargarVersiones, // ✅ Exportar para refrescar desde el modal
  }
}
