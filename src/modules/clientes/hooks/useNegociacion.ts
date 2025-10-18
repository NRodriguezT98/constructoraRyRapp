/**
 * Hook useNegociacion
 *
 * Gestiona el ciclo completo de una negociación:
 * 1. Crear negociación (En Proceso)
 * 2. Configurar fuentes de pago (Cierre Financiero)
 * 3. Activar negociación (Activa)
 * 4. Registrar abonos y seguimiento
 * 5. Completar, cancelar o registrar renuncia
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

'use client'

import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import { useCallback, useEffect, useState } from 'react'

interface UseNegociacionReturn {
  // Estado
  negociacion: any | null
  fuentesPago: any[]
  totales: {
    valorTotal: number
    totalFuentes: number
    porcentajeCubierto: number
    diferencia: number
  }
  cargando: boolean
  error: string | null

  // Acciones de estado
  pasarACierreFinanciero: () => Promise<boolean>
  activarNegociacion: () => Promise<boolean>
  completarNegociacion: () => Promise<boolean>
  cancelarNegociacion: (motivo: string) => Promise<boolean>
  registrarRenuncia: (motivo: string) => Promise<boolean>

  // Operaciones CRUD
  actualizarNegociacion: (datos: any) => Promise<boolean>
  recargarNegociacion: () => Promise<void>

  // Helpers
  puedeActivarse: boolean
  puedeCompletarse: boolean
  esActiva: boolean
  estaEnProceso: boolean
  estaCancelada: boolean
  estadoLegible: string
}

export function useNegociacion(negociacionId: string): UseNegociacionReturn {
  // Estado
  const [negociacion, setNegociacion] = useState<any | null>(null)
  const [fuentesPago, setFuentesPago] = useState<any[]>([])
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
      const negData = await negociacionesService.obtenerNegociacion(negociacionId)
      setNegociacion(negData)

      // Cargar fuentes de pago
      const fuentesData = await fuentesPagoService.obtenerFuentesPagoNegociacion(negociacionId)
      setFuentesPago(fuentesData)
    } catch (err: any) {
      console.error('Error cargando negociación:', err)
      setError(`Error cargando negociación: ${err.message}`)
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
    const valorTotal = negociacion?.valor_total || 0
    const totalFuentes = fuentesPago.reduce(
      (sum, f) => sum + (f.monto_aprobado || 0),
      0
    )
    const porcentajeCubierto = valorTotal > 0 ? (totalFuentes / valorTotal) * 100 : 0
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
   */
  const estaEnProceso = negociacion?.estado === 'En Proceso'
  const esActiva = negociacion?.estado === 'Activa'
  const estaCancelada = negociacion?.estado === 'Cancelada' || negociacion?.estado === 'Renuncia'
  const cierreCompleto = Math.abs(totales.diferencia) < 1
  const puedeActivarse = negociacion?.estado === 'Cierre Financiero' && cierreCompleto
  const puedeCompletarse = esActiva && totales.porcentajeCubierto >= 100

  const estadoLegible =
    negociacion?.estado === 'En Proceso'
      ? 'En Proceso'
      : negociacion?.estado === 'Cierre Financiero'
        ? 'Configurando Fuentes de Pago'
        : negociacion?.estado === 'Activa'
          ? 'Negociación Activa'
          : negociacion?.estado === 'Completada'
            ? 'Completada'
            : negociacion?.estado === 'Cancelada'
              ? 'Cancelada'
              : negociacion?.estado === 'Renuncia'
                ? 'Renuncia del Cliente'
                : 'Desconocido'

  /**
   * Pasar a Cierre Financiero
   */
  const pasarACierreFinanciero = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)
      await negociacionesService.pasarACierreFinanciero(negociacionId)
      await cargarDatos()
      return true
    } catch (err: any) {
      console.error('Error pasando a cierre financiero:', err)
      setError(`Error: ${err.message}`)
      return false
    }
  }, [negociacionId, cargarDatos])

  /**
   * Activar negociación
   */
  const activarNegociacion = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)

      // Verificar que el cierre esté completo
      if (!cierreCompleto) {
        setError('El cierre financiero debe estar completo (100%) para activar la negociación')
        return false
      }

      await negociacionesService.activarNegociacion(negociacionId)
      await cargarDatos()
      return true
    } catch (err: any) {
      console.error('Error activando negociación:', err)
      setError(`Error: ${err.message}`)
      return false
    }
  }, [negociacionId, cierreCompleto, cargarDatos])

  /**
   * Completar negociación
   */
  const completarNegociacion = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)

      if (!puedeCompletarse) {
        setError('La negociación solo puede completarse si está activa y el pago está completo')
        return false
      }

      await negociacionesService.completarNegociacion(negociacionId)
      await cargarDatos()
      return true
    } catch (err: any) {
      console.error('Error completando negociación:', err)
      setError(`Error: ${err.message}`)
      return false
    }
  }, [negociacionId, puedeCompletarse, cargarDatos])

  /**
   * Cancelar negociación
   */
  const cancelarNegociacion = useCallback(
    async (motivo: string): Promise<boolean> => {
      try {
        setError(null)

        if (!motivo?.trim()) {
          setError('Debes especificar el motivo de cancelación')
          return false
        }

        await negociacionesService.cancelarNegociacion(negociacionId, motivo)
        await cargarDatos()
        return true
      } catch (err: any) {
        console.error('Error cancelando negociación:', err)
        setError(`Error: ${err.message}`)
        return false
      }
    },
    [negociacionId, cargarDatos]
  )

  /**
   * Registrar renuncia del cliente
   */
  const registrarRenuncia = useCallback(
    async (motivo: string): Promise<boolean> => {
      try {
        setError(null)

        if (!motivo?.trim()) {
          setError('Debes especificar el motivo de la renuncia')
          return false
        }

        await negociacionesService.registrarRenuncia(negociacionId, motivo)
        await cargarDatos()
        return true
      } catch (err: any) {
        console.error('Error registrando renuncia:', err)
        setError(`Error: ${err.message}`)
        return false
      }
    },
    [negociacionId, cargarDatos]
  )

  /**
   * Actualizar campos de la negociación
   */
  const actualizarNegociacion = useCallback(
    async (datos: any): Promise<boolean> => {
      try {
        setError(null)
        await negociacionesService.actualizarNegociacion(negociacionId, datos)
        await cargarDatos()
        return true
      } catch (err: any) {
        console.error('Error actualizando negociación:', err)
        setError(`Error: ${err.message}`)
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
    pasarACierreFinanciero,
    activarNegociacion,
    completarNegociacion,
    cancelarNegociacion,
    registrarRenuncia,

    // CRUD
    actualizarNegociacion,
    recargarNegociacion: cargarDatos,

    // Helpers
    puedeActivarse,
    puedeCompletarse,
    esActiva,
    estaEnProceso,
    estaCancelada,
    estadoLegible,
  }
}
