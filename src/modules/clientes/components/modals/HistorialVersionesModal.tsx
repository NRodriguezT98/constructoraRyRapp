/**
 * Modal: Historial de Versiones de Negociación
 * Muestra timeline con todos los cambios realizados
 * ✅ REFACTORIZADO: Separación completa de responsabilidades
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, History, X } from 'lucide-react'
import { useState } from 'react'
import { useHistorialVersiones } from '../../hooks/useHistorialVersiones'
import { VersionCard } from './components/VersionCard'

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
          {/* Header - Tema Clientes (Cyan → Azul → Índigo) */}
          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Historial de Versiones
                  </h2>
                  <p className="text-cyan-100 dark:text-cyan-200 text-sm mt-0.5">
                    {totalVersiones} {totalVersiones === 1 ? 'versión' : 'versiones'} registradas
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
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
                    versionAnterior={versiones[index + 1] || null}
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
