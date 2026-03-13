import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import type { DocumentoProyecto } from '@/types/documento.types'
import { useClickOutside } from '../../../shared/hooks'
import type { TipoEntidad } from '../types/entidad.types'
import { useEliminarDocumento } from './useEliminarDocumento'
// ❌ ELIMINADO: DocumentosClienteService (servicio legacy eliminado)
// TODO: Migrar métodos obtenerEstadoProceso y esDocumentoDeProceso a servicio genérico

interface UseDocumentoCardProps {
  documento: DocumentoProyecto
  esDocumentoProyecto?: boolean
}

export function useDocumentoCard({ documento, esDocumentoProyecto = true }: UseDocumentoCardProps) {
  // 🔐 Auth y Permisos
  const { perfil } = useAuth()
  const { puede } = usePermisosQuery()
  const esAdmin = useMemo(() => perfil?.rol === 'Administrador', [perfil?.rol])
  const puedeEliminar = useMemo(() => puede('documentos', 'eliminar'), [puede])

  // �️ Confirmación de eliminación inteligente
  const {
    abrirConfirmacion,
    cerrarConfirmacion,    ejecutarEliminacion,    confirmacion: confirmacionEliminar,
    eliminando,
  } = useEliminarDocumento()

  const abrirConfirmacionEliminar = useCallback((doc: DocumentoProyecto, tipoEntidad: TipoEntidad = 'cliente') => {
    abrirConfirmacion(doc, tipoEntidad)
  }, [abrirConfirmacion])

  const cerrarConfirmacionEliminar = useCallback(() => {
    cerrarConfirmacion()
  }, [cerrarConfirmacion])

  // �📋 Estados de UI
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [modalReemplazarAbierto, setModalReemplazarAbierto] = useState(false)
  const [modalVersionesAbierto, setModalVersionesAbierto] = useState(false)
  const [modalNuevaVersionAbierto, setModalNuevaVersionAbierto] = useState(false)

  // 🔒 Estados de protección (solo para documentos de clientes)
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

  // 📅 Cálculos de fechas (memoizados)
  const estaProximoAVencer = useMemo(() => {
    if (!documento.fecha_vencimiento) return false
    const fechaVencimiento = new Date(documento.fecha_vencimiento)
    const fechaLimite = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return fechaVencimiento <= fechaLimite
  }, [documento.fecha_vencimiento])

  const estaVencido = useMemo(() => {
    if (!documento.fecha_vencimiento) return false
    return new Date(documento.fecha_vencimiento) < new Date()
  }, [documento.fecha_vencimiento])

  const diasParaVencer = useMemo(() => {
    if (!documento.fecha_vencimiento) return null
    const diff = new Date(documento.fecha_vencimiento).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [documento.fecha_vencimiento])

  // 📊 Propiedades del documento (memoizadas)
  // ✅ SIEMPRE mostrar "Nueva Versión" para documentos de proyectos (sin depender de etiquetas)
  const esDocumentoDeProceso = useMemo(() => {
    return esDocumentoProyecto
  }, [esDocumentoProyecto])

  // ✅ Solo mostrar "Ver Historial" si hay MÁS de 1 versión
  const tieneVersiones = useMemo(() => {
    return documento.version > 1
  }, [documento.version])

  // Usar hook compartido para cerrar al hacer click fuera
  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setMenuAbierto(false)
  })

  // Verificar si el documento está protegido (SOLO para documentos de clientes con procesos)
  useEffect(() => {
    // ✅ SKIP verificación para documentos de proyectos
    if (esDocumentoProyecto) {
      setEstaProtegido(false)
      setProcesoInfo(null)
      setEstadoProceso({ esDeProceso: false })
      setVerificando(false)
      return
    }

    if (documento.id) {
      verificarProteccion()
    }
  }, [documento.id, esDocumentoProyecto])

  const verificarProteccion = async () => {
    const documentoId = documento.id
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
      // ⚠️ DESHABILITADO: Servicio legacy eliminado
      // TODO: Migrar estos métodos al servicio genérico
      // const estadoProc = await DocumentosClienteService.obtenerEstadoProceso(documentoId)
      // setEstadoProceso(estadoProc)

      // const resultado = await DocumentosClienteService.esDocumentoDeProceso(documentoId)
      // setEstaProtegido(resultado.esDeProceso && resultado.procesoCompletado)
      // setProcesoInfo({
      //   pasoNombre: resultado.pasoNombre,
      //   procesoCompletado: resultado.procesoCompletado
      // })

      // Por ahora: asumir que no está protegido
      setEstaProtegido(false)
      setProcesoInfo(null)
      setEstadoProceso({ esDeProceso: false })
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

  const abrirModalEditar = useCallback(() => {
    setModalEditarAbierto(true)
    cerrarMenu()
  }, [])

  const cerrarModalEditar = useCallback(() => {
    setModalEditarAbierto(false)
  }, [])

  const abrirModalReemplazar = useCallback(() => {
    setModalReemplazarAbierto(true)
    cerrarMenu()
  }, [])

  const cerrarModalReemplazar = useCallback(() => {
    setModalReemplazarAbierto(false)
  }, [])

  return {
    // 🔐 Auth
    esAdmin,
    puedeEliminar,

    // 📋 Estados de UI - Menú
    menuAbierto,
    menuRef,
    toggleMenu,
    cerrarMenu,

    // 📋 Estados de UI - Modales
    modalEditarAbierto,
    abrirModalEditar,
    cerrarModalEditar,
    modalReemplazarAbierto,
    abrirModalReemplazar,
    cerrarModalReemplazar,
    modalVersionesAbierto,
    abrirModalVersiones,
    cerrarModalVersiones,
    modalNuevaVersionAbierto,
    abrirModalNuevaVersion,
    cerrarModalNuevaVersion,

    // 🔒 Protección de documentos
    estaProtegido,
    procesoInfo,
    estadoProceso,
    verificando,

    // 📅 Cálculos de fechas
    estaProximoAVencer,
    estaVencido,
    diasParaVencer,

    // 📊 Propiedades del documento
    esDocumentoDeProceso,
    tieneVersiones,

    // 🗑️ Confirmación de eliminación
    confirmacionEliminar,
    abrirConfirmacionEliminar,
    cerrarConfirmacionEliminar,
    ejecutarEliminacion,
    eliminando,
  }
}
