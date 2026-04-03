'use client'

import { Star } from 'lucide-react'
import type { Path, UseFormRegister, UseFormWatch } from 'react-hook-form'

import { type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import type { DocumentoFormValuesBase } from './documento-form.types'

interface ImportanteToggleProps<TFormValues extends DocumentoFormValuesBase> {
  moduleName?: ModuleName
  register: UseFormRegister<TFormValues>
  watch: UseFormWatch<TFormValues>
}

export function ImportanteToggle<TFormValues extends DocumentoFormValuesBase>({
  moduleName: _moduleName = 'proyectos',
  register,
  watch,
}: ImportanteToggleProps<TFormValues>) {
  const esImportanteField = 'es_importante' as Path<TFormValues>
  const esImportante = Boolean(watch(esImportanteField))

  return (
    <div>
      <label className='mb-1.5 block flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
        <Star
          size={14}
          className={cn(esImportante && 'fill-yellow-500 text-yellow-500')}
        />
        Prioridad
      </label>
      <label className='group flex h-[42px] cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 p-2.5 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50'>
        <div className='relative flex-shrink-0'>
          <input
            {...register(esImportanteField)}
            type='checkbox'
            className='peer sr-only'
          />
          <div className="peer h-5 w-10 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-yellow-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-yellow-800"></div>
        </div>
        <span className='flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
          <Star
            size={14}
            className={cn(
              'transition-colors',
              esImportante ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
            )}
          />
          Importante
        </span>
      </label>
    </div>
  )
}
