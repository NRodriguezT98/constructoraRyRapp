/**
 * Hook useNegociacion
 *
 * Gestiona el ciclo completo de una negociación:
 * 1. Crear negociación (estado: 'Activa')
 * 2. Configurar fuentes de pago
 * 3. Registrar abonos y seguimiento
 * 4. Completar o registrar renuncia
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { logger } from '@/lib/utils/logger'
import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import type {
  ActualizarNegociacionDTO,
  Negociacion,
} from '@/modules/clientes/types'

interface UseNegociacionReturn {
  // Estado
  negociacion: Negociacion | null
  fuentesPago: FuentePago[]
  totales: {
    valorTotal: number
    totalFuentes: number
    porcentajeCubierto: number
    diferencia: number
  }
  cargando: boolean
  error: string | null

  // Acciones de estado
  completarNegociacion: () => Promise<boolean>
  registrarRenuncia: (motivo: string) => Promise<boolean>

  // Operaciones CRUD
  actualizarNegociacion: (datos: ActualizarNegociacionDTO) => Promise<boolean>
  recargarNegociacion: () => Promise<void>

  // Helpers
  puedeCompletarse: boolean
  esActiva: boolean
  estaSuspendida: boolean
  estaCompletada: boolean
  estaCerrada: boolean
  estadoLegible: string
}

export function useNegociacion(negociacionId: string): UseNegociacionReturn {
  // Estado
  const [negociacion, setNegociacion] = useState<Negociacion | null>(null)
  const [fuentesPago, setFuentesPago] = useState<FuentePago[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Cargar negociación y fuentes de pago
   */
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      // Cargar negociación
      const negData =
        await negociacionesService.obtenerNegociacion(negociacionId)
      setNegociacion(negData)

      // Cargar fuentes de pago
      const fuentesData =
        await fuentesPagoService.obtenerFuentesPagoNegociacion(negociacionId)
      setFuentesPago(fuentesData)
    } catch (err: unknown) {
      logger.error('Error cargando negociación:', err)
      setError(
        `Error cargando negociación: ${err instanceof Error ? err.message : String(err)}`
      )
    } finally {
      setCargando(false)
    }
  }, [negociacionId])

  /**
   * Cargar datos al montar
   */
  useEffect(() => {
    if (negociacionId) {
      cargarDatos()
    }
  }, [negociacionId, cargarDatos])

  /**
   * Calcular totales de fuentes de pago
   */
  const calcularTotales = useCallback(() => {
    // Para créditos con la constructora usamos capital_para_cierre (sin intereses).
    // Para el resto, monto_aprobado es el valor correcto.
    const valorTotal = negociacion?.valor_total || 0
    const totalFuentes = fuentesPago.reduce(
      (sum, f) => sum + (f.capital_para_cierre ?? f.monto_aprobado ?? 0),
      0
    )
    const porcentajeCubierto =
      valorTotal > 0 ? (totalFuentes / valorTotal) * 100 : 0
    const diferencia = valorTotal - totalFuentes

    return {
      valorTotal,
      totalFuentes,
      porcentajeCubierto,
      diferencia,
    }
  }, [negociacion, fuentesPago])

  const totales = calcularTotales()

  /**
   * Helpers de estado
   * Estados permitidos: 'Activa', 'Suspendida', 'Cerrada por Renuncia', 'Completada'
   */
  const esActiva = negociacion?.estado === 'Activa'
  const estaSuspendida = negociacion?.estado === 'Suspendida'
  const estaCompletada = negociacion?.estado === 'Completada'
  const estaCerrada = negociacion?.estado === 'Cerrada por Renuncia'
  const puedeCompletarse = esActiva && totales.porcentajeCubierto >= 100

  const estadoLegible =
    negociacion?.estado === 'Activa'
      ? 'Negociación Activa'
      : negociacion?.estado === 'Suspendida'
        ? 'Suspendida'
        : negociacion?.estado === 'Cerrada por Renuncia'
          ? 'Cerrada por Renuncia'
          : negociacion?.estado === 'Completada'
            ? 'Completada'
            : 'Desconocido'

  /**
   * Completar negociación
   * ✅ Estado final: 'Completada'
   * Requisito: Estar en estado 'Activa' y tener pago completo (100%)
   */
  const completarNegociacion = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)

      if (!puedeCompletarse) {
        setError(
          'La negociación solo puede completarse si está activa y el pago está completo'
        )
        return false
      }

      await negociacionesService.completarNegociacion(negociacionId)
      await cargarDatos()
      return true
    } catch (err: unknown) {
      logger.error('Error completando negociación:', err)
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
      return false
    }
  }, [negociacionId, puedeCompletarse, cargarDatos])

  /**
   * Registrar renuncia del cliente
   * ✅ Cambia estado de negociación a 'Cerrada por Renuncia'
   * ✅ Crea registro en tabla renuncias
   */
  const registrarRenuncia = useCallback(
    async (motivo: string): Promise<boolean> => {
      try {
        setError(null)

        if (!motivo?.trim()) {
          setError('Debes especificar el motivo de la renuncia')
          return false
        }

        await negociacionesService.cerrarPorRenuncia(negociacionId)
        await cargarDatos()
        return true
      } catch (err: unknown) {
        logger.error('Error registrando renuncia:', err)
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
        return false
      }
    },
    [negociacionId, cargarDatos]
  )

  /**
   * Actualizar campos de la negociación
   */
  const actualizarNegociacion = useCallback(
    async (datos: ActualizarNegociacionDTO): Promise<boolean> => {
      try {
        setError(null)
        await negociacionesService.actualizarNegociacion(negociacionId, datos)
        await cargarDatos()
        return true
      } catch (err: unknown) {
        logger.error('Error actualizando negociación:', err)
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
        return false
      }
    },
    [negociacionId, cargarDatos]
  )

  return {
    // Estado
    negociacion,
    fuentesPago,
    totales,
    cargando,
    error,

    // Acciones
    completarNegociacion,
    registrarRenuncia,

    // CRUD
    actualizarNegociacion,
    recargarNegociacion: cargarDatos,

    // Helpers
    puedeCompletarse,
    esActiva,
    estaSuspendida,
    estaCompletada,
    estaCerrada,
    estadoLegible,
  }
}
