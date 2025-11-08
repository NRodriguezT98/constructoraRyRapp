/**
 * 🔄 HOOK: useDocumentoVersiones
 *
 * Lógica de negocio para gestión de versiones de documentos
 * - Cargar historial de versiones
 * - Ver/Descargar versiones
 * - Restaurar versión anterior (con invalidación de caché)
 * - Eliminar versión (soft delete)
 */

import { useEffect, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'

import { DocumentosViviendaService, type DocumentoVivienda } from '../services/documentos-vivienda.service'

interface UseDocumentoVersionesProps {
  documentoId: string
  isOpen: boolean
  onVersionRestaurada?: () => void
}

export function useDocumentoVersiones({
  documentoId,
  isOpen,
  onVersionRestaurada
}: UseDocumentoVersionesProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient() // ✅ NUEVO: Para invalidar caché
  const [versiones, setVersiones] = useState<DocumentoVivienda[]>([])
  const [cargando, setCargando] = useState(false)
  const [restaurando, setRestaurando] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)

  // Estado del modal de confirmación de restauración
  const [mostrarModalMotivo, setMostrarModalMotivo] = useState(false)
  const [versionARestaurar, setVersionARestaurar] = useState<{ id: string; numero: number } | null>(null)
  const [motivoRestauracion, setMotivoRestauracion] = useState('')

  const service = new DocumentosViviendaService()

  useEffect(() => {
    if (isOpen && documentoId) {
      cargarVersiones()
    }
  }, [isOpen, documentoId])

  const cargarVersiones = async () => {
    setCargando(true)
    try {
      const data = await service.obtenerVersiones(documentoId)
      setVersiones(data)
    } catch (error) {
      console.error('Error al cargar versiones:', error)
      toast.error('Error al cargar historial de versiones')
    } finally {
      setCargando(false)
    }
  }

  const handleVerDocumento = async (documento: DocumentoVivienda) => {
    try {
      const url = await service.obtenerUrlFirmada(documento.id)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error al ver documento:', error)
      toast.error('Error al abrir el documento')
    }
  }

  const handleDescargar = async (documento: DocumentoVivienda) => {
    try {
      const url = await service.obtenerUrlFirmada(documento.id)
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
      console.error('Error al descargar:', error)
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
      await service.restaurarVersion(versionId, user.id, motivoRestauracion.trim())
      toast.success('Versión restaurada correctamente')

      // ✅ NUEVO: Invalidar caché de React Query para actualizar la lista
      // Necesitamos obtener el vivienda_id del documento actual
      const docActual = versiones.find(v => v.id === versionId)
      if (docActual) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', docActual.vivienda_id],
        })
      }

      await cargarVersiones()
      onVersionRestaurada?.()
      // Limpiar estado
      setMostrarModalMotivo(false)
      setVersionARestaurar(null)
      setMotivoRestauracion('')
    } catch (error) {
      console.error('Error al restaurar versión:', error)
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

    const motivo = window.prompt(
      `¿Estás seguro de eliminar la versión ${versionNumero}?\n\nProporciona el motivo de eliminación:`
    )

    if (!motivo) return

    setEliminando(versionId)
    try {
      await service.eliminarVersion(versionId, user.id, motivo)
      toast.success('Versión eliminada correctamente')

      // ✅ NUEVO: Invalidar caché de React Query
      const docActual = versiones.find(v => v.id === versionId)
      if (docActual) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', docActual.vivienda_id],
        })
      }

      await cargarVersiones()
    } catch (error: any) {
      console.error('Error al eliminar versión:', error)
      toast.error(error?.message || 'Error al eliminar la versión')
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

    // Modal de motivo
    mostrarModalMotivo,
    versionARestaurar,
    motivoRestauracion,
    setMotivoRestauracion,

    // Acciones
    handleVerDocumento,
    handleDescargar,
    solicitarRestauracion,
    cancelarRestauracion,
    handleRestaurar,
    handleEliminar,
    cargarVersiones, // ✅ Exportar para refrescar desde el modal
  }
}
