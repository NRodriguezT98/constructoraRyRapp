/**
 * ArchivarProyectoModal - Modal de confirmación para archivar proyecto
 * ✅ Confirmación obligatoria
 * ✅ Motivo opcional
 * ✅ Información sobre archivado (soft delete)
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Archive, Loader2, X } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/shared/utils/helpers'

interface ArchivarProyectoModalProps {
  isOpen: boolean
  nombreProyecto: string
  onConfirm: (motivo?: string) => Promise<void>
  onCancel: () => void
  archivando?: boolean
}

export function ArchivarProyectoModal({
  isOpen,
  nombreProyecto,
  onConfirm,
  onCancel,
  archivando = false,
}: ArchivarProyectoModalProps) {
  const [motivo, setMotivo] = useState('')

  const handleConfirmar = async () => {
    await onConfirm(motivo.trim() || undefined)
    setMotivo('') // Reset
  }

  const handleCancelar = () => {
    setMotivo('') // Reset
    onCancel()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelar}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Archive className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Archivar Proyecto
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    El proyecto se ocultará de la lista principal
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelar}
                disabled={archivando}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Advertencia informativa */}
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-200 mb-2">
                      ¿Estás seguro de archivar este proyecto?
                    </p>
                    <p className="text-amber-800 dark:text-amber-300 mb-1">
                      <strong className="font-semibold">Proyecto:</strong> {nombreProyecto}
                    </p>
                    <ul className="mt-2 space-y-1 text-amber-700 dark:text-amber-400 text-xs">
                      <li>✓ El proyecto se ocultará de la lista principal</li>
                      <li>✓ Los datos NO se eliminarán (soft delete)</li>
                      <li>✓ Podrás restaurarlo cuando quieras</li>
                      <li>✓ Las viviendas y documentos se mantienen</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Motivo (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo del archivado (opcional)
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  disabled={archivando}
                  rows={3}
                  maxLength={500}
                  className={cn(
                    'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all resize-none',
                    'focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent',
                    'disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800',
                    'border-gray-200 dark:border-gray-700'
                  )}
                  placeholder="Ej: Proyecto finalizado en 2024, cliente canceló contrato, etc."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {motivo.length}/500 caracteres
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <button
                onClick={handleCancelar}
                disabled={archivando}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={archivando}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {archivando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Archivando...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    Archivar Proyecto
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
