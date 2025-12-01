/**
 * Hook para manejar la carga de proyectos y viviendas
 * ✅ REFACTORIZADO: Usa React Query para cache automático
 */

import { useCallback, useEffect, useState } from 'react'

import { useProyectosQuery } from './useProyectosQuery'
import { useViviendasQuery } from './useViviendasQuery'

interface UseProyectosViviendasProps {
  viviendaIdInicial?: string
  valorViviendaInicial?: number
}

export function useProyectosViviendas({
  viviendaIdInicial,
  valorViviendaInicial,
}: UseProyectosViviendasProps = {}) {
  // ✅ React Query para proyectos
  const {
    data: proyectos = [],
    isLoading: cargandoProyectos,
  } = useProyectosQuery()

  // Estado local
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('')
  const [viviendaId, setViviendaId] = useState(viviendaIdInicial || '')
  const [valorNegociado, setValorNegociado] = useState(valorViviendaInicial || 0)

  // ✅ React Query para viviendas (se ejecuta solo si hay proyecto)
  const {
    data: viviendas = [],
    isLoading: cargandoViviendas,
  } = useViviendasQuery(proyectoSeleccionado || undefined)

  // Efecto: Resetear vivienda si no hay proyecto
  useEffect(() => {
    if (!proyectoSeleccionado && !viviendaIdInicial) {
      setViviendaId('')
    }
  }, [proyectoSeleccionado, viviendaIdInicial])

  // Efecto: Auto-llenar valor cuando se selecciona vivienda
  useEffect(() => {
    if (viviendaId && !valorViviendaInicial) {
      const vivienda = viviendas.find((v) => v.id === viviendaId)
      if (vivienda?.valor_total) {
        setValorNegociado(vivienda.valor_total)
      }
    }
  }, [viviendaId, viviendas, valorViviendaInicial])

  // Resetear estado
  const resetear = useCallback(() => {
    setProyectoSeleccionado('')
    setViviendaId(viviendaIdInicial || '')
    setValorNegociado(valorViviendaInicial || 0)
  }, [viviendaIdInicial, valorViviendaInicial])

  return {
    // Estado
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaId,
    valorNegociado,

    // Estado de carga
    cargandoProyectos,
    cargandoViviendas,

    // Setters
    setProyectoSeleccionado,
    setViviendaId,
    setValorNegociado,

    // Funciones
    resetear,
  }
}
