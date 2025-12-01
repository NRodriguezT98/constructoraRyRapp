/**
 * Hook para manejar las fuentes de pago y sus validaciones
 */

import { useCallback, useMemo, useState } from 'react'

import type { CrearFuentePagoDTO, TipoFuentePago } from '@/modules/clientes/types'

import type { FuentePagoConfig, FuentePagoConfiguracion, FuentePagoErrores } from '../types'

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

  // Estado de errores por fuente
  const [erroresFuentes, setErroresFuentes] = useState<Record<TipoFuentePago, FuentePagoErrores>>({
    'Cuota Inicial': {},
    'Crédito Hipotecario': {},
    'Subsidio Mi Casa Ya': {},
    'Subsidio Caja Compensación': {},
  })

  // ⭐ NUEVO: Estado para documentos pendientes
  const [tieneCartasAhora, setTieneCartasAhora] = useState<Record<TipoFuentePago, boolean>>({
    'Cuota Inicial': false,
    'Crédito Hipotecario': false,
    'Subsidio Mi Casa Ya': false,
    'Subsidio Caja Compensación': false,
  })

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

  // Validar una fuente específica
  const validarFuente = useCallback((tipo: TipoFuentePago, config: FuentePagoConfig | null): FuentePagoErrores => {
    const errores: FuentePagoErrores = {}

    if (!config) return errores

    // Validar monto
    if (!config.monto_aprobado || config.monto_aprobado <= 0) {
      errores.monto_aprobado = 'El monto debe ser mayor a 0'
    } else if (config.monto_aprobado > valorTotal) {
      errores.monto_aprobado = 'El monto no puede superar el valor total'
    }

    // Validar entidad (solo para fuentes con entidad)
    if (tipo !== 'Cuota Inicial') {
      if (!config.entidad || config.entidad.trim() === '') {
        errores.entidad = tipo === 'Crédito Hipotecario'
          ? 'Debes seleccionar un banco'
          : tipo === 'Subsidio Caja Compensación'
          ? 'Debes seleccionar una caja de compensación'
          : 'Debes indicar la entidad'
      }
    }

    // Validar número de referencia (solo para fuentes con entidad)
    if (tipo !== 'Cuota Inicial') {
      if (!config.numero_referencia || config.numero_referencia.trim() === '') {
        errores.numero_referencia = 'Debe especificar el número de referencia o radicado'
      }
    }

    return errores
  }, [valorTotal])

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

      // Validar y actualizar errores
      const errores = validarFuente(tipo, config)
      setErroresFuentes((prev) => ({
        ...prev,
        [tipo]: errores,
      }))
    },
    [validarFuente]
  )

  // ⭐ NUEVO: Handler para documentos pendientes
  const handleTieneCartaAhoraChange = useCallback((tipo: TipoFuentePago, tiene: boolean) => {
    setTieneCartasAhora((prev) => ({
      ...prev,
      [tipo]: tiene,
    }))
  }, [])

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
    erroresFuentes,
    tieneCartasAhora, // ⭐ NUEVO

    // Cálculos
    totalFuentes,
    diferencia,
    sumaCierra,
    paso2Valido,

    // Handlers
    handleFuenteEnabledChange,
    handleFuenteConfigChange,
    handleTieneCartaAhoraChange, // ⭐ NUEVO

    // Utilidades
    resetear,
    obtenerFuentesParaCrear,
  }
}
