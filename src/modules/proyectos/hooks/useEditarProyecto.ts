/**
 * useEditarProyecto — Hook que orquesta el wizard accordion para edición de proyectos
 * Espejo de useNuevoProyecto pero con carga de datos existentes y submit de actualización.
 */

'use client'

import { useCallback, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  CalendarDays,
  FileText,
  Home,
  LayoutGrid,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import type {
  SectionStatus,
  SummaryItem,
  WizardStepConfig,
} from '@/shared/components/accordion-wizard'
import type {
  CambioDetectado,
  CategoriaConfig,
} from '@/shared/components/modulos/ConfirmarCambiosModal'

import { proyectosService } from '../services/proyectos.service'
import type { EstadoProyecto, Proyecto, ProyectoFormData } from '../types'

import {
  useDetectarCambios,
  type CambioManzana,
  type ResumenCambios,
} from './useDetectarCambios'
import { useProyectoConValidacion } from './useProyectoConValidacion'
import { useProyectosForm } from './useProyectosForm'

// ── Campos por paso (constantes estables, definidas fuera del hook) ──
const CAMPOS_PASO_1 = [
  'nombre',
  'departamento',
  'ciudad',
  'direccion',
  'descripcion',
]
const CAMPOS_PASO_2 = [
  'estado',
  'fechaInicio',
  'fechaFinEstimada',
  'responsable',
]

// ── Configuración de pasos (misma que creación) ──────────────────
export const PASOS_PROYECTO_EDICION: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Información General',
    description:
      'Modifica el nombre, departamento, ciudad, dirección y descripción del proyecto.',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Estado y Fechas',
    description:
      'Actualiza el estado actual del proyecto y las fechas de inicio y fin estimada.',
    icon: CalendarDays,
  },
  {
    id: 3,
    title: 'Manzanas',
    description:
      'Ajusta la distribución de manzanas y la cantidad de viviendas por cada una.',
    icon: LayoutGrid,
  },
]

const FIELDS_PASO_1 = [
  'nombre',
  'departamento',
  'ciudad',
  'direccion',
  'descripcion',
] as const
const FIELDS_PASO_2 = ['estado', 'fechaInicio', 'fechaFinEstimada'] as const

const ESTADO_LABELS: Record<string, string> = {
  en_planificacion: 'En Planificación',
  en_proceso: 'En Proceso',
  en_construccion: 'En Construcción',
  completado: 'Completado',
  pausado: 'Pausado',
}

// ── Iconos por campo para la modal de confirmación ───────────────
const CAMPO_ICONO: Record<string, import('lucide-react').LucideIcon> = {
  nombre: Building2,
  departamento: MapPin,
  ciudad: MapPin,
  direccion: MapPin,
  descripcion: FileText,
  estado: TrendingUp,
  fechaInicio: CalendarDays,
  fechaFinEstimada: CalendarDays,
  responsable: User,
}

// ── Categorías para agrupar cambios en la modal ──────────────────
export const CATEGORIAS_CAMBIOS_PROYECTO: Record<string, CategoriaConfig> = {
  proyecto: { titulo: 'Cambios en el Proyecto', icono: Building2 },
  manzanas: { titulo: 'Cambios en Manzanas', icono: Home },
}

/** Convierte ResumenCambios (específico de proyectos) al formato genérico CambioDetectado[] */
function convertirAGenerico(resumen: ResumenCambios): CambioDetectado[] {
  const resultado: CambioDetectado[] = []

  // Cambios de proyecto
  for (const c of resumen.proyecto) {
    resultado.push({
      campo: c.campo,
      label: c.label,
      valorAnterior: c.valorAnterior ?? '—',
      valorNuevo: c.valorNuevo ?? '—',
      icono: CAMPO_ICONO[c.campo] ?? FileText,
      categoria: 'proyecto',
    })
  }

  // Cambios de manzanas
  for (const m of resumen.manzanas) {
    const icono =
      m.tipo === 'agregada' ? Plus : m.tipo === 'eliminada' ? Trash2 : Pencil
    const label =
      m.tipo === 'agregada'
        ? `Manzana ${m.nombre} (nueva)`
        : m.tipo === 'eliminada'
          ? `Manzana ${m.nombre} (eliminada)`
          : `Manzana ${m.nombre}`

    const anterior = formatManzanaValor(m, 'anterior')
    const nuevo = formatManzanaValor(m, 'nuevo')

    resultado.push({
      campo: `manzana_${m.nombre}`,
      label,
      valorAnterior: anterior,
      valorNuevo: nuevo,
      icono,
      categoria: 'manzanas',
    })
  }

  return resultado
}

