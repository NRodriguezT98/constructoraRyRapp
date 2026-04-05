/**
 * useManzanasEditables - Hook para validar qué manzanas se pueden editar
 * ✅ Consulta DB para verificar si manzana tiene viviendas
 * ✅ Retorna estado editable/bloqueado por manzana
 * ✅ DB logic extraída a proyectos-consultas.service.ts
 */

import { useCallback, useState } from 'react'

import { logger } from '@/lib/utils/logger'

import {
  type ManzanaEditableResult,
  validarManzanasEditables,
} from '../services/proyectos-consultas.service'

type ManzanaEditableState = ManzanaEditableResult & { cargando: boolean }

interface UseManzanasEditablesReturn {
  manzanasState: Map<string, ManzanaEditableState>
  validarManzanas: (manzanasIds: string[]) => Promise<void>
  cargando: boolean
  puedeEliminar: (manzanaId: string) => boolean
  puedeEditar: (manzanaId: string) => boolean
  obtenerMotivoBloqueado: (manzanaId: string) => string
}

export function useManzanasEditables(): UseManzanasEditablesReturn {
  const [manzanasState, setManzanasState] = useState<
    Map<string, ManzanaEditableState>
  >(new Map())
  const [cargando, setCargando] = useState(false)

  const validarManzanas = useCallback(async (manzanasIds: string[]) => {
    if (manzanasIds.length === 0) return

    setCargando(true)
    try {
      const result = await validarManzanasEditables(manzanasIds)
      // Adaptar al Map con campo cargando=false
      const stateMap = new Map<string, ManzanaEditableState>()
      result.forEach((val, key) =>
        stateMap.set(key, { ...val, cargando: false })
      )
      setManzanasState(stateMap)
    } catch (error) {
      logger.error('Error validando manzanas:', error)
    } finally {
      setCargando(false)
    }
  }, [])

  const puedeEliminar = useCallback(
    (manzanaId: string): boolean => {
      const state = manzanasState.get(manzanaId)
      return state ? state.esEditable : true
    },
    [manzanasState]
  )

  const puedeEditar = useCallback(
    (manzanaId: string): boolean => {
      const state = manzanasState.get(manzanaId)
      return state ? state.esEditable : true
    },
    [manzanasState]
  )

  const obtenerMotivoBloqueado = useCallback(
    (manzanaId: string): string => {
      const state = manzanasState.get(manzanaId)
      if (!state || state.esEditable) return ''
      const n = state.cantidadViviendas
      return `Esta manzana tiene ${n} vivienda${n === 1 ? '' : 's'} creada${n === 1 ? '' : 's'}. No se puede modificar para proteger la integridad de datos.`
    },
    [manzanasState]
  )

  return {
    manzanasState,
    validarManzanas,
    cargando,
    puedeEliminar,
    puedeEditar,
    obtenerMotivoBloqueado,
  }
}
