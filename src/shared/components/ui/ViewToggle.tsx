'use client'

import { motion } from 'framer-motion'
import { Grid3x3, List } from 'lucide-react'
import { cn } from '../../utils/helpers'

export type ViewMode = 'grid' | 'lista'

interface ViewToggleProps {
    /** Vista actual */
    value: ViewMode
    /** Callback cuando cambia la vista */
    onChange: (value: ViewMode) => void
    /** Clases adicionales */
    className?: string
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
    return (
        <div className={cn(
            "flex bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm",
            className
        )}>
            <button
                onClick={() => onChange('grid')}
                className={cn(
                    'px-4 py-3 transition-all duration-200 relative',
                    value === 'grid'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                )}
                type="button"
                aria-label="Vista de cuadrícula"
            >
                {value === 'grid' && (
                    <motion.div
                        layoutId="activeView"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Grid3x3 className="w-4 h-4 relative z-10" />
            </button>

            <div className="w-px bg-gray-200 dark:bg-gray-700" />

            <button
                onClick={() => onChange('lista')}
                className={cn(
                    'px-4 py-3 transition-all duration-200 relative',
                    value === 'lista'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                )}
                type="button"
                aria-label="Vista de lista"
            >
                {value === 'lista' && (
                    <motion.div
                        layoutId="activeView"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <List className="w-4 h-4 relative z-10" />
            </button>
        </div>
    )
}
