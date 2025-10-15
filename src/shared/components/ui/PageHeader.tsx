'use client'

import { motion } from 'framer-motion'
import { LucideIcon, Sparkles, ArrowRight } from 'lucide-react'
import { staggerItem } from '../../styles/animations'
import { cn } from '../../utils/helpers'

interface PageHeaderProps {
    /** Título principal de la página */
    title: string
    /** Descripción o subtítulo */
    description?: string
    /** Icono de Lucide React */
    icon: LucideIcon
    /** Color del gradiente del icono (tailwind colors) */
    iconColor?: string
    /** Color del gradiente del título */
    titleGradient?: string
    /** Botón de acción principal */
    action?: {
        label: string
        onClick: () => void
        icon?: LucideIcon
    }
    /** Clases adicionales para el contenedor */
    className?: string
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    iconColor = 'from-blue-500 to-blue-600',
    titleGradient = 'from-blue-600 via-purple-600 to-pink-600',
    action,
    className
}: PageHeaderProps) {
    const ActionIcon = action?.icon

    return (
        <motion.div
            variants={staggerItem}
            className={cn("mb-12 relative", className)}
        >
            {/* Fondo decorativo con gradientes animados */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute -top-10 -right-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1,
                    }}
                />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
                <div className="flex items-start gap-6">
                    {/* Ícono premium con múltiples capas de efectos */}
                    <motion.div
                        className="relative flex-shrink-0"
                        whileHover={{ scale: 1.08, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                        {/* Resplandor exterior animado */}
                        <motion.div
                            className={cn(
                                "absolute inset-0 rounded-2xl blur-2xl opacity-30",
                                `bg-gradient-to-r ${iconColor}`
                            )}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />

                        {/* Anillo de brillo rotatorio */}
                        <motion.div
                            className={cn(
                                "absolute -inset-2 rounded-2xl blur-xl opacity-20",
                                `bg-gradient-to-r ${iconColor}`
                            )}
                            animate={{
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />

                        {/* Contenedor del ícono con glassmorphism */}
                        <div className={cn(
                            "relative p-5 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm",
                            `bg-gradient-to-br ${iconColor}`
                        )}>
                            <motion.div
                                animate={{
                                    y: [0, -3, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Icon className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
                            </motion.div>
                        </div>

                        {/* Destello decorativo */}
                        <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [1, 0.5, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </motion.div>

                    {/* Título y descripción premium */}
                    <div className="flex-1 min-w-0">
                        {/* Título con efectos avanzados */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-3"
                        >
                            <h1 className="relative inline-block">
                                {/* Sombra de texto con color */}
                                <span
                                    className={cn(
                                        "absolute inset-0 blur-lg bg-clip-text text-transparent opacity-50",
                                        `bg-gradient-to-r ${titleGradient}`
                                    )}
                                    aria-hidden="true"
                                >
                                    {title}
                                </span>

                                {/* Texto principal con gradiente animado */}
                                <motion.span
                                    className={cn(
                                        "relative text-4xl md:text-5xl lg:text-6xl font-black bg-clip-text text-transparent",
                                        `bg-gradient-to-r ${titleGradient}`
                                    )}
                                    style={{
                                        backgroundSize: '200% 200%',
                                    }}
                                    animate={{
                                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    {title}
                                </motion.span>

                                {/* Línea decorativa animada */}
                                <motion.div
                                    className={cn(
                                        "h-1.5 mt-3 rounded-full",
                                        `bg-gradient-to-r ${titleGradient}`
                                    )}
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                />
                            </h1>
                        </motion.div>

                        {/* Descripción mejorada */}
                        {description && (
                            <motion.div
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <motion.div
                                    className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium">
                                    {description}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Botón de acción premium */}
                {action && (
                    <motion.button
                        onClick={action.onClick}
                        className="relative px-8 py-4 rounded-2xl font-bold text-white overflow-hidden group shadow-2xl flex-shrink-0"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {/* Gradiente de fondo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-transform group-hover:scale-110" />

                        {/* Resplandor en hover */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                            initial={false}
                        />

                        {/* Efecto de brillo que se desliza */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                                x: ['-200%', '200%'],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                repeatDelay: 1,
                            }}
                        />

                        {/* Contenido del botón */}
                        <span className="relative flex items-center gap-3 text-base whitespace-nowrap">
                            {ActionIcon && (
                                <motion.div
                                    animate={{
                                        rotate: [0, 15, -15, 0],
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        repeatDelay: 3,
                                    }}
                                >
                                    <ActionIcon className="w-5 h-5" strokeWidth={2.5} />
                                </motion.div>
                            )}
                            {action.label}

                            {/* Flecha animada */}
                            <motion.span
                                animate={{
                                    x: [0, 4, 0],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                            </motion.span>
                        </span>

                        {/* Sparkles decorativos */}
                        <motion.div
                            className="absolute -top-1 -right-1"
                            animate={{
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            <Sparkles className="w-4 h-4 text-white opacity-75" />
                        </motion.div>
                    </motion.button>
                )}
            </div>
        </motion.div>
    )
}
