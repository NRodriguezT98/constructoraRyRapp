/**
 * useManzanasEditables - Hook para validar qué manzanas se pueden editar
 * ✅ Consulta DB para verificar si manzana tiene viviendas
 * ✅ Retorna estado editable/bloqueado por manzana
 */

import { useCallback, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

interface ManzanaEditableState {
  id: string
  nombre: string
  esEditable: boolean // true = no tiene viviendas, false = tiene viviendas
  cantidadViviendas: number
  cargando: boolean
}

interface UseManzanasEditablesReturn {
  manzanasState: Map<string, ManzanaEditableState>
  validarManzanas: (manzanasIds: string[]) => Promise<void>
  cargando: boolean
  puedeEliminar: (manzanaId: string) => boolean
  puedeEditar: (manzanaId: string) => boolean
  obtenerMotivoBloqueado: (manzanaId: string) => string
}

export function useManzanasEditables(): UseManzanasEditablesReturn {
  const [manzanasState, setManzanasState] = useState<Map<string, ManzanaEditableState>>(new Map())
  const [cargando, setCargando] = useState(false)

  /**
   * Valida si cada manzana puede ser editada
   * Consulta la cantidad de viviendas asociadas en un solo query batch
   */
  const validarManzanas = useCallback(async (manzanasIds: string[]) => {
    if (manzanasIds.length === 0) return

    setCargando(true)
    const newState = new Map<string, ManzanaEditableState>()

    try {
      // ✅ Query batch: obtener todas las manzanas de una vez
      const { data: manzanas, error: manzanasError } = await supabase
        .from('manzanas')
        .select('id, nombre')
        .in('id', manzanasIds)

      if (manzanasError) {
        console.error('Error obteniendo manzanas:', manzanasError)
        setCargando(false)
        return
      }

      // Identificar manzanas nuevas (no en DB)
      const manzanasEnDB = new Set((manzanas ?? []).map(m => m.id))
      for (const id of manzanasIds) {
        if (!manzanasEnDB.has(id)) {
          newState.set(id, {
            id,
            nombre: '(Nueva)',
            esEditable: true,
            cantidadViviendas: 0,
            cargando: false,
          })
        }
      }

      // ✅ Query batch: contar viviendas agrupadas por manzana en un solo query
      if (manzanas && manzanas.length > 0) {
        const idsEnDB = manzanas.map(m => m.id)
        const { data: conteos, error: conteosError } = await supabase
          .from('viviendas')
          .select('manzana_id')
          .in('manzana_id', idsEnDB)

        if (conteosError) {
          console.error('Error contando viviendas:', conteosError)
          setCargando(false)
          return
        }

        // Agrupar conteo de viviendas por manzana_id
        const conteosPorManzana = new Map<string, number>()
        for (const row of conteos ?? []) {
          const prev = conteosPorManzana.get(row.manzana_id) ?? 0
          conteosPorManzana.set(row.manzana_id, prev + 1)
        }

        // Construir estado de cada manzana
        for (const manzana of manzanas) {
          const cantidadViviendas = conteosPorManzana.get(manzana.id) ?? 0
          newState.set(manzana.id, {
            id: manzana.id,
            nombre: manzana.nombre,
            esEditable: cantidadViviendas === 0,
            cantidadViviendas,
            cargando: false,
          })
        }
      }

      setManzanasState(newState)
    } catch (error) {
      console.error('Error validando manzanas:', error)
    } finally {
      setCargando(false)
    }
  }, []) // No dependencies porque no usa state externo

  /**
   * Verifica si una manzana específica puede ser eliminada
   */
  const puedeEliminar = useCallback((manzanaId: string): boolean => {
    const state = manzanasState.get(manzanaId)
    if (!state) return true // Si no está en el state, es manzana nueva (aún no en DB)
    return state.esEditable
  }, [manzanasState])

  /**
   * Verifica si una manzana específica puede ser editada
   */
  const puedeEditar = useCallback((manzanaId: string): boolean => {
    const state = manzanasState.get(manzanaId)
    if (!state) return true // Si no está en el state, es manzana nueva
    return state.esEditable
  }, [manzanasState])

  /**
   * Obtiene el motivo por el cual una manzana está bloqueada
   */
  const obtenerMotivoBloqueado = useCallback((manzanaId: string): string => {
    const state = manzanasState.get(manzanaId)
    if (!state) return ''
    if (state.esEditable) return ''

    return `Esta manzana tiene ${state.cantidadViviendas} vivienda${
      state.cantidadViviendas === 1 ? '' : 's'
    } creada${state.cantidadViviendas === 1 ? '' : 's'}. No se puede modificar para proteger la integridad de datos.`
  }, [manzanasState])

  return {
    manzanasState,
    validarManzanas,
    cargando,
    puedeEliminar,
    puedeEditar,
    obtenerMotivoBloqueado,
  }
}
