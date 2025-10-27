/**
 * ✅ CONFIRM MODAL
 *
 * Modal moderno de confirmación que reemplaza window.confirm()
 * Con diseño glassmorphism, animaciones y dark mode.
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'
import { useModal } from './modal-context'

// ==========================================
// ESTILOS
// ==========================================

const styles = {
  backdrop: `fixed inset-0 z-50 bg-black/60 dark:bg-black/80
             backdrop-blur-md flex items-center justify-center p-4`,

  modal: {
    base: `relative w-full max-w-lg rounded-3xl
           bg-gradient-to-br from-white via-white to-gray-50
           dark:from-gray-800 dark:via-gray-800 dark:to-gray-900
           backdrop-blur-2xl shadow-2xl
           border border-gray-200/60 dark:border-purple-500/20
           overflow-hidden
           ring-1 ring-purple-500/5 dark:ring-purple-500/10`,

    header: `p-8 flex items-start gap-5`,

    iconContainer: {
      info: `w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
             bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700
             shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20`,
      warning: `w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
                bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700
                shadow-lg shadow-amber-500/30 dark:shadow-amber-500/20`,
      danger: `w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
               bg-gradient-to-br from-red-400 to-red-600 dark:from-red-500 dark:to-red-700
               shadow-lg shadow-red-500/30 dark:shadow-red-500/20`,
      success: `w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
                bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700
                shadow-lg shadow-green-500/30 dark:shadow-green-500/20`,
    },

    icon: {
      info: 'w-7 h-7 text-white',
      warning: 'w-7 h-7 text-white',
      danger: 'w-7 h-7 text-white',
      success: 'w-7 h-7 text-white',
    },

    content: 'flex-1 min-w-0',
    title: 'text-xl font-bold text-gray-900 dark:text-white mb-2',
    message: 'text-sm leading-relaxed text-gray-600 dark:text-gray-300',

    closeButton: `absolute top-6 right-6 p-2 rounded-xl
                  hover:bg-gray-100 dark:hover:bg-gray-700/50
                  transition-all duration-200
                  group`,
    closeIcon: 'w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors',
  },

  footer: `px-8 pb-8 pt-4 flex items-center justify-end gap-3`,

  button: {
    cancel: `px-5 py-2.5 rounded-xl text-sm font-semibold
             bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300
             hover:bg-gray-200 dark:hover:bg-gray-600/50
             border border-gray-200 dark:border-gray-600
             transition-all duration-200 shadow-sm
             hover:shadow-md hover:-translate-y-0.5`,

    confirm: {
      info: `px-5 py-2.5 rounded-xl text-sm font-semibold text-white
             bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-800
             hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-700 dark:hover:to-blue-900
             shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20
             hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/25
             transition-all duration-200 hover:-translate-y-0.5
             border border-blue-500/20`,

      warning: `px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-600 dark:to-amber-800
                hover:from-amber-700 hover:to-amber-800 dark:hover:from-amber-700 dark:hover:to-amber-900
                shadow-lg shadow-amber-500/25 dark:shadow-amber-500/20
                hover:shadow-xl hover:shadow-amber-500/30 dark:hover:shadow-amber-500/25
                transition-all duration-200 hover:-translate-y-0.5
                border border-amber-500/20`,

      danger: `px-5 py-2.5 rounded-xl text-sm font-semibold text-white
               bg-gradient-to-r from-red-600 to-red-700 dark:from-red-600 dark:to-red-800
               hover:from-red-700 hover:to-red-800 dark:hover:from-red-700 dark:hover:to-red-900
               shadow-lg shadow-red-500/25 dark:shadow-red-500/20
               hover:shadow-xl hover:shadow-red-500/30 dark:hover:shadow-red-500/25
               transition-all duration-200 hover:-translate-y-0.5
               border border-red-500/20`,

      success: `px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-green-600 to-green-700 dark:from-green-600 dark:to-green-800
                hover:from-green-700 hover:to-green-800 dark:hover:from-green-700 dark:hover:to-green-900
                shadow-lg shadow-green-500/25 dark:shadow-green-500/20
                hover:shadow-xl hover:shadow-green-500/30 dark:hover:shadow-green-500/25
                transition-all duration-200 hover:-translate-y-0.5
                border border-green-500/20`,
    },
  },
}

// ==========================================
// ICONOS POR VARIANTE
// ==========================================

const icons = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  success: CheckCircle,
}

// ==========================================
// COMPONENTE
// ==========================================

export function ConfirmModal() {
  const { confirmState, closeConfirm } = useModal()

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmState?.isOpen) {
        closeConfirm(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [confirmState?.isOpen, closeConfirm])

  if (!confirmState) return null

  const variant = confirmState.variant || 'info'
  const Icon = icons[variant]

  return (
    <AnimatePresence>
      {confirmState.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.backdrop}
          onClick={() => closeConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={styles.modal.base}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modal.header}>
              {/* Icono */}
              <div className={styles.modal.iconContainer[variant]}>
                {confirmState.icon || <Icon className={styles.modal.icon[variant]} />}
              </div>

              {/* Contenido */}
              <div className={styles.modal.content}>
                <h3 className={styles.modal.title}>{confirmState.title}</h3>
                <div className={styles.modal.message}>
                  {confirmState.message.split('\n').map((line, index) => {
                    // Si la línea empieza con viñeta (• o -)
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      return (
                        <div key={index} className="flex gap-2 mt-2">
                          <span className="text-amber-500 dark:text-amber-400 font-bold flex-shrink-0">•</span>
                          <span>{line.trim().replace(/^[•\-]\s*/, '')}</span>
                        </div>
                      )
                    }
                    // Líneas normales
                    if (line.trim()) {
                      return <p key={index} className="mt-2 first:mt-0">{line}</p>
                    }
                    // Líneas vacías = separador
                    return <div key={index} className="h-2" />
                  })}
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => closeConfirm(false)}
                className={styles.modal.closeButton}
              >
                <X className={styles.modal.closeIcon} />
              </button>
            </div>

            {/* Footer con botones */}
            <div className={styles.footer}>
              <button
                onClick={() => closeConfirm(false)}
                className={styles.button.cancel}
              >
                {confirmState.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={() => closeConfirm(true)}
                className={styles.button.confirm[variant]}
              >
                {confirmState.confirmText || 'Confirmar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
