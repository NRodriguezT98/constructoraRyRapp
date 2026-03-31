/**
 * useNuevoProyecto — Hook que orquesta useProyectosForm para el wizard accordion
 * Maneja navegación por pasos, validación por sección y estado del wizard.
 */

import { useCallback, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { Building2, CalendarDays, LayoutGrid } from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import type { SectionStatus, SummaryItem, WizardStepConfig } from '@/shared/components/accordion-wizard'

import { proyectosService } from '../services/proyectos.service'
import type { ProyectoFormData } from '../types'

import { useProyectosForm } from './useProyectosForm'

// ── Configuración de pasos ───────────────────────────────────────
export const PASOS_PROYECTO: WizardStepConfig[] = [
  { id: 1, title: 'Información General', description: 'Define el nombre, departamento, ciudad, dirección y una descripción del proyecto de construcción.', icon: Building2 },
  { id: 2, title: 'Estado y Fechas', description: 'Selecciona el estado actual del proyecto y las fechas de inicio y fin estimada.', icon: CalendarDays },
  { id: 3, title: 'Manzanas', description: 'Configura la distribución de manzanas y la cantidad de viviendas por cada una.', icon: LayoutGrid },
]

// Campos por paso (para trigger de validación parcial)
const FIELDS_PASO_1 = ['nombre', 'departamento', 'ciudad', 'direccion', 'descripcion'] as const
const FIELDS_PASO_2 = ['estado', 'fechaInicio', 'fechaFinEstimada'] as const

const ESTADO_LABELS: Record<string, string> = {
  en_planificacion: 'En Planificación',
  en_proceso: 'En Proceso',
  en_construccion: 'En Construcción',
  completado: 'Completado',
  pausado: 'Pausado',
}

export function useNuevoProyecto() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // ── Callback de submit final ────────────────────────
  const handleSubmitFinal = useCallback(async (data: ProyectoFormData) => {
    setIsSubmitting(true)
    try {
      await proyectosService.crearProyecto(data)
      await queryClient.invalidateQueries({ queryKey: ['proyectos'] })
      toast.success('Proyecto creado exitosamente')
      setShowSuccess(true)
      setTimeout(() => router.push('/proyectos'), 1800)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear el proyecto'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [queryClient, router])

  // ── Hook del formulario base ────────────────────────
  const form = useProyectosForm({
    onSubmit: handleSubmitFinal,
    isEditing: false,
  })

  const {
    register, control, errors, trigger, watch, setValue, setError,
    fields, handleAgregarManzana, handleEliminarManzana,
    totalManzanas, totalViviendas, manzanasWatch, canAgregarManzana,
  } = form

  // ── Watch values para resúmenes ─────────────────────
  const watchedNombre = watch('nombre')
  const watchedDepartamento = watch('departamento')
  const watchedCiudad = watch('ciudad')
  const watchedEstado = watch('estado')

  // ── Estado de cada sección ──────────────────────────
  const getEstadoPaso = useCallback((paso: number): SectionStatus => {
    if (pasosCompletados.has(paso)) return 'completed'
    if (paso === pasoActual) return 'active'
    return 'pending'
  }, [pasoActual, pasosCompletados])

  // ── Resumen de cada sección completada ──────────────
  const summaryPaso1: SummaryItem[] = useMemo(() => [
    { label: 'Nombre', value: watchedNombre },
    { label: 'Departamento', value: watchedDepartamento },
    { label: 'Ciudad', value: watchedCiudad },
  ], [watchedNombre, watchedDepartamento, watchedCiudad])

  const summaryPaso2: SummaryItem[] = useMemo(() => [
    { label: 'Estado', value: watchedEstado ? ESTADO_LABELS[watchedEstado] : undefined },
  ], [watchedEstado])

  const summaryPaso3: SummaryItem[] = useMemo(() => [
    { label: 'Manzanas', value: totalManzanas > 0 ? `${totalManzanas} manzana(s)` : undefined },
    { label: 'Viviendas', value: totalViviendas > 0 ? `${totalViviendas} vivienda(s)` : undefined },
  ], [totalManzanas, totalViviendas])

  // ── Progreso global ─────────────────────────────────
  const progress = useMemo(() => {
    return Math.round((pasosCompletados.size / PASOS_PROYECTO.length) * 100)
  }, [pasosCompletados.size])

  // ── Validación por paso y navegación ────────────────
  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    setIsValidating(true)
    try {
      switch (pasoActual) {
        case 1:
          return await trigger([...FIELDS_PASO_1])
        case 2: {
          const paso2Valid = await trigger([...FIELDS_PASO_2])
          if (!paso2Valid) return false

          // Validación cruzada de fechas (no cubierta por trigger parcial)
          const fechaInicio = watch('fechaInicio') as string | undefined
          const fechaFin = watch('fechaFinEstimada') as string | undefined
          const estado = watch('estado') as string | undefined

          if (fechaInicio && fechaFin && fechaInicio.trim() !== '' && fechaFin.trim() !== '') {
            const dateInicio = new Date(fechaInicio)
            const dateFin = new Date(fechaFin)
            const ahora = new Date()

            if (dateFin <= dateInicio) {
              setError('fechaFinEstimada', { type: 'manual', message: 'La fecha de fin debe ser posterior a la fecha de inicio' })
              return false
            }
            if (estado === 'completado' && dateFin > ahora) {
              setError('fechaFinEstimada', { type: 'manual', message: 'Un proyecto completado no puede tener fecha de fin futura' })
              return false
            }
            if ((estado === 'en_proceso' || estado === 'en_construccion') && dateInicio > ahora) {
              setError('fechaInicio', { type: 'manual', message: 'Un proyecto en proceso o en construcción no puede tener fecha de inicio futura' })
              return false
            }
          }
          return true
        }
        case 3:
          return await trigger(['manzanas'])
        default:
          return true
      }
    } finally {
      setIsValidating(false)
    }
  }, [pasoActual, trigger, watch, setError])

  const irSiguiente = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return

    setPasosCompletados((prev) => new Set(prev).add(pasoActual))
    setPasoActual((prev) => Math.min(prev + 1, PASOS_PROYECTO.length))
  }, [pasoActual, validarPasoActual])

  const irAtras = useCallback(() => {
    setPasoActual((prev) => Math.max(prev - 1, 1))
  }, [])

  const irAPaso = useCallback((paso: number) => {
    if (pasosCompletados.has(paso)) {
      // Invalidar pasos posteriores al editado
      setPasosCompletados((prev) => {
        const next = new Set(prev)
        for (let i = paso; i <= PASOS_PROYECTO.length; i++) {
          next.delete(i)
        }
        return next
      })
      setPasoActual(paso)
    }
  }, [pasosCompletados])

  const handleSubmit = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return

    setPasosCompletados((prev) => new Set(prev).add(pasoActual))

    // Trigger the form submit handler from useProyectosForm
    form.handleSubmit()
  }, [pasoActual, validarPasoActual, form])

  return {
    // Pasos
    pasos: PASOS_PROYECTO,
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

    // Form (delegado de useProyectosForm)
    register,
    control,
    errors,
    watch,
    setValue,
    fields,
    handleAgregarManzana,
    handleEliminarManzana,
    manzanasWatch,
    totalManzanas,
    totalViviendas,
    canAgregarManzana,

    // Submit
    handleSubmit,
    isSubmitting,
    isValidating,
    showSuccess,

    // Estado labels para UI
    estadoLabels: ESTADO_LABELS,
  }
}
