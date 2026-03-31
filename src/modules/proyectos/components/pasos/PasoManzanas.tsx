'use client'

import { motion } from 'framer-motion'
import { Home, Plus, Trash2 } from 'lucide-react'
import type { FieldArrayWithId, FieldErrors, UseFormRegister } from 'react-hook-form'

import { AccordionWizardField, fieldStaggerAnim } from '@/shared/components/accordion-wizard'

interface ManzanaFormValues {
  id?: string
  nombre: string
  totalViviendas: number
}

interface PasoManzanasProps {
  register: UseFormRegister<any>
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
  manzanasWatch,
  totalManzanas,
  totalViviendas,
  onAgregar,
  onEliminar,
  canAgregar = true,
}: PasoManzanasProps) {
  const manzanasErrors = (errors.manzanas as any)

  return (
    <div className="space-y-4 pt-4">
      {/* Resumen rápido */}
      <motion.div
        {...fieldStaggerAnim(0)}
        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-green-700 dark:text-green-300">{totalManzanas}</span>
          <span className="text-green-600 dark:text-green-400">manzana(s)</span>
        </div>
        <div className="w-px h-4 bg-green-300 dark:bg-green-700" />
        <div className="flex items-center gap-2 text-sm">
          <Home className="w-3.5 h-3.5 text-green-500" />
          <span className="font-semibold text-green-700 dark:text-green-300">{totalViviendas}</span>
          <span className="text-green-600 dark:text-green-400">vivienda(s) total</span>
        </div>
      </motion.div>

      {/* Manzanas existentes */}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            {...fieldStaggerAnim(index + 1)}
            className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AccordionWizardField
                label={`Manzana ${index + 1} - Nombre`}
                moduleName="proyectos"
                required
                error={manzanasErrors?.[index]?.nombre?.message}
                {...register(`manzanas.${index}.nombre`)}
              />
              <AccordionWizardField
                label="Cantidad de viviendas"
                type="number"
                moduleName="proyectos"
                required
                error={manzanasErrors?.[index]?.totalViviendas?.message}
                {...register(`manzanas.${index}.totalViviendas`, { valueAsNumber: true })}
              />
            </div>
            {fields.length > 1 ? (
              <button
                type="button"
                onClick={() => onEliminar(index)}
                className="mt-3 p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                aria-label={`Eliminar manzana ${index + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
          </motion.div>
        ))}
      </div>

      {/* Error global de manzanas */}
      {typeof manzanasErrors?.message === 'string' ? (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
          {manzanasErrors.message}
        </p>
      ) : null}

      {/* Agregar manzana */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onAgregar}
          disabled={!canAgregar}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors ${
            canAgregar
              ? 'border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-400 dark:hover:border-green-600'
              : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
          }`}
        >
          <Plus className="w-4 h-4" />
          Agregar manzana
        </button>
        {!canAgregar ? (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Límite de 20 manzanas alcanzado
          </p>
        ) : null}
      </div>
    </div>
  )
}
