/**
 * Hook para gestionar historial de cliente
 * Carga eventos de audit_log y los humaniza para mostrar en timeline
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { historialClienteService } from '../services/historial-cliente.service'
import { humanizarEventos } from '../utils/humanizador-eventos'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import type {
    EventoHistorialHumanizado,
    FiltrosHistorial,
    GrupoEventosPorFecha,
} from '../types/historial.types'

interface UseHistorialClienteProps {
  clienteId: string
  habilitado?: boolean
  limit?: number
}

export function useHistorialCliente({
  clienteId,
  habilitado = true,
  limit = 200,
}: UseHistorialClienteProps) {
  // ========== ESTADO ==========
  const [filtros, setFiltros] = useState<FiltrosHistorial>({})
  const [busqueda, setBusqueda] = useState('')

  // ========== QUERY ==========
  const {
    data: eventosRaw = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['historial-cliente', clienteId, limit],
    queryFn: () => historialClienteService.obtenerHistorial(clienteId, limit),
    enabled: habilitado && !!clienteId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // ========== HUMANIZAR EVENTOS ==========
  const eventosHumanizados = useMemo(() => {
    return humanizarEventos(eventosRaw)
  }, [eventosRaw])

  // ========== FILTRAR Y BUSCAR ==========
  const eventosFiltrados = useMemo(() => {
    let eventos = eventosHumanizados

    // Filtrar por tipo
    if (filtros.tipo && filtros.tipo.length > 0) {
      eventos = eventos.filter((e) => filtros.tipo!.includes(e.tipo))
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const terminoLower = busqueda.toLowerCase()
      eventos = eventos.filter((e) => {
        const textoEvento = `
          ${e.titulo}
          ${e.descripcion}
          ${e.usuario.email}
          ${e.usuario.nombres || ''}
        `.toLowerCase()

        return textoEvento.includes(terminoLower)
      })
    }

    // Filtrar por fechas
    if (filtros.fecha_desde) {
      const fechaDesde = new Date(filtros.fecha_desde)
      eventos = eventos.filter((e) => new Date(e.fecha) >= fechaDesde)
    }

    if (filtros.fecha_hasta) {
      const fechaHasta = new Date(filtros.fecha_hasta)
      eventos = eventos.filter((e) => new Date(e.fecha) <= fechaHasta)
    }

    return eventos
  }, [eventosHumanizados, filtros, busqueda])

  // ========== AGRUPAR POR FECHA ==========
  const eventosAgrupados = useMemo(() => {
    const grupos: Record<string, EventoHistorialHumanizado[]> = {}

    eventosFiltrados.forEach((evento) => {
      const fecha = new Date(evento.fecha)
      const fechaKey = fecha.toISOString().split('T')[0] // YYYY-MM-DD

      if (!grupos[fechaKey]) {
        grupos[fechaKey] = []
      }

      grupos[fechaKey].push(evento)
    })

    // Convertir a array y ordenar
    const gruposArray: GrupoEventosPorFecha[] = Object.entries(grupos).map(
      ([fecha, eventos]) => ({
        fecha,
        fechaFormateada: formatearFechaRelativa(fecha),
        eventos,
        total: eventos.length,
      })
    )

    // Ordenar por fecha descendente (más reciente primero)
    gruposArray.sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime()
      const fechaB = new Date(b.fecha).getTime()
      return fechaB - fechaA
    })

    return gruposArray
  }, [eventosFiltrados])

  // ========== ESTADÍSTICAS ==========
  const estadisticas = useMemo(() => {
    const total = eventosHumanizados.length
    const porTipo: Record<string, number> = {}
    const porColor: Record<string, number> = {}

    eventosHumanizados.forEach((evento) => {
      // Contar por tipo
      porTipo[evento.tipo] = (porTipo[evento.tipo] || 0) + 1

      // Contar por color
      porColor[evento.color] = (porColor[evento.color] || 0) + 1
    })

    return {
      total,
      porTipo,
      porColor,
      filtrados: eventosFiltrados.length,
      grupos: eventosAgrupados.length,
    }
  }, [eventosHumanizados, eventosFiltrados, eventosAgrupados])

  // ========== FUNCIONES DE FILTRADO ==========
  const aplicarFiltros = (nuevosFiltros: Partial<FiltrosHistorial>) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }))
  }

  const limpiarFiltros = () => {
    setFiltros({})
    setBusqueda('')
  }

  const tieneAplicados = Object.keys(filtros).length > 0 || busqueda.trim() !== ''

  // ========== RETORNO ==========
  return {
    // Datos
    eventosRaw,
    eventosHumanizados,
    eventosFiltrados,
    eventosAgrupados,
    estadisticas,

    // Estados
    isLoading,
    error,

    // Filtros y búsqueda
    filtros,
    busqueda,
    setBusqueda,
    aplicarFiltros,
    limpiarFiltros,
    tieneAplicados,

    // Acciones
    refetch,
  }
}

/**
 * Formatear fecha relativa (Hoy, Ayer, fecha completa)
 */
function formatearFechaRelativa(fechaStr: string): string {
  const fecha = new Date(fechaStr + 'T12:00:00') // Agregar hora para evitar timezone shift
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)

  const fechaInput = new Date(fecha)
  fechaInput.setHours(0, 0, 0, 0)

  if (fechaInput.getTime() === hoy.getTime()) {
    return 'Hoy'
  }

  if (fechaInput.getTime() === ayer.getTime()) {
    return 'Ayer'
  }

  // Fecha completa: "15 de noviembre de 2025"
  return formatDateForDisplay(fechaStr)
}
