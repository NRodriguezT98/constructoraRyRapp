import { useCallback, useMemo, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import { useClickOutside } from '@/shared/hooks'
import type { DocumentoVivienda } from '../../types/documento-vivienda.types'

interface UseDocumentoCardProps {
  documento: DocumentoVivienda
  esDocumentoVivienda?: boolean
}

export function useDocumentoCard({ documento, esDocumentoVivienda = true }: UseDocumentoCardProps) {
  // 🔐 Auth y Permisos
  const { perfil } = useAuth()
  const { puede } = usePermisosQuery()
  const esAdmin = useMemo(() => perfil?.rol === 'Administrador', [perfil?.rol])
  const puedeEliminar = useMemo(() => puede('documentos', 'eliminar'), [puede])

  // 📋 Estados de UI
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [modalReemplazarAbierto, setModalReemplazarAbierto] = useState(false)
  const [modalVersionesAbierto, setModalVersionesAbierto] = useState(false)
  const [modalNuevaVersionAbierto, setModalNuevaVersionAbierto] = useState(false)

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
  // ✅ SIEMPRE mostrar "Nueva Versión" para documentos de viviendas
  const esDocumentoDeProceso = useMemo(() => {
    return esDocumentoVivienda
  }, [esDocumentoVivienda])

  // ✅ Solo mostrar "Ver Historial" si hay MÁS de 1 versión
  const tieneVersiones = useMemo(() => {
    return documento.version > 1
  }, [documento.version])

  // Usar hook compartido para cerrar al hacer click fuera
  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setMenuAbierto(false)
  })

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

    // 📅 Cálculos de fechas
    estaProximoAVencer,
    estaVencido,
    diasParaVencer,

    // 📊 Propiedades del documento
    esDocumentoDeProceso,
    tieneVersiones,
  }
}
