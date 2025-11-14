'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ChevronDown, Folder } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { FieldErrors } from 'react-hook-form'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

interface CategoriaDocumento {
  id: string
  nombre: string
  descripcion?: string | null
}

interface CategoriaSelectProps {
  moduleName?: ModuleName
  categorias: CategoriaDocumento[]
  value: string
  onChange: (value: string) => void
  errors: FieldErrors
}

export function CategoriaSelect({
  moduleName = 'proyectos',
  categorias,
  value,
  onChange,
  errors,
}: CategoriaSelectProps) {
  const theme = moduleThemes[moduleName]
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const categoriaSeleccionada = categorias.find(c => c.id === value)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
        <Folder size={14} />
        Categoría
      </label>

      <div ref={dropdownRef} className="relative">
        {/* Botón del select */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all text-left flex items-center justify-between',
            'focus:ring-2 focus:border-transparent',
            errors.categoria_id
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700'
          )}
          style={{
            ...(errors.categoria_id
              ? {}
              : {
                  '--tw-ring-color': theme.colors.light,
                } as React.CSSProperties),
          }}
        >
          <div className="flex-1 min-w-0">
            {categoriaSeleccionada ? (
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {categoriaSeleccionada.nombre}
                </div>
                {categoriaSeleccionada.descripcion && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {categoriaSeleccionada.descripcion}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">Sin categoría</span>
            )}
          </div>
          <ChevronDown
            size={14}
            className={cn(
              'ml-2 flex-shrink-0 transition-transform text-gray-400',
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
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
            >
              {/* Opción "Sin categoría" */}
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                  !value && theme.classes.bg.light
                )}
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  Sin categoría
                </div>
              </button>

              {/* Lista de categorías */}
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => {
                    onChange(categoria.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full px-2.5 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-t border-gray-100 dark:border-gray-700',
                    value === categoria.id && theme.classes.bg.light
                  )}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {categoria.nombre}
                  </div>
                  {categoria.descripcion && (
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-tight">
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
          className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <AlertCircle size={12} />
          {errors.categoria_id.message as string}
        </motion.p>
      )}
      {!errors.categoria_id && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Clasifica el documento
        </p>
      )}
    </div>
  )
}
