/**
 * Hook: useListaIntereses
 *
 * Gestiona la lista de intereses de un cliente con acciones.
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 *
 * Campos usados de cliente_intereses:
 * - id, cliente_id, proyecto_id, vivienda_id
 * - estado (PascalCase: 'Activo', 'Descartado', etc.)
 * - origen ('WhatsApp', 'Email', etc.)
 * - notas, fecha_interes
 *
 * Campos de vista intereses_completos:
 * - proyecto_nombre, proyecto_estado
 * - vivienda_numero, vivienda_valor, vivienda_estado
 * - manzana_nombre
 */

import { useCallback, useEffect, useState } from 'react'

import { logger } from '@/lib/utils/logger'
import { interesesService } from '@/modules/clientes/services/intereses.service'
import type { ClienteInteres } from '@/modules/clientes/types'

interface UseListaInteresesReturn {
  intereses: ClienteInteres[]
  loading: boolean
  error: string | null

  // Acciones
  recargar: () => Promise<void>
  descartarInteres: (interesId: string, motivo?: string) => Promise<void>

  // Filtros
  filtrarPorEstado: (estado: string | null) => void
  estadoFiltro: string | null

  // Estadísticas rápidas
  stats: {
    total: number
    activos: number
    descartados: number
  }
}

export function useListaIntereses(clienteId: string): UseListaInteresesReturn {
  const [intereses, setIntereses] = useState<ClienteInteres[]>([])
  const [interesesFiltrados, setInteresesFiltrados] = useState<
    ClienteInteres[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null)

  /**
   * Cargar intereses del cliente
   * Usa interesesService.obtenerInteresesCliente() que consulta vista intereses_completos
   */
  const cargarIntereses = useCallback(async () => {
    if (!clienteId) {
      logger.warn('⚠️ useListaIntereses: clienteId no proporcionado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Obtener todos los intereses (activos y descartados)
      const data = await interesesService.obtenerInteresesCliente(
        clienteId,
        false
      )

      setIntereses(data)
      setInteresesFiltrados(data) // Inicialmente sin filtro
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al cargar intereses'
      logger.error('❌ Error cargando intereses:', err)
      setError(errorMsg)
      setIntereses([])
      setInteresesFiltrados([])
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  /**
   * Descartar un interés (cambiar estado a 'Descartado')
   */
  const descartarInteres = useCallback(
    async (interesId: string, motivo?: string) => {
      try {
        await interesesService.descartarInteres(interesId, motivo)

        // Recargar lista
        await cargarIntereses()
      } catch (err) {
        logger.error('❌ Error descartando interés:', err)
        throw err
      }
    },
    [cargarIntereses]
  )

  /**
   * Filtrar por estado
   */
  const filtrarPorEstado = useCallback(
    (estado: string | null) => {
      setEstadoFiltro(estado)

      if (!estado) {
        setInteresesFiltrados(intereses)
      } else {
        const filtrados = intereses.filter(interes => interes.estado === estado)
        setInteresesFiltrados(filtrados)
      }
    },
    [intereses]
  )

  /**
   * Recalcular filtro cuando cambian los intereses
   */
  useEffect(() => {
    if (estadoFiltro) {
      filtrarPorEstado(estadoFiltro)
    } else {
      setInteresesFiltrados(intereses)
    }
  }, [intereses, estadoFiltro, filtrarPorEstado])

  /**
   * Calcular estadísticas
   */
  const stats = {
    total: intereses.length,
    activos: intereses.filter(i => i.estado === 'Activo').length,
    descartados: intereses.filter(i => i.estado === 'Descartado').length,
  }

  /**
   * Cargar al montar
   */
  useEffect(() => {
    cargarIntereses()
  }, [cargarIntereses])

  return {
    intereses: interesesFiltrados,
    loading,
    error,
    recargar: cargarIntereses,
    descartarInteres,
    filtrarPorEstado,
    estadoFiltro,
    stats,
  }
}
