'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '../../utils/helpers'

export interface FilterOption<T = string> {
    value: T
    label: string
}

interface FilterPanelProps<T = string> {
    /** Si el panel está visible */
    show: boolean
    /** Título del panel */
    title?: string
    /** Opciones de filtro */
    options: FilterOption<T>[]
    /** Valor seleccionado */
    value?: T
    /** Callback cuando cambia la selección */
    onChange: (value?: T) => void
    /** Label para "Todos" */
    allLabel?: string
    /** Clases adicionales */
    className?: string
}

export function FilterPanel<T = string>({
    show,
    title = 'Filtrar por:',
    options,
    value,
    onChange,
    allLabel = 'Todos',
    className
}: FilterPanelProps<T>) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                        "p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700",
                        className
                    )}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {title}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* Botón "Todos" */}
                        <button
                            onClick={() => onChange(undefined)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                                value === undefined
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                            )}
                            type="button"
                        >
                            {allLabel}
                        </button>

                        {/* Opciones de filtro */}
                        {options.map((option) => (
                            <button
                                key={String(option.value)}
                                onClick={() => onChange(option.value)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                                    value === option.value
                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                                )}
                                type="button"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
