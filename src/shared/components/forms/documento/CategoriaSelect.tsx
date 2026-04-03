'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ChevronDown, Folder } from 'lucide-react'
import type { FieldErrors } from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import type {
  CategoriaDocumentoBase,
  DocumentoFormValuesBase,
} from './documento-form.types'

interface CategoriaSelectProps<TFormValues extends DocumentoFormValuesBase> {
  moduleName?: ModuleName
  categorias: CategoriaDocumentoBase[]
  value: string
  onChange: (value: string) => void
  errors: FieldErrors<TFormValues>
  disabled?: boolean // ✅ Para deshabilitar select
  helperText?: string // ✅ Texto custom de ayuda
}

export function CategoriaSelect<TFormValues extends DocumentoFormValuesBase>({
  moduleName = 'proyectos',
  categorias,
  value,
  onChange,
  errors,
  disabled = false,
  helperText,
}: CategoriaSelectProps<TFormValues>) {
  const theme = moduleThemes[moduleName]
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const categoriaSeleccionada = categorias.find(c => c.id === value)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div>
      <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
        <Folder size={14} />
        Categoría
      </label>

      <div ref={dropdownRef} className='relative'>
        {/* Botón del select */}
        <button
          type='button'
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm transition-all dark:bg-gray-900/50',
            'focus:border-transparent focus:ring-2',
            disabled && 'cursor-not-allowed opacity-50',
            errors.categoria_id
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700'
          )}
          style={{
            ...(errors.categoria_id
              ? {}
              : ({
                  '--tw-ring-color': theme.colors.light,
                } as CSSProperties)),
          }}
        >
          <div className='min-w-0 flex-1'>
            {categoriaSeleccionada ? (
              <div>
                <div className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                  {categoriaSeleccionada.nombre}
                </div>
                {categoriaSeleccionada.descripcion && (
                  <div className='mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400'>
                    {categoriaSeleccionada.descripcion}
                  </div>
                )}
              </div>
            ) : (
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Sin categoría
              </span>
            )}
          </div>
          <ChevronDown
            size={14}
            className={cn(
              'ml-2 flex-shrink-0 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className='absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800'
            >
              {/* Opción "Sin categoría" */}
              <button
                type='button'
                onClick={() => {
                  onChange('')
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  !value && theme.classes.bg.light
                )}
              >
                <div className='font-medium text-gray-900 dark:text-white'>
                  Sin categoría
                </div>
              </button>

              {/* Lista de categorías */}
              {categorias.map(categoria => (
                <button
                  key={categoria.id}
                  type='button'
                  onClick={() => {
                    onChange(categoria.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full border-t border-gray-100 px-2.5 py-1.5 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50',
                    value === categoria.id && theme.classes.bg.light
                  )}
                >
                  <div className='text-sm font-medium text-gray-900 dark:text-white'>
                    {categoria.nombre}
                  </div>
                  {categoria.descripcion && (
                    <div className='mt-0.5 line-clamp-2 text-[11px] leading-tight text-gray-500 dark:text-gray-400'>
                      {categoria.descripcion}
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {errors.categoria_id && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'
        >
          <AlertCircle size={12} />
          {errors.categoria_id.message as string}
        </motion.p>
      )}
      {!errors.categoria_id && (
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
          {helperText || 'Clasifica el documento'}
        </p>
      )}
    </div>
  )
}
