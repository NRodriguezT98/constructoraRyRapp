import { useCallback, useEffect, useState } from 'react'

import { useClickOutside } from '../../../shared/hooks'
import { DocumentosClienteService } from '../../clientes/documentos/services/documentos-cliente.service'

export function useDocumentoCard(documentoId?: string) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [estaProtegido, setEstaProtegido] = useState(false)
  const [procesoInfo, setProcesoInfo] = useState<{
    pasoNombre?: string
    procesoCompletado: boolean
  } | null>(null)
  const [estadoProceso, setEstadoProceso] = useState<{
    esDeProceso: boolean
    estadoPaso?: 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido'
    nombrePaso?: string
  }>({ esDeProceso: false })
  const [verificando, setVerificando] = useState(false)
  const [modalVersionesAbierto, setModalVersionesAbierto] = useState(false)
  const [modalNuevaVersionAbierto, setModalNuevaVersionAbierto] = useState(false)

  // Usar hook compartido para cerrar al hacer click fuera
  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setMenuAbierto(false)
  })

  // Verificar si el documento está protegido (es de proceso completado)
  useEffect(() => {
    if (documentoId) {
      verificarProteccion()
    }
  }, [documentoId])

  const verificarProteccion = async () => {
    if (!documentoId) return

    // Validar que documentoId sea un UUID válido
    // UUIDs tienen formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(documentoId)) {
      // Si no es un UUID válido (ej: "cedula-ciudadania"), no hacer verificación
      setEstaProtegido(false)
      setProcesoInfo(null)
      setEstadoProceso({ esDeProceso: false })
      setVerificando(false)
      return
    }

    setVerificando(true)
    try {
      // Obtener estado del proceso (NUEVO)
      const estadoProc = await DocumentosClienteService.obtenerEstadoProceso(documentoId)
      setEstadoProceso(estadoProc)

      // Mantener la verificación de protección existente
      const resultado = await DocumentosClienteService.esDocumentoDeProceso(documentoId)
      setEstaProtegido(resultado.esDeProceso && resultado.procesoCompletado)
      setProcesoInfo({
        pasoNombre: resultado.pasoNombre,
        procesoCompletado: resultado.procesoCompletado
      })
    } catch (error) {
      console.error('Error al verificar protección:', error)
      setEstaProtegido(false)
      setProcesoInfo(null)
      setEstadoProceso({ esDeProceso: false })
    } finally {
      setVerificando(false)
    }
  }

  const toggleMenu = useCallback(() => {
    setMenuAbierto(prev => !prev)
  }, [])

  const cerrarMenu = useCallback(() => {
    setMenuAbierto(false)
  }, [])

  const abrirModalVersiones = useCallback(() => {
    setModalVersionesAbierto(true)
    cerrarMenu()
  }, [cerrarMenu])

  const cerrarModalVersiones = useCallback(() => {
    setModalVersionesAbierto(false)
  }, [])

  const abrirModalNuevaVersion = useCallback(() => {
    setModalNuevaVersionAbierto(true)
    cerrarMenu()
  }, [cerrarMenu])

  const cerrarModalNuevaVersion = useCallback(() => {
    setModalNuevaVersionAbierto(false)
  }, [])

  return {
    menuAbierto,
    menuRef,
    toggleMenu,
    cerrarMenu,
    estaProtegido,
    procesoInfo,
    estadoProceso, // ✅ NUEVO: Estado del proceso
    verificando,
    modalVersionesAbierto,
    abrirModalVersiones,
    cerrarModalVersiones,
    modalNuevaVersionAbierto,
    abrirModalNuevaVersion,
    cerrarModalNuevaVersion,
  }
}
