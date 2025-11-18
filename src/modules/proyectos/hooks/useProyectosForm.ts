/**
 * useProyectosForm - Hook con lógica del formulario de proyectos
 * ✅ Separación de responsabilidades ESTRICTA
 * ✅ Validación con Zod
 * ✅ React Hook Form
 * ✅ Cálculos y transformaciones
 * ✅ Validación granular de manzanas editables
 */

import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import type { ProyectoFormData } from '../types'

import { useFormChanges } from '@/shared/hooks/useFormChanges'
import { proyectosService } from '../services/proyectos.service'
import { useManzanasEditables } from './useManzanasEditables'

// ==================== SCHEMAS ====================
const manzanaSchema = z.object({
  id: z.string().optional(), // ID real de la DB (si existe)
  nombre: z
    .string()
    .min(1, 'El nombre de la manzana es obligatorio')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_().]+$/,
      'Solo se permiten letras, números, espacios, guiones, paréntesis y puntos'
    ),
  totalViviendas: z
    .number({
      errorMap: () => ({ message: 'La cantidad de viviendas es obligatoria' }),
      invalid_type_error: 'Ingresa un número válido',
    })
    .min(1, 'Mínimo 1 vivienda')
    .max(100, 'Máximo 100 viviendas')
    .int('Debe ser un número entero'),
  // ✅ Campos opcionales para validación precargada
  cantidadViviendasCreadas: z.number().optional(),
  esEditable: z.boolean().optional(),
  motivoBloqueado: z.string().optional(),
})

const proyectoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre del proyecto debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_().]+$/,
      'Solo se permiten letras (con acentos), números, espacios, guiones, paréntesis y puntos'
    ),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,;:()\n¿?¡!'"°%$]+$/,
      'Caracteres no permitidos en la descripción. Use solo letras, números y puntuación básica'
    ),
  ubicacion: z
    .string()
    .min(5, 'La ubicación debe tener al menos 5 caracteres')
    .max(200, 'La ubicación no puede exceder 200 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-,#.°]+$/,
      'Solo se permiten letras (con acentos), números, espacios, comas, guiones, # y puntos'
    ),
  estado: z.enum(['en_planificacion', 'en_proceso', 'en_construccion', 'completado', 'pausado'], {
    errorMap: () => ({ message: 'Selecciona un estado para el proyecto' }),
  }),
  fechaInicio: z.string().optional(),
  fechaFinEstimada: z.string().optional(),
  manzanas: z.array(manzanaSchema).min(1, 'Debe agregar al menos una manzana'),
}).refine(
  (data) => {
    // Solo validar si ambas fechas están presentes y no son strings vacías
    if (data.fechaInicio && data.fechaFinEstimada &&
        data.fechaInicio.trim() !== '' && data.fechaFinEstimada.trim() !== '') {
      return new Date(data.fechaFinEstimada) > new Date(data.fechaInicio)
    }
    return true
  },
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFinEstimada'],
  }
).refine(
  (data) => {
    // ✅ VALIDACIÓN: Fechas coherentes con estado del proyecto
    const ahora = new Date()
    const fechaInicio = data.fechaInicio ? new Date(data.fechaInicio) : null
    const fechaFin = data.fechaFinEstimada ? new Date(data.fechaFinEstimada) : null

    // Si está "completado", la fecha de fin no puede ser futura
    if (data.estado === 'completado' && fechaFin && fechaFin > ahora) {
      return false
    }

    // Si está "en_proceso" o "en_construccion", la fecha de inicio no puede ser futura
    if (
      (data.estado === 'en_proceso' || data.estado === 'en_construccion') &&
      fechaInicio &&
      fechaInicio > ahora
    ) {
      return false
    }

    return true
  },
  {
    message: 'Las fechas no son coherentes con el estado del proyecto',
    path: ['estado'],
  }
)

