/**
 * 🚫 COMPONENTE: MODAL OMITIR PASO
 *
 * Modal para capturar el motivo por el cual se omite un paso del proceso.
 * Permite al usuario especificar la razón antes de marcar el paso como omitido.
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

interface ModalOmitirPasoProps {
  isOpen: boolean
  pasoNombre: string
  onClose: () => void
  onConfirm: (motivo: string) => void
  loading?: boolean
}

export function ModalOmitirPaso({
  isOpen,
  pasoNombre,
  onClose,
  onConfirm,
  loading = false
}: ModalOmitirPasoProps) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    // Validar que se haya ingresado un motivo
    if (!motivo.trim()) {
      setError('Debes especificar un motivo para omitir el paso')
      return
    }

    if (motivo.trim().length < 10) {
      setError('El motivo debe tener al menos 10 caracteres')
      return
    }

    onConfirm(motivo.trim())
    handleClose()
  }

  const handleClose = () => {
    setMotivo('')
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">
                        Omitir Paso
                      </h2>
                      <p className="text-sm text-white/90">
                        {pasoNombre}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    Este paso será marcado como <span className="font-bold">Omitido</span> y no se requerirá completarlo.
                    Por favor indica el motivo de esta omisión.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Motivo de Omisión <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value)
                      setError('')
                    }}
                    placeholder="Ej: El cliente decidió no utilizar crédito hipotecario, pagará de contado..."
                    rows={4}
                    className={`
                      w-full px-4 py-3 rounded-lg
                      bg-white dark:bg-gray-900
                      border-2 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                      focus:border-amber-500 dark:focus:border-amber-500
                      focus:ring-4 focus:ring-amber-500/20
                      text-gray-900 dark:text-gray-100
                      placeholder:text-gray-400 dark:placeholder:text-gray-500
                      transition-all outline-none resize-none
                    `}
                    disabled={loading}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {error}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Mínimo 10 caracteres
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300
                           hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !motivo.trim()}
                  className="px-6 py-2 rounded-lg font-medium text-white
                           bg-gradient-to-r from-amber-500 to-orange-500
                           hover:from-amber-600 hover:to-orange-600
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-amber-500/30
                           transition-all"
                >
                  {loading ? 'Omitiendo...' : 'Omitir Paso'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
