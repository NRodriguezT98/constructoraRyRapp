'use client'

import type { CSSProperties } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { FieldErrors, Path, UseFormRegister } from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import type { DocumentoFormValuesBase } from './documento-form.types'

interface TituloInputProps<TFormValues extends DocumentoFormValuesBase> {
  moduleName?: ModuleName
  register: UseFormRegister<TFormValues>
  errors: FieldErrors<TFormValues>
  value?: string
}

export function TituloInput<TFormValues extends DocumentoFormValuesBase>({
  moduleName = 'proyectos',
  register,
  errors,
  value,
}: TituloInputProps<TFormValues>) {
  const theme = moduleThemes[moduleName]
  const tituloField = 'titulo' as Path<TFormValues>

  return (
    <div>
      <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
        Título del documento <span className='text-red-500'>*</span>
      </label>
      <div className='relative'>
        <input
          {...register(tituloField)}
          type='text'
          placeholder='Ej: Licencia de Construcción 2024'
          maxLength={200}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 pr-9 text-sm transition-all dark:bg-gray-900/50',
            `focus:border-transparent focus:ring-2`,
            errors.titulo
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700'
          )}
          style={{
            ...(errors.titulo
              ? {}
              : ({
                  '--tw-ring-color': theme.colors.light,
                } as CSSProperties)),
          }}
        />
        {/* Indicador de estado */}
        {value && (
          <div className='absolute right-2.5 top-1/2 -translate-y-1/2'>
            {errors.titulo ? (
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
      {errors.titulo && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'
        >
          <AlertCircle size={12} />
          {errors.titulo.message as string}
        </motion.p>
      )}
      {!errors.titulo && (
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
          Mínimo 3 caracteres, máximo 200
        </p>
      )}
    </div>
  )
}
