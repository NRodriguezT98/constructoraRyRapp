/**
 * ============================================
 * HOOK: useUsuariosList
 * ============================================
 *
 * Lógica de UI para la lista de usuarios:
 * filtros, búsqueda, modales, selección activa.
 * Consume useUsuariosListQuery — NO hace fetch directo.
 */

'use client'

import { useCallback, useMemo, useState } from 'react'

import type {
  EstadoUsuario,
  FiltrosUsuarios,
  Rol,
  UsuarioCompleto,
} from '../types'

import {
  useUsuariosEstadisticasQuery,
  useUsuariosListQuery,
} from './useUsuariosQuery'

// ============================================
// TIPOS INTERNOS
// ============================================

type ModalState =
  | { tipo: 'cerrado' }
  | { tipo: 'crear' }
  | { tipo: 'editar'; usuario: UsuarioCompleto }
  | { tipo: 'cambiarEstado'; usuario: UsuarioCompleto }
  | { tipo: 'cambiarRol'; usuario: UsuarioCompleto }

// ============================================
// HOOK
// ============================================

export function useUsuariosList() {
  // ── Filtros ──────────────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState('')
  const [rolFiltro, setRolFiltro] = useState<Rol | ''>('')
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoUsuario | ''>('')

  // Filtros para React Query (solo valores con dato)
  const filtrosQuery = useMemo<FiltrosUsuarios>(
    () => ({
      busqueda: busqueda.trim() || undefined,
      rol: rolFiltro || undefined,
      estado: estadoFiltro || undefined,
    }),
    [busqueda, rolFiltro, estadoFiltro]
  )

  // ── Queries ───────────────────────────────────────────────────────────
  const {
    data: usuarios = [],
    isLoading: cargandoUsuarios,
    error: errorUsuarios,
  } = useUsuariosListQuery(filtrosQuery)

  const { data: estadisticas, isLoading: cargandoEstadisticas } =
    useUsuariosEstadisticasQuery()

  // ── Estado de modales ─────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>({ tipo: 'cerrado' })

  // ── Acciones de modales ───────────────────────────────────────────────
  const abrirCrear = useCallback(() => setModal({ tipo: 'crear' }), [])

  const abrirEditar = useCallback(
    (usuario: UsuarioCompleto) => setModal({ tipo: 'editar', usuario }),
    []
  )

  const abrirCambiarEstado = useCallback(
    (usuario: UsuarioCompleto) => setModal({ tipo: 'cambiarEstado', usuario }),
    []
  )

  const abrirCambiarRol = useCallback(
    (usuario: UsuarioCompleto) => setModal({ tipo: 'cambiarRol', usuario }),
    []
  )

  const cerrarModal = useCallback(() => setModal({ tipo: 'cerrado' }), [])

  // ── Limpiar filtros ───────────────────────────────────────────────────
  const limpiarFiltros = useCallback(() => {
    setBusqueda('')
    setRolFiltro('')
    setEstadoFiltro('')
  }, [])

  const hayFiltrosActivos =
    busqueda !== '' || rolFiltro !== '' || estadoFiltro !== ''

  return {
    // Datos
    usuarios,
    estadisticas,

    // Estados de carga
    cargandoUsuarios,
    cargandoEstadisticas,
    errorUsuarios,

    // Filtros
    busqueda,
    setBusqueda,
    rolFiltro,
    setRolFiltro,
    estadoFiltro,
    setEstadoFiltro,
    hayFiltrosActivos,
    limpiarFiltros,

    // Modales
    modal,
    abrirCrear,
    abrirEditar,
    abrirCambiarEstado,
    abrirCambiarRol,
    cerrarModal,
  }
}
