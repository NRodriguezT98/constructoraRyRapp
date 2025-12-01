/**
 * PasoLinderosNuevo - Paso 2: Linderos de la vivienda
 * ✅ Diseño compacto estándar
 * ✅ 4 linderos (Norte, Sur, Oriente, Occidente)
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Compass, Lightbulb } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { cn } from '@/shared/utils/helpers'

import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'

interface PasoLinderosProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
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
      className="space-y-3"
    >
      {/* Título del paso */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Linderos de la Vivienda
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define los límites de la vivienda en cada dirección
        </p>
      </div>

      {/* Consejo */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
            Consejo
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Describe claramente cada límite de la vivienda. Por ejemplo: "Por el Norte con la Calle 123",
            "Por el Sur con el lote 45", etc.
          </p>
        </div>
      </div>

      {/* Grid de linderos */}
      <div className={styles.linderos.grid}>
        {linderos.map(lindero => (
          <div key={lindero.id} className={styles.field.container}>
            <label htmlFor={lindero.id} className={styles.field.label}>
              {lindero.icon} {lindero.label} <span className={styles.field.required}>*</span>
            </label>
            <div className={styles.field.inputWrapper}>
              <Compass className={styles.field.inputIcon} />
              <textarea
                {...register(lindero.id)}
                id={lindero.id}
                rows={2}
                placeholder={lindero.placeholder}
                className={cn(
                  styles.field.textarea,
                  errors[lindero.id] && styles.field.inputError
                )}
              />
            </div>
            {errors[lindero.id] && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.field.error}
              >
                <AlertCircle className={styles.field.errorIcon} />
                {errors[lindero.id]?.message as string}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
