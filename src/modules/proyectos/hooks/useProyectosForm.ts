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
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'
import { useFormChanges } from '@/shared/hooks/useFormChanges'

import {
  proyectoSchema,
  type ProyectoFormSchema,
} from '../schemas/proyecto.schemas'
import { proyectosService } from '../services/proyectos.service'
import type { ProyectoFormData } from '../types'
export type { ProyectoFormSchema }

import { useManzanasEditables } from './useManzanasEditables'

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
  // Estado para spinner de validación de nombre - gestionado en retorno
  // const [validandoNombre, setValidandoNombre] = useState(false)

  // ✅ OPTIMIZACIÓN: Si initialData ya tiene validación (de useProyectoConValidacion),
  // construir Map desde initialData en vez de consultar DB
  const manzanasConValidacionInicial = initialData?.manzanas?.filter(
    m => m.id && m.esEditable !== undefined
  )
  const validacionPrecargada =
    manzanasConValidacionInicial && manzanasConValidacionInicial.length > 0

  // Hook de validación de manzanas editables (solo si NO hay validación precargada)
  const {
    manzanasState,
    validarManzanas,
    cargando: validandoManzanas,
    puedeEliminar,
    puedeEditar,
    obtenerMotivoBloqueado,
  } = useManzanasEditables()

  // React Hook Form con schema que incluye validación async (no utilizado actualmente)
  // const schemaConValidacionAsync = ...
  // React Hook Form con schema SIN validación async (para evitar validación constante)
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    trigger,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<ProyectoFormSchema>({
    resolver: zodResolver(proyectoSchema), // â† Schema básico SIN validación async
    mode: 'onBlur', // â† Validar al salir del campo
    reValidateMode: 'onSubmit', // â† CRÍTICO: No re-validar en cada cambio, solo al enviar
    defaultValues: {
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      departamento: initialData?.departamento || '',
      ciudad: initialData?.ciudad || '',
      direccion: initialData?.direccion || '',
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
      departamento: initialData?.departamento || '',
      ciudad: initialData?.ciudad || '',
      direccion: initialData?.direccion || '',
      estado: initialData?.estado || 'en_planificacion',
      fechaInicio: initialData?.fechaInicio?.split('T')[0] || '',
      fechaFinEstimada: initialData?.fechaFinEstimada?.split('T')[0] || '',
      manzanas: initialData?.manzanas || [],
    })
  }, [initialData, reset]) // ✅ Solo cuando cambia el ID (proyecto diferente)

  // ✅ OPTIMIZACIÓN: Validar manzanas SOLO si NO hay validación precargada
  useEffect(() => {
    if (validacionPrecargada) {
      return
    }

    // Validación tradicional (solo si no hay datos precargados)
    if (isEditing && manzanasWatch && manzanasWatch.length > 0) {
      const manzanasIds = manzanasWatch
        .map(m => m.id)
        .filter(Boolean) as string[]

      if (manzanasIds.length > 0) {
        validarManzanas(manzanasIds)
      }
    }
  }, [isEditing, validacionPrecargada, validarManzanas, manzanasWatch])

  // ==================== CÁLCULOS ====================
  const totalManzanas = useMemo(() => {
    return fields.length
  }, [fields.length])

  const totalViviendas = useMemo(() => {
    return (
      manzanasWatch?.reduce((sum, m) => sum + (m.totalViviendas || 0), 0) || 0
    )
  }, [manzanasWatch])

  // ==================== DETECCIÓN DE CAMBIOS (solo en modo edición) ====================
  const { hasChanges, changes, changesCount, isFieldChanged } = useFormChanges(
    {
      nombre: watch('nombre'),
      departamento: watch('departamento'),
      ciudad: watch('ciudad'),
      direccion: watch('direccion'),
      descripcion: watch('descripcion'),
      estado: watch('estado'),
      fechaInicio: watch('fechaInicio'),
      fechaFinEstimada: watch('fechaFinEstimada'),
      responsable: watch('responsable'),
      manzanas: manzanasWatch,
    },
    {
      nombre: initialData?.nombre || '',
      departamento: initialData?.departamento || '',
      ciudad: initialData?.ciudad || '',
      direccion: initialData?.direccion || '',
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
        departamento: 'Departamento',
        ciudad: 'Ciudad',
        direccion: 'Dirección',
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
  const MAX_MANZANAS = 20
  const canAgregarManzana = fields.length < MAX_MANZANAS

  const handleAgregarManzana = () => {
    if (!canAgregarManzana) {
      toast.warning(
        `Has alcanzado el límite de ${MAX_MANZANAS} manzanas por proyecto`
      )
      return
    }
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
        toast.error(`No se puede eliminar esta manzana: ${motivo}`)
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
            message: 'Ya existe un proyecto con este nombre',
          })
          return // Detener envío
        }
      } catch (error) {
        logger.error('Error validando nombre:', error)
        setError('nombre', {
          type: 'manual',
          message: 'Error al validar el nombre. Intenta de nuevo.',
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
        fechaInicio:
          data.fechaInicio && data.fechaInicio.trim() !== ''
            ? `${data.fechaInicio}T12:00:00`
            : null,
        fechaFinEstimada:
          data.fechaFinEstimada && data.fechaFinEstimada.trim() !== ''
            ? `${data.fechaFinEstimada}T12:00:00`
            : null,
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
        // Convertir fechas de input (YYYY-MM-DD) a ISO con hora mediodía
        // Si están vacías, enviar null (las fechas son opcionales)
        fechaInicio:
          data.fechaInicio && data.fechaInicio.trim() !== ''
            ? `${data.fechaInicio}T12:00:00`
            : null,
        fechaFinEstimada:
          data.fechaFinEstimada && data.fechaFinEstimada.trim() !== ''
            ? `${data.fechaFinEstimada}T12:00:00`
            : null,
        presupuesto: 0,
      }

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
    touchedFields,
    trigger,
    watch,
    setValue,
    setError,
    // Field array
    fields,
    handleAgregarManzana,
    handleEliminarManzana,

    // Computed values
    totalManzanas,
    totalViviendas,
    manzanasWatch, // ✅ Exportar para acceder a valores reales
    canAgregarManzana,

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
