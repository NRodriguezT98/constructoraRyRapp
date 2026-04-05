'use client'

import { useMemo, useState } from 'react'

import type { FiltrosRenuncias, RenunciaConInfo } from '../types'

import { useRenunciasMetricas, useRenunciasQuery } from './useRenunciasQuery'

/**
 * Hook para la lista de renuncias con filtros.
 * Separa lógica de negocio del componente presentacional.
 */
export function useRenunciasList() {
  const { data: renuncias = [], isLoading, refetch } = useRenunciasQuery()
  const { data: metricas } = useRenunciasMetricas()

  const [filtros, setFiltros] = useState<FiltrosRenuncias>({
    busqueda: '',
    estado: 'todos',
    proyecto_id: '',
  })

  // Proyectos únicos (para select de filtros)
  const proyectos = useMemo(() => {
    const map = new Map<string, string>()
    renuncias.forEach(r => {
      if (r.proyecto.id && r.proyecto.nombre) {
        map.set(r.proyecto.id, r.proyecto.nombre)
      }
    })
    return Array.from(map, ([id, nombre]) => ({ id, nombre })).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    )
  }, [renuncias])

  // Renuncias filtradas
  const renunciasFiltradas = useMemo(() => {
    let resultado: RenunciaConInfo[] = renuncias

    // Filtro por búsqueda
    if (filtros.busqueda && filtros.busqueda.trim().length > 0) {
      const term = filtros.busqueda.toLowerCase().trim()
      resultado = resultado.filter(
        r =>
          r.cliente.nombre.toLowerCase().includes(term) ||
          r.cliente.documento.toLowerCase().includes(term) ||
          r.vivienda.numero.toLowerCase().includes(term) ||
          r.proyecto.nombre.toLowerCase().includes(term) ||
          r.motivo.toLowerCase().includes(term)
      )
    }

    // Filtro por estado
    if (filtros.estado && filtros.estado !== 'todos') {
      resultado = resultado.filter(r => r.estado === filtros.estado)
    }

    // Filtro por proyecto
    if (filtros.proyecto_id && filtros.proyecto_id.length > 0) {
      resultado = resultado.filter(r => r.proyecto.id === filtros.proyecto_id)
    }

    return resultado
  }, [renuncias, filtros])

  const limpiarFiltros = () => {
    setFiltros({ busqueda: '', estado: 'todos', proyecto_id: '' })
  }

  return {
    renuncias: renunciasFiltradas,
    cargando: isLoading,
    metricas: metricas ?? {
      total: 0,
      pendientes: 0,
      cerradas: 0,
      totalDevuelto: 0,
      totalRetenido: 0,
    },
    filtros,
    actualizarFiltros: setFiltros,
    limpiarFiltros,
    refrescar: refetch,
    totalFiltradas: renunciasFiltradas.length,
    proyectos,
  }
}
