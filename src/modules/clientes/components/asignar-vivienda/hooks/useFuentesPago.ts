/**
 * Hook para manejar las fuentes de pago y sus validaciones
 * âœ… Carga dinámica desde BD (NO más hardcodeadas)
 * âœ… V2: Soporta campos dinámicos con roles
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { cargarTiposFuentesPagoActivas } from '@/modules/clientes/services/tipos-fuentes-pago.service'
import type { CrearFuentePagoDTO, TipoFuentePago } from '@/modules/clientes/types'
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'

import type { FuentePagoConfig, FuentePagoConfiguracion, FuentePagoErrores } from '../types'

interface UseFuentesPagoProps {
  valorTotal: number
}

export function useFuentesPago({ valorTotal }: UseFuentesPagoProps) {
  // ðŸ”¥ Cargar configuración de campos desde BD
  const { data: tiposConCampos = [] } = useTiposFuentesConCampos()

  // ðŸ”¥ Estado de carga y fuentes dinámicas desde BD
  const [cargandoTipos, setCargandoTipos] = useState(true)
  const [tiposFuentesDisponibles, setTiposFuentesDisponibles] = useState<string[]>([])

  // Estado inicial de fuentes (se carga dinámicamente)
  const [fuentes, setFuentes] = useState<FuentePagoConfiguracion[]>([])

  // ðŸ”¥ Cargar tipos de fuentes desde BD al montar
  useEffect(() => {
    const cargarTipos = async () => {
      const { data, error } = await cargarTiposFuentesPagoActivas()

      if (error || !data) {
        console.error('âŒ Error al cargar tipos de fuentes:', error)
        // Fallback: usar las 4 por defecto si falla la carga
        setTiposFuentesDisponibles([
          'Cuota Inicial',
          'Crédito Hipotecario',
          'Subsidio Mi Casa Ya',
          'Subsidio Caja Compensación',
        ])
      } else {
        setTiposFuentesDisponibles(data.map(f => f.nombre))
      }

      setCargandoTipos(false)
    }

    cargarTipos()
  }, [])

  // ðŸ”¥ Inicializar fuentes cuando se cargan los tipos desde BD
  useEffect(() => {
    if (!cargandoTipos && tiposFuentesDisponibles.length > 0) {
      const fuentesIniciales: FuentePagoConfiguracion[] = tiposFuentesDisponibles.map(nombre => ({
        tipo: nombre as TipoFuentePago,
        enabled: false,
        config: null,
      }))

      setFuentes(fuentesIniciales)

      // ðŸ”¥ Inicializar estado de errores dinámicamente
      const erroresIniciales = tiposFuentesDisponibles.reduce((acc, nombre) => {
        acc[nombre as TipoFuentePago] = {}
        return acc
      }, {} as Record<TipoFuentePago, FuentePagoErrores>)
      setErroresFuentes(erroresIniciales)

    }
  }, [cargandoTipos, tiposFuentesDisponibles])

  // Estado de errores por fuente (inicializado dinámicamente)
  const [erroresFuentes, setErroresFuentes] = useState<Record<TipoFuentePago, FuentePagoErrores>>({} as any)

  // Cálculos
  const fuentesActivas = useMemo(() => {
    return fuentes.filter((f) => f.enabled && f.config !== null)
  }, [fuentes])

  const totalFuentes = useMemo(() => {
    return fuentesActivas.reduce((sum, f) => {
      // ðŸ”¥ Buscar configuración de campos para este tipo
      const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
      const camposConfig = tipoConCampos?.configuracion_campos?.campos || []

      // ðŸ”¥ Usar utility que busca por rol='monto'
      const monto = obtenerMonto(f.config, camposConfig)
      return sum + monto
    }, 0)
  }, [fuentesActivas, tiposConCampos])

  const diferencia = useMemo(() => {
    return valorTotal - totalFuentes
  }, [valorTotal, totalFuentes])

  const sumaCierra = diferencia === 0 && totalFuentes > 0

  // Validación paso 2
  const paso2Valido = useMemo(() => {
    // Debe haber al menos UNA fuente habilitada con monto > 0
    const tieneAlMenosUnaFuente = fuentesActivas.length > 0 &&
      fuentesActivas.some((f) => {
        // ðŸ”¥ Buscar configuración de campos para este tipo
        const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
        const camposConfig = tipoConCampos?.configuracion_campos?.campos || []

        // ðŸ”¥ Usar utility que busca por rol='monto' (igual que totalFuentes)
        const monto = obtenerMonto(f.config, camposConfig)
        return monto > 0
      })

    // Suma debe cerrar exactamente
    return tieneAlMenosUnaFuente && sumaCierra
  }, [fuentesActivas, sumaCierra, tiposConCampos])

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

    // â„¹ï¸ NOTA: La carta de aprobación NO se valida aquí
    // El sistema creará un documento pendiente automáticamente
    // Usuario sube la carta desde la pestaña Documentos

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
      }) as FuentePagoConfiguracion[]
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

  // Resetear (todas deshabilitadas) - ðŸ”¥ Ahora dinámico
  const resetear = useCallback(() => {
    const fuentesReseteadas: FuentePagoConfiguracion[] = tiposFuentesDisponibles.map(nombre => ({
      tipo: nombre as TipoFuentePago,
      enabled: false,
      config: null,
    }))
    setFuentes(fuentesReseteadas)

    // â­ Resetear errores
    const erroresReseteados = tiposFuentesDisponibles.reduce((acc, nombre) => {
      acc[nombre as TipoFuentePago] = {}
      return acc
    }, {} as Record<TipoFuentePago, FuentePagoErrores>)
    setErroresFuentes(erroresReseteados)
  }, [tiposFuentesDisponibles])

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
      })) as CrearFuentePagoDTO[]
  }, [fuentesActivas])

  return {
    // ðŸ”¥ Estado de carga
    cargandoTipos,
    tiposFuentesDisponibles,

    // Estado
    fuentes,
    fuentesActivas,
    erroresFuentes,

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
