'use client'

import { useEffect } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

interface ToastProps {
  show: boolean
  message: string
  onClose: () => void
  type?: 'success' | 'error'
  duration?: number
}

/**
 * Componente Toast moderno para notificaciones
 * Diseño limpio con glassmorphism y animaciones suaves
 */
export function Toast({
  show,
  message,
  onClose,
  type = 'success',
  duration = 3000
}: ToastProps) {
  // Auto-cerrar después de duration
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-6 right-6 z-[9999] max-w-md"
        >
          <div className={`
            relative overflow-hidden rounded-xl border backdrop-blur-xl shadow-2xl
            ${type === 'success'
              ? 'border-green-400/30 bg-green-500/20'
              : 'border-red-400/30 bg-red-500/20'
            }
          `}>
            {/* Barra de progreso animada */}
            {duration > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`absolute top-0 left-0 h-1 ${
                  type === 'success' ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
            )}

            <div className="flex items-start gap-3 p-4">
              {/* Icono */}
              <div className={`
                flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full
                ${type === 'success'
                  ? 'bg-green-500/30 text-green-300'
                  : 'bg-red-500/30 text-red-300'
                }
              `}>
                {type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <X className="w-6 h-6" />
                )}
              </div>

              {/* Mensaje */}
              <div className="flex-1 pt-1">
                <p className={`text-sm font-medium ${
                  type === 'success' ? 'text-green-100' : 'text-red-100'
                }`}>
                  {message}
                </p>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className={`
                  flex-shrink-0 rounded-lg p-1.5 transition-all
                  ${type === 'success'
                    ? 'text-green-300 hover:bg-green-500/20'
                    : 'text-red-300 hover:bg-red-500/20'
                  }
                `}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
