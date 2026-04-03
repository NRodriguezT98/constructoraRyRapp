/**
 * useNuevoClienteAccordion — Hook que orquesta la creación de cliente
 * con el patrón Accordion Wizard (4 pasos).
 *
 * ✅ Zod validation por paso
 * ✅ Async: documento duplicado (paso 0)
 * ✅ Cross-field: teléfono OR email (paso 1)
 * ✅ Sanitización antes de enviar
 */

import { useCallback, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useRouter } from 'next/navigation'

import type {
  SectionStatus,
  SummaryItem,
  WizardStepConfig,
} from '@/shared/components/accordion-wizard'

import { useCrearClienteMutation } from '../hooks/useClientesQuery'
import { clientesService } from '../services/clientes.service'
import type { CrearClienteDTO, EstadoCivil, TipoDocumento } from '../types'
import { sanitizeCrearClienteDTO } from '../utils/sanitize-cliente.utils'
import type { TipoDocumentoColombia } from '../utils/validacion-documentos-colombia'
import { validarDocumentoIdentidad } from '../utils/validacion-documentos-colombia'

// ── Configuración de pasos ─────────────────────────────
export const PASOS_CLIENTE: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Datos Personales',
    description: 'Nombres, documento e información básica',
  },
  {
    id: 2,
    title: 'Contacto y Ubicación',
    description: 'Teléfono, email y dirección',
  },
  {
    id: 3,
    title: 'Interés Inicial',
    description: 'Proyecto y vivienda de interés',
  },
  {
    id: 4,
    title: 'Notas Adicionales',
    description: 'Observaciones opcionales',
  },
]

// ── Helpers de validación ──────────────────────────────
/** Solo letras (incluye tildes, ñ, espacios y guiones) */
const REGEX_SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/
/** Teléfono: dígitos, +, -, espacios, paréntesis */
const REGEX_TELEFONO = /^[0-9+\-\s()]+$/

