'use client'

import { motion } from 'framer-motion'
import { Home, Plus, Trash2 } from 'lucide-react'
import type {
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form'

import {
  AccordionWizardField,
  fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'

import type { ProyectoFormSchema } from '../../hooks/useProyectosForm'

interface ManzanaFormValues {
  id?: string
  nombre: string
  totalViviendas: number
}

interface PasoManzanasProps {
  register: UseFormRegister<ProyectoFormSchema>
  errors: FieldErrors
  fields: FieldArrayWithId[]
  manzanasWatch: ManzanaFormValues[]
  totalManzanas: number
  totalViviendas: number
  onAgregar: () => void
  onEliminar: (index: number) => void
  canAgregar?: boolean
}

/**
 * Paso 3: Manzanas (array dinámico de manzana: nombre + totalViviendas)
 */
export function PasoManzanas({
  register,
  errors,
  fields,
  manzanasWatch: _manzanasWatch,
  totalManzanas,
  totalViviendas,
  onAgregar,
  onEliminar,
  canAgregar = true,
}: PasoManzanasProps) {
  const manzanasErrors = errors.manzanas as
    | (Record<string, { message?: string }>[] & { message?: string })
    | undefined

  return (
    <div className='space-y-4 pt-4'>
      {/* Resumen rápido */}
      <motion.div
        {...fieldStaggerAnim(0)}
        className='flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950/20'
      >
        <div className='flex items-center gap-2 text-sm'>
          <span className='font-semibold text-green-700 dark:text-green-300'>
            {totalManzanas}
          </span>
          <span className='text-green-600 dark:text-green-400'>manzana(s)</span>
        </div>
        <div className='h-4 w-px bg-green-300 dark:bg-green-700' />
        <div className='flex items-center gap-2 text-sm'>
          <Home className='h-3.5 w-3.5 text-green-500' />
          <span className='font-semibold text-green-700 dark:text-green-300'>
            {totalViviendas}
          </span>
          <span className='text-green-600 dark:text-green-400'>
            vivienda(s) total
          </span>
        </div>
      </motion.div>

      {/* Manzanas existentes */}
      <div className='space-y-3'>
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            {...fieldStaggerAnim(index + 1)}
            className='flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'
          >
            <div className='grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2'>
              <AccordionWizardField
                label={`Manzana ${index + 1} - Nombre`}
                moduleName='proyectos'
                required
                error={manzanasErrors?.[index]?.nombre?.message}
                {...register(`manzanas.${index}.nombre`)}
              />
              <AccordionWizardField
                label='Cantidad de viviendas'
                type='number'
                moduleName='proyectos'
                required
                error={manzanasErrors?.[index]?.totalViviendas?.message}
                {...register(`manzanas.${index}.totalViviendas`, {
                  valueAsNumber: true,
                })}
              />
            </div>
            {fields.length > 1 ? (
              <button
                type='button'
                onClick={() => onEliminar(index)}
                className='mt-3 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'
                aria-label={`Eliminar manzana ${index + 1}`}
              >
                <Trash2 className='h-4 w-4' />
              </button>
            ) : null}
          </motion.div>
        ))}
      </div>

      {/* Error global de manzanas */}
      {typeof manzanasErrors?.message === 'string' ? (
        <p className='flex items-center gap-1 text-xs text-red-500 dark:text-red-400'>
          <span className='inline-block h-1 w-1 rounded-full bg-red-500' />
          {manzanasErrors.message}
        </p>
      ) : null}

      {/* Agregar manzana */}
      <div className='space-y-1.5'>
        <button
          type='button'
          onClick={onAgregar}
          disabled={!canAgregar}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors ${
            canAgregar
              ? 'border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-950/20'
              : 'cursor-not-allowed border-gray-200 text-gray-400 opacity-60 dark:border-gray-700 dark:text-gray-600'
          }`}
        >
          <Plus className='h-4 w-4' />
          Agregar manzana
        </button>
        {!canAgregar ? (
          <p className='text-center text-xs text-gray-400 dark:text-gray-500'>
            Límite de 20 manzanas alcanzado
          </p>
        ) : null}
      </div>
    </div>
  )
}
