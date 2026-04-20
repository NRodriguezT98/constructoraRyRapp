'use client'

import { useEffect, useMemo, useState } from 'react'

import { useNegociacionesAbonos } from './index'

export type OrdenClientes =
  | 'urgente'
  | 'mayor_pago'
  | 'nombre_az'
  | 'nombre_za'
  | 'vivienda_asc'
  | 'mayor_saldo'

export function useNegociacionesList() {
  const { negociaciones, isLoading, estadisticas } = useNegociacionesAbonos()

  const [busqueda, setBusqueda] = useState('')
  const [proyectoFiltro, setProyectoFiltro] = useState('')
  const [ordenar, setOrdenar] = useState<OrdenClientes>('vivienda_asc')
  const [paginaActual, setPaginaActual] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // ─── Proyectos disponibles para el filtro ─────────────────────────────────
  const proyectosDisponibles = useMemo(() => {
    const nombres = negociaciones
      .map(n => n.proyecto?.nombre)
      .filter((n): n is string => Boolean(n))
    return [...new Set(nombres)].sort()
  }, [negociaciones])

  // ─── Promedio de avance del portafolio ────────────────────────────────────
  const promedioAvance = useMemo(() => {
    if (!negociaciones.length) return 0
    const suma = negociaciones.reduce(
      (acc, n) => acc + (n.porcentaje_pagado || 0),
      0
    )
    return Math.round(suma / negociaciones.length)
  }, [negociaciones])

  // ─── Filtrar + ordenar ────────────────────────────────────────────────────
  const negociacionesFiltradas = useMemo(() => {
    let result = negociaciones

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase().trim().replace(/\s/g, '')
      result = result.filter(neg => {
        const nombre =
          `${neg.cliente.nombres} ${neg.cliente.apellidos}`.toLowerCase()
        const documento = neg.cliente.numero_documento.toLowerCase()
        const proyectoNombre = neg.proyecto?.nombre?.toLowerCase() || ''
        const viviendaNumero = (neg.vivienda.numero || '').toLowerCase()
        const manzana = (neg.vivienda.manzana?.nombre || '').toLowerCase()
        const codigoCombinado = `${manzana}${viviendaNumero}`.replace(/\s/g, '')
        const codigoCompleto = `${manzana} ${viviendaNumero}`
        return (
          nombre.includes(termino) ||
          documento.includes(termino) ||
          proyectoNombre.includes(termino) ||
          viviendaNumero.includes(termino) ||
          codigoCombinado.includes(termino) ||
          codigoCompleto.includes(termino)
        )
      })
    }

    if (proyectoFiltro) {
      result = result.filter(n => n.proyecto?.nombre === proyectoFiltro)
    }

    return [...result].sort((a, b) => {
      switch (ordenar) {
        case 'mayor_pago':
          return (b.porcentaje_pagado || 0) - (a.porcentaje_pagado || 0)
        case 'nombre_az': {
          const na = `${a.cliente.apellidos} ${a.cliente.nombres}`.toLowerCase()
          const nb = `${b.cliente.apellidos} ${b.cliente.nombres}`.toLowerCase()
          return na.localeCompare(nb, 'es')
        }
        case 'nombre_za': {
          const na = `${a.cliente.apellidos} ${a.cliente.nombres}`.toLowerCase()
          const nb = `${b.cliente.apellidos} ${b.cliente.nombres}`.toLowerCase()
          return nb.localeCompare(na, 'es')
        }
        case 'vivienda_asc': {
          const ka =
            `${a.vivienda.manzana?.nombre || ''}${(a.vivienda.numero || '').padStart(5, '0')}`.toLowerCase()
          const kb =
            `${b.vivienda.manzana?.nombre || ''}${(b.vivienda.numero || '').padStart(5, '0')}`.toLowerCase()
          return ka.localeCompare(kb, 'es')
        }
        case 'mayor_saldo': {
          const sa = (a.valor_total || 0) - (a.total_abonado || 0)
          const sb = (b.valor_total || 0) - (b.total_abonado || 0)
          return sb - sa
        }
        case 'urgente':
        default:
          return (a.porcentaje_pagado || 0) - (b.porcentaje_pagado || 0)
      }
    })
  }, [negociaciones, busqueda, proyectoFiltro, ordenar])

  // Resetear a pagina 1 al cambiar filtros o pageSize
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, proyectoFiltro, ordenar, pageSize])

  const totalFiltrado = negociacionesFiltradas.length
  const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / pageSize))

  const negociacionesPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * pageSize
    return negociacionesFiltradas.slice(inicio, inicio + pageSize)
  }, [negociacionesFiltradas, paginaActual, pageSize])

  return {
    negociaciones,
    negociacionesFiltradas,
    negociacionesPaginadas,
    proyectosDisponibles,
    promedioAvance,
    busqueda,
    setBusqueda,
    proyectoFiltro,
    setProyectoFiltro,
    ordenar,
    setOrdenar,
    paginaActual,
    totalPaginas,
    totalFiltrado,
    setPaginaActual,
    pageSize,
    setPageSize,
    isLoading,
    estadisticas,
  }
}
