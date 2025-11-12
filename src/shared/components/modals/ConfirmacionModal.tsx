/**
 * 🎨 COMPONENTE REUTILIZABLE: ConfirmacionModal
 *
 * Modal de confirmación profesional con diseño compacto
 * - Variantes: danger (rojo), warning (ámbar), info (azul), success (verde)
 * - Responsive: adaptativo móvil/desktop
 * - Glassmorphism + animaciones Framer Motion
 * - Type-safe props
 *
 * @example
 * ```tsx
 * <ConfirmacionModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleEliminar}
 *   variant="danger"
 *   title="¿Eliminar definitivo?"
 *   message="Esta acción no se puede deshacer"
 *   confirmText="Sí, eliminar"
 *   isLoading={eliminando}
 * />
 * ```
 */

'use client'

import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, Loader2, X, XCircle } from 'lucide-react'

export type ConfirmacionVariant = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmacionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  variant?: ConfirmacionVariant
  title: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  loadingText?: string
}

/**
 * Tema visual por variante
 */
const variantStyles = {
  danger: {
    icon: XCircle,
    iconClass: 'w-12 h-12 text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    titleClass: 'text-red-900 dark:text-red-100',
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
    borderClass: 'border-red-200 dark:border-red-800',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'w-12 h-12 text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    titleClass: 'text-amber-900 dark:text-amber-100',
    confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
  info: {
    icon: Info,
    iconClass: 'w-12 h-12 text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    titleClass: 'text-blue-900 dark:text-blue-100',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  success: {
    icon: CheckCircle,
    iconClass: 'w-12 h-12 text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    titleClass: 'text-green-900 dark:text-green-100',
    confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
    borderClass: 'border-green-200 dark:border-green-800',
  },
}

export function ConfirmacionModal({
  isOpen,
  onClose,
  onConfirm,
  variant = 'danger',
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  loadingText = 'Procesando...',
}: ConfirmacionModalProps) {
  const styles = variantStyles[variant]
  const Icon = styles.icon

  const handleConfirm = () => {
    onConfirm()
    // NO cerrar automáticamente - dejar que el padre controle
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={`
                relative w-full max-w-md
                bg-white dark:bg-gray-800
                rounded-2xl shadow-2xl
                border-2 ${styles.borderClass}
                overflow-hidden
              `}
            >
              {/* Header con icono */}
              <div className="relative p-6 pb-4">
                {/* Botón cerrar */}
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Icono principal */}
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-2xl ${styles.iconBg}`}>
                    <Icon className={styles.iconClass} />
                  </div>
                </div>

                {/* Título */}
                <h2 className={`text-xl font-bold text-center ${styles.titleClass}`}>
                  {title}
                </h2>
              </div>

              {/* Contenido */}
              <div className="px-6 pb-6">
                <div className="text-center text-gray-700 dark:text-gray-300 mb-6">
                  {typeof message === 'string' ? (
                    <p className="whitespace-pre-line">{message}</p>
                  ) : (
                    message
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 border-2"
                  >
                    {cancelText}
                  </Button>

                  <Button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`flex-1 ${styles.confirmButton} shadow-lg`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {loadingText}
                      </>
                    ) : (
                      confirmText
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
