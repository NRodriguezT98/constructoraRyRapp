'use client'

import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { cn } from '../../utils/helpers'

interface FilterButtonProps {
    /** Si los filtros están activos/visibles */
    active: boolean
    /** Callback al hacer click */
    onClick: () => void
    /** Label del botón */
    label?: string
    /** Clases adicionales */
    className?: string
}

export function FilterButton({
    active,
    onClick,
    label = 'Filtros',
    className
}: FilterButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            className={cn(
                "px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200",
                active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500",
                className
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
        >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
        </motion.button>
    )
}
