/**
 * 🎣 HOOK: Progreso del Proceso por Cliente
 *
 * Obtiene el progreso del proceso de la negociación activa del cliente.
 * Útil para mostrar resumen rápido en header o cards.
 *
 * Incluye información de:
 * - Progreso general
 * - Último paso completado
 * - Próximo paso pendiente
 */

import { useEffect, useState } from 'react'

import { obtenerProcesosNegociacion, obtenerProgresoNegociacion } from '../services/procesos.service'
import type { ProcesoNegociacion, ProgresoNegociacion } from '../types'
import { EstadoPaso } from '../types'

interface UseProgresoClienteParams {
  clienteId: string | null
  enabled?: boolean  // Permite deshabilitar la carga
}

interface UseProgresoClienteReturn {
  progreso: ProgresoNegociacion | null
  ultimoPasoCompletado: ProcesoNegociacion | null
  proximoPasoPendiente: ProcesoNegociacion | null
  loading: boolean
  error: string | null
}

/**
 * Hook para obtener el progreso del proceso de un cliente
 */
export function useProgresoCliente({
  clienteId,
  enabled = true
}: UseProgresoClienteParams): UseProgresoClienteReturn {
  const [progreso, setProgreso] = useState<ProgresoNegociacion | null>(null)
  const [ultimoPasoCompletado, setUltimoPasoCompletado] = useState<ProcesoNegociacion | null>(null)
  const [proximoPasoPendiente, setProximoPasoPendiente] = useState<ProcesoNegociacion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !clienteId) {
      setProgreso(null)
      setUltimoPasoCompletado(null)
      setProximoPasoPendiente(null)
      return
    }

    const cargarProgreso = async () => {
      setLoading(true)
      setError(null)

      try {
        // 1. Obtener negociación activa del cliente
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: negociaciones, error: negError } = await supabase
          .from('negociaciones')
          .select('id')
          .eq('cliente_id', clienteId)
          .eq('estado', 'Activa')  // Solo negociaciones activas
          .order('fecha_negociacion', { ascending: false })
          .limit(1)

        if (negError) throw negError

        // Si no tiene negociación activa, no hay progreso
        if (!negociaciones || negociaciones.length === 0) {
          setProgreso(null)
          setUltimoPasoCompletado(null)
          setProximoPasoPendiente(null)
          return
        }

        const negociacionId = negociaciones[0].id

        // 2. Obtener progreso de la negociación
        const progresoData = await obtenerProgresoNegociacion(negociacionId)
        setProgreso(progresoData)

        // 3. Obtener todos los pasos para encontrar último completado y próximo pendiente
        const pasos = await obtenerProcesosNegociacion(negociacionId)

        // Encontrar último paso completado (ordenar por fecha_completado DESC)
        const pasosCompletados = pasos
          .filter(p => p.estado === EstadoPaso.COMPLETADO)
          .sort((a, b) => {
            if (!a.fechaCompletado || !b.fechaCompletado) return 0
            return new Date(b.fechaCompletado).getTime() - new Date(a.fechaCompletado).getTime()
          })

        setUltimoPasoCompletado(pasosCompletados[0] || null)

        // Encontrar próximo paso pendiente (ordenar por orden ASC)
        const pasosPendientes = pasos
          .filter(p => p.estado === EstadoPaso.PENDIENTE)
          .sort((a, b) => a.orden - b.orden)

        setProximoPasoPendiente(pasosPendientes[0] || null)

      } catch (err: any) {
        console.error('Error al cargar progreso del cliente:', err)
        setError(err.message || 'Error al cargar progreso')
        setProgreso(null)
        setUltimoPasoCompletado(null)
        setProximoPasoPendiente(null)
      } finally {
        setLoading(false)
      }
    }

    cargarProgreso()
  }, [clienteId, enabled])

  return {
    progreso,
    ultimoPasoCompletado,
    proximoPasoPendiente,
    loading,
    error
  }
}
