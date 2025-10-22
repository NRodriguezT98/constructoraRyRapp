/**
 * Modal: Suspender Negociación
 *
 * Permite suspender temporalmente una negociación activa
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Pause, X } from 'lucide-react'
import { useState } from 'react'
import * as styles from '../../styles/detalle.styles'

interface ModalSuspenderProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (motivo: string) => Promise<boolean>
  negociacionId: string
}

export function ModalSuspender({
  isOpen,
  onClose,
  onConfirm,
  negociacionId,
}: ModalSuspenderProps) {
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      setError('Debes especificar el motivo de la suspensión')
      return
    }

    setProcesando(true)
    setError(null)

    try {
      const exito = await onConfirm(motivo)
      if (exito) {
        handleClose()
      } else {
        setError('Error al suspender la negociación')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setProcesando(false)
    }
  }

  const handleClose = () => {
    if (!procesando) {
      setMotivo('')
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Pause className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className={styles.modalClasses.title}>Suspender Negociación</h3>
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

              {/* Alerta */}
              <div className="flex items-start gap-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3 mb-4 border border-orange-200 dark:border-orange-800">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  La negociación quedará temporalmente suspendida. Podrás reactivarla en cualquier momento.
                </p>
              </div>

              {/* Descripción */}
              <p className={styles.modalClasses.description}>
                Especifica el motivo de la suspensión:
              </p>

              {/* Textarea */}
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                placeholder="Ej: Cliente solicitó pausar temporalmente la negociación..."
                className={styles.modalClasses.textarea}
                disabled={procesando}
              />

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
                  disabled={procesando || !motivo.trim()}
                  className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesando ? 'Suspendiendo...' : 'Confirmar Suspensión'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
