/**
 * useTrasladoVivienda
 *
 * Orquestador central del formulario acordeón de traslado de vivienda.
 * Reutiliza el patrón AccordionWizard idéntico a Asignar Vivienda V2.
 *
 * Paso 1: Resumen de negociación actual + motivo/autorización
 * Paso 2: Selección de vivienda destino + configuración de fuentes
 * Paso 3: Comparativa y confirmación
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Banknote, ClipboardCheck, FileText } from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { formatCurrency } from '@/lib/utils/format.utils'
import { logger } from '@/lib/utils/logger'
import { useFuentesPago } from '@/modules/clientes/components/asignar-vivienda/hooks/useFuentesPago'
import { useProyectosViviendas } from '@/modules/clientes/components/asignar-vivienda/hooks/useProyectosViviendas'
import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
} from '@/modules/clientes/components/asignar-vivienda/types'
import {
  trasladoViviendaService,
  type FuenteConAbonos,
  type FuenteTrasladoDTO,
} from '@/modules/clientes/services/traslado-vivienda.service'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useEntidadesFinancierasCombinadas } from '@/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'
import type {
  SectionStatus,
  SummaryItem,
  WizardStepConfig,
} from '@/shared/components/accordion-wizard'

// ── Configuración de pasos ─────────────────────────────
export const PASOS_TRASLADO: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Negociación Actual',
    description:
      'Revisa la negociación actual y registra el motivo del traslado.',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Nueva Vivienda y Fuentes de Pago',
    description:
      'Selecciona la vivienda destino y configura las fuentes de pago.',
    icon: Banknote,
  },
  {
    id: 3,
    title: 'Revisión y Confirmación',
    description: 'Verifica la comparativa antes → después y confirma.',
    icon: ClipboardCheck,
  },
]

interface UseTrasladoViviendaProps {
  clienteId: string
  clienteSlug?: string
  clienteNombre?: string
  negociacionId: string
}

export function useTrasladoVivienda({
  clienteId,
  clienteSlug,
  negociacionId,
}: UseTrasladoViviendaProps) {
  const router = useRouter()

  // ─── Wizard state ────────────────────────────────────
  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(
    new Set()
  )
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [ejecutando, setEjecutando] = useState(false)
  const [errorApi, setErrorApi] = useState<string | null>(null)

  // ─── Paso 1: Datos de validación / negociación actual ──
  const [validacion, setValidacion] = useState<{
    valido: boolean
    errores: string[]
    fuentesConAbonos: FuenteConAbonos[]
    negociacionOrigen: Record<string, unknown> | null
  }>({
    valido: false,
    errores: [],
    fuentesConAbonos: [],
    negociacionOrigen: null,
  })
  const [cargandoValidacion, setCargandoValidacion] = useState(true)

  // Paso 1 form fields
  const [motivo, setMotivo] = useState('')
  const [autorizadoPor, setAutorizadoPor] = useState('')

  // ─── Paso 2: Vivienda destino ──────────────────────────
  const {
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaId: viviendaDestinoId,
    cargandoProyectos,
    cargandoViviendas,
    setProyectoSeleccionado,
    setViviendaId: setViviendaDestinoId,
  } = useProyectosViviendas()

  const { data: tiposConCampos = [], isLoading: cargandoTiposConCampos } =
    useTiposFuentesConCampos()
  const { entidades } = useEntidadesFinancierasCombinadas()

  const viviendaDestinoSeleccionada = useMemo(
    () => viviendas.find(v => v.id === viviendaDestinoId) ?? null,
    [viviendas, viviendaDestinoId]
  )

  const valorBaseDestino = viviendaDestinoSeleccionada?.valor_base ?? 0
  const gastosNotarialesDestino =
    viviendaDestinoSeleccionada?.gastos_notariales ?? 0
  const recargoEsquineraDestino =
    viviendaDestinoSeleccionada?.recargo_esquinera ?? 0
  const valorTotalDestino = useMemo(
    () =>
      Math.max(
        0,
        valorBaseDestino + gastosNotarialesDestino + recargoEsquineraDestino
      ),
    [valorBaseDestino, gastosNotarialesDestino, recargoEsquineraDestino]
  )

  // Values from origen
  const negOrigen = validacion.negociacionOrigen
  const valorOrigenTotal =
    ((negOrigen as Record<string, unknown>)?.valor_total_pagar as number) ?? 0
  const diferenciaPrecio = valorTotalDestino - valorOrigenTotal

  // ─── Fuentes de pago ──────────────────────────────────
  const {
    fuentes,
    totalFuentes,
    diferencia,
    sumaCierra,
    handleFuenteEnabledChange: _handleFuenteEnabledChange,
    handleFuenteConfigChange: _handleFuenteConfigChange,
  } = useFuentesPago({
    valorTotal: valorTotalDestino,
    tiposConCampos,
    cargandoTipos: cargandoTiposConCampos,
  })

  const handleFuenteEnabledChange = _handleFuenteEnabledChange
  const handleFuenteConfigChange = _handleFuenteConfigChange

  // ─── Validación de fuentes ────────────────────────────
  const [erroresFuentes, setErroresFuentes] = useState<Record<string, string>>(
    {}
  )
  const [mostrarErroresFuentes, setMostrarErroresFuentes] = useState(false)

  // ─── Cargar validación al montar ──────────────────────
  useEffect(() => {
    let cancelled = false
    const cargar = async () => {
      setCargandoValidacion(true)
      try {
        const result = await trasladoViviendaService.validarTraslado(
          negociacionId,
          clienteId
        )
        if (cancelled) return
        setValidacion({
          valido: result.valido,
          errores: result.errores,
          fuentesConAbonos: result.fuentesConAbonos,
          negociacionOrigen: result.negociacion as unknown as Record<
            string,
            unknown
          >,
        })
      } catch (error) {
        logger.error('Error validando traslado:', error)
        if (!cancelled) {
          setValidacion({
            valido: false,
            errores: ['Error al validar: intente de nuevo'],
            fuentesConAbonos: [],
            negociacionOrigen: null,
          })
        }
      } finally {
        if (!cancelled) setCargandoValidacion(false)
      }
    }
    cargar()
    return () => {
      cancelled = true
    }
  }, [negociacionId, clienteId])

  // ─── Forzar activación de fuentes que tienen abonos (obligatorias) ──
  const fuentesObligatorias = useMemo(
    () =>
      validacion.fuentesConAbonos.filter(
        f => !f.es_externa && f.monto_recibido > 0
      ),
    [validacion.fuentesConAbonos]
  )

  // Auto-activar fuentes obligatorias cuando se cargan los tipos
  const fuentesObligatoriasActivadas = useRef(false)
  useEffect(() => {
    if (
      fuentesObligatoriasActivadas.current ||
      cargandoTiposConCampos ||
      fuentes.length === 0 ||
      fuentesObligatorias.length === 0
    ) {
      return
    }

    for (const fOblig of fuentesObligatorias) {
      const yaActiva = fuentes.find(
        f => f.tipo.toLowerCase() === fOblig.tipo.toLowerCase() && f.enabled
      )
      if (!yaActiva) {
        handleFuenteEnabledChange(fOblig.tipo as TipoFuentePago, true)
      }
    }
    fuentesObligatoriasActivadas.current = true
  }, [
    fuentes,
    fuentesObligatorias,
    cargandoTiposConCampos,
    handleFuenteEnabledChange,
  ])

  // ─── Validaciones ─────────────────────────────────────

  const validarFuentesManual = useCallback((): boolean => {
    const errores: Record<string, string> = {}

    // Validar campos requeridos por tipo
    fuentes
      .filter(f => f.enabled)
      .forEach(f => {
        const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
        const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
        const requiereEntidad = camposConfig.some(
          c => c.rol === 'entidad' && c.requerido
        )
        const requiereReferencia = camposConfig.some(
          c => c.rol === 'referencia' && c.requerido
        )

        if (
          requiereEntidad &&
          (!f.config?.entidad || f.config.entidad.trim() === '')
        ) {
          errores[f.tipo] = 'Entidad requerida'
        } else if (
          requiereReferencia &&
          (!f.config?.numero_referencia ||
            f.config.numero_referencia.trim() === '')
        ) {
          errores[f.tipo] = 'Número de referencia requerido'
        }
      })

    // Validar regla 7: fuentes con abonos mínimo
    for (const fOblig of fuentesObligatorias) {
      const fDest = fuentes.find(
        f => f.tipo.toLowerCase() === fOblig.tipo.toLowerCase() && f.enabled
      )
      if (!fDest) {
        errores[fOblig.tipo] =
          `Obligatoria: tiene $${fOblig.monto_recibido.toLocaleString('es-CO')} en abonos`
        continue
      }
      const tipoConCampos = tiposConCampos.find(t => t.nombre === fDest.tipo)
      const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
      const monto = fDest.config ? obtenerMonto(fDest.config, camposConfig) : 0
      if (monto < fOblig.monto_recibido) {
        errores[fOblig.tipo] =
          `Monto mínimo: ${formatCurrency(fOblig.monto_recibido)} (ya abonado)`
      }
    }

    setErroresFuentes(errores)
    return Object.keys(errores).length === 0
  }, [fuentes, tiposConCampos, fuentesObligatorias])

  const paso1Valido = useMemo(
    () => motivo.length >= 20 && autorizadoPor.length >= 3 && validacion.valido,
    [motivo, autorizadoPor, validacion.valido]
  )

  const _paso2Valido = useMemo(
    () => !!viviendaDestinoId && sumaCierra && fuentes.some(f => f.enabled),
    [viviendaDestinoId, sumaCierra, fuentes]
  )

  // ─── Estado de cada sección ───────────────────────────
  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus => {
      if (pasosCompletados.has(paso)) return 'completed'
      if (paso === pasoActual) return 'active'
      return 'pending'
    },
    [pasoActual, pasosCompletados]
  )

  // ─── Summaries ────────────────────────────────────────
  const summaryPaso1: SummaryItem[] = useMemo(() => {
    if (!motivo) return []
    return [
      {
        label: 'Motivo',
        value: motivo.substring(0, 50) + (motivo.length > 50 ? '...' : ''),
      },
      { label: 'Autorizado por', value: autorizadoPor },
    ]
  }, [motivo, autorizadoPor])

  const summaryPaso2: SummaryItem[] = useMemo(() => {
    if (!viviendaDestinoSeleccionada) return []
    const fuentesOn = fuentes.filter(f => f.enabled).map(f => f.tipo)
    return [
      {
        label: 'Vivienda destino',
        value: `${viviendaDestinoSeleccionada.manzana_nombre} · Casa ${viviendaDestinoSeleccionada.numero}`,
      },
      { label: 'Valor', value: formatCurrency(valorTotalDestino) },
      { label: 'Fuentes', value: fuentesOn.join(', ') || 'Ninguna' },
    ]
  }, [viviendaDestinoSeleccionada, valorTotalDestino, fuentes])

  // ─── Navegación ───────────────────────────────────────
  const irSiguiente = useCallback(async () => {
    setIsValidating(true)
    try {
      if (pasoActual === 1) {
        if (!paso1Valido) return
        setPasosCompletados(prev => new Set(prev).add(1))
        setPasoActual(2)
        return
      }

      if (pasoActual === 2) {
        if (!viviendaDestinoId) {
          toast.error('Selecciona una vivienda destino')
          return
        }
        if (!sumaCierra) {
          setMostrarErroresFuentes(true)
          return
        }
        const fuentesOk = validarFuentesManual()
        if (!fuentesOk) {
          setMostrarErroresFuentes(true)
          return
        }
        setPasosCompletados(prev => new Set(prev).add(2))
        setPasoActual(3)
        return
      }
    } finally {
      setIsValidating(false)
    }
  }, [
    pasoActual,
    paso1Valido,
    viviendaDestinoId,
    sumaCierra,
    validarFuentesManual,
  ])

  const irAtras = useCallback(() => {
    setPasoActual(prev => Math.max(prev - 1, 1))
  }, [])

  const irAPaso = useCallback(
    (paso: number) => {
      if (pasosCompletados.has(paso)) {
        setPasosCompletados(prev => {
          const next = new Set(prev)
          for (let i = paso; i <= PASOS_TRASLADO.length; i++) next.delete(i)
          return next
        })
        setPasoActual(paso)
      }
    },
    [pasosCompletados]
  )

  // ─── Submit final ─────────────────────────────────────
  const handleSubmitFinal = useCallback(async () => {
    setErrorApi(null)

    if (!sumaCierra) {
      setErrorApi(
        'Las fuentes de pago no cubren el valor total. Regresa al paso 2 y ajusta los montos.'
      )
      return
    }

    setEjecutando(true)

    try {
      const fuentesDTO: FuenteTrasladoDTO[] = fuentes
        .filter(
          (f): f is FuentePagoConfiguracion & { config: FuentePagoConfig } =>
            f.enabled && f.config !== null
        )
        .map(f => {
          const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
          const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
          const monto = obtenerMonto(f.config, camposConfig)
          const generaCuotas =
            tipoConCampos?.logica_negocio?.genera_cuotas === true

          return {
            tipo: f.tipo,
            monto_aprobado: monto,
            capital_para_cierre: f.config.capital_para_cierre ?? undefined,
            parametrosCredito: f.config.parametrosCredito ?? undefined,
            entidad:
              (entidades.find(e => e.value === f.config.entidad)?.label ??
                f.config.entidad) ||
              undefined,
            numero_referencia: f.config.numero_referencia || undefined,
            permite_multiples_abonos:
              generaCuotas || (f.config.permite_multiples_abonos ?? false),
          }
        })

      await trasladoViviendaService.ejecutarTraslado(
        {
          negociacion_origen_id: negociacionId,
          vivienda_destino_id: viviendaDestinoId,
          valor_negociado: valorTotalDestino,
          fuentes_pago: fuentesDTO,
          motivo,
          autorizado_por: autorizadoPor,
        },
        clienteId
      )

      toast.success('¡Traslado de vivienda ejecutado exitosamente!', {
        description:
          'La negociación anterior ha sido cerrada y la nueva vivienda asignada.',
        duration: 5000,
      })

      setShowSuccess(true)
      setTimeout(() => {
        router.push(`/clientes/${clienteSlug ?? clienteId}`)
      }, 2000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido'
      logger.error('Error ejecutando traslado:', error)
      setErrorApi(msg)
      toast.error('Error al ejecutar el traslado', { description: msg })
    } finally {
      setEjecutando(false)
    }
  }, [
    sumaCierra,
    fuentes,
    tiposConCampos,
    entidades,
    negociacionId,
    viviendaDestinoId,
    valorTotalDestino,
    motivo,
    autorizadoPor,
    clienteId,
    clienteSlug,
    router,
  ])

  const clearErrorApi = useCallback(() => {
    setErrorApi(null)
  }, [])

  return {
    // Wizard
    pasos: PASOS_TRASLADO,
    pasoActual,
    getEstadoPaso,
    summaryPaso1,
    summaryPaso2,
    showSuccess,
    isValidating,

    // Navegación
    irSiguiente,
    irAtras,
    irAPaso,

    // Paso 1 - Negociación actual
    cargandoValidacion,
    validacion,
    fuentesObligatorias,
    motivo,
    setMotivo,
    autorizadoPor,
    setAutorizadoPor,
    paso1Valido,

    // Paso 2 - Vivienda destino
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaDestinoId,
    viviendaDestinoSeleccionada,
    cargandoProyectos,
    cargandoViviendas,
    setProyectoSeleccionado,
    setViviendaDestinoId,
    valorBaseDestino,
    gastosNotarialesDestino,
    recargoEsquineraDestino,
    valorTotalDestino,
    diferenciaPrecio,
    valorOrigenTotal,

    // Fuentes
    cargandoTipos: cargandoTiposConCampos,
    tiposConCampos,
    fuentes,
    totalFuentes,
    diferencia,
    sumaCierra,
    erroresFuentes,
    mostrarErroresFuentes,
    handleFuenteEnabledChange,
    handleFuenteConfigChange,

    // Submit
    handleSubmitFinal,
    ejecutando,
    errorApi,
    clearErrorApi,
    entidades,
  }
}
