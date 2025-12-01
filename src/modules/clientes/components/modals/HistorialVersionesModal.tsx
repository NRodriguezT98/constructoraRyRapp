/**
 * Modal: Historial de Versiones de Negociación
 * Muestra timeline con todos los cambios realizados
 */

'use client'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  History,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useHistorialVersiones } from '../../hooks/useHistorialVersiones'
import type { VersionConDescuentos } from '../../services/negociaciones-versiones.service'

interface HistorialVersionesModalProps {
  negociacionId: string
  isOpen: boolean
  onClose: () => void
}

export function HistorialVersionesModal({
  negociacionId,
  isOpen,
  onClose,
}: HistorialVersionesModalProps) {
  const { versiones, isLoading, totalVersiones } = useHistorialVersiones(negociacionId)
  const [versionExpandida, setVersionExpandida] = useState<string | null>(null)

  if (!isOpen) return null

  const toggleVersion = (versionId: string) => {
    setVersionExpandida(versionExpandida === versionId ? null : versionId)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Historial de Versiones
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {totalVersiones} {totalVersiones === 1 ? 'versión' : 'versiones'} registradas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : versiones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No hay versiones registradas para esta negociación
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {versiones.map((version, index) => (
                  <VersionCard
                    key={version.id}
                    version={version}
                    isLatest={index === 0}
                    isExpanded={versionExpandida === version.id}
                    onToggle={() => toggleVersion(version.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ============================================
// Componente: Card de Versión Individual
// ============================================

interface VersionCardProps {
  version: VersionConDescuentos
  isLatest: boolean
  isExpanded: boolean
  onToggle: () => void
}

function VersionCard({ version, isLatest, isExpanded, onToggle }: VersionCardProps) {
  const fuentesPago = (version.fuentes_pago as any[]) || []

  return (
    <motion.div
      layout
      className={`
        rounded-xl border-2 overflow-hidden transition-all
        ${
          isLatest
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
      `}
    >
      {/* Header Colapsable */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Badge Versión */}
          <div
            className={`
            px-3 py-1 rounded-full text-sm font-bold
            ${
              isLatest
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
          `}
          >
            v{version.version}
          </div>

          {/* Info */}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {getTipoLabel(version.tipo_cambio)}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              {formatDateCompact(version.creado_en)}
              {version.usuario && (
                <>
                  <span>•</span>
                  <User className="w-3 h-3" />
                  {version.usuario.nombres} {version.usuario.apellidos}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expand Icon */}
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content Expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {/* Valores Financieros */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Valor Vivienda</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(version.valor_vivienda)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Descuento</p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                    -{formatCurrency(version.descuento_aplicado)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Valor Total</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(version.valor_total)}
                  </p>
                </div>
              </div>

              {/* Motivo del Cambio */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Motivo del cambio
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {version.motivo_cambio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fuentes de Pago */}
              {fuentesPago.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Fuentes de Pago ({fuentesPago.length})
                  </p>
                  <div className="space-y-2">
                    {fuentesPago.map((fuente: any, i: number) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-900 dark:text-white">
                              {fuente.tipo}
                            </p>
                            {fuente.entidad && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {fuente.entidad}
                              </p>
                            )}
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {formatCurrency(fuente.monto_aprobado)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Helper: Convertir tipo de cambio a label
function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    creacion_inicial: 'Creación Inicial',
    modificacion_fuentes: 'Modificación de Fuentes',
    aplicacion_descuento: 'Aplicación de Descuento',
    ajuste_avaluo: 'Ajuste de Avalúo',
    cambio_entidad: 'Cambio de Entidad',
    otro: 'Otro Cambio',
  }
  return labels[tipo] || tipo
}
