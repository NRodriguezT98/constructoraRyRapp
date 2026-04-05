/**
 * PasoLinderosNuevo - Paso 2: Linderos de la vivienda
 * ✅ Diseño compacto estándar
 * ✅ 4 linderos (Norte, Sur, Oriente, Occidente)
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Compass, Lightbulb } from 'lucide-react'
import type { FieldErrors, Path, UseFormRegister } from 'react-hook-form'

import { cn } from '@/shared/utils/helpers'

import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'

interface PasoLinderosProps {
  register: UseFormRegister<ViviendaSchemaType>
  errors: FieldErrors<ViviendaSchemaType>
}

export function PasoLinderosNuevo({ register, errors }: PasoLinderosProps) {
  const linderos = [
    {
      id: 'lindero_norte',
      label: 'Lindero Norte',
      placeholder: 'Ej: Por el Norte con la Calle 123',
      icon: '⬆️',
    },
    {
      id: 'lindero_sur',
      label: 'Lindero Sur',
      placeholder: 'Ej: Por el Sur con el lote 45',
      icon: '⬇️',
    },
    {
      id: 'lindero_oriente',
      label: 'Lindero Oriente',
      placeholder: 'Ej: Por el Oriente con la Carrera 67',
      icon: '➡️',
    },
    {
      id: 'lindero_occidente',
      label: 'Lindero Occidente',
      placeholder: 'Ej: Por el Occidente con casa 89',
      icon: '⬅️',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className='space-y-3'
    >
      {/* Título del paso */}
      <div>
        <h2 className='mb-1 text-xl font-bold text-gray-900 dark:text-white'>
          Linderos de la Vivienda
        </h2>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Define los límites de la vivienda en cada dirección
        </p>
      </div>

      {/* Consejo */}
      <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20'>
        <Lightbulb className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
        <div>
          <p className='mb-1 text-sm font-medium text-amber-900 dark:text-amber-100'>
            Consejo
          </p>
          <p className='text-xs text-amber-700 dark:text-amber-300'>
            Describe claramente cada límite de la vivienda. Por ejemplo:
            &quot;Por el Norte con la Calle 123&quot;, &quot;Por el Sur con el
            lote 45&quot;, etc.
          </p>
        </div>
      </div>

      {/* Grid de linderos */}
      <div className={styles.linderos.grid}>
        {linderos.map(lindero => (
          <div key={lindero.id} className={styles.field.container}>
            <label htmlFor={lindero.id} className={styles.field.label}>
              {lindero.icon} {lindero.label}{' '}
              <span className={styles.field.required}>*</span>
            </label>
            <div className={styles.field.inputWrapper}>
              <Compass className={styles.field.inputIcon} />
              <textarea
                {...register(lindero.id as Path<ViviendaSchemaType>)}
                id={lindero.id}
                rows={2}
                placeholder={lindero.placeholder}
                className={cn(
                  styles.field.textarea,
                  errors[lindero.id as keyof ViviendaSchemaType] &&
                    styles.field.inputError
                )}
              />
            </div>
            {errors[lindero.id as keyof ViviendaSchemaType] && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.field.error}
              >
                <AlertCircle className={styles.field.errorIcon} />
                {
                  errors[lindero.id as keyof ViviendaSchemaType]
                    ?.message as string
                }
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
