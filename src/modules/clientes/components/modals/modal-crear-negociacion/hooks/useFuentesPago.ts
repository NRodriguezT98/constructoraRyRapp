/**
 * Hook para manejar las fuentes de pago y sus validaciones
 */

import { useCallback, useMemo, useState } from 'react'

import type { CrearFuentePagoDTO, TipoFuentePago } from '@/modules/clientes/types'

import type { FuentePagoConfig, FuentePagoConfiguracion } from '../types'

interface UseFuentesPagoProps {
  valorTotal: number
}

export function useFuentesPago({ valorTotal }: UseFuentesPagoProps) {
  // Estado inicial de fuentes (todas opcionales)
  const [fuentes, setFuentes] = useState<FuentePagoConfiguracion[]>([
    {
      tipo: 'Cuota Inicial',
      enabled: false, // Opcional, como las demás
      config: null,
    },
    {
      tipo: 'Crédito Hipotecario',
      enabled: false,
      config: null,
    },
    {
      tipo: 'Subsidio Mi Casa Ya',
      enabled: false,
      config: null,
    },
    {
      tipo: 'Subsidio Caja Compensación',
      enabled: false,
      config: null,
    },
  ])

  // Cálculos
  const fuentesActivas = useMemo(() => {
    return fuentes.filter((f) => f.enabled && f.config !== null)
  }, [fuentes])

  const totalFuentes = useMemo(() => {
    return fuentesActivas.reduce((sum, f) => sum + (f.config?.monto_aprobado || 0), 0)
  }, [fuentesActivas])

  const diferencia = useMemo(() => {
    return valorTotal - totalFuentes
  }, [valorTotal, totalFuentes])

  const sumaCierra = diferencia === 0 && totalFuentes > 0

  // Validación paso 2
  const paso2Valido = useMemo(() => {
    // Debe haber al menos UNA fuente habilitada con monto > 0
    const tieneAlMenosUnaFuente = fuentesActivas.length > 0 &&
      fuentesActivas.some((f) => (f.config?.monto_aprobado || 0) > 0)

    // Suma debe cerrar exactamente
    return tieneAlMenosUnaFuente && sumaCierra
  }, [fuentesActivas, sumaCierra])

  // Handlers
  const handleFuenteEnabledChange = useCallback((tipo: TipoFuentePago, enabled: boolean) => {
    setFuentes((prev) =>
      prev.map((f) => {
        if (f.tipo === tipo) {
          return {
            ...f,
            enabled,
            config: enabled
              ? {
                  tipo,
                  monto_aprobado: 0,
                  permite_multiples_abonos: tipo === 'Cuota Inicial',
                }
              : null,
          }
        }
        return f
      })
    )
  }, [])

  const handleFuenteConfigChange = useCallback(
    (tipo: TipoFuentePago, config: FuentePagoConfig | null) => {
      setFuentes((prev) =>
        prev.map((f) => {
          if (f.tipo === tipo) {
            return { ...f, config }
          }
          return f
        })
      )
    },
    []
  )

  // Resetear (todas deshabilitadas)
  const resetear = useCallback(() => {
    setFuentes([
      { tipo: 'Cuota Inicial', enabled: false, config: null },
      { tipo: 'Crédito Hipotecario', enabled: false, config: null },
      { tipo: 'Subsidio Mi Casa Ya', enabled: false, config: null },
      { tipo: 'Subsidio Caja Compensación', enabled: false, config: null },
    ])
  }, [])

  // Obtener fuentes para crear (convierte a DTO)
  const obtenerFuentesParaCrear = useCallback((): CrearFuentePagoDTO[] => {
    return fuentesActivas
      .map((f) => f.config)
      .filter((c): c is FuentePagoConfig => c !== null)
      .map((config) => ({
        tipo: config.tipo,
        monto_aprobado: config.monto_aprobado,
        entidad: config.entidad,
        numero_referencia: config.numero_referencia,
        carta_aprobacion_url: config.carta_aprobacion_url,
        carta_asignacion_url: config.carta_asignacion_url,
        permite_multiples_abonos: config.tipo === 'Cuota Inicial',
      }))
  }, [fuentesActivas])

  return {
    // Estado
    fuentes,
    fuentesActivas,

    // Cálculos
    totalFuentes,
    diferencia,
    sumaCierra,
    paso2Valido,

    // Handlers
    handleFuenteEnabledChange,
    handleFuenteConfigChange,

    // Utilidades
    resetear,
    obtenerFuentesParaCrear,
  }
}
