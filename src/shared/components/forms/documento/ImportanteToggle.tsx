'use client'

import { Star } from 'lucide-react'
import { UseFormRegister, UseFormWatch } from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

interface ImportanteToggleProps {
  moduleName?: ModuleName
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
}

export function ImportanteToggle({
  moduleName = 'proyectos',
  register,
  watch,
}: ImportanteToggleProps) {
  const theme = moduleThemes[moduleName]
  const esImportante = watch('es_importante')

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
        <Star size={14} className={cn(esImportante && 'text-yellow-500 fill-yellow-500')} />
        Prioridad
      </label>
      <label className="flex items-center gap-2.5 cursor-pointer group p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors h-[42px]">
        <div className="relative flex-shrink-0">
          <input
            {...register('es_importante')}
            type="checkbox"
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
        </div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Star
            size={14}
            className={cn(
              'transition-colors',
              esImportante
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-400'
            )}
          />
          Importante
        </span>
      </label>
    </div>
  )
}
