'use client'

/**
 * 🗑️ MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE VERSIÓN
 *
 * Modal con doble confirmación para eliminar versión de documento
 * Requiere motivo obligatorio antes de proceder
 */

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

import { logger } from '@/lib/utils/logger'

interface DocumentoEliminarVersionModalProps {
  isOpen: boolean
  version: number
  onClose: () => void
  onConfirmar: (motivo: string) => Promise<void>
}

export function DocumentoEliminarVersionModal({
  isOpen,
  version,
  onClose,
  onConfirmar
}: DocumentoEliminarVersionModalProps) {
  const [motivo, setMotivo] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [errorMotivo, setErrorMotivo] = useState(false)

  const handleConfirmar = async () => {
    if (!motivo.trim()) {
      setErrorMotivo(true)
      return
    }

    setConfirmando(true)
    try {
      await onConfirmar(motivo.trim())
      handleCerrar()
    } catch (error) {
      logger.error('Error al eliminar versión:', error)
    } finally {
      setConfirmando(false)
    }
  }

  const handleCerrar = () => {
    if (!confirmando) {
      setMotivo('')
      setErrorMotivo(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleCerrar}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con advertencia */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  ¿Eliminar Versión {version}?
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCerrar}
                disabled={confirmando}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Advertencias */}
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Importante
                </h3>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  <li>• La versión NO se eliminará físicamente del servidor</li>
                  <li>• Se mantendrá para auditoría y cumplimiento legal</li>
                  <li>• NO aparecerá en el historial normal</li>
                  <li>• Solo administradores podrán recuperarla</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>⚠️ Esta acción requiere justificación:</strong> Se registrará en el sistema quién eliminó la versión, cuándo y por qué motivo.
                </p>
              </div>
            </div>

            {/* Campo de motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivo de eliminación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value)
                  setErrorMotivo(false)
                }}
                placeholder="Ej: Documento equivocado, información sensible, duplicado, etc."
                rows={3}
                disabled={confirmando}
                className={`
                  w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700
                  text-gray-900 dark:text-white placeholder-gray-400
                  focus:ring-2 focus:border-transparent transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errorMotivo
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                  }
                `}
              />
              {errorMotivo && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  El motivo es obligatorio
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mínimo 10 caracteres para una justificación válida
              </p>
            </div>

            {/* Checkbox de confirmación */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Al confirmar, acepto que:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1 ml-4">
                <li>✓ He verificado que esta es la versión correcta a eliminar</li>
                <li>✓ El motivo descrito es verídico y justificado</li>
                <li>✓ Esta acción quedará registrada en auditoría</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCerrar}
              disabled={confirmando}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={confirmando || !motivo.trim() || motivo.trim().length < 10}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {confirmando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Confirmar Eliminación
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
