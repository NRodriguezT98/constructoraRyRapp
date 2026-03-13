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
import { AlertCircle, Award, CheckCircle2, FileCheck, FileSignature, FileText, Loader2, Send } from 'lucide-react'
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
      onChange(plantillasSeleccionadas.filter((id) => id !== plantillaId))
    } else {
      onChange([...plantillasSeleccionadas, plantillaId])
    }
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    )
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Error al cargar plantillas
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
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
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          No hay plantillas de requisitos disponibles
        </p>
      </div>
    )
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-2">
      {/* Info header */}
      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
          <strong>Requisitos de Documentación:</strong> Selecciona los documentos que serán
          necesarios para permitir el desembolso de este tipo de fuente de pago.
        </p>
      </div>

      {/* Lista de plantillas */}
      <div className="space-y-2">
        {plantillas.map((plantilla) => {
          const isSelected = plantillasSeleccionadas.includes(plantilla.id)
          const IconoComponente = getIconoPorNombre(plantilla.icono)

          return (
            <motion.label
              key={plantilla.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                relative flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 dark:border-blue-400'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }
              `}
            >
              {/* Checkbox */}
              <div className="flex items-center pt-0.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleTogglePlantilla(plantilla.id)}
                  className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              {/* Ícono del documento */}
              <div className="flex-shrink-0 pt-0.5">
                <IconoComponente
                  className={`w-5 h-5 ${
                    isSelected
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
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
                  <div className="flex items-center gap-1.5">
                    {plantilla.es_obligatorio ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-[10px] font-medium text-red-700 dark:text-red-300">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Obligatorio
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                        Opcional
                      </span>
                    )}

                    {plantilla.se_valida_en === 'creacion' ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/50 border border-orange-300 dark:border-orange-700 text-[10px] font-medium text-orange-700 dark:text-orange-300">
                        Temprano
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-700 text-[10px] font-medium text-purple-700 dark:text-purple-300">
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
                  className="flex-shrink-0"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
          className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-xs text-green-900 dark:text-green-100">
              <strong>{plantillasSeleccionadas.length}</strong> requisito(s) configurado(s) para
              este tipo de fuente
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
