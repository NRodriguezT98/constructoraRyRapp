'use client'

import { motion } from 'framer-motion'
import { Home, Lock, Plus, Trash2 } from 'lucide-react'
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
  cantidadViviendasCreadas?: number
  esEditable?: boolean
  motivoBloqueado?: string
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
 *
 * Reglas de negocio:
 * - Manzana con viviendas creadas (esEditable=false): no se puede eliminar (lock icon)
 * - totalViviendas no puede bajarse por debajo de cantidadViviendasCreadas (validado en schema)
 * - Siempre se puede agregar nuevas manzanas (hasta máximo 20)
 * - El nombre de la manzana siempre es editable
 */
export function PasoManzanas({
  register,
  errors,
  fields,
  manzanasWatch,
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
        {fields.map((field, index) => {
          const manzanaData = manzanasWatch[index]
          const estaBloqueada = manzanaData?.esEditable === false
          const viviendasCreadas = manzanaData?.cantidadViviendasCreadas ?? 0

          return (
            <motion.div
              key={field.id}
              {...fieldStaggerAnim(index + 1)}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                estaBloqueada
                  ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/10'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
              }`}
            >
              <div className='flex-1 space-y-3'>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <AccordionWizardField
                    label={`Manzana ${index + 1} - Nombre`}
                    moduleName='proyectos'
                    required
                    error={manzanasErrors?.[index]?.nombre?.message}
                    {...register(`manzanas.${index}.nombre`)}
                  />
                  <AccordionWizardField
                    label={
                      viviendasCreadas > 0
                        ? `Cantidad de viviendas (mín. ${viviendasCreadas} creada${viviendasCreadas !== 1 ? 's' : ''})`
                        : 'Cantidad de viviendas'
                    }
                    type='number'
                    moduleName='proyectos'
                    required
                    error={manzanasErrors?.[index]?.totalViviendas?.message}
                    {...register(`manzanas.${index}.totalViviendas`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                {/* Badge: viviendas ya creadas en esta manzana */}
                {viviendasCreadas > 0 ? (
                  <div className='flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400'>
                    <Home className='h-3 w-3 flex-shrink-0' />
                    <span>
                      {viviendasCreadas} vivienda
                      {viviendasCreadas !== 1 ? 's' : ''} ya creada
                      {viviendasCreadas !== 1 ? 's' : ''} — la cantidad no puede
                      bajarse por debajo de este valor
                    </span>
                  </div>
                ) : null}

                {/* Mensaje de bloqueo para eliminación */}
                {estaBloqueada ? (
                  <div className='flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-300'>
                    <Lock className='h-3.5 w-3.5 flex-shrink-0' />
                    <span>
                      {manzanaData.motivoBloqueado ||
                        'Esta manzana tiene viviendas creadas y no puede eliminarse.'}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Botón eliminar o candado */}
              {estaBloqueada ? (
                <div
                  className='mt-3 cursor-not-allowed rounded-lg p-2 text-amber-400 dark:text-amber-600'
                  title={
                    manzanaData.motivoBloqueado ||
                    'No se puede eliminar: tiene viviendas creadas'
                  }
                  aria-label='Manzana bloqueada, no se puede eliminar'
                >
                  <Lock className='h-4 w-4' />
                </div>
              ) : fields.length > 1 ? (
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
          )
        })}
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
