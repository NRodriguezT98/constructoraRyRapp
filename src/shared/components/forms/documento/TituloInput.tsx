'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

interface TituloInputProps {
  moduleName?: ModuleName
  register: UseFormRegister<any>
  errors: FieldErrors
  value?: string
}

export function TituloInput({
  moduleName = 'proyectos',
  register,
  errors,
  value,
}: TituloInputProps) {
  const theme = moduleThemes[moduleName]

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Título del documento <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          {...register('titulo')}
          type="text"
          placeholder="Ej: Licencia de Construcción 2024"
          maxLength={200}
          className={cn(
            'w-full px-3 py-2 pr-9 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
            `focus:ring-2 focus:border-transparent`,
            errors.titulo
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700'
          )}
          style={{
            ...(errors.titulo
              ? {}
              : {
                  '--tw-ring-color': theme.colors.light,
                } as React.CSSProperties),
          }}
        />
        {/* Indicador de estado */}
        {value && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {errors.titulo ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4" style={{ color: theme.colors.primary }} />
            )}
          </div>
        )}
      </div>
      {errors.titulo && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <AlertCircle size={12} />
          {errors.titulo.message as string}
        </motion.p>
      )}
      {!errors.titulo && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Mínimo 3 caracteres, máximo 200
        </p>
      )}
    </div>
  )
}
