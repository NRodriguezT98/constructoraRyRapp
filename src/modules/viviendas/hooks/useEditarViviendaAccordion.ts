/**
 * useEditarViviendaAccordion — Hook para editar vivienda con el patrón Accordion Wizard.
 *
 * ✅ Carga datos existentes y pre-puebla el formulario
 * ✅ 4 pasos (Ubicación read-only, Linderos, Legal, Financiero)
 * ✅ Detección de impacto financiero en negociaciones activas
 * ✅ Race condition prevented with impactoFinancieroSnapshot
 * ✅ Navega a página de detalle de vivienda al guardar exitosamente
 * ✅ Guard de cambios no guardados (useUnsavedChanges)
 *
 * REGLAS DE NEGOCIO:
 * - Paso 1 (Ubicación): READ-ONLY. Número, manzana y proyecto no se pueden cambiar.
 * - Paso 2 (Linderos): Los 4 linderos son obligatorios.
 * - Paso 3 (Legal): Matrícula única; área construida ≤ área lote; ambas áreas > 0.
 * - Paso 4 (Financiero):
 *     • Bloqueado completamente cuando estado = 'Entregada'.
 *     • valor_base no puede ser < total_abonado (ImpactoFinanciero).
 *     • Si es_esquinera = true, recargo_esquinera debe ser > 0.
 *     • Cambio de valor_base activa aviso de sincronización con negociación activa.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { useUnsavedChanges } from '@/contexts/unsaved-changes-context'
import { errorLog } from '@/lib/utils/logger'
import { construirURLVivienda } from '@/lib/utils/slug.utils'
import type {
  SectionStatus,
  SummaryItem,
} from '@/shared/components/accordion-wizard'

import {
  FIELDS_PASO_2_VIVIENDA_EDICION as FIELDS_PASO_2,
  FIELDS_PASO_3_VIVIENDA_EDICION as FIELDS_PASO_3,
  FIELDS_PASO_4_VIVIENDA_EDICION as FIELDS_PASO_4,
  PASOS_VIVIENDA_EDICION,
} from '../schemas/editar-vivienda-accordion.schema'
import {
  viviendaFullSchema,
  type ViviendaSchemaType,
} from '../schemas/vivienda.schemas'
import { viviendasService } from '../services/viviendas.service'
import type { ResumenFinanciero, ViviendaFormData } from '../types'
import { calcularValorTotal, detectarCambiosVivienda } from '../utils'

import type { ImpactoFinanciero } from './useEditarVivienda'
import { useViviendaQuery } from './useViviendaQuery'
import {
  useActualizarViviendaMutation,
  useConfiguracionRecargosQuery,
  useGastosNotarialesQuery,
} from './useViviendasQuery'

// Re-exportamos los tipos para coherencia con useEditarVivienda
export type { ImpactoFinanciero, NegociacionImpacto } from './useEditarVivienda'
export { PASOS_VIVIENDA_EDICION }

type FormData = ViviendaSchemaType

interface Props {
  viviendaId: string
}

export function useEditarViviendaAccordion({ viviendaId }: Props) {
  const router = useRouter()
  const { setHasUnsavedChanges, setMessage } = useUnsavedChanges()

  // ── Carga de datos ───────────────────────────────────────────────────────
  const {
    vivienda,
    loading: cargandoVivienda,
    error: errorVivienda,
  } = useViviendaQuery(viviendaId)

  // ── Estado del accordion ─────────────────────────────────────────────────
  // En edición, iniciamos sin ningún paso activo (pasoActual=0 = todos colapsados)
  const [pasoActual, setPasoActual] = useState(0)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(
    new Set()
  )
  const [isValidating, setIsValidating] = useState(false)
  const [validandoMatricula, setValidandoMatricula] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // ── Estado de modales ────────────────────────────────────────────────────
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] =
    useState(false)
  const [mostrarModalImpacto, setMostrarModalImpacto] = useState(false)
  const [sincronizandoNegociacion, setSincronizandoNegociacion] =
    useState(false)
  const [estadoModal, setEstadoModal] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  // Snapshot del impacto capturado al abrir el modal → previene race condition
  // cuando la caché se invalida tras la mutación exitosa
  const [impactoFinancieroSnapshot, setImpactoFinancieroSnapshot] =
    useState<ImpactoFinanciero | null>(null)

  // ── Estado de la vivienda ────────────────────────────────────────────────
  const esViviendaAsignada = vivienda?.estado === 'Asignada'
  const esViviendaEntregada = vivienda?.estado === 'Entregada'

  // ── Negociación activa ───────────────────────────────────────────────────
  const { data: negociacionActiva = null } = useQuery({
    queryKey: ['negociacion-activa-vivienda', vivienda?.id],
    queryFn: () =>
      viviendasService.obtenerNegociacionActivaPorVivienda(vivienda?.id ?? ''),
    enabled: !!vivienda?.id && esViviendaAsignada,
    staleTime: 60_000,
  })

  // ── React Query ──────────────────────────────────────────────────────────
  const { data: gastosNotariales = 0 } = useGastosNotarialesQuery()
  const { data: configuracionRecargos = [] } = useConfiguracionRecargosQuery()
  const actualizarMutation = useActualizarViviendaMutation()

  // ── React Hook Form ──────────────────────────────────────────────────────
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
    getValues,
    reset,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(viviendaFullSchema) as Resolver<FormData>,
    mode: 'onChange',
    defaultValues: {
      proyecto_id: '',
      manzana_id: '',
      numero: '',
      lindero_norte: '',
      lindero_sur: '',
      lindero_oriente: '',
      lindero_occidente: '',
      matricula_inmobiliaria: '',
      nomenclatura: '',
      area_lote: 0,
      area_construida: 0,
      tipo_vivienda: '',
      valor_base: 0,
      es_esquinera: false,
      recargo_esquinera: 0,
    },
  })

  // ── Pre-cargar datos cuando la vivienda carga ────────────────────────────
  useEffect(() => {
    if (!vivienda) return

    reset({
      proyecto_id: vivienda.manzanas?.proyecto_id || '',
      manzana_id: vivienda.manzana_id,
      numero: String(vivienda.numero),
      lindero_norte: vivienda.lindero_norte || '',
      lindero_sur: vivienda.lindero_sur || '',
      lindero_oriente: vivienda.lindero_oriente || '',
      lindero_occidente: vivienda.lindero_occidente || '',
      matricula_inmobiliaria: vivienda.matricula_inmobiliaria || '',
      nomenclatura: vivienda.nomenclatura || '',
      area_lote: vivienda.area_lote || 0,
      area_construida: vivienda.area_construida || 0,
      tipo_vivienda: vivienda.tipo_vivienda || 'Regular',
      valor_base: vivienda.valor_base || 0,
      es_esquinera: vivienda.es_esquinera || false,
      recargo_esquinera: vivienda.recargo_esquinera || 0,
    })

    // En edición, todos los pasos parten completados (data ya validada en BD)
    // El usuario puede abrir cualquier paso directamente sin secuencia obligatoria
    setPasosCompletados(new Set([1, 2, 3, 4]))
  }, [vivienda, reset])

  // ── Watch valores del formulario ─────────────────────────────────────────
  const formData = watch()
  const esEsquinera = watch('es_esquinera')
  const valorBase = watch('valor_base')
  const recargoEsquinera = watch('recargo_esquinera')

  // ── Resumen financiero ───────────────────────────────────────────────────
  const resumenFinanciero: ResumenFinanciero = useMemo(() => {
    const recargoFinal = esEsquinera ? recargoEsquinera || 0 : 0
    const valorTotal = calcularValorTotal(
      valorBase || 0,
      gastosNotariales,
      recargoFinal
    )
    return {
      valor_base: valorBase || 0,
      gastos_notariales: gastosNotariales,
      recargo_esquinera: recargoFinal,
      valor_total: valorTotal,
    }
  }, [valorBase, esEsquinera, recargoEsquinera, gastosNotariales])

  // ── Cambios detectados (para ConfirmarCambiosModal y badges) ──────────────
  const cambiosDetectados = useMemo(() => {
    if (!vivienda) return []
    return detectarCambiosVivienda({
      viviendaActual: vivienda,
      formData: formData as unknown as import('../types').Vivienda,
    })
  }, [vivienda, formData])

  const hayCambios = cambiosDetectados.length > 0

  // ── Guard de navegación: avisa si hay cambios sin guardar ─────────────────
  useEffect(() => {
    const nombre = vivienda
      ? `Mz. ${vivienda.manzanas?.nombre ?? '?'} Casa #${vivienda.numero}`
      : 'esta vivienda'
    setHasUnsavedChanges(hayCambios)
    setMessage(
      hayCambios ? `La vivienda "${nombre}" tiene cambios sin guardar.` : null
    )
  }, [hayCambios, vivienda, setHasUnsavedChanges, setMessage])

  useEffect(() => {
    return () => {
      setHasUnsavedChanges(false)
      setMessage(null)
    }
  }, [setHasUnsavedChanges, setMessage])

  // ── Cambios por paso (para changeCount badge en cada sección) ────────────
  const cambiosPorPaso = useMemo(
    () => ({
      paso2: cambiosDetectados.filter(c => c.categoria === 'linderos').length,
      paso3: cambiosDetectados.filter(c => c.categoria === 'legal').length,
      paso4: cambiosDetectados.filter(c => c.categoria === 'financiero').length,
    }),
    [cambiosDetectados]
  )

  // ── Impacto financiero calculado ─────────────────────────────────────────
  const impactoFinancieroCalculado = useMemo((): ImpactoFinanciero | null => {
    if (!vivienda || !negociacionActiva || !esViviendaAsignada) return null

    const valorBaseAnterior = vivienda.valor_base ?? 0
    const valorBaseNuevo = formData.valor_base ?? 0

    // Solo hay impacto si el valor_base cambió
    if (valorBaseAnterior === valorBaseNuevo) return null

    const diferencia = valorBaseNuevo - valorBaseAnterior
    const totalAbonado = negociacionActiva.total_abonado ?? 0
    const bloqueado = valorBaseNuevo < totalAbonado
    const motivoBloqueo = bloqueado
      ? `El nuevo valor ($${valorBaseNuevo.toLocaleString('es-CO')}) es menor al total ya abonado ($${totalAbonado.toLocaleString('es-CO')})`
      : null

    return {
      negociacion: negociacionActiva,
      valorBaseAnterior,
      valorBaseNuevo,
      diferencia,
      bloqueado,
      motivoBloqueo,
    }
  }, [vivienda, negociacionActiva, esViviendaAsignada, formData.valor_base])

  // Usar snapshot mientras el modal está abierto para evitar race condition
  const impactoFinanciero =
    impactoFinancieroSnapshot ?? impactoFinancieroCalculado

  // ── Estado de sección ────────────────────────────────────────────────────
  // En modo edición: 'active' tiene precedencia sobre 'completed' para que el
  // usuario pueda abrir cualquier paso directamente aunque ya esté completado.
  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus => {
      if (paso === pasoActual) return 'active' // activo siempre gana
      if (pasosCompletados.has(paso)) return 'completed'
      return 'pending'
    },
    [pasoActual, pasosCompletados]
  )

  // ── Resúmenes de secciones ───────────────────────────────────────────────
  const summaryPaso1: SummaryItem[] = useMemo(
    () => [
      { label: 'Manzana', value: vivienda?.manzanas?.nombre ?? undefined },
      { label: 'Casa', value: vivienda ? `#${vivienda.numero}` : undefined },
    ],
    [vivienda]
  )

  const summaryPaso2: SummaryItem[] = useMemo(() => {
    const definidos = [
      formData.lindero_norte,
      formData.lindero_sur,
      formData.lindero_oriente,
      formData.lindero_occidente,
    ].filter(Boolean).length
    return [
      {
        label: 'Linderos',
        value: definidos > 0 ? `${definidos} de 4 definidos` : undefined,
      },
    ]
  }, [
    formData.lindero_norte,
    formData.lindero_sur,
    formData.lindero_oriente,
    formData.lindero_occidente,
  ])

  const summaryPaso3: SummaryItem[] = useMemo(
    () => [
      {
        label: 'Matrícula',
        value: formData.matricula_inmobiliaria || undefined,
      },
      {
        label: 'Área',
        value: formData.area_lote ? `${formData.area_lote} m²` : undefined,
      },
    ],
    [formData.matricula_inmobiliaria, formData.area_lote]
  )

  const summaryPaso4: SummaryItem[] = useMemo(() => {
    const val = resumenFinanciero.valor_total
    return [
      {
        label: 'Valor Total',
        value: val > 0 ? `$${val.toLocaleString('es-CO')}` : undefined,
      },
    ]
  }, [resumenFinanciero.valor_total])

  // ── Progreso global ──────────────────────────────────────────────────────
  const progress = useMemo(
    () =>
      Math.round((pasosCompletados.size / PASOS_VIVIENDA_EDICION.length) * 100),
    [pasosCompletados.size]
  )

  // ── Validación por paso ──────────────────────────────────────────────────
  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    setIsValidating(true)
    try {
      switch (pasoActual) {
        case 1:
          return true // Ubicación es read-only en edición

        case 2:
          return await trigger([...FIELDS_PASO_2])

        case 3: {
          const syncValid = await trigger([...FIELDS_PASO_3])
          if (!syncValid) return false

          const erroresEncontrados: Array<{ campo: string; mensaje: string }> =
            []

          const areaLote = Number(getValues('area_lote'))
          const areaConstruida = Number(getValues('area_construida'))
          if (areaConstruida > areaLote) {
            erroresEncontrados.push({
              campo: 'area_construida',
              mensaje: 'El área construida no puede ser mayor al área del lote',
            })
          }

          const matricula = getValues('matricula_inmobiliaria')
          if (matricula && matricula !== vivienda?.matricula_inmobiliaria) {
            setValidandoMatricula(true)
            try {
              const resultado = await viviendasService.verificarMatriculaUnica(
                matricula,
                vivienda?.id
              )
              if (!resultado.esUnica && resultado.viviendaDuplicada) {
                erroresEncontrados.push({
                  campo: 'matricula_inmobiliaria',
                  mensaje: `Matrícula ya registrada en Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`,
                })
              }
            } catch {
              // No bloquear si falla la red
            } finally {
              setValidandoMatricula(false)
            }
          }

          if (erroresEncontrados.length > 0) {
            erroresEncontrados.forEach(e =>
              setError(e.campo as keyof FormData, {
                type: 'manual',
                message: e.mensaje,
              })
            )
            return false
          }
          return true
        }

        case 4: {
          const paso4Valid = await trigger([...FIELDS_PASO_4])
          if (!paso4Valid) return false

          // Regla de negocio: si la vivienda es esquinera, el recargo debe ser > 0
          const esEsquineraVal = getValues('es_esquinera')
          const recargoVal = Number(getValues('recargo_esquinera'))
          if (esEsquineraVal && recargoVal <= 0) {
            setError('recargo_esquinera', {
              type: 'manual',
              message:
                'La vivienda es esquinera: ingresa el recargo correspondiente (> $0)',
            })
            return false
          }
          return true
        }

        default:
          return true
      }
    } finally {
      setIsValidating(false)
    }
  }, [pasoActual, trigger, getValues, setError, vivienda])

  // ── Navegación ───────────────────────────────────────────────────────────
  const irSiguiente = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return
    setPasosCompletados(prev => new Set(prev).add(pasoActual))
    setPasoActual(prev => Math.min(prev + 1, PASOS_VIVIENDA_EDICION.length))
  }, [pasoActual, validarPasoActual])

  const irAtras = useCallback(() => {
    setPasoActual(prev => Math.max(prev - 1, 1))
  }, [])

  // En modo edición: abrir cualquier paso sin afectar el estado de los demás.
  // No se hace cascade-delete de pasos posteriores; cada paso se valida
  // de forma independiente al hacer clic en "Siguiente".
  const irAPaso = useCallback((paso: number) => {
    setPasoActual(paso)
  }, [])

  // ── Validación completa de todos los pasos antes de guardar ───────────────
  // Garantiza integridad aunque el usuario haya saltado directamente al último paso.
  const validarFormCompleto = useCallback(async (): Promise<boolean> => {
    setIsValidating(true)
    try {
      const paso2OK = await trigger([...FIELDS_PASO_2])
      const paso3OK = await trigger([...FIELDS_PASO_3])
      const paso4OK = await trigger([...FIELDS_PASO_4])

      if (!paso2OK || !paso3OK || !paso4OK) return false

      // Validación adicional: área construida <= área del lote
      const areaLote = Number(getValues('area_lote'))
      const areaConstruida = Number(getValues('area_construida'))
      if (areaConstruida > areaLote) {
        setError('area_construida', {
          type: 'manual',
          message: 'El área construida no puede ser mayor al área del lote',
        })
        return false
      }

      // Validación adicional: recargo_esquinera > 0 cuando es_esquinera = true
      const esEsquineraFull = getValues('es_esquinera')
      const recargoFull = Number(getValues('recargo_esquinera'))
      if (esEsquineraFull && recargoFull <= 0) {
        setError('recargo_esquinera', {
          type: 'manual',
          message:
            'La vivienda es esquinera: ingresa el recargo correspondiente (> $0)',
        })
        return false
      }

      return true
    } finally {
      setIsValidating(false)
    }
  }, [trigger, getValues, setError])

  // ── Mostrar confirmación o modal de impacto ──────────────────────────────
  const mostrarConfirmacion = useCallback(async () => {
    // Validar TODOS los pasos, no solo el activo, para garantizar integridad
    const valido = await validarFormCompleto()
    if (!valido) return

    setPasosCompletados(new Set([1, 2, 3, 4]))

    if (impactoFinancieroCalculado) {
      // Capturar snapshot antes de abrir modal → evita race condition
      setImpactoFinancieroSnapshot(impactoFinancieroCalculado)
      setMostrarModalImpacto(true)
      return
    }

    setMostrarModalConfirmacion(true)
  }, [validarFormCompleto, impactoFinancieroCalculado])

  // ── Guardar cambios ──────────────────────────────────────────────────────
  const confirmarYGuardar = useCallback(
    async (sincronizarNeg = false) => {
      if (!vivienda) return

      const data = getValues()

      const updateData: Partial<ViviendaFormData> = {
        lindero_norte: data.lindero_norte,
        lindero_sur: data.lindero_sur,
        lindero_oriente: data.lindero_oriente,
        lindero_occidente: data.lindero_occidente,
        matricula_inmobiliaria: data.matricula_inmobiliaria,
        nomenclatura: data.nomenclatura,
        area_lote: Number(data.area_lote),
        area_construida: Number(data.area_construida),
        tipo_vivienda: data.tipo_vivienda as ViviendaFormData['tipo_vivienda'],
      }

      // Solo actualizar financiero si la vivienda no está Entregada
      if (!esViviendaEntregada) {
        updateData.valor_base = data.valor_base
        updateData.es_esquinera = data.es_esquinera
        updateData.recargo_esquinera = data.recargo_esquinera
      }

      setEstadoModal('loading')

      try {
        const viviendaActualizada = await actualizarMutation.mutateAsync({
          id: vivienda.id,
          data: updateData,
        })

        // Sincronizar negociación si se solicitó
        if (sincronizarNeg && impactoFinanciero && negociacionActiva) {
          setSincronizandoNegociacion(true)
          try {
            await viviendasService.sincronizarNegociacionConVivienda(
              negociacionActiva.id,
              data.valor_base
            )
            toast.info(
              'Valor de negociación actualizado. Recuerda redistribuir las fuentes de pago.',
              { duration: 6000 }
            )
          } catch {
            toast.error(
              'La vivienda se actualizó, pero hubo un error sincronizando la negociación.'
            )
          } finally {
            setSincronizandoNegociacion(false)
          }
        } else if (impactoFinanciero && !sincronizarNeg) {
          toast.warning(
            'El valor de la vivienda cambió pero la negociación mantiene el valor anterior.',
            { duration: 5000 }
          )
        }

        setEstadoModal('success')
        setHasUnsavedChanges(false)
        setMessage(null)

        setTimeout(() => {
          setMostrarModalConfirmacion(false)
          setMostrarModalImpacto(false)
          setImpactoFinancieroSnapshot(null)
          setEstadoModal('idle')
          setShowSuccess(true)

          // Navegar a la página de detalle de la vivienda
          const url = construirURLVivienda(
            {
              numero: String(viviendaActualizada.numero),
              id: viviendaActualizada.id,
            },
            viviendaActualizada.manzanas?.nombre,
            viviendaActualizada.manzanas?.proyectos?.nombre
          )
          setTimeout(() => router.push(url), 1500)
        }, 1200)
      } catch {
        errorLog(
          'useEditarViviendaAccordion.confirmarYGuardar',
          'Error al actualizar vivienda'
        )
        setEstadoModal('error')
      }
    },
    [
      vivienda,
      getValues,
      esViviendaEntregada,
      actualizarMutation,
      impactoFinanciero,
      negociacionActiva,
      router,
      setHasUnsavedChanges,
      setMessage,
    ]
  )

  // ── Nombre de la vivienda para display ───────────────────────────────────
  const viviendaNombre = vivienda
    ? `Mz. ${vivienda.manzanas?.nombre ?? '?'} Casa #${vivienda.numero}`
    : null

  const financieroBloqueado = esViviendaEntregada

  // ── Return ───────────────────────────────────────────────────────────────
  return {
    // Datos cargados
    vivienda,
    cargandoVivienda,
    errorVivienda,
    viviendaNombre,

    // Pasos
    pasos: PASOS_VIVIENDA_EDICION,
    pasoActual,
    getEstadoPaso,
    progress,

    // Navegación
    irSiguiente,
    irAtras,
    irAPaso,

    // Resúmenes de secciones
    summaryPaso1,
    summaryPaso2,
    summaryPaso3,
    summaryPaso4,

    // React Hook Form
    register,
    errors,
    setValue,
    watch,
    formData,

    // Finanzas
    resumenFinanciero,
    gastosNotariales,
    configuracionRecargos,
    financieroBloqueado,

    // Estado
    isValidating,
    isSubmitting: actualizarMutation.isPending,
    showSuccess,
    hayCambios,
    cambiosDetectados,
    cambiosPorPaso,
    validandoMatricula,

    // Modal
    mostrarModalConfirmacion,
    setMostrarModalConfirmacion,
    mostrarModalImpacto,
    setMostrarModalImpacto,
    estadoModal,
    setEstadoModal,
    impactoFinanciero,
    sincronizandoNegociacion,
    esViviendaAsignada,
    esViviendaEntregada,
    negociacionActiva,

    // Acciones
    mostrarConfirmacion,
    confirmarYGuardar,
  }
}
