/**
 * useProyectosForm - Hook con lógica del formulario de proyectos
 * ✅ Separación de responsabilidades ESTRICTA
 * ✅ Validación con Zod
 * ✅ React Hook Form
 * ✅ Cálculos y transformaciones
 * ✅ Validación granular de manzanas editables
 */

import { useEffect, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import type { ProyectoFormData } from '../types'

import { useFormChanges } from '@/shared/hooks/useFormChanges'
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
    .number()
    .min(1, 'Mínimo 1 vivienda')
    .max(100, 'Máximo 100 viviendas'),
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
  manzanas: z.array(manzanaSchema).min(1, 'Debe agregar al menos una manzana'),
})

type ProyectoFormSchema = z.infer<typeof proyectoSchema>

// ==================== TIPOS ====================
interface UseProyectosFormParams {
  initialData?: Partial<ProyectoFormData>
  onSubmit: (data: ProyectoFormData) => void | Promise<void>
  isEditing?: boolean
}

export function useProyectosForm({
  initialData,
  onSubmit,
  isEditing = false,
}: UseProyectosFormParams) {
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

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, touchedFields },
  } = useForm<ProyectoFormSchema>({
    resolver: zodResolver(proyectoSchema),
    mode: 'onBlur', // ← Validar al salir del campo (UX no intrusiva)
    reValidateMode: 'onChange', // ← Si ya hay error, validar mientras corrige
    defaultValues: {
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      ubicacion: initialData?.ubicacion || '',
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
  useEffect(() => {
    reset({
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      ubicacion: initialData?.ubicacion || '',
      manzanas: initialData?.manzanas || [],
    })
  }, [initialData, reset])

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
      manzanas: manzanasWatch,
    },
    {
      nombre: initialData?.nombre || '',
      ubicacion: initialData?.ubicacion || '',
      descripcion: initialData?.descripcion || '',
      manzanas: initialData?.manzanas || [],
    },
    {
      fieldLabels: {
        nombre: 'Nombre del Proyecto',
        ubicacion: 'Ubicación',
        descripcion: 'Descripción',
        manzanas: 'Manzanas',
      },
    }
  )

  // Solo habilitar detección de cambios en modo edición
  const shouldShowChanges = isEditing
  const canSave = isEditing ? hasChanges : true // En creación siempre puede guardar

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

  const onSubmitForm = (data: ProyectoFormSchema) => {
    // ✅ FIX: En modo edición, SOLO enviar campos modificados del formulario
    if (isEditing) {
      // Modo edición: SOLO enviar nombre, descripción, ubicación y manzanas
      const formDataEdicion: ProyectoFormData = {
        ...data,
        // Agregar campos faltantes a las manzanas (preservando IDs)
        manzanas: data.manzanas.map(m => ({
          ...m,
          precioBase: 0,
          superficieTotal: 0,
          ubicacion: '',
        })),
        // ✅ CRÍTICO: NO sobrescribir fechas/estado en edición
        // El backend/service debe manejar estos campos
      } as ProyectoFormData

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
        fechaInicio: new Date().toISOString(),
        fechaFinEstimada: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
        presupuesto: 0,
        estado: 'en_planificacion',
        responsable: 'RyR Constructora',
        telefono: '+57 300 000 0000',
        email: 'info@ryrconstrucora.com',
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
    manzanasState,
  }
}
