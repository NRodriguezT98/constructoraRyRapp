'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, RefreshCw, X } from 'lucide-react'

import { type ModuleName } from '@/shared/config/module-themes'

import { getRestaurarDocumentoModalStyles } from './RestaurarDocumentoModal.styles'

interface RestaurarDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  documentoTitulo: string
  moduleName?: ModuleName
  procesando?: boolean
}

export function RestaurarDocumentoModal({
  isOpen,
  onClose,
  onConfirm,
  documentoTitulo,
  moduleName = 'proyectos',
  procesando = false,
}: RestaurarDocumentoModalProps) {
  const styles = getRestaurarDocumentoModalStyles(moduleName)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className={styles.overlay.container}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.overlay.backdrop}
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className={styles.modal.container}
        >
          {/* Header */}
          <div className={styles.header.container}>
            <div className={styles.header.content}>
              <RefreshCw className={styles.header.icon} />
              <h2 className={styles.header.title}>Restaurar Documento</h2>
            </div>
            <button
              type='button'
              onClick={onClose}
              disabled={procesando}
              className={styles.header.closeButton}
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          {/* Content */}
          <div className={styles.content.container}>
            {/* Advertencia informativa */}
            <div className={styles.content.warningBox}>
              <AlertCircle className={styles.content.warningIcon} />
              <div className='flex-1'>
                <p className={styles.content.warningTitle}>
                  ¿Estás seguro de que deseas restaurar este documento?
                </p>
              </div>
            </div>

            {/* Documento a restaurar */}
            <div className={styles.content.documentBox}>
              <div className='flex-1'>
                <p className={styles.content.label}>Documento:</p>
                <p className={styles.content.documentTitle}>
                  {documentoTitulo}
                </p>
              </div>
            </div>

            {/* Información de lo que pasará */}
            <div className={styles.content.infoBox}>
              <div className='space-y-2'>
                <div className='flex items-start gap-2'>
                  <div className={styles.content.checkIcon}>✅</div>
                  <p className={styles.content.infoText}>
                    El documento volverá a estar <strong>activo</strong> y
                    visible en la pestaña &quot;Activos&quot;
                  </p>
                </div>
                <div className='flex items-start gap-2'>
                  <div className={styles.content.checkIcon}>💡</div>
                  <p className={styles.content.infoText}>
                    Podrás archivarlo nuevamente en cualquier momento si es
                    necesario
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className={styles.footer.container}>
            <button
              type='button'
              onClick={onClose}
              disabled={procesando}
              className={styles.footer.cancelButton}
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={onConfirm}
              disabled={procesando}
              className={styles.footer.confirmButton}
            >
              {procesando ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <RefreshCw className='h-4 w-4' />
                  </motion.div>
                  Restaurando...
                </>
              ) : (
                <>
                  <RefreshCw className='h-4 w-4' />
                  Restaurar
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
