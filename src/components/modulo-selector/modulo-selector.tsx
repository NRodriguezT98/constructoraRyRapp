// ============================================
// COMPONENT: ModuloSelector
// Selector de módulos para categorías de documentos
// ============================================

'use client'

import type { ModuloDocumento } from '@/modules/documentos/types/documento.types'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Circle, FolderTree, Globe, Home, Users } from 'lucide-react'

interface ModuloSelectorProps {
  esGlobal: boolean
  modulosPermitidos: ModuloDocumento[]
  onEsGlobalChange: (value: boolean) => void
  onModulosChange: (modulos: ModuloDocumento[]) => void
  error?: string
}

const MODULOS_CONFIG = [
  {
    id: 'proyectos' as ModuloDocumento,
    label: 'Proyectos',
    descripcion: 'Documentos de proyectos de construcción',
    icono: FolderTree,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    borderColor: 'border-blue-200 dark:border-blue-500/20',
  },
  {
    id: 'clientes' as ModuloDocumento,
    label: 'Clientes',
    descripcion: 'Documentos de clientes y negociaciones',
    icono: Users,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-500/10',
    borderColor: 'border-green-200 dark:border-green-500/20',
  },
  {
    id: 'viviendas' as ModuloDocumento,
    label: 'Viviendas',
    descripcion: 'Documentos de viviendas y entregas',
    icono: Home,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10',
    borderColor: 'border-purple-200 dark:border-purple-500/20',
  },
]

export function ModuloSelector({
  esGlobal,
  modulosPermitidos,
  onEsGlobalChange,
  onModulosChange,
  error,
}: ModuloSelectorProps) {
  const handleModuloToggle = (modulo: ModuloDocumento) => {
    if (modulosPermitidos.includes(modulo)) {
      // Remover módulo (solo si no es el último)
      if (modulosPermitidos.length > 1) {
        onModulosChange(modulosPermitidos.filter(m => m !== modulo))
      }
    } else {
      // Agregar módulo
      onModulosChange([...modulosPermitidos, modulo])
    }
  }

  return (
    <div className='space-y-4'>
      {/* Opción: Global */}
      <motion.div
        className={`rounded-lg border-2 p-4 transition-all cursor-pointer ${
          esGlobal
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        onClick={() => onEsGlobalChange(!esGlobal)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className='flex items-start gap-3'>
          <div className='mt-0.5'>
            {esGlobal ? (
              <CheckCircle2 className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />
            ) : (
              <Circle className='h-5 w-5 text-gray-400 dark:text-gray-600' />
            )}
          </div>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <Globe className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
              <span className='font-semibold text-gray-900 dark:text-white'>
                Global (todos los módulos)
              </span>
            </div>
            <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
              Esta categoría estará disponible en proyectos, clientes y viviendas
            </p>
          </div>
        </div>
      </motion.div>

      {/* Opciones: Módulos específicos */}
      <AnimatePresence>
        {!esGlobal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='space-y-2'
          >
            <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Selecciona los módulos donde estará disponible:
            </p>

            <div className='space-y-2'>
              {MODULOS_CONFIG.map(modulo => {
                const isSelected = modulosPermitidos.includes(modulo.id)
                const isUltimoSeleccionado =
                  isSelected && modulosPermitidos.length === 1
                const IconoModulo = modulo.icono

                return (
                  <motion.div
                    key={modulo.id}
                    className={`rounded-lg border-2 p-3 transition-all cursor-pointer ${
                      isSelected
                        ? `${modulo.borderColor} ${modulo.bgColor}`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${isUltimoSeleccionado ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() =>
                      !isUltimoSeleccionado && handleModuloToggle(modulo.id)
                    }
                    whileHover={!isUltimoSeleccionado ? { scale: 1.01 } : {}}
                    whileTap={!isUltimoSeleccionado ? { scale: 0.99 } : {}}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='mt-0.5'>
                        {isSelected ? (
                          <CheckCircle2
                            className={`h-5 w-5 ${modulo.color}`}
                          />
                        ) : (
                          <Circle className='h-5 w-5 text-gray-400 dark:text-gray-600' />
                        )}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <IconoModulo className={`h-4 w-4 ${modulo.color}`} />
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {modulo.label}
                          </span>
                        </div>
                        <p className='mt-0.5 text-xs text-gray-600 dark:text-gray-400'>
                          {modulo.descripcion}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Mensaje de validación */}
            {modulosPermitidos.length === 1 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-xs text-amber-600 dark:text-amber-400'
              >
                ⚠️ Debe haber al menos un módulo seleccionado
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error de validación */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-sm text-red-600 dark:text-red-400'
        >
          {error}
        </motion.p>
      )}

      {/* Preview de disponibilidad */}
      <div className='rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4'>
        <p className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2'>
          Disponibilidad
        </p>
        <div className='flex flex-wrap gap-2'>
          {esGlobal ? (
            <span className='inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300'>
              <Globe className='h-3 w-3' />
              Todos los módulos
            </span>
          ) : (
            <>
              {modulosPermitidos.map(modulo => {
                const config = MODULOS_CONFIG.find(m => m.id === modulo)
                if (!config) return null
                const Icono = config.icono

                return (
                  <span
                    key={modulo}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.color}`}
                  >
                    <Icono className='h-3 w-3' />
                    {config.label}
                  </span>
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
