import { useCallback, useMemo, useState } from 'react'

import {
  useAbonosQuery,
  type AbonoConInfo,
} from '@/modules/abonos/hooks/useAbonosQuery'

// Re-export para consumidores existentes
export type { AbonoConInfo }

interface Filtros {
  busqueda: string
  fuente: string // nombre de fuente o 'todas'
  mes: string // 'YYYY-MM' o 'todos'
  mostrarActivos: boolean
  mostrarAnulados: boolean
  mostrarRenunciados: boolean
}

interface Estadisticas {
  totalAbonos: number
  montoTotal: number
  montoEsteMes: number
  abonosEsteMes: number
}

/**
 * 🎣 HOOK: useAbonosList
 *
 * Wrapper de presentación sobre useAbonosQuery (React Query).
 * Agrega filtrado local, estadísticas y meses disponibles.
 */
export function useAbonosList() {
  const {
    abonos,
    cargando: isLoading,
    error: queryError,
    refrescar,
  } = useAbonosQuery()

  const [filtros, setFiltros] = useState<Filtros>({
    busqueda: '',
    fuente: 'todas',
    mes: 'todos',
    mostrarActivos: true,
    mostrarAnulados: false,
    mostrarRenunciados: false,
  })

  /**
   * 🔍 Filtrar abonos según criterios
   */
  const abonosFiltrados = useMemo(() => {
    let resultado = [...abonos]

    // Filtrado por categoría (checklist): activos, anulados, renunciados
    resultado = resultado.filter(a => {
      const esAnulado = a.estado === 'Anulado'
      const esDeRenuncia = a.negociacion?.estado === 'Cerrada por Renuncia'

      // Anulados tienen prioridad (un abono anulado de renuncia se clasifica como anulado)
      if (esAnulado) return filtros.mostrarAnulados
      if (esDeRenuncia) return filtros.mostrarRenunciados
      return filtros.mostrarActivos
    })

    // Filtro por búsqueda (cliente, CC o RYR-XXXX)
    if (filtros.busqueda.trim()) {
      const termino = filtros.busqueda.toLowerCase().trim()
      resultado = resultado.filter(abono => {
        const nombreCompleto =
          `${abono.cliente.nombres} ${abono.cliente.apellidos}`.toLowerCase()
        const documento = abono.cliente.numero_documento.toLowerCase()
        const recibo =
          `ryr-${String(abono.numero_recibo).padStart(4, '0')}`.toLowerCase()
        return (
          nombreCompleto.includes(termino) ||
          documento.includes(termino) ||
          recibo.includes(termino)
        )
      })
    }

    // Filtro por fuente de pago
    if (filtros.fuente && filtros.fuente !== 'todas') {
      resultado = resultado.filter(
        abono => abono.fuente_pago.tipo === filtros.fuente
      )
    }

    // Filtro por mes (YYYY-MM)
    if (filtros.mes && filtros.mes !== 'todos') {
      resultado = resultado.filter(abono => {
        const fechaMes = abono.fecha_abono.substring(0, 7) // 'YYYY-MM'
        return fechaMes === filtros.mes
      })
    }

    return resultado
  }, [abonos, filtros])

  /**
   * 📊 Calcular estadísticas
   */
  const estadisticas = useMemo<Estadisticas>(() => {
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    const abonosEsteMes = abonosFiltrados.filter(abono => {
      const fechaAbono = new Date(abono.fecha_abono)
      return fechaAbono >= inicioMes
    })

    return {
      totalAbonos: abonosFiltrados.length,
      montoTotal: abonosFiltrados.reduce(
        (sum, abono) => sum + Number(abono.monto),
        0
      ),
      montoEsteMes: abonosEsteMes.reduce(
        (sum, abono) => sum + Number(abono.monto),
        0
      ),
      abonosEsteMes: abonosEsteMes.length,
    }
  }, [abonosFiltrados])

  /**
   * 🎛️ Funciones de control de filtros
   */
  const actualizarFiltros = (nuevosFiltros: Partial<Filtros>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      fuente: 'todas',
      mes: 'todos',
      mostrarActivos: true,
      mostrarAnulados: false,
      mostrarRenunciados: false,
    })
  }

  const toggleMostrarActivos = useCallback(() => {
    setFiltros(prev => ({ ...prev, mostrarActivos: !prev.mostrarActivos }))
  }, [])

  const toggleMostrarAnulados = useCallback(() => {
    setFiltros(prev => ({ ...prev, mostrarAnulados: !prev.mostrarAnulados }))
  }, [])

  const toggleMostrarRenunciados = useCallback(() => {
    setFiltros(prev => ({
      ...prev,
      mostrarRenunciados: !prev.mostrarRenunciados,
    }))
  }, [])

  const fuentesUnicas = useMemo(() => {
    const set = new Set<string>()
    abonos.forEach(a => {
      if (a.fuente_pago.tipo) set.add(a.fuente_pago.tipo)
    })
    return Array.from(set).sort()
  }, [abonos])

  const mesesDisponibles = useMemo(() => {
    const meses: { value: string; label: string }[] = []
    const ahora = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('es-CO', {
        month: 'long',
        year: 'numeric',
      })
      meses.push({
        value,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      })
    }
    return meses
  }, [])

  return {
    abonos: abonosFiltrados,
    abonosCompletos: abonos,
    estadisticas,
    fuentesUnicas,
    mesesDisponibles,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    toggleMostrarActivos,
    toggleMostrarAnulados,
    toggleMostrarRenunciados,
    isLoading,
    error: queryError?.message ?? null,
    refetch: refrescar,
  }
}