function formatManzanaValor(
  m: CambioManzana,
  tipo: 'anterior' | 'nuevo'
): string {
  if (m.tipo === 'agregada')
    return tipo === 'anterior'
      ? '—'
      : `${m.cambios?.viviendasNuevo ?? 0} viviendas`
  if (m.tipo === 'eliminada')
    return tipo === 'anterior' ? `${m.nombre}` : '— (eliminada)'
  // modificada
  const partes: string[] = []
  if (tipo === 'anterior') {
    if (m.cambios?.nombreAnterior) partes.push(m.cambios.nombreAnterior)
    if (m.cambios?.viviendasAnterior != null)
      partes.push(`${m.cambios.viviendasAnterior} viv.`)
  } else {
    if (m.cambios?.nombreNuevo) partes.push(m.cambios.nombreNuevo)
    if (m.cambios?.viviendasNuevo != null)
      partes.push(`${m.cambios.viviendasNuevo} viv.`)
  }
  return partes.join(', ') || '—'
}

/** Parsea el campo `ubicacion` de la DB en sus 3 campos separados */
function parsearUbicacion(ubicacion: string): {
  departamento: string
  ciudad: string
  direccion: string
} {
  const partes = ubicacion.split(', ')
  if (partes.length >= 3) {
    return {
      departamento: partes[partes.length - 1],
      ciudad: partes[partes.length - 2],
      direccion: partes.slice(0, -2).join(', '),
    }
  }
  if (partes.length === 2) {
    return { departamento: partes[1], ciudad: partes[0], direccion: '' }
  }
  return { departamento: '', ciudad: '', direccion: ubicacion }
}

