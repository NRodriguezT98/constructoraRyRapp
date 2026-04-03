'use client'

import type { CSSProperties } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, Calendar } from 'lucide-react'
import type { FieldErrors, Path, UseFormRegister } from 'react-hook-form'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import type { DocumentoFormValuesBase } from './documento-form.types'

interface FechasInputsProps<TFormValues extends DocumentoFormValuesBase> {
  moduleName?: ModuleName
  register: UseFormRegister<TFormValues>
  errors: FieldErrors<TFormValues>
}

export function FechasInputs<TFormValues extends DocumentoFormValuesBase>({
  moduleName = 'proyectos',
  register,
  errors,
}: FechasInputsProps<TFormValues>) {
  const theme = moduleThemes[moduleName]
  const fechaDocumentoField = 'fecha_documento' as Path<TFormValues>
  const fechaVencimientoField = 'fecha_vencimiento' as Path<TFormValues>

  return (
    <div>
      <label className='mb-1.5 block flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
        <Calendar size={14} />
        Fechas (opcional)
      </label>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        {/* Fecha del documento */}
        <div>
          <label className='mb-1 block text-xs text-gray-600 dark:text-gray-400'>
            Fecha del documento
          </label>
          <input
            {...register(fechaDocumentoField)}
            type='date'
            max={getTodayDateString()}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all dark:bg-gray-900/50',
              'focus:border-transparent focus:ring-2',
              errors.fecha_documento
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-700'
            )}
            style={{
              ...(errors.fecha_documento
                ? {}
                : ({
                    '--tw-ring-color': theme.colors.light,
                  } as CSSProperties)),
            }}
          />
          {errors.fecha_documento && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'
            >
              <AlertCircle size={12} />
              {errors.fecha_documento.message as string}
            </motion.p>
          )}
        </div>

        {/* Fecha de vencimiento */}
        <div>
          <label className='mb-1 block flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400'>
            <AlertCircle size={12} />
            Vencimiento
          </label>
          <input
            {...register(fechaVencimientoField)}
            type='date'
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all dark:bg-gray-900/50',
              'focus:border-transparent focus:ring-2',
              errors.fecha_vencimiento
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-700'
            )}
            style={{
              ...(errors.fecha_vencimiento
                ? {}
                : ({
                    '--tw-ring-color': theme.colors.light,
                  } as CSSProperties)),
            }}
          />
          {errors.fecha_vencimiento && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'
            >
              <AlertCircle size={12} />
              {errors.fecha_vencimiento.message as string}
            </motion.p>
          )}
          {!errors.fecha_vencimiento && (
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              Solo si expira
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
