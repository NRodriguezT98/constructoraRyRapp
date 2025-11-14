'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

interface DescripcionTextareaProps {
  moduleName?: ModuleName
  register: UseFormRegister<any>
  errors: FieldErrors
  value?: string
  rows?: number
}

export function DescripcionTextarea({
  moduleName = 'proyectos',
  register,
  errors,
  value,
  rows = 2,
}: DescripcionTextareaProps) {
  const theme = moduleThemes[moduleName]

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Descripción
      </label>
      <div className="relative">
        <textarea
          {...register('descripcion')}
          rows={rows}
          placeholder="Descripción opcional del documento..."
          maxLength={1000}
          className={cn(
            'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all resize-none',
            'focus:ring-2 focus:border-transparent',
            errors.descripcion
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700'
          )}
          style={{
            ...(errors.descripcion
              ? {}
              : {
                  '--tw-ring-color': theme.colors.light,
                } as React.CSSProperties),
          }}
        />
        {/* Indicador de estado */}
        {value && (
          <div className="absolute right-2.5 top-2.5">
            {errors.descripcion ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4" style={{ color: theme.colors.primary }} />
            )}
          </div>
        )}
      </div>
      {errors.descripcion && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <AlertCircle size={12} />
          {errors.descripcion.message as string}
        </motion.p>
      )}
      {!errors.descripcion && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Opcional, máximo 1000 caracteres
        </p>
      )}
    </div>
  )
}
