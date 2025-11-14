'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Calendar } from 'lucide-react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

interface FechasInputsProps {
  moduleName?: ModuleName
  register: UseFormRegister<any>
  errors: FieldErrors
}

export function FechasInputs({
  moduleName = 'proyectos',
  register,
  errors,
}: FechasInputsProps) {
  const theme = moduleThemes[moduleName]

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
        <Calendar size={14} />
        Fechas (opcional)
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Fecha del documento */}
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Fecha del documento
          </label>
          <input
            {...register('fecha_documento')}
            type="date"
            max={new Date().toISOString().split('T')[0]}
            className={cn(
              'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
              'focus:ring-2 focus:border-transparent',
              errors.fecha_documento
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-700'
            )}
            style={{
              ...(errors.fecha_documento
                ? {}
                : {
                    '--tw-ring-color': theme.colors.light,
                  } as React.CSSProperties),
            }}
          />
          {errors.fecha_documento && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle size={12} />
              {errors.fecha_documento.message as string}
            </motion.p>
          )}
        </div>

        {/* Fecha de vencimiento */}
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
            <AlertCircle size={12} />
            Vencimiento
          </label>
          <input
            {...register('fecha_vencimiento')}
            type="date"
            className={cn(
              'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
              'focus:ring-2 focus:border-transparent',
              errors.fecha_vencimiento
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-700'
            )}
            style={{
              ...(errors.fecha_vencimiento
                ? {}
                : {
                    '--tw-ring-color': theme.colors.light,
                  } as React.CSSProperties),
            }}
          />
          {errors.fecha_vencimiento && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle size={12} />
              {errors.fecha_vencimiento.message as string}
            </motion.p>
          )}
          {!errors.fecha_vencimiento && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Solo si expira
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
