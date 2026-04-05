'use client'

import { useCallback, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type {
  AuditoriaRegistro,
  FiltrosAuditoria,
  VistaAuditoria,
} from '../types'

import {
  auditoriasKeys,
  useAuditoriasEstadisticasQuery,
  useAuditoriasEliminacionesQuery,
  useAuditoriasListQuery,
  useAuditoriasResumenQuery,
} from './useAuditoriasQuery'

const REGISTROS_POR_PAGINA = 50

export function useAuditorias() {
  // UI state
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({ busqueda: '' })
  const [vista, setVista] = useState<VistaAuditoria>('tabla')
  const [paginaActual, setPaginaActual] = useState(1)
  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<AuditoriaRegistro | null>(null)

  const queryClient = useQueryClient()

  // React Query — data remota
  const {
    data: listData,
    isLoading: cargandoLista,
    error: errorLista,
    refetch: refetchLista,
  } = useAuditoriasListQuery(filtros, paginaActual)

  const { data: resumenModulos = [], refetch: refetchResumen } =
    useAuditoriasResumenQuery()

  const { data: eliminacionesMasivas = [], refetch: refetchEliminaciones } =
    useAuditoriasEliminacionesQuery()

  const { data: estadisticas = null, refetch: refetchEstadisticas } =
    useAuditoriasEstadisticasQuery()

  const registros = listData?.datos ?? []
  const totalRegistros = listData?.total ?? 0
  const totalPaginas = listData?.totalPaginas ?? 0
  const cargando = cargandoLista
  const error = errorLista instanceof Error ? errorLista.message : null

  // Acciones de filtrado y navegación
  const aplicarFiltros = useCallback(
    (nuevosFiltros: Partial<FiltrosAuditoria>) => {
      setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
      setPaginaActual(1)
    },
    []
  )

  const limpiarFiltros = useCallback(() => {
    setFiltros({ busqueda: '' })
    setPaginaActual(1)
  }, [])

  const buscar = useCallback(
    (texto: string) => {
      aplicarFiltros({ busqueda: texto })
    },
    [aplicarFiltros]
  )

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina)
  }, [])

  const cambiarVista = useCallback((nuevaVista: VistaAuditoria) => {
    setVista(nuevaVista)
  }, [])

  const seleccionarRegistro = useCallback(
    (registro: AuditoriaRegistro | null) => {
      setRegistroSeleccionado(registro)
    },
    []
  )

  // Wrappers de refetch para compatibilidad backward
  const cargarAuditorias = useCallback(async () => {
    await refetchLista()
  }, [refetchLista])

  const cargarResumenModulos = useCallback(async () => {
    await refetchResumen()
  }, [refetchResumen])

  const cargarEliminacionesMasivas = useCallback(async () => {
    await refetchEliminaciones()
  }, [refetchEliminaciones])

  const cargarEstadisticas = useCallback(async () => {
    await refetchEstadisticas()
  }, [refetchEstadisticas])

  const refrescar = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: auditoriasKeys.all })
  }, [queryClient])

  const obtenerHistorial = useCallback(
    async (tabla: string, registroId: string) => {
      await queryClient.invalidateQueries({
        queryKey: auditoriasKeys.historial(tabla, registroId),
      })
    },
    [queryClient]
  )

  return {
    // Data
    registros,
    resumenModulos,
    eliminacionesMasivas,
    estadisticas,
    registroSeleccionado,
    cargando,
    error,
    filtros,
    vista,
    paginaActual,
    totalRegistros,
    registrosPorPagina: REGISTROS_POR_PAGINA,
    totalPaginas,

    // Acciones
    cargarAuditorias,
    buscar,
    cargarResumenModulos,
    cargarEliminacionesMasivas,
    cargarEstadisticas,
    obtenerHistorial,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarVista,
    seleccionarRegistro,
    refrescar,
  }
}
