import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
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
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Premium con blur y gradiente */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-md"
                    >
                        {/* Gradientes decorativos en el backdrop */}
                        <motion.div
                            className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl"
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.5, 0.3, 0.5],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 1,
                            }}
                        />
                    </motion.div>

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            ref={modalRef}
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: 20,
                            }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 300,
                            }}
                            className={cn(
                                'relative w-full my-8',
                                'bg-white dark:bg-gray-900',
                                'rounded-3xl shadow-2xl',
                                'border border-gray-200/50 dark:border-gray-700/50',
                                'overflow-hidden',
                                sizeClasses[size],
                                className
                            )}
                        >
                            {/* Borde superior con gradiente animado */}
                            <motion.div
                                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                                animate={{
                                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                style={{
                                    backgroundSize: '200% 200%',
                                }}
                            />

                            {/* Resplandor superior */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/5 dark:from-blue-500/10 to-transparent pointer-events-none" />

                            {/* Header Premium */}
                            {(title || showCloseButton) && (
                                <div className="relative flex items-start justify-between p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-gray-50/50 dark:from-gray-800/30 to-transparent">
                                    <div className="flex-1 pr-4">
                                        {title && (
                                            <div className="flex items-center gap-3 mb-2">
                                                {/* Ícono decorativo */}
                                                <motion.div
                                                    animate={{
                                                        rotate: [0, 360],
                                                    }}
                                                    transition={{
                                                        duration: 20,
                                                        repeat: Infinity,
                                                        ease: 'linear',
                                                    }}
                                                >
                                                    <Sparkles className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                                </motion.div>

                                                {/* Título con gradiente */}
                                                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                                                    {title}
                                                </h2>
                                            </div>
                                        )}
                                        {description && (
                                            <p className="text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                                {description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Botón de cerrar premium */}
                                    {showCloseButton && (
                                        <motion.button
                                            onClick={onClose}
                                            className="relative flex-shrink-0 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors group"
                                            whileHover={{ scale: 1.05, rotate: 90 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                        >
                                            <X className="w-5 h-5 transition-transform group-hover:rotate-90" />

                                            {/* Resplandor en hover */}
                                            <motion.div
                                                className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity"
                                                initial={false}
                                            />
                                        </motion.button>
                                    )}
                                </div>
                            )}

                            {/* Content con scroll suave */}
                            <motion.div
                                className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-280px)] custom-scrollbar"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {children}
                            </motion.div>

                            {/* Footer Premium */}
                            {footer && (
                                <motion.div
                                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-6 sm:p-8 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-t from-gray-50/80 dark:from-gray-800/30 to-transparent backdrop-blur-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    {footer}
                                </motion.div>
                            )}

                            {/* Resplandor inferior */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/5 dark:from-purple-500/10 to-transparent pointer-events-none" />
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
            size="sm"
            footer={
                <>
                    {/* Botón Cancelar Premium */}
                    <motion.button
                        onClick={onClose}
                        disabled={isLoading}
                        className={cn(
                            "px-6 py-3 rounded-xl font-semibold transition-all duration-300",
                            "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                            "hover:bg-gray-200 dark:hover:bg-gray-700",
                            "border border-gray-300 dark:border-gray-600",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "w-full sm:w-auto"
                        )}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                        {cancelText}
                    </motion.button>

                    {/* Botón Confirmar Premium */}
                    <motion.button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={cn(
                            "relative px-6 py-3 rounded-xl font-bold text-white overflow-hidden group",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "w-full sm:w-auto",
                            variant === 'danger'
                                ? 'shadow-lg shadow-red-500/25'
                                : 'shadow-lg shadow-blue-500/25'
                        )}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                        {/* Gradiente de fondo */}
                        <div className={cn(
                            "absolute inset-0 transition-transform",
                            variant === 'danger'
                                ? 'bg-gradient-to-r from-red-600 to-pink-600 group-hover:scale-105'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-105'
                        )} />

                        {/* Resplandor en hover */}
                        <motion.div
                            className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300",
                                variant === 'danger'
                                    ? 'bg-gradient-to-r from-red-400 to-pink-400'
                                    : 'bg-gradient-to-r from-blue-400 to-purple-400'
                            )}
                            initial={false}
                        />

                        {/* Efecto de brillo deslizante */}
                        {!isLoading && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{
                                    x: ['-200%', '200%'],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    repeatDelay: 0.5,
                                }}
                            />
                        )}

                        {/* Texto del botón */}
                        <span className="relative flex items-center justify-center gap-2">
                            {isLoading && (
                                <motion.div
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                />
                            )}
                            {isLoading ? 'Procesando...' : confirmText}
                        </span>
                    </motion.button>
                </>
            }
        >
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {message}
            </p>
        </Modal>
    )
}