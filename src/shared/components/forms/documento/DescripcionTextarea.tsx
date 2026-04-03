'use client'

import type { CSSProperties } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { FieldErrors, Path, UseFormRegister } from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import type { DocumentoFormValuesBase } from './documento-form.types'

interface DescripcionTextareaProps<
  TFormValues extends DocumentoFormValuesBase,
> {
  moduleName?: ModuleName
  register: UseFormRegister<TFormValues>
  errors: FieldErrors<TFormValues>
  value?: string
  rows?: number
}

export function DescripcionTextarea<
  TFormValues extends DocumentoFormValuesBase,
>({
  moduleName = 'proyectos',
  register,
  errors,
  value,
  rows = 2,
}: DescripcionTextareaProps<TFormValues>) {
  const theme = moduleThemes[moduleName]
  const descripcionField = 'descripcion' as Path<TFormValues>

  return (
    <div>
      <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
        Descripción
      </label>
      <div className='relative'>
        <textarea
          {...register(descripcionField)}
          rows={rows}
          placeholder='Descripción opcional del documento...'
          maxLength={1000}
          className={cn(
            'w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm transition-all dark:bg-gray-900/50',
            'focus:border-transparent focus:ring-2',
            errors.descripcion
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700'
          )}
          style={{
            ...(errors.descripcion
              ? {}
              : ({
                  '--tw-ring-color': theme.colors.light,
                } as CSSProperties)),
          }}
        />
        {/* Indicador de estado */}
        {value && (
          <div className='absolute right-2.5 top-2.5'>
            {errors.descripcion ? (
              <AlertCircle className='h-4 w-4 text-red-500' />
            ) : (
              <CheckCircle2
                className='h-4 w-4'
                style={{ color: theme.colors.primary }}
              />
            )}
          </div>
        )}
      </div>
      {errors.descripcion && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'
        >
          <AlertCircle size={12} />
          {errors.descripcion.message as string}
        </motion.p>
      )}
      {!errors.descripcion && (
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
          Opcional, máximo 1000 caracteres
        </p>
      )}
    </div>
  )
}
