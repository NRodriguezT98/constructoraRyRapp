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
      if (vivienda) {
        // ✅ CRÍTICO: usar valor_base (precio sin gastos notariales ni recargos).
        // El trigger calcular_valor_total_pagar en BD suma gastos+recargo automáticamente
        // para obtener valor_total_pagar (obligación real del cliente).
        // Si usamos valor_total aquí, el trigger los suma DOS VECES → doble conteo.
        const precioBase = (vivienda.valor_base && vivienda.valor_base > 0)
          ? vivienda.valor_base
          : vivienda.valor_total
        setValorNegociado(precioBase)
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
