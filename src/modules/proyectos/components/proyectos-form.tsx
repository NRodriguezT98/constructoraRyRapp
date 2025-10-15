'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Building, Home, Layers, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '../../../shared/utils/helpers'
import type { ProyectoFormData } from '../types'
import { buttonClasses, fieldClasses, manzanaClasses, sectionClasses } from './proyectos-form.styles'

// Schema completo de validación
const manzanaSchema = z.object({
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

interface ProyectosFormProps {
  onSubmit: (data: ProyectoFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<ProyectoFormData>
}

export function ProyectosForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
}: ProyectosFormProps) {
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'manzanas',
  })

  const handleAgregarManzana = () => {
    append({
      nombre: `${String.fromCharCode(65 + fields.length)}`,
      totalViviendas: 0,
    })
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

  const totalManzanas = fields.length
  const totalViviendas =
    watch('manzanas')?.reduce((sum, m) => sum + (m.totalViviendas || 0), 0) || 0

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-5'>
      {/* Layout de 2 columnas en desktop, 1 en mobile */}
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        {/* COLUMNA IZQUIERDA: Información General */}
        <div className={sectionClasses.card}>
          <div className={sectionClasses.header}>
            <div className={sectionClasses.icon}>
              <Building className='h-4 w-4' />
            </div>
            <h3 className={sectionClasses.title}>Información General</h3>
          </div>

          <div className='space-y-4'>
            {/* Nombre */}
            <div>
              <label className={fieldClasses.label}>
                Nombre del Proyecto <span className='text-red-500'>*</span>
              </label>
              <input
                {...register('nombre')}
                className={cn(
                  fieldClasses.input,
                  errors.nombre && 'border-red-500 focus:border-red-500'
                )}
                placeholder='Ej: Urbanización Las Américas II'
              />
              {errors.nombre && (
                <p className={fieldClasses.error}>{errors.nombre.message}</p>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className={fieldClasses.label}>
                Ubicación <span className='text-red-500'>*</span>
              </label>
              <input
                {...register('ubicacion')}
                className={cn(
                  fieldClasses.input,
                  errors.ubicacion && 'border-red-500 focus:border-red-500'
                )}
                placeholder='Dirección completa del proyecto'
              />
              {errors.ubicacion && (
                <p className={fieldClasses.error}>{errors.ubicacion.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className={fieldClasses.label}>
                Descripción <span className='text-red-500'>*</span>
              </label>
              <textarea
                {...register('descripcion')}
                className={cn(
                  fieldClasses.textarea,
                  errors.descripcion && 'border-red-500 focus:border-red-500'
                )}
                placeholder='Describe las características principales del proyecto...'
                rows={5}
              />
              {errors.descripcion && (
                <p className={fieldClasses.error}>{errors.descripcion.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Manzanas */}
        <div className={sectionClasses.card}>
          <div className='flex items-center justify-between'>
            <div className={sectionClasses.header}>
              <div className={sectionClasses.icon}>
                <Layers className='h-4 w-4' />
              </div>
              <div>
                <h3 className={sectionClasses.title}>
                  Manzanas <span className='text-red-500'>*</span>
                </h3>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {totalManzanas} {totalManzanas === 1 ? 'manzana' : 'manzanas'} •{' '}
                  {totalViviendas} {totalViviendas === 1 ? 'vivienda' : 'viviendas'}
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={handleAgregarManzana}
              className={buttonClasses.add}
            >
              <Plus className='h-3.5 w-3.5' />
              Agregar
            </button>
          </div>

          {errors.manzanas && !Array.isArray(errors.manzanas) && (
            <p className={fieldClasses.error}>{errors.manzanas.message}</p>
          )}

          {fields.length === 0 ? (
            <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 py-8 text-center dark:border-gray-700 dark:bg-gray-800/30'>
              <Layers className='mx-auto mb-2 h-8 w-8 text-gray-400' />
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                No hay manzanas agregadas
              </p>
              <p className='mt-0.5 text-xs text-gray-400 dark:text-gray-500'>
                Haz clic en "Agregar" para comenzar
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {fields.map((field, index) => (
                <div key={field.id} className={manzanaClasses.card}>
                  <div className={manzanaClasses.header}>
                    <div className='flex items-center gap-2'>
                      <div className={manzanaClasses.icon}>
                        <Home className='h-3.5 w-3.5' />
                      </div>
                      <h4 className={manzanaClasses.title}>Manzana {index + 1}</h4>
                    </div>
                    <button
                      type='button'
                      onClick={() => remove(index)}
                      className={buttonClasses.delete}
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </button>
                  </div>

                  <div className={manzanaClasses.grid}>
                    {/* Nombre */}
                    <div>
                      <label className={manzanaClasses.label}>
                        Nombre <span className='text-red-500'>*</span>
                      </label>
                      <input
                        {...register(`manzanas.${index}.nombre`)}
                        className={cn(
                          manzanaClasses.input,
                          errors.manzanas?.[index]?.nombre && 'border-red-500'
                        )}
                        placeholder='A'
                      />
                      {errors.manzanas?.[index]?.nombre && (
                        <p className={manzanaClasses.error}>
                          {errors.manzanas[index]?.nombre?.message}
                        </p>
                      )}
                    </div>

                    {/* Total Viviendas */}
                    <div>
                      <label className={manzanaClasses.label}>
                        N° Viviendas <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='number'
                        {...register(`manzanas.${index}.totalViviendas`, {
                          valueAsNumber: true,
                        })}
                        className={cn(
                          manzanaClasses.input,
                          errors.manzanas?.[index]?.totalViviendas &&
                            'border-red-500'
                        )}
                        placeholder='0'
                        min='1'
                      />
                      {errors.manzanas?.[index]?.totalViviendas && (
                        <p className={manzanaClasses.error}>
                          {errors.manzanas[index]?.totalViviendas?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className='flex justify-end gap-3'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isLoading}
          className={buttonClasses.secondary}
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={isLoading}
          className={buttonClasses.primary}
        >
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <span className='animate-spin'>⏳</span>
              Guardando...
            </span>
          ) : (
            <span className='flex items-center gap-2'>
              <Building className='h-4 w-4' />
              Crear Proyecto
            </span>
          )}
        </button>
      </div>
    </form>
  )
}
