import { useEffect } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { useClickOutside } from '../../hooks/useClickOutside'
import { cn } from '../../utils/helpers'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  className?: string
  icon?: React.ReactNode
  gradientColor?: 'orange' | 'green' | 'cyan' | 'pink' | 'blue' | 'purple'
  compact?: boolean // ✅ Para modales de confirmación (sin min-height)
  headerExtra?: React.ReactNode // ✅ Contenido extra en el header (ej: badges)
  noContentScroll?: boolean // ✅ Para wizards que manejan su propio scroll interno
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw]',
}

const gradientClasses = {
  orange: {
    border: 'from-orange-500 via-amber-500 to-yellow-500',
    icon: 'from-orange-500 to-amber-600',
    shadow: 'shadow-orange-500/30',
  },
  green: {
    border: 'from-green-500 via-emerald-500 to-teal-500',
    icon: 'from-green-500 to-emerald-600',
    shadow: 'shadow-green-500/30',
  },
  cyan: {
    border: 'from-cyan-500 via-blue-500 to-indigo-500',
    icon: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/30',
  },
  pink: {
    border: 'from-pink-500 via-purple-500 to-indigo-500',
    icon: 'from-pink-500 to-purple-600',
    shadow: 'shadow-pink-500/30',
  },
  blue: {
    border: 'from-blue-500 via-indigo-500 to-purple-500',
    icon: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/30',
  },
  purple: {
    border: 'from-blue-500 via-purple-500 to-pink-500',
    icon: 'from-blue-500 to-purple-600',
    shadow: 'shadow-blue-500/30',
  },
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  icon,
  gradientColor = 'purple',
  compact = false, // ✅ Por defecto false para mantener compatibilidad
  headerExtra,
  noContentScroll = false, // ✅ Por defecto false
}: ModalProps) {
  const modalRef = useClickOutside<HTMLDivElement>(() => {
    if (closeOnBackdrop) onClose()
  })

  const gradient = gradientClasses[gradientColor]

  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEscape])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop con animación */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm dark:bg-black/70'
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal Container */}
          <div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              ref={modalRef}
              className={cn(
                'relative w-full',
                'bg-white dark:bg-gray-900',
                'rounded-xl sm:rounded-2xl shadow-2xl',
                'border border-gray-200/50 dark:border-gray-700/50',
                'overflow-hidden',
                'max-h-[95vh] flex flex-col',
                sizeClasses[size],
                className
              )}
            >
              {/* Header mejorado y compacto */}
              {(title || showCloseButton) && (
                <div className='relative px-3 py-3 sm:px-6 sm:py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/30 flex-shrink-0'>
                  <div className='flex items-start justify-between gap-2 sm:gap-4'>
                    {/* Lado izquierdo: Ícono + Títulos */}
                    <div className='flex items-start gap-2 sm:gap-4 flex-1 min-w-0'>
                      {/* Ícono */}
                      {icon && (
                        <div className={cn(
                          'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0',
                          'bg-gradient-to-br',
                          gradient.icon,
                          gradient.shadow
                        )}>
                          {icon}
                        </div>
                      )}

                      {/* Títulos */}
                      <div className='flex-1 min-w-0 pr-2'>
                        {title && (
                          <h2 className='text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-0.5 leading-tight'>
                            {title}
                          </h2>
                        )}
                        {description && (
                          <p className='text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 leading-tight sm:leading-relaxed line-clamp-1 sm:line-clamp-2'>
                            {description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Lado derecho: HeaderExtra + Botón cerrar */}
                    <div className='flex items-start gap-2 sm:gap-3'>
                      {headerExtra && (
                        <div className='flex-shrink-0'>
                          {headerExtra}
                        </div>
                      )}

                      {/* Botón de cerrar mejorado */}
                      {showCloseButton && (
                        <button
                          onClick={onClose}
                          type='button'
                          className='flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors'
                        >
                          <X className='h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Content - Wizard mode sin scroll automático */}
              <div className={cn(
                'flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar',
                noContentScroll
                  ? 'px-0' // ← Sin padding horizontal en wizard mode
                  : 'px-3 sm:px-6',
                compact ? 'py-3 sm:py-4' : 'py-3'
              )}>
                {children}
              </div>

              {/* Footer mejorado y compacto */}
              {footer && (
                <div className='px-3 sm:px-6 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 flex-shrink-0'>
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  isLoading = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size='sm'
      footer={
        <>
          {/* Botón Cancelar */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
              'hover:bg-gray-200 dark:hover:bg-gray-700',
              'border border-gray-300 dark:border-gray-600',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'w-full sm:w-auto'
            )}
          >
            {cancelText}
          </button>

          {/* Botón Confirmar */}
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-bold text-white shadow-md transition-shadow hover:shadow-lg',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'w-full sm:w-auto',
              variant === 'danger'
                ? 'bg-gradient-to-r from-red-600 to-pink-600'
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            )}
          >
            <span className='flex items-center justify-center gap-2'>
              {isLoading && (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
              )}
              {isLoading ? 'Procesando...' : confirmText}
            </span>
          </button>
        </>
      }
    >
      <p className='text-sm leading-relaxed text-gray-700 dark:text-gray-300'>
        {message}
      </p>
    </Modal>
  )
}
