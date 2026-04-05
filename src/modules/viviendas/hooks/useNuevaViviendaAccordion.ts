/**
 * useNuevaViviendaAccordion — Hook que orquesta la creación de vivienda
 * con el patrón Accordion Wizard (5 pasos).
 *
 * ✅ Separación de responsabilidades
 * ✅ Validación por paso (sync + async)
 * ✅ Cálculos financieros en tiempo real
 * ✅ Estado de sección (completed/active/pending)
 */

import { useCallback, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import type {
  SectionStatus,
  SummaryItem,
} from '@/shared/components/accordion-wizard'

import {
  FIELDS_PASO_1,
  FIELDS_PASO_2,
  FIELDS_PASO_3,
  FIELDS_PASO_4,
  nuevaViviendaAccordionSchema,
  PASOS_VIVIENDA,
} from '../schemas/nueva-vivienda-accordion.schema'
import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import { viviendasService } from '../services/viviendas.service'
import type { ViviendaFormData } from '../types'

import { useViviendaFinanciero } from './useViviendaFinanciero'
import { useCrearViviendaMutation } from './useViviendasQuery'

export type { ViviendaFormValues } from '../schemas/nueva-vivienda-accordion.schema'
export { PASOS_VIVIENDA }

export function useNuevaViviendaAccordion() {
  const router = useRouter()
  const crearMutation = useCrearViviendaMutation({ showToast: false })

  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(
    new Set()
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // ── Formulario ──────────────────────────────────────
  const {
    register,
    watch,
    setValue,
    trigger,
    setError,
    getValues,
    formState: { errors },
  } = useForm<ViviendaSchemaType>({
    resolver: zodResolver(
      nuevaViviendaAccordionSchema
    ) as unknown as import('react-hook-form').Resolver<ViviendaSchemaType>,
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
      area_lote: '' as unknown as number,
      area_construida: '' as unknown as number,
      tipo_vivienda: 'Regular',
      valor_base: 0,
      es_esquinera: false,
      recargo_esquinera: 0,
    },
  })

  const formData = watch()

  // ── Cálculos financieros (sub-hook) ────────────────
  const { gastosNotariales, configuracionRecargos, resumenFinanciero } =
    useViviendaFinanciero({
      valor_base: formData.valor_base ?? 0,
      es_esquinera: formData.es_esquinera ?? false,
      recargo_esquinera: formData.recargo_esquinera ?? 0,
    })

  // ── Estado de cada sección ──────────────────────────
  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus => {
      if (pasosCompletados.has(paso)) return 'completed'
      if (paso === pasoActual) return 'active'
      return 'pending'
    },
    [pasoActual, pasosCompletados]
  )

  // ── Resumen de cada sección completada ──────────────
  const summaryPaso1: SummaryItem[] = useMemo(
    () => [
      {
        label: 'Proyecto',
        value: formData.proyecto_id ? 'Seleccionado' : undefined,
      },
      {
        label: 'Manzana',
        value: formData.manzana_id ? 'Seleccionada' : undefined,
      },
      { label: 'Número', value: formData.numero || undefined },
    ],
    [formData.proyecto_id, formData.manzana_id, formData.numero]
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

  // ── Progreso global ─────────────────────────────────
  const progress = useMemo(() => {
    return Math.round((pasosCompletados.size / PASOS_VIVIENDA.length) * 100)
  }, [pasosCompletados.size])

  // ── Validación por paso ─────────────────────────────
  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    setIsValidating(true)
    try {
      switch (pasoActual) {
        case 1:
          return await trigger([...FIELDS_PASO_1])
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
          if (matricula && matricula.length >= 7) {
            try {
              const resultado =
                await viviendasService.verificarMatriculaUnica(matricula)
              if (!resultado.esUnica && resultado.viviendaDuplicada) {
                erroresEncontrados.push({
                  campo: 'matricula_inmobiliaria',
                  mensaje: `Matrícula ya registrada en Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`,
                })
              }
            } catch {
              // No bloquear si falla la red
            }
          }

          if (erroresEncontrados.length > 0) {
            erroresEncontrados.forEach(e => {
              setError(e.campo as keyof ViviendaSchemaType, {
                type: 'manual',
                message: e.mensaje,
              })
            })
            return false
          }
          return true
        }
        case 4:
          return await trigger([...FIELDS_PASO_4])
        case 5:
          return true
        default:
          return true
      }
    } finally {
      setIsValidating(false)
    }
  }, [pasoActual, trigger, getValues, setError])

  // ── Navegación ──────────────────────────────────────
  const irSiguiente = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return
    setPasosCompletados(prev => new Set(prev).add(pasoActual))
    setPasoActual(prev => Math.min(prev + 1, PASOS_VIVIENDA.length))
  }, [pasoActual, validarPasoActual])

  const irAtras = useCallback(() => {
    setPasoActual(prev => Math.max(prev - 1, 1))
  }, [])

  const irAPaso = useCallback(
    (paso: number) => {
      if (pasosCompletados.has(paso)) {
        setPasosCompletados(prev => {
          const next = new Set(prev)
          for (let i = paso; i <= PASOS_VIVIENDA.length; i++) next.delete(i)
          return next
        })
        setPasoActual(paso)
      }
    },
    [pasosCompletados]
  )

  // ── Submit final ────────────────────────────────────
  const handleSubmitFinal = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return

    setPasosCompletados(prev => new Set(prev).add(pasoActual))
    setIsSubmitting(true)
    try {
      const values = getValues()
      const data = {
        ...values,
        area_lote: Number(values.area_lote),
        area_construida: Number(values.area_construida),
        valor_base: Number(values.valor_base),
        recargo_esquinera: Number(values.recargo_esquinera) || 0,
      } as unknown as ViviendaFormData

      await crearMutation.mutateAsync(data)
      toast.success('¡Vivienda creada exitosamente!')
      setShowSuccess(true)
      setTimeout(() => router.push('/viviendas'), 1800)
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Error al crear vivienda'
      toast.error(msg)
      if (error instanceof Error && error.message.includes('matrícula')) {
        setError('matricula_inmobiliaria', {
          type: 'manual',
          message: error.message,
        })
        setPasoActual(3)
        setPasosCompletados(prev => {
          const next = new Set(prev)
          for (let i = 3; i <= PASOS_VIVIENDA.length; i++) next.delete(i)
          return next
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [
    pasoActual,
    validarPasoActual,
    getValues,
    crearMutation,
    router,
    setError,
  ])

  // ── Preview para paso 5 (resumen) ──────────────────
  const previewData = useMemo(
    () => ({
      proyecto: formData.proyecto_id || null,
      manzana: formData.manzana_id || null,
      numero: formData.numero || null,
      linderos: {
        norte: formData.lindero_norte || null,
        sur: formData.lindero_sur || null,
        oriente: formData.lindero_oriente || null,
        occidente: formData.lindero_occidente || null,
      },
      legal: {
        matricula: formData.matricula_inmobiliaria || null,
        nomenclatura: formData.nomenclatura || null,
        areaLote: Number(formData.area_lote) || 0,
        areaConstruida: Number(formData.area_construida) || 0,
        tipoVivienda: formData.tipo_vivienda || 'Regular',
      },
      financiero: {
        valorBase: Number(formData.valor_base) || 0,
        esEsquinera: formData.es_esquinera || false,
        recargoEsquinera: Number(formData.recargo_esquinera) || 0,
      },
    }),
    [formData]
  )

  return {
    // Pasos
    pasos: PASOS_VIVIENDA,
    pasoActual,
    getEstadoPaso,
    progress,

    // Navegación
    irSiguiente,
    irAtras,
    irAPaso,

    // Resúmenes
    summaryPaso1,
    summaryPaso2,
    summaryPaso3,
    summaryPaso4,

    // Form
    register,
    errors,
    setValue,
    watch,
    formData,
    previewData,

    // Finanzas
    resumenFinanciero,
    gastosNotariales,
    configuracionRecargos,

    // Submit
    handleSubmit: handleSubmitFinal,
    isSubmitting,
    isValidating,
    showSuccess,
  }
}
