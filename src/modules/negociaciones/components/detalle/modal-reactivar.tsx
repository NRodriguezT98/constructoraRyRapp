/**
 * Modal: Reactivar Negociación
 *
 * Confirma la reactivación de una negociación suspendida
 */

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import * as styles from '../../styles/detalle.styles'

interface ModalReactivarProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<boolean>
  negociacionId: string
}

export function ModalReactivar({
  isOpen,
  onClose,
  onConfirm,
  negociacionId,
}: ModalReactivarProps) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setProcesando(true)
    setError(null)

    try {
      const exito = await onConfirm()
      if (exito) {
        handleClose()
      } else {
        setError('Error al reactivar la negociación')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setProcesando(false)
    }
  }

  const handleClose = () => {
    if (!procesando) {
      setError(null)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            {...styles.animations.scaleIn}
            onClick={handleClose}
            className={styles.modalClasses.overlay}
          />

          {/* Modal */}
          <div className={styles.modalClasses.container}>
            <motion.div {...styles.animations.scaleIn} className={styles.modalClasses.content}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <RotateCcw className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className={styles.modalClasses.title}>Reactivar Negociación</h3>
                    <p className="text-xs text-gray-500">ID: {negociacionId.slice(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={procesando}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 p-3 mb-4 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                    ✓ Reactivación de Negociación
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    La negociación volverá a estar activa y el cliente podrá continuar
                    con el proceso de pago.
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <p className={styles.modalClasses.description}>
                ¿Estás seguro de que deseas reactivar esta negociación?
              </p>

              {/* Error */}
              {error && (
                <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>
              )}

              {/* Footer */}
              <div className={styles.modalClasses.footer}>
                <button
                  onClick={handleClose}
                  disabled={procesando}
                  className={styles.modalClasses.footerButtonCancel}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={procesando}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesando ? 'Reactivando...' : 'Confirmar Reactivación'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
