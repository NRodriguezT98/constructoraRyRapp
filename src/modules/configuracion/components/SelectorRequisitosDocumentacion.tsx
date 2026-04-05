/**
 * ============================================
 * COMPONENTE: Selector de Requisitos de Documentación
 * ============================================
 *
 * Componente para seleccionar requisitos de documentación
 * que se aplicarán a un tipo de fuente de pago.
 *
 * ✅ COMPONENTE PRESENTACIONAL
 * - Checkboxes con plantillas disponibles
 * - Diseño compacto y profesional
 * - Visual feedback (obligatorio/opcional)
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  Award,
  CheckCircle2,
  FileCheck,
  FileSignature,
  FileText,
  Loader2,
  Send,
} from 'lucide-react'

import { usePlantillasRequisitos } from '../hooks/usePlantillasRequisitos'

// ============================================
// TYPES
// ============================================

interface SelectorRequisitosDocumentacionProps {
  plantillasSeleccionadas: string[]
  onChange: (plantillas: string[]) => void
}

// ============================================
// HELPERS
// ============================================

const ICONOS_MAP = {
  FileCheck,
  FileSignature,
  Send,
  Award,
  FileText,
} as const

const getIconoPorNombre = (nombre: string) => {
  return ICONOS_MAP[nombre as keyof typeof ICONOS_MAP] || FileText
}

// ============================================
// COMPONENT
// ============================================

export function SelectorRequisitosDocumentacion({
  plantillasSeleccionadas,
  onChange,
}: SelectorRequisitosDocumentacionProps) {
  const { data: plantillas, isLoading, error } = usePlantillasRequisitos()

  const handleTogglePlantilla = (plantillaId: string) => {
    if (plantillasSeleccionadas.includes(plantillaId)) {
      onChange(plantillasSeleccionadas.filter(id => id !== plantillaId))
    } else {
      onChange([...plantillasSeleccionadas, plantillaId])
    }
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-600 dark:text-blue-400' />
      </div>
    )
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30'>
        <div className='flex items-start gap-2'>
          <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400' />
          <div>
            <p className='text-sm font-medium text-red-900 dark:text-red-100'>
              Error al cargar plantillas
            </p>
            <p className='mt-1 text-xs text-red-700 dark:text-red-300'>
              {error.message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // EMPTY STATE
  // ============================================

  if (!plantillas || plantillas.length === 0) {
    return (
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
        <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
          No hay plantillas de requisitos disponibles
        </p>
      </div>
    )
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className='space-y-2'>
      {/* Info header */}
      <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30'>
        <p className='text-xs leading-relaxed text-blue-900 dark:text-blue-100'>
          <strong>Requisitos de Documentación:</strong> Selecciona los
          documentos que serán necesarios para permitir el desembolso de este
          tipo de fuente de pago.
        </p>
      </div>

      {/* Lista de plantillas */}
      <div className='space-y-2'>
        {plantillas.map(plantilla => {
          const isSelected = plantillasSeleccionadas.includes(plantilla.id)
          const IconoComponente = getIconoPorNombre(plantilla.icono)

          return (
            <motion.label
              key={plantilla.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                  : 'border-gray-200 bg-white hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600'
              } `}
            >
              {/* Checkbox */}
              <div className='flex items-center pt-0.5'>
                <input
                  type='checkbox'
                  checked={isSelected}
                  onChange={() => handleTogglePlantilla(plantilla.id)}
                  className='h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-400'
                />
              </div>

              {/* Ícono del documento */}
              <div className='flex-shrink-0 pt-0.5'>
                <IconoComponente
                  className={`h-5 w-5 ${
                    isSelected
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
              </div>

              {/* Contenido */}
              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <p
                    className={`text-sm font-semibold ${
                      isSelected
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {plantilla.tipo_documento}
                  </p>

                  {/* Badges */}
                  <div className='flex items-center gap-1.5'>
                    {plantilla.es_obligatorio ? (
                      <span className='inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:border-red-700 dark:bg-red-900/50 dark:text-red-300'>
                        <AlertCircle className='h-2.5 w-2.5' />
                        Obligatorio
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'>
                        Opcional
                      </span>
                    )}

                    {plantilla.se_valida_en === 'creacion' ? (
                      <span className='inline-flex items-center rounded-full border border-orange-300 bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 dark:border-orange-700 dark:bg-orange-900/50 dark:text-orange-300'>
                        Temprano
                      </span>
                    ) : (
                      <span className='inline-flex items-center rounded-full border border-purple-300 bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:border-purple-700 dark:bg-purple-900/50 dark:text-purple-300'>
                        Desembolso
                      </span>
                    )}
                  </div>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    isSelected
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {plantilla.descripcion}
                </p>
              </div>

              {/* Check visual */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className='flex-shrink-0'
                >
                  <CheckCircle2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </motion.div>
              )}
            </motion.label>
          )
        })}
      </div>

      {/* Resumen */}
      {plantillasSeleccionadas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30'
        >
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400' />
            <p className='text-xs text-green-900 dark:text-green-100'>
              <strong>{plantillasSeleccionadas.length}</strong> requisito(s)
              configurado(s) para este tipo de fuente
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
