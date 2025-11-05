/**
 * useProyectosForm - Hook con lógica del formulario de proyectos
 * ✅ Separación de responsabilidades ESTRICTA
 * ✅ Validación con Zod
 * ✅ React Hook Form
 * ✅ Cálculos y transformaciones
 * ✅ Validación granular de manzanas editables
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ProyectoFormData } from '../types'
import { useManzanasEditables } from './useManzanasEditables'

// ==================== SCHEMAS ====================
const manzanaSchema = z.object({
  id: z.string().optional(), // ID real de la DB (si existe)
  nombre: z.string().min(1, 'El nombre de la manzana es obligatorio'),
  totalViviendas: z
    .number()
    .min(1, 'Mínimo 1 vivienda')
    .max(100, 'Máximo 100 viviendas'),
})

const proyectoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre del proyecto es obligatorio (mínimo 3 caracteres)')
    .max(255, 'Máximo 255 caracteres'),
  descripcion: z
    .string()
    .min(10, 'La descripción es obligatoria (mínimo 10 caracteres)'),
  ubicacion: z
    .string()
    .min(5, 'La ubicación es obligatoria (mínimo 5 caracteres)')
    .max(500, 'Máximo 500 caracteres'),
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
  // Hook de validación de manzanas editables
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
    formState: { errors },
  } = useForm<ProyectoFormSchema>({
    resolver: zodResolver(proyectoSchema),
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
  // Validar manzanas cuando se carga el formulario en modo edición
  useEffect(() => {
    if (isEditing && manzanasWatch && manzanasWatch.length > 0) {
      // Obtener IDs reales de las manzanas (no los IDs internos de useFieldArray)
      const manzanasIds = manzanasWatch
        .map(m => m.id)
        .filter(Boolean) as string[]

      console.log('🔍 Validando manzanas con IDs:', manzanasIds)

      if (manzanasIds.length > 0) {
        validarManzanas(manzanasIds)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, manzanasWatch?.length]) // Validar cuando cambia la cantidad de manzanas

  // ==================== CÁLCULOS ====================
  const totalManzanas = useMemo(() => {
    return fields.length
  }, [fields.length])

  const totalViviendas = useMemo(() => {
    return manzanasWatch?.reduce((sum, m) => sum + (m.totalViviendas || 0), 0) || 0
  }, [manzanasWatch])

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
        alert(obtenerMotivoBloqueado(manzana.id))
        return
      }
    }
    remove(index)
  }

  const onSubmitForm = (data: ProyectoFormSchema) => {
    // Completar con valores por defecto para los campos no incluidos en el formulario
    const formDataCompleto: ProyectoFormData = {
      ...data,
      // Agregar campos faltantes a las manzanas
      manzanas: data.manzanas.map(m => ({
        ...m,
        precioBase: 0,
        superficieTotal: 0,
        ubicacion: '',
      })),
      // Campos del proyecto con valores por defecto
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
    onSubmit(formDataCompleto)
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

    return puedeEditar(manzana.id)
  }

  /**
   * Verifica si una manzana específica puede ser eliminada
   */
  const esManzanaEliminable = (index: number): boolean => {
    if (!isEditing) return canRemoveManzana() // En modo creación, validar cantidad mínima

    const manzana = manzanasWatch?.[index]
    if (!manzana || !manzana.id) return true // Manzana nueva, puede eliminarse

    return puedeEliminar(manzana.id)
  }

  return {
    // Form state
    register,
    handleSubmit: handleSubmit(onSubmitForm),
    control,
    errors,

    // Field array
    fields,
    handleAgregarManzana,
    handleEliminarManzana,

    // Computed values
    totalManzanas,
    totalViviendas,
    manzanasWatch, // ✅ Exportar para acceder a valores reales

    // Helpers
    getButtonText,
    canRemoveManzana,
    esManzanaEditable,
    esManzanaEliminable,
    obtenerMotivoBloqueado,

    // Validación state
    validandoManzanas,
    manzanasState,
  }
}
