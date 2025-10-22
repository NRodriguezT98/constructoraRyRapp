/**
 * Modal: Registrar Renuncia
 *
 * Permite registrar la renuncia del cliente
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X, XCircle } from 'lucide-react'
import { useState } from 'react'
import * as styles from '../../styles/detalle.styles'

interface ModalRenunciaProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (motivo: string) => Promise<boolean>
  negociacionId: string
}

export function ModalRenuncia({
  isOpen,
  onClose,
  onConfirm,
  negociacionId,
}: ModalRenunciaProps) {
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      setError('Debes especificar el motivo de la renuncia')
      return
    }

    setProcesando(true)
    setError(null)

    try {
      const exito = await onConfirm(motivo)
      if (exito) {
        handleClose()
      } else {
        setError('Error al registrar la renuncia')
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className={styles.modalClasses.title}>Registrar Renuncia del Cliente</h3>
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
              <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 mb-4 border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                    ⚠️ Acción Irreversible
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    La negociación se cerrará definitivamente y no podrá ser reactivada.
                    La vivienda quedará disponible para otras negociaciones.
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <p className={styles.modalClasses.description}>
                Especifica el motivo de la renuncia del cliente:
              </p>

              {/* Textarea */}
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                placeholder="Ej: Cliente encontró mejor oferta en otro proyecto, cambió de ciudad..."
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
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesando ? 'Registrando...' : 'Confirmar Renuncia'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