// ✅ Schema factory: permite acceso a initialData e isEditing para validaciones async
const createProyectoSchema = (params: { initialData?: Partial<ProyectoFormData>, isEditing: boolean }) => {
  return proyectoSchema.superRefine(async (data, ctx) => {
    // ✅ Validación async: Verificar nombres duplicados de PROYECTOS
    if (data.nombre && data.nombre.length >= 3) {
      // No validar si es el mismo nombre en modo edición
      if (params.isEditing && data.nombre === params.initialData?.nombre) {
        return
      }

      try {
        const existe = await proyectosService.verificarNombreDuplicado(
          data.nombre,
          params.isEditing ? params.initialData?.id : undefined
        )

        if (existe) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Ya existe un proyecto con el nombre "${data.nombre}"`,
            path: ['nombre'],
          })
        }
      } catch (error) {
        console.error('Error al validar nombre duplicado:', error)
        // No bloqueamos el submit si falla la validación async
      }
    }

    // ✅ Validación síncrona: Verificar nombres únicos de MANZANAS dentro del proyecto
    if (data.manzanas && data.manzanas.length > 1) {
      const nombresNormalizados = data.manzanas.map(m => m.nombre.trim().toLowerCase())
      const duplicados = nombresNormalizados.filter((nombre, index) =>
        nombresNormalizados.indexOf(nombre) !== index
      )

      if (duplicados.length > 0) {
        // Encontrar índice de la primera manzana duplicada
        const indiceDuplicado = nombresNormalizados.findIndex((nombre, index) =>
          nombresNormalizados.indexOf(nombre) !== index
        )

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Ya existe una manzana con este nombre en el proyecto`,
          path: ['manzanas', indiceDuplicado, 'nombre'],
        })
      }
    }

    // ✅ Validación síncrona: Verificar formato de ubicación (evitar genéricas)
    if (data.ubicacion) {
      const ubicacionNormalizada = data.ubicacion.trim().toLowerCase()
      const ubicacionesGenericas = ['sin ubicación', 'n/a', 'na', 'sin definir', 'por definir', 'tbd']

      if (ubicacionesGenericas.includes(ubicacionNormalizada)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La ubicación debe ser específica (ej: Calle 123 #45-67, Bogotá)',
          path: ['ubicacion'],
        })
      }
    }
  })
}

type ProyectoFormSchema = z.infer<typeof proyectoSchema>

// ==================== TIPOS ====================
interface UseProyectosFormParams {
  initialData?: Partial<ProyectoFormData>
  onSubmit: (data: ProyectoFormData) => void | Promise<void>
  isEditing?: boolean
  onHasChanges?: (hasChanges: boolean) => void // ✅ Callback para notificar cambios al padre
}

