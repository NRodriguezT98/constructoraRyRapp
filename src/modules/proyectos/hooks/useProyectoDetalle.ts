import { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/auth-context'
import { useModal } from '../../../shared/components/modals'
import { DocumentosService } from '../../documentos/services'
import { useDocumentosStore } from '../../documentos/store/documentos.store'
import { Proyecto } from '../types'

/**
 * Hook para manejar la lógica del proyecto detalle
 * Separa la lógica de negocio del componente de presentación
 */
export function useProyectoDetalle(proyectoId: string) {
  const { user } = useAuth()
  const { confirm } = useModal()
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [urlPreview, setUrlPreview] = useState<string | null>(null)

  const {
    modalViewerAbierto,
    documentoSeleccionado,
    cerrarModalViewer,
    eliminarDocumento,
  } = useDocumentosStore()

  // Cargar proyecto
  useEffect(() => {
    let cancelado = false

    const cargarProyecto = async () => {
      setCargando(true)
      try {
        // TODO: Implementar carga desde Supabase
        // const { data } = await supabase.from('proyectos').select('*').eq('id', proyectoId).single()
        // setProyecto(data)

        // Simulación temporal
        await new Promise(resolve => setTimeout(resolve, 500))

        if (!cancelado) {
          setProyecto({
            id: proyectoId,
            nombre: 'Proyecto Ejemplo',
            descripcion: 'Descripción del proyecto',
            ubicacion: 'Ubicación ejemplo',
            estado: 'en_construccion',
            fechaInicio: new Date().toISOString(),
            fechaFinEstimada: new Date().toISOString(),
            presupuesto: 1000000,
            manzanas: [],
            responsable: 'Responsable',
            telefono: '123456789',
            email: 'test@test.com',
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
          })
        }
      } catch (error) {
        if (!cancelado) {
          console.error('Error al cargar proyecto:', error)
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargarProyecto()

    return () => {
      cancelado = true
    }
  }, [proyectoId])

  // Cargar URL de preview para el visor
  useEffect(() => {
    let cancelado = false

    if (modalViewerAbierto && documentoSeleccionado) {
      const cargarPreview = async () => {
        try {
          const url = await DocumentosService.obtenerUrlDescarga(
            documentoSeleccionado.url_storage,
            3600
          )
          if (!cancelado) {
            setUrlPreview(url)
          }
        } catch (error) {
          if (!cancelado) {
            console.error('Error cargando preview:', error)
          }
        }
      }
      cargarPreview()
    } else {
      if (!cancelado) {
        setUrlPreview(null)
      }
    }

    return () => {
      cancelado = true
    }
  }, [modalViewerAbierto, documentoSeleccionado])

  // Handler: Descargar documento
  const handleDownloadDocumento = async () => {
    if (!documentoSeleccionado) return
    try {
      const blob = await DocumentosService.descargarArchivo(
        documentoSeleccionado.url_storage
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = documentoSeleccionado.nombre_original
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando:', error)
    }
  }

  // Handler: Eliminar documento
  const handleDeleteDocumento = async () => {
    if (!documentoSeleccionado) return

    const confirmed = await confirm({
      title: '¿Eliminar documento?',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'danger'
    })

    if (confirmed) {
      await eliminarDocumento(documentoSeleccionado.id)
      cerrarModalViewer()
    }
  }

  return {
    // Estados
    proyecto,
    cargando,
    urlPreview,
    user,

    // Handlers
    handleDownloadDocumento,
    handleDeleteDocumento,
  }
}
