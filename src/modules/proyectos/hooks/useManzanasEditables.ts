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
   * Consulta la cantidad de viviendas asociadas
   */
  const validarManzanas = useCallback(async (manzanasIds: string[]) => {
    if (manzanasIds.length === 0) return

    setCargando(true)
    const newState = new Map<string, ManzanaEditableState>()

    try {
      // Consultar viviendas por cada manzana
      for (const manzanaId of manzanasIds) {
        // Obtener datos de la manzana (maybeSingle permite 0 filas sin error)
        const { data: manzana, error: manzanaError } = await supabase
          .from('manzanas')
          .select('id, nombre')
          .eq('id', manzanaId)
          .maybeSingle() // ← CAMBIO CRÍTICO: permite 0 resultados

        if (manzanaError) {
          console.error('Error obteniendo manzana:', manzanaId, manzanaError)
          continue
        }

        // Si la manzana NO existe en DB, es una manzana nueva (aún no persistida)
        if (!manzana) {
          // Marcamos como editable porque no está en DB todavía
          newState.set(manzanaId, {
            id: manzanaId,
            nombre: '(Nueva)',
            esEditable: true,
            cantidadViviendas: 0,
            cargando: false,
          })
          continue
        }

        // Contar viviendas asociadas
        const { count, error: countError } = await supabase
          .from('viviendas')
          .select('*', { count: 'exact', head: true })
          .eq('manzana_id', manzanaId)

        if (countError) {
          console.error('Error contando viviendas para manzana:', manzana.nombre, countError)
          continue
        }

        const cantidadViviendas = count || 0
        const esEditable = cantidadViviendas === 0

        newState.set(manzanaId, {
          id: manzanaId,
          nombre: manzana.nombre,
          esEditable,
          cantidadViviendas,
          cargando: false,
        })
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
