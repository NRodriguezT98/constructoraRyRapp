/**
 * Hook personalizado para gestionar el estado de todos los modales de proyectos
 * Centraliza la lógica de apertura/cierre y estado de modales
 */

import { useState } from 'react'
import type { Proyecto, ProyectoFormData } from '../types'

interface UseProyectosModalsReturn {
  // Estado de modales
  modalAbierto: boolean
  modalEditar: boolean
  modalEliminar: boolean
  modalArchivar: boolean
  modalRestaurar: boolean
  modalConfirmarCambios: boolean

  // Datos de modales
  proyectoEditar: Proyecto | null
  proyectoEliminar: string | null
  proyectoArchivar: Proyecto | null
  proyectoRestaurar: Proyecto | null
  datosEdicion: ProyectoFormData | null
  datosConfirmacion: { proyectoId: string; data: ProyectoFormData } | null
  totalesProyecto: { totalManzanas: number; totalViviendas: number }

  // Acciones de modales
  abrirModalCrear: () => void
  cerrarModalCrear: () => void
  abrirModalEditar: (proyecto: Proyecto) => void
  cerrarModalEditar: () => void
  abrirModalEliminar: (proyectoId: string) => void
  cerrarModalEliminar: () => void
  abrirModalArchivar: (proyecto: Proyecto) => void
  cerrarModalArchivar: () => void
  abrirModalRestaurar: (proyecto: Proyecto) => void
  cerrarModalRestaurar: () => void
  abrirModalConfirmarCambios: (data: ProyectoFormData) => void
  cerrarModalConfirmarCambios: () => void
  setDatosConfirmacion: (data: { proyectoId: string; data: ProyectoFormData } | null) => void
  setTotalesProyecto: (totales: { totalManzanas: number; totalViviendas: number }) => void
}

/**
 * Hook para gestionar el estado de todos los modales de proyectos
 * @returns Estado y acciones de modales
 * @example
 * ```tsx
 * const modals = useProyectosModals()
 *
 * // Abrir modal crear
 * <Button onClick={modals.abrirModalCrear}>Nuevo Proyecto</Button>
 *
 * // Renderizar modal
 * {modals.modalAbierto && <ProyectosForm onClose={modals.cerrarModalCrear} />}
 * ```
 */
export function useProyectosModals(): UseProyectosModalsReturn {
  // ==================== ESTADO DE MODALES ====================
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [modalArchivar, setModalArchivar] = useState(false)
  const [modalRestaurar, setModalRestaurar] = useState(false)
  const [modalConfirmarCambios, setModalConfirmarCambios] = useState(false)

  // ==================== DATOS DE MODALES ====================
  const [proyectoEditar, setProyectoEditar] = useState<Proyecto | null>(null)
  const [proyectoEliminar, setProyectoEliminar] = useState<string | null>(null)
  const [proyectoArchivar, setProyectoArchivar] = useState<Proyecto | null>(null)
  const [proyectoRestaurar, setProyectoRestaurar] = useState<Proyecto | null>(null)
  const [datosEdicion, setDatosEdicion] = useState<ProyectoFormData | null>(null)
  const [datosConfirmacion, setDatosConfirmacionState] = useState<{
    proyectoId: string
    data: ProyectoFormData
  } | null>(null)
  const [totalesProyecto, setTotalesProyecto] = useState({
    totalManzanas: 0,
    totalViviendas: 0,
  })

  // ==================== ACCIONES DE MODALES ====================

  const abrirModalCrear = () => {
    setModalAbierto(true)
  }

  const cerrarModalCrear = () => {
    setModalAbierto(false)
  }

  const abrirModalEditar = (proyecto: Proyecto) => {
    setProyectoEditar(proyecto)
    setModalEditar(true)
  }

  const cerrarModalEditar = () => {
    setModalEditar(false)
    setProyectoEditar(null)
    setDatosEdicion(null)
  }

  const abrirModalEliminar = (proyectoId: string) => {
    setProyectoEliminar(proyectoId)
    setModalEliminar(true)
  }

  const cerrarModalEliminar = () => {
    setModalEliminar(false)
    setProyectoEliminar(null)
  }

  const abrirModalArchivar = (proyecto: Proyecto) => {
    setProyectoArchivar(proyecto)
    setModalArchivar(true)
  }

  const cerrarModalArchivar = () => {
    setModalArchivar(false)
    setProyectoArchivar(null)
  }

  const abrirModalRestaurar = (proyecto: Proyecto) => {
    setProyectoRestaurar(proyecto)
    setModalRestaurar(true)
  }

  const cerrarModalRestaurar = () => {
    setModalRestaurar(false)
    setProyectoRestaurar(null)
  }

  const abrirModalConfirmarCambios = (data: ProyectoFormData) => {
    setDatosEdicion(data)
    setModalConfirmarCambios(true)
  }

  const cerrarModalConfirmarCambios = () => {
    setModalConfirmarCambios(false)
    setDatosEdicion(null)
  }

  const setDatosConfirmacion = (data: { proyectoId: string; data: ProyectoFormData } | null) => {
    setDatosConfirmacionState(data)
  }

  // ==================== RETURN ====================
  return {
    // Estado de modales
    modalAbierto,
    modalEditar,
    modalEliminar,
    modalArchivar,
    modalRestaurar,
    modalConfirmarCambios,

    // Datos de modales
    proyectoEditar,
    proyectoEliminar,
    proyectoArchivar,
    proyectoRestaurar,
    datosEdicion,
    datosConfirmacion,
    totalesProyecto,

    // Acciones
    abrirModalCrear,
    cerrarModalCrear,
    abrirModalEditar,
    cerrarModalEditar,
    abrirModalEliminar,
    cerrarModalEliminar,
    abrirModalArchivar,
    cerrarModalArchivar,
    abrirModalRestaurar,
    cerrarModalRestaurar,
    abrirModalConfirmarCambios,
    cerrarModalConfirmarCambios,
    setDatosConfirmacion,
    setTotalesProyecto,
  }
}