export function useEditarProyecto(proyectoId: string) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(
    new Set()
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [datosFormularioPendiente, setDatosFormularioPendiente] =
    useState<ProyectoFormData | null>(null)

  // ── Cargar proyecto con validación de manzanas ────────────────────
  const {
    data: proyectoConValidacion,
    isLoading,
    isError,
  } = useProyectoConValidacion(proyectoId)

  // ── Transformar datos cargados en initialData para el formulario ──
  const initialData = useMemo((): Partial<ProyectoFormData> | undefined => {
    if (!proyectoConValidacion) return undefined

    const { departamento, ciudad, direccion } = parsearUbicacion(
      proyectoConValidacion.ubicacion
    )

    return {
      id: proyectoConValidacion.id,
      nombre: proyectoConValidacion.nombre,
      descripcion: proyectoConValidacion.descripcion,
      departamento,
      ciudad,
      direccion,
      fechaInicio: proyectoConValidacion.fechaInicio,
      fechaFinEstimada: proyectoConValidacion.fechaFinEstimada,
      presupuesto: proyectoConValidacion.presupuesto,
      estado: proyectoConValidacion.estado as EstadoProyecto,
      responsable: proyectoConValidacion.responsable,
      manzanas: proyectoConValidacion.manzanas.map(m => ({
        id: m.id,
        nombre: m.nombre,
        totalViviendas: m.totalViviendas,
        precioBase: 0,
        superficieTotal: 0,
        ubicacion: '',
        cantidadViviendasCreadas: m.cantidadViviendasCreadas,
        esEditable: m.esEditable,
        motivoBloqueado: m.motivoBloqueado,
      })),
    }
  }, [proyectoConValidacion])

  // ── Proyecto original como tipo Proyecto para detección de cambios ──
  const proyectoOriginalParaCambios = useMemo((): Proyecto | null => {
    if (!proyectoConValidacion) return null

    const { departamento, ciudad, direccion } = parsearUbicacion(
      proyectoConValidacion.ubicacion
    )

    return {
      id: proyectoConValidacion.id,
      nombre: proyectoConValidacion.nombre,
      descripcion: proyectoConValidacion.descripcion,
      ubicacion: proyectoConValidacion.ubicacion,
      departamento,
      ciudad,
      direccion,
      fechaInicio: proyectoConValidacion.fechaInicio,
      fechaFinEstimada: proyectoConValidacion.fechaFinEstimada,
      presupuesto: proyectoConValidacion.presupuesto,
      estado: proyectoConValidacion.estado as EstadoProyecto,
      manzanas: proyectoConValidacion.manzanas.map(m => ({
        id: m.id,
        nombre: m.nombre,
        totalViviendas: m.totalViviendas,
        viviendasVendidas: 0,
        precioBase: 0,
        superficieTotal: 0,
        proyectoId: proyectoConValidacion.id,
        estado: 'planificada' as const,
        fechaCreacion: proyectoConValidacion.fechaCreacion,
      })),
      fechaCreacion: proyectoConValidacion.fechaCreacion,
      fechaActualizacion: proyectoConValidacion.fechaActualizacion,
    }
  }, [proyectoConValidacion])

  // ── Detección de cambios EN TIEMPO REAL (proyecto original vs formulario actual) ──
  // Se computa con los datos pendientes de confirmar (si existen) o con watch() en vivo
  const resumenCambios = useDetectarCambios(
    proyectoOriginalParaCambios,
    datosFormularioPendiente
  )

  // ── Interceptor de submit: captura datos y muestra confirmación ──
  const handleSubmitInterceptor = useCallback(
    async (data: ProyectoFormData) => {
      setDatosFormularioPendiente(data)
      setMostrarConfirmacion(true)
    },
    []
  )

  // ── Confirmar actualización: cerrar modal → loading en formulario → éxito/error ──
  const confirmarActualizacion = useCallback(async () => {
    if (!datosFormularioPendiente) return

    // 1. Cerrar modal inmediatamente
    setMostrarConfirmacion(false)

    // 2. Formulario entra en loading state
    setIsSubmitting(true)
    try {
      await proyectosService.actualizarProyecto(
        proyectoId,
        datosFormularioPendiente
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['proyectos'] }),
        queryClient.invalidateQueries({
          queryKey: ['proyecto-validacion', proyectoId],
        }),
      ])
      // 3. Formulario muestra celebración de éxito
      setIsSubmitting(false)
      setShowSuccess(true)
      setTimeout(() => router.push('/proyectos'), 2000)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al actualizar el proyecto'
      setIsSubmitting(false)
      toast.error(message)
      setDatosFormularioPendiente(null)
    }
  }, [datosFormularioPendiente, proyectoId, queryClient, router])

  // ── Cancelar confirmación ──
  const cancelarConfirmacion = useCallback(() => {
    setMostrarConfirmacion(false)
    setDatosFormularioPendiente(null)
  }, [])

  // ── Cambios en formato genérico para la modal compartida ──
  const cambiosGenericos = useMemo(
    () => convertirAGenerico(resumenCambios),
    [resumenCambios]
  )

  // ── Hook del formulario base (se inicializa con los datos cargados) ──
  const form = useProyectosForm({
    initialData,
    onSubmit: handleSubmitInterceptor,
    isEditing: true,
  })

  const {
    register,
    control,
    errors,
    trigger,
    watch,
    setValue,
    setError,
    fields,
    handleAgregarManzana,
    handleEliminarManzana,
    totalManzanas,
    totalViviendas,
    manzanasWatch,
    canAgregarManzana,
  } = form

  // ── Watch values para resúmenes ──────────────────────────────────
  const watchedNombre = watch('nombre')
  const watchedDepartamento = watch('departamento')
  const watchedCiudad = watch('ciudad')
  const watchedEstado = watch('estado')

  // ── Detección LIVE de cambios (para badges en accordion) ────────
  const allFormValues = watch()
  const datosFormularioLive = useMemo((): ProyectoFormData | null => {
    if (!allFormValues || !proyectoOriginalParaCambios) return null
    return allFormValues as ProyectoFormData
  }, [allFormValues, proyectoOriginalParaCambios])

  const resumenCambiosLive = useDetectarCambios(
    proyectoOriginalParaCambios,
    datosFormularioLive
  )

  // ── Cambios por paso (para badges en cada sección del accordion) ──

  const cambiosPorPaso = useMemo(() => {
    const cambiosPaso1 = resumenCambiosLive.proyecto.filter(c =>
      CAMPOS_PASO_1.includes(c.campo)
    ).length
    const cambiosPaso2 = resumenCambiosLive.proyecto.filter(c =>
      CAMPOS_PASO_2.includes(c.campo)
    ).length
    const cambiosPaso3 = resumenCambiosLive.manzanas.length
    return { paso1: cambiosPaso1, paso2: cambiosPaso2, paso3: cambiosPaso3 }
  }, [resumenCambiosLive])

  const hayCambios = resumenCambiosLive.hayCambios

  // ── Estado de cada sección ───────────────────────────────────────
  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus => {
      if (pasosCompletados.has(paso)) return 'completed'
      if (paso === pasoActual) return 'active'
      return 'pending'
    },
    [pasoActual, pasosCompletados]
  )

  // ── Resúmenes de pasos completados ──────────────────────────────
  const summaryPaso1: SummaryItem[] = useMemo(
    () => [
      { label: 'Nombre', value: watchedNombre },
      { label: 'Departamento', value: watchedDepartamento },
      { label: 'Ciudad', value: watchedCiudad },
    ],
    [watchedNombre, watchedDepartamento, watchedCiudad]
  )

  const summaryPaso2: SummaryItem[] = useMemo(
    () => [
      {
        label: 'Estado',
        value: watchedEstado ? ESTADO_LABELS[watchedEstado] : undefined,
      },
    ],
    [watchedEstado]
  )

  const summaryPaso3: SummaryItem[] = useMemo(
    () => [
      {
        label: 'Manzanas',
        value: totalManzanas > 0 ? `${totalManzanas} manzana(s)` : undefined,
      },
      {
        label: 'Viviendas',
        value: totalViviendas > 0 ? `${totalViviendas} vivienda(s)` : undefined,
      },
    ],
    [totalManzanas, totalViviendas]
  )

  // ── Progreso global ──────────────────────────────────────────────
  const progress = useMemo(() => {
    return Math.round(
      (pasosCompletados.size / PASOS_PROYECTO_EDICION.length) * 100
    )
  }, [pasosCompletados.size])

  // ── Validación por paso (idéntica a useNuevoProyecto) ────────────
  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    setIsValidating(true)
    try {
      switch (pasoActual) {
        case 1: {
          const paso1Valid = await trigger([...FIELDS_PASO_1])
          if (!paso1Valid) return false

          // ✅ Validación extra: asegurar que ciudad esté seleccionada
          // (previene edge-case si el select no sincronizó con RHF)
          const ciudadVal = watch('ciudad') as string | undefined
          if (!ciudadVal || ciudadVal.trim() === '') {
            setError('ciudad', {
              type: 'manual',
              message: 'Selecciona una ciudad o municipio',
            })
            return false
          }
          return true
        }
        case 2: {
          const paso2Valid = await trigger([...FIELDS_PASO_2])
          if (!paso2Valid) return false

          const fechaInicio = watch('fechaInicio') as string | undefined
          const fechaFin = watch('fechaFinEstimada') as string | undefined
          const estado = watch('estado') as string | undefined

          if (
            fechaInicio &&
            fechaFin &&
            fechaInicio.trim() !== '' &&
            fechaFin.trim() !== ''
          ) {
            const dateInicio = new Date(fechaInicio)
            const dateFin = new Date(fechaFin)
            const ahora = new Date()

            if (dateFin <= dateInicio) {
              setError('fechaFinEstimada', {
                type: 'manual',
                message:
                  'La fecha de fin debe ser posterior a la fecha de inicio',
              })
              return false
            }
            if (estado === 'completado' && dateFin > ahora) {
              setError('fechaFinEstimada', {
                type: 'manual',
                message:
                  'Un proyecto completado no puede tener fecha de fin futura',
              })
              return false
            }
            if (
              (estado === 'en_proceso' || estado === 'en_construccion') &&
              dateInicio > ahora
            ) {
              setError('fechaInicio', {
                type: 'manual',
                message:
                  'Un proyecto en proceso o en construcción no puede tener fecha de inicio futura',
              })
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

    setPasosCompletados(prev => new Set(prev).add(pasoActual))
    setPasoActual(prev => Math.min(prev + 1, PASOS_PROYECTO_EDICION.length))
  }, [pasoActual, validarPasoActual])

  const irAtras = useCallback(() => {
    setPasoActual(prev => Math.max(prev - 1, 1))
  }, [])

  const irAPaso = useCallback(
    (paso: number) => {
      if (pasosCompletados.has(paso)) {
        setPasosCompletados(prev => {
          const next = new Set(prev)
          for (let i = paso; i <= PASOS_PROYECTO_EDICION.length; i++) {
            next.delete(i)
          }
          return next
        })
        setPasoActual(paso)
      }
    },
    [pasosCompletados]
  )

  const handleSubmit = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return

    setPasosCompletados(prev => new Set(prev).add(pasoActual))
    form.handleSubmit()
  }, [pasoActual, validarPasoActual, form])

  return {
    // Estado de carga del proyecto
    isLoading,
    isError,
    proyectoNombre: proyectoConValidacion?.nombre,

    // Pasos
    pasos: PASOS_PROYECTO_EDICION,
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

    // Form
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

    // Confirmación de cambios (modal compartida)
    mostrarConfirmacion,
    cambiosGenericos,
    categoriasConfig: CATEGORIAS_CAMBIOS_PROYECTO,
    confirmarActualizacion,
    cancelarConfirmacion,

    // Cambios en tiempo real (para badges y disable submit)
    hayCambios,
    cambiosPorPaso,

    // UI helpers
    estadoLabels: ESTADO_LABELS,
  }
}