// ── Schema del formulario ─────────────────────────────
const clienteFormSchema = z.object({
  // Paso 1: Datos Personales
  nombres: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(80, 'Máximo 80 caracteres')
    .regex(REGEX_SOLO_LETRAS, 'Solo letras, espacios y tildes'),
  apellidos: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(80, 'Máximo 80 caracteres')
    .regex(REGEX_SOLO_LETRAS, 'Solo letras, espacios y tildes'),
  tipo_documento: z.string().min(1, 'El tipo de documento es requerido'),
  numero_documento: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  fecha_nacimiento: z.string().optional(),
  estado_civil: z.string().optional(),
  // Paso 2: Contacto
  telefono: z
    .string()
    .regex(REGEX_TELEFONO, 'Solo números, +, -, (, ) y espacios')
    .min(7, 'Mínimo 7 dígitos')
    .max(15, 'Máximo 15 caracteres')
    .or(z.literal('')),
  telefono_alternativo: z
    .string()
    .regex(REGEX_TELEFONO, 'Solo números, +, -, (, ) y espacios')
    .min(7, 'Mínimo 7 dígitos')
    .max(15, 'Máximo 15 caracteres')
    .or(z.literal('')),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .max(100, 'Máximo 100 caracteres')
    .or(z.literal('')),
  direccion: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(200, 'Máximo 200 caracteres')
    .or(z.literal('')),
  departamento: z.string().min(1, 'El departamento es obligatorio'),
  ciudad: z.string().min(1, 'La ciudad es obligatoria'),
  // Paso 3: Interés
  proyecto_interes_id: z.string().optional(),
  vivienda_interes_id: z.string().optional(),
  notas_interes: z.string().max(500, 'Máximo 500 caracteres').optional(),
  // Paso 4: Notas
  notas: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

type ClienteFormValues = z.infer<typeof clienteFormSchema>

// Campos por paso
const FIELDS_PASO_1 = [
  'nombres',
  'apellidos',
  'tipo_documento',
  'numero_documento',
] as const
const FIELDS_PASO_2 = ['departamento', 'ciudad'] as const

export function useNuevoClienteAccordion() {
  const router = useRouter()
  const crearMutation = useCrearClienteMutation()

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
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    mode: 'onChange',
    defaultValues: {
      nombres: '',
      apellidos: '',
      tipo_documento: 'CC',
      numero_documento: '',
      fecha_nacimiento: '',
      estado_civil: '',
      telefono: '',
      telefono_alternativo: '',
      email: '',
      direccion: '',
      departamento: '',
      ciudad: '',
      proyecto_interes_id: '',
      vivienda_interes_id: '',
      notas_interes: '',
      notas: '',
    },
  })

  const formData = watch()

  // ── Estado de sección ───────────────────────────────
  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus => {
      if (pasosCompletados.has(paso)) return 'completed'
      if (paso === pasoActual) return 'active'
      return 'pending'
    },
    [pasoActual, pasosCompletados]
  )

  // ── Resúmenes ───────────────────────────────────────
  const summaryPaso1: SummaryItem[] = useMemo(
    () => [
      {
        label: 'Nombre',
        value:
          formData.nombres && formData.apellidos
            ? `${formData.nombres} ${formData.apellidos}`
            : undefined,
      },
      {
        label: 'Documento',
        value: formData.numero_documento
          ? `${formData.tipo_documento} ${formData.numero_documento}`
          : undefined,
      },
    ],
    [
      formData.nombres,
      formData.apellidos,
      formData.tipo_documento,
      formData.numero_documento,
    ]
  )

  const summaryPaso2: SummaryItem[] = useMemo(() => {
    const contacto = formData.telefono || formData.email
    return [
      { label: 'Contacto', value: contacto || undefined },
      {
        label: 'Ubicación',
        value:
          formData.ciudad && formData.departamento
            ? `${formData.ciudad}, ${formData.departamento}`
            : undefined,
      },
    ]
  }, [
    formData.telefono,
    formData.email,
    formData.ciudad,
    formData.departamento,
  ])

  const summaryPaso3: SummaryItem[] = useMemo(
    () => [
      {
        label: 'Interés',
        value: formData.proyecto_interes_id
          ? 'Proyecto seleccionado'
          : 'Sin interés definido',
      },
    ],
    [formData.proyecto_interes_id]
  )

  const summaryPaso4: SummaryItem[] = useMemo(
    () => [
      {
        label: 'Notas',
        value: formData.notas ? 'Con observaciones' : 'Sin notas',
      },
    ],
    [formData.notas]
  )

  // ── Progreso ────────────────────────────────────────
  const progress = useMemo(() => {
    return Math.round((pasosCompletados.size / PASOS_CLIENTE.length) * 100)
  }, [pasosCompletados.size])

  // ── Validación por paso ─────────────────────────────
  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    setIsValidating(true)
    try {
      switch (pasoActual) {
        case 1: {
          // 1. Validar campos requeridos + regex (Zod)
          const syncValid = await trigger([...FIELDS_PASO_1])
          if (!syncValid) return false

          const erroresEncontrados: Array<{ campo: string; mensaje: string }> =
            []

          // 2. Validar formato + longitud + algoritmo del documento según tipo
          const tipoDoc = getValues('tipo_documento') as TipoDocumentoColombia
          const numDoc = getValues('numero_documento').trim()

          const resultado = validarDocumentoIdentidad(tipoDoc, numDoc)
          if (!resultado.valido) {
            erroresEncontrados.push({
              campo: 'numero_documento',
              mensaje: resultado.mensaje || 'Documento inválido',
            })
          }

          // 4. Validar fecha de nacimiento si se proporcionó
          const fechaNac = getValues('fecha_nacimiento')
          if (fechaNac) {
            const hoy = new Date()
            const fecha = new Date(fechaNac + 'T12:00:00')
            if (fecha > hoy) {
              erroresEncontrados.push({
                campo: 'fecha_nacimiento',
                mensaje: 'La fecha no puede ser futura',
              })
            }
            const edadMaxima = new Date()
            edadMaxima.setFullYear(edadMaxima.getFullYear() - 120)
            if (fecha < edadMaxima) {
              erroresEncontrados.push({
                campo: 'fecha_nacimiento',
                mensaje: 'Fecha fuera de rango válido',
              })
            }
          }

          // 5. Async: verificar duplicados
          if (erroresEncontrados.length === 0 && numDoc.length >= 5) {
            try {
              const existente = await clientesService.buscarPorDocumento(
                tipoDoc,
                numDoc
              )
              if (existente) {
                erroresEncontrados.push({
                  campo: 'numero_documento',
                  mensaje: `Ya existe: ${existente.nombres} ${existente.apellidos}`,
                })
              }
            } catch {
              // No bloquear si falla la red
            }
          }

          if (erroresEncontrados.length > 0) {
            erroresEncontrados.forEach(e => {
              setError(e.campo as keyof ClienteFormValues, {
                type: 'manual',
                message: e.mensaje,
              })
            })
            return false
          }
          return true
        }
        case 2: {
          // Validar departamento y ciudad (required via Zod)
          const syncValid = await trigger([...FIELDS_PASO_2])
          if (!syncValid) return false

          // Cross-field: al menos teléfono o email
          const tel = getValues('telefono')?.trim()
          const email = getValues('email')?.trim()

          if (!tel && !email) {
            setError('telefono', {
              type: 'manual',
              message: 'Requerido: teléfono o email',
            })
            setError('email', {
              type: 'manual',
              message: 'Requerido: teléfono o email',
            })
            return false
          }

          // Validar formato teléfono vía Zod (regex + min/max ya en schema)
          if (tel) {
            const telValid = await trigger('telefono')
            if (!telValid) return false
          }

          // Validar formato email vía Zod (.email() ya en schema)
          if (email) {
            const emailValid = await trigger('email')
            if (!emailValid) return false
          }

          // Validar teléfono alternativo si se proporcionó
          const telAlt = getValues('telefono_alternativo')?.trim()
          if (telAlt) {
            const telAltValid = await trigger('telefono_alternativo')
            if (!telAltValid) return false
          }

          // Validar dirección si se proporcionó
          const dir = getValues('direccion')?.trim()
          if (dir) {
            const dirValid = await trigger('direccion')
            if (!dirValid) return false
          }

          return true
        }
        case 3: {
          // Si tiene vivienda, requiere proyecto
          const vivienda = getValues('vivienda_interes_id')
          const proyecto = getValues('proyecto_interes_id')
          if (vivienda && !proyecto) {
            setError('proyecto_interes_id', {
              type: 'manual',
              message: 'Selecciona un proyecto primero',
            })
            return false
          }

          // Validar notas_interes (max 500 via Zod)
          const notasInteres = getValues('notas_interes')?.trim()
          if (notasInteres) {
            const notasValid = await trigger('notas_interes')
            if (!notasValid) return false
          }
          return true
        }
        case 4: {
          // Validar notas (max 500 via Zod)
          const notas = getValues('notas')?.trim()
          if (notas) {
            const notasValid = await trigger('notas')
            if (!notasValid) return false
          }
          return true
        }
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
    setPasoActual(prev => Math.min(prev + 1, PASOS_CLIENTE.length))
  }, [pasoActual, validarPasoActual])

  const irAtras = useCallback(() => {
    setPasoActual(prev => Math.max(prev - 1, 1))
  }, [])

  const irAPaso = useCallback(
    (paso: number) => {
      if (pasosCompletados.has(paso)) {
        setPasosCompletados(prev => {
          const next = new Set(prev)
          for (let i = paso; i <= PASOS_CLIENTE.length; i++) next.delete(i)
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

      // Construir DTO
      const dto: CrearClienteDTO = {
        nombres: values.nombres,
        apellidos: values.apellidos,
        tipo_documento: values.tipo_documento as TipoDocumento,
        numero_documento: values.numero_documento,
        fecha_nacimiento: values.fecha_nacimiento || undefined,
        estado_civil: (values.estado_civil || undefined) as
          | EstadoCivil
          | undefined,
        telefono: values.telefono || undefined,
        telefono_alternativo: values.telefono_alternativo || undefined,
        email: values.email || undefined,
        direccion: values.direccion || undefined,
        departamento: values.departamento,
        ciudad: values.ciudad,
        notas: values.notas || undefined,
      }

      // Agregar interés si existe
      if (values.proyecto_interes_id) {
        dto.interes_inicial = {
          proyecto_id: values.proyecto_interes_id,
          vivienda_id: values.vivienda_interes_id || undefined,
          notas_interes: values.notas_interes || undefined,
        }
      }

      const sanitized = sanitizeCrearClienteDTO(dto)
      await crearMutation.mutateAsync(sanitized)
      // Toast ya lo maneja useCrearClienteMutation → no duplicar
      setShowSuccess(true)
      setTimeout(() => router.push('/clientes'), 1800)
    } catch (error) {
      // Toast de error ya lo maneja useCrearClienteMutation → no duplicar

      // Si es duplicado, volver al paso 1
      if (error instanceof Error && error.message.includes('documento')) {
        setError('numero_documento', { type: 'manual', message: error.message })
        setPasoActual(1)
        setPasosCompletados(prev => {
          const next = new Set(prev)
          for (let i = 1; i <= PASOS_CLIENTE.length; i++) next.delete(i)
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

  return {
    // Pasos
    pasos: PASOS_CLIENTE,
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

    // Submit
    handleSubmit: handleSubmitFinal,
    isSubmitting,
    isValidating,
    showSuccess,
  }
}
