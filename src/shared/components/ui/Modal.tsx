import { X } from 'lucide-react'
import { useEffect } from 'react'
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
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw]',
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
}: ModalProps) {
  const modalRef = useClickOutside<HTMLDivElement>(() => {
    if (closeOnBackdrop) onClose()
  })

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
    <>
      {isOpen && (
        <>
          {/* Backdrop Optimizado */}
          <div
            className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity dark:bg-black/70'
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal Container */}
          <div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4'>
            <div
              ref={modalRef}
              className={cn(
                'relative my-4 w-full',
                'bg-white dark:bg-gray-900',
                'rounded-xl shadow-2xl',
                'border border-gray-200/80 dark:border-gray-700/50',
                'overflow-hidden',
                sizeClasses[size],
                className
              )}
            >
              {/* Borde superior con gradiente */}
              <div className='absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' />

              {/* Header */}
              {(title || showCloseButton) && (
                <div className='relative flex items-start justify-between border-b border-gray-200/50 bg-gradient-to-b from-gray-50/50 to-transparent p-4 dark:border-gray-700/50 dark:from-gray-800/30'>
                  <div className='flex-1 pr-3'>
                    {title && (
                      <div className='mb-1'>
                        <h2 className='bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-xl font-black text-transparent dark:from-white dark:via-gray-200 dark:to-white'>
                          {title}
                        </h2>
                      </div>
                    )}
                    {description && (
                      <p className='text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400'>
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Botón de cerrar */}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className='flex-shrink-0 rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  )}
                </div>
              )}

              {/* Content con scroll suave */}
              <div className='custom-scrollbar max-h-[calc(90vh-200px)] overflow-y-auto p-4'>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className='flex flex-col items-stretch justify-end gap-2 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/80 to-transparent p-4 dark:border-gray-700/50 dark:from-gray-800/30 sm:flex-row sm:items-center'>
                  {footer}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
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
