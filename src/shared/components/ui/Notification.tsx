import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '../../utils/helpers'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationProps {
    id: string
    type: NotificationType
    title: string
    message?: string
    duration?: number
    onClose: (id: string) => void
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

const gradientClasses = {
    success: 'from-green-500 to-emerald-500',
    error: 'from-red-500 to-rose-500',
    warning: 'from-yellow-500 to-orange-500',
    info: 'from-blue-500 to-cyan-500',
}

const bgClasses = {
    success: 'bg-green-50 dark:bg-green-950/30',
    error: 'bg-red-50 dark:bg-red-950/30',
    warning: 'bg-yellow-50 dark:bg-yellow-950/30',
    info: 'bg-blue-50 dark:bg-blue-950/30',
}

const borderClasses = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    warning: 'border-yellow-200 dark:border-yellow-800',
    info: 'border-blue-200 dark:border-blue-800',
}

export function Notification({
    id,
    type,
    title,
    message,
    duration = 5000,
    onClose
}: NotificationProps) {
    const Icon = icons[type]

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id)
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [id, duration, onClose])

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
                'relative flex items-start gap-4 p-4 pr-12 rounded-2xl shadow-2xl border backdrop-blur-sm min-w-[320px] max-w-md overflow-hidden',
                bgClasses[type],
                borderClasses[type]
            )}
        >
            {/* Borde superior gradiente animado */}
            <motion.div
                className={cn(
                    'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
                    gradientClasses[type]
                )}
                initial={{ width: '100%' }}
                animate={{ width: duration > 0 ? '0%' : '100%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
            />

            {/* Resplandor de fondo */}
            <motion.div
                className={cn(
                    'absolute -inset-1 blur-2xl opacity-20 rounded-2xl bg-gradient-to-r',
                    gradientClasses[type]
                )}
                animate={{
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Ícono con animación */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="relative flex-shrink-0"
            >
                <motion.div
                    className={cn(
                        'p-2 rounded-xl bg-gradient-to-br shadow-lg',
                        gradientClasses[type]
                    )}
                    animate={{
                        boxShadow: [
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        ],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </motion.div>
            </motion.div>

            {/* Contenido */}
            <div className="relative flex-1 min-w-0 pt-0.5">
                <motion.h4
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-bold text-gray-900 dark:text-white text-base"
                >
                    {title}
                </motion.h4>
                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                    >
                        {message}
                    </motion.p>
                )}
            </div>

            {/* Botón de cerrar premium */}
            <motion.button
                onClick={() => onClose(id)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all backdrop-blur-sm"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
            >
                <X className="w-4 h-4" />
            </motion.button>
        </motion.div>
    )
}

interface NotificationContainerProps {
    notifications: Array<{
        id: string
        type: NotificationType
        title: string
        message?: string
        duration?: number
    }>
    onClose: (id: string) => void
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
}

const positionClasses = {
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
}

export function NotificationContainer({
    notifications,
    onClose,
    position = 'top-right'
}: NotificationContainerProps) {
    return (
        <div className={cn('fixed z-50 flex flex-col gap-3', positionClasses[position])}>
            <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        {...notification}
                        onClose={onClose}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}