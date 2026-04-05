/**
 * useEditarViviendaData — Queries y mutation de servidor para edición de viviendas
 * Sub-hook extraído de useEditarVivienda.ts
 */

import { useQuery } from '@tanstack/react-query'

import { viviendasService } from '../services/viviendas.service'
import type { Vivienda } from '../types'

import {
  useActualizarViviendaMutation,
  useConfiguracionRecargosQuery,
  useGastosNotarialesQuery,
  useManzanasDisponiblesQuery,
  useProyectosActivosQuery,
} from './useViviendasQuery'

interface UseEditarViviendaDataProps {
  vivienda: Vivienda | null
  esViviendaAsignada: boolean
}

export function useEditarViviendaData({
  vivienda,
  esViviendaAsignada,
}: UseEditarViviendaDataProps) {
  const { data: proyectos = [], isLoading: cargandoProyectos } =
    useProyectosActivosQuery()
  const { data: gastosNotariales = 0 } = useGastosNotarialesQuery()
  const { data: configuracionRecargos = [] } = useConfiguracionRecargosQuery()

  const proyectoId = vivienda?.manzanas?.proyecto_id
  const { data: manzanas = [], isLoading: cargandoManzanas } =
    useManzanasDisponiblesQuery(proyectoId || '')

  const { data: negociacionActiva = null } = useQuery({
    queryKey: ['negociacion-activa-vivienda', vivienda?.id],
    queryFn: () =>
      viviendasService.obtenerNegociacionActivaPorVivienda(vivienda?.id ?? ''),
    enabled: !!vivienda?.id && esViviendaAsignada,
    staleTime: 60_000,
  })

  const actualizarMutation = useActualizarViviendaMutation()

  return {
    proyectos,
    cargandoProyectos,
    gastosNotariales,
    configuracionRecargos,
    manzanas,
    cargandoManzanas,
    negociacionActiva,
    actualizarMutation,
  }
}