export function useProyectosForm({
  initialData,
  onSubmit,
  isEditing = false,
  onHasChanges,
}: UseProyectosFormParams) {
  // Estado para spinner de validación de nombre
  const [validandoNombre, setValidandoNombre] = useState(false)

  // ✅ OPTIMIZACIÓN: Si initialData ya tiene validación (de useProyectoConValidacion),
  // construir Map desde initialData en vez de consultar DB
  const manzanasConValidacionInicial = initialData?.manzanas?.filter(m => m.id && m.esEditable !== undefined)
  const validacionPrecargada = manzanasConValidacionInicial && manzanasConValidacionInicial.length > 0

  // Hook de validación de manzanas editables (solo si NO hay validación precargada)
  const {
    manzanasState,
    validarManzanas,
    cargando: validandoManzanas,
    puedeEliminar,
    puedeEditar,
    obtenerMotivoBloqueado,
  } = useManzanasEditables()

  // React Hook Form con schema que incluye validación async
  const schemaConValidacionAsync = useMemo(
    () => createProyectoSchema({ initialData, isEditing }),
    [initialData?.id, initialData?.nombre, isEditing]
  )

  // React Hook Form con schema SIN validación async (para evitar validación constante)
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    clearErrors,
    trigger,
    formState: { errors, touchedFields, isValidating },
  } = useForm<ProyectoFormSchema>({
    resolver: zodResolver(proyectoSchema), // ← Schema básico SIN validación async
    mode: 'onBlur', // ← Validar al salir del campo
    reValidateMode: 'onSubmit', // ← CRÍTICO: No re-validar en cada cambio, solo al enviar
    defaultValues: {
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      ubicacion: initialData?.ubicacion || '',
      estado: initialData?.estado || 'en_planificacion',
      fechaInicio: initialData?.fechaInicio?.split('T')[0] || '',
      fechaFinEstimada: initialData?.fechaFinEstimada?.split('T')[0] || '',
      manzanas: initialData?.manzanas || [],
    },
  })

  // useFieldArray para manzanas
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'manzanas',
  })

  // Watch manzanas para calcular totales
  const manzanasWatch = watch('manzanas')

  // ==================== EFECTOS ====================
  // 🔄 CRÍTICO: Reset del formulario cuando initialData cambia (ej: después de actualización exitosa)
  // ⚠️ SOLO resetear cuando el ID del proyecto cambia, NO en cada render
  useEffect(() => {
    if (!initialData) return

    reset({
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      ubicacion: initialData?.ubicacion || '',
      estado: initialData?.estado || 'en_planificacion',
      fechaInicio: initialData?.fechaInicio?.split('T')[0] || '',
      fechaFinEstimada: initialData?.fechaFinEstimada?.split('T')[0] || '',
      manzanas: initialData?.manzanas || [],
    })
  }, [initialData?.id, reset]) // ✅ Solo cuando cambia el ID (proyecto diferente)

  // ✅ OPTIMIZACIÓN: Validar manzanas SOLO si NO hay validación precargada
  useEffect(() => {
    if (validacionPrecargada) {
      console.log('⚡ [FORM] Validación precargada detectada, saltando consultas DB')
      return
    }

    // Validación tradicional (solo si no hay datos precargados)
    if (isEditing && manzanasWatch && manzanasWatch.length > 0) {
      const manzanasIds = manzanasWatch
        .map(m => m.id)
        .filter(Boolean) as string[]

      if (manzanasIds.length > 0) {
        console.log('🔍 [FORM] Validando manzanas desde DB (sin precarga)...')
        validarManzanas(manzanasIds)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, validacionPrecargada]) // Solo ejecutar al montar si no hay precarga

  // ==================== CÁLCULOS ====================
  const totalManzanas = useMemo(() => {
    return fields.length
  }, [fields.length])

  const totalViviendas = useMemo(() => {
    return manzanasWatch?.reduce((sum, m) => sum + (m.totalViviendas || 0), 0) || 0
  }, [manzanasWatch])

  // ==================== DETECCIÓN DE CAMBIOS (solo en modo edición) ====================
  const {
    hasChanges,
    changes,
    changesCount,
    isFieldChanged,
  } = useFormChanges(
    {
      nombre: watch('nombre'),
      ubicacion: watch('ubicacion'),
      descripcion: watch('descripcion'),
      estado: watch('estado'),
      fechaInicio: watch('fechaInicio'),
      fechaFinEstimada: watch('fechaFinEstimada'),
      responsable: watch('responsable'),
      manzanas: manzanasWatch,
    },
    {
      nombre: initialData?.nombre || '',
      ubicacion: initialData?.ubicacion || '',
      descripcion: initialData?.descripcion || '',
      estado: initialData?.estado || 'en_planificacion',
      fechaInicio: initialData?.fechaInicio?.split('T')[0] || '',
      fechaFinEstimada: initialData?.fechaFinEstimada?.split('T')[0] || '',
      responsable: initialData?.responsable || '',
      manzanas: initialData?.manzanas || [],
    },
    {
      fieldLabels: {
        nombre: 'Nombre del Proyecto',
        ubicacion: 'Ubicación',
        descripcion: 'Descripción',
        estado: 'Estado',
        fechaInicio: 'Fecha de Inicio',
        fechaFinEstimada: 'Fecha de Fin Estimada',
        responsable: 'Responsable',
        manzanas: 'Manzanas',
      },
    }
  )

  // Solo habilitar detección de cambios en modo edición
  const shouldShowChanges = isEditing
  const canSave = isEditing ? hasChanges : true // En creación siempre puede guardar

  // ✅ Notificar al padre cuando cambie hasChanges
  useEffect(() => {
    onHasChanges?.(hasChanges)
  }, [hasChanges, onHasChanges])

  // ==================== HANDLERS ====================
  const handleAgregarManzana = () => {
    append({
      nombre: `${String.fromCharCode(65 + fields.length)}`,
      totalViviendas: 0,
    })
  }

  const handleEliminarManzana = (index: number) => {
    // En modo edición, verificar si la manzana puede ser eliminada
    if (isEditing && manzanasWatch) {
      const manzana = manzanasWatch[index]
      if (manzana.id && !puedeEliminar(manzana.id)) {
        const motivo = obtenerMotivoBloqueado(manzana.id)
        alert(`❌ No se puede eliminar esta manzana\n\n${motivo}\n\nLas manzanas con viviendas creadas están protegidas para mantener la integridad de datos.`)
        return
      }
    }
    remove(index)
  }

  const onSubmitForm = async (data: ProyectoFormSchema) => {
    // ✅ VALIDACIÓN DE DUPLICADOS: Solo al enviar el formulario
    if (data.nombre && data.nombre !== initialData?.nombre) {
      try {
        const esDuplicado = await proyectosService.verificarNombreDuplicado(
          data.nombre,
          isEditing ? initialData?.id : undefined
        )

        if (esDuplicado) {
          setError('nombre', {
            type: 'manual',
            message: 'Ya existe un proyecto con este nombre'
          })
          return // Detener envío
        }
      } catch (error) {
        console.error('Error validando nombre:', error)
        setError('nombre', {
          type: 'manual',
          message: 'Error al validar el nombre. Intenta de nuevo.'
        })
        return
      }
    }

    // ✅ FIX: En modo edición, enviar TODOS los campos del formulario
    if (isEditing) {
      // Modo edición: Enviar todos los campos editables
      const formDataEdicion: ProyectoFormData = {
        ...data,
        // Agregar campos faltantes a las manzanas (preservando IDs)
        manzanas: data.manzanas.map(m => ({
          ...m,
          precioBase: 0,
          superficieTotal: 0,
          ubicacion: '',
        })),
        // Convertir fechas opcionales de input (YYYY-MM-DD) a ISO con hora mediodía
        fechaInicio: data.fechaInicio && data.fechaInicio.trim() !== ''
          ? `${data.fechaInicio}T12:00:00`
          : null,
        fechaFinEstimada: data.fechaFinEstimada && data.fechaFinEstimada.trim() !== ''
          ? `${data.fechaFinEstimada}T12:00:00`
          : null,
      } as ProyectoFormData

      console.log('📝 [FORM] Datos de edición preparados:', formDataEdicion)
      onSubmit(formDataEdicion)
    } else {
      // Modo creación: Completar con valores por defecto
      const formDataCompleto: ProyectoFormData = {
        ...data,
        manzanas: data.manzanas.map(m => ({
          ...m,
          precioBase: 0,
          superficieTotal: 0,
          ubicacion: '',
        })),
        // Convertir fechas de input (YYYY-MM-DD) a ISO con hora mediodía
        // Si están vacías, enviar null (las fechas son opcionales)
        fechaInicio: data.fechaInicio && data.fechaInicio.trim() !== ''
          ? `${data.fechaInicio}T12:00:00`
          : null,
        fechaFinEstimada: data.fechaFinEstimada && data.fechaFinEstimada.trim() !== ''
          ? `${data.fechaFinEstimada}T12:00:00`
          : null,
        presupuesto: 0,
      }

      console.log('📋 [FORM] Datos de creación preparados:', formDataCompleto)
      onSubmit(formDataCompleto)
    }
  }

  // ==================== HELPERS ====================
  const getButtonText = (isEditing: boolean) => {
    return isEditing ? 'Actualizar Proyecto' : 'Crear Proyecto'
  }

  const canRemoveManzana = () => {
    return fields.length > 1
  }

  /**
   * Verifica si una manzana específica puede ser editada/eliminada
   */
  const esManzanaEditable = (index: number): boolean => {
    if (!isEditing) return true // En modo creación, todo es editable

    const manzana = manzanasWatch?.[index]
    if (!manzana || !manzana.id) return true // Manzana nueva (sin ID), es editable

    // ✅ OPTIMIZACIÓN: Usar validación precargada si existe
    if (manzana.esEditable !== undefined) {
      return manzana.esEditable
    }

    // Fallback: usar validación de DB
    return puedeEditar(manzana.id)
  }

  /**
   * Verifica si una manzana específica puede ser eliminada
   */
  const esManzanaEliminable = (index: number): boolean => {
    if (!isEditing) return canRemoveManzana() // En modo creación, validar cantidad mínima

    const manzana = manzanasWatch?.[index]
    if (!manzana || !manzana.id) return true // Manzana nueva, puede eliminarse

    // ✅ OPTIMIZACIÓN: Usar validación precargada si existe
    if (manzana.esEditable !== undefined) {
      return manzana.esEditable
    }

    // Fallback: usar validación de DB
    return puedeEliminar(manzana.id)
  }

  /**
   * Obtiene el motivo por el cual una manzana está bloqueada
   */
  const obtenerMotivoBloqueadoLocal = (manzanaId: string): string => {
    // ✅ OPTIMIZACIÓN: Buscar en manzanas precargadas primero
    const manzanaPrecargada = manzanasWatch?.find(m => m.id === manzanaId)
    if (manzanaPrecargada?.motivoBloqueado) {
      return manzanaPrecargada.motivoBloqueado
    }

    // Fallback: usar validación de DB
    return obtenerMotivoBloqueado(manzanaId)
  }

  return {
    // Form state
    register,
    handleSubmit: handleSubmit(onSubmitForm),
    control,
    errors,
    touchedFields, // ← Exportar para validación progresiva

    // Field array
    fields,
    handleAgregarManzana,
    handleEliminarManzana,

    // Computed values
    totalManzanas,
    totalViviendas,
    manzanasWatch, // ✅ Exportar para acceder a valores reales

    // Detección de cambios
    hasChanges,
    changes,
    changesCount,
    isFieldChanged,
    shouldShowChanges,
    canSave,

    // Helpers
    getButtonText,
    canRemoveManzana,
    esManzanaEditable,
    esManzanaEliminable,
    obtenerMotivoBloqueado: obtenerMotivoBloqueadoLocal,

    // Validación state
    validandoManzanas,
    validandoNombre: false, // ✅ Validación solo al enviar, no mostrar spinner en campo
    manzanasState,
  }
}
