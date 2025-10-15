'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/helpers'

interface SearchBarProps {
    /** Valor actual del buscador */
    value: string
    /** Callback cuando cambia el valor */
    onChange: (value: string) => void
    /** Texto placeholder */
    placeholder?: string
    /** Clases adicionales */
    className?: string
}

export function SearchBar({
    value,
    onChange,
    placeholder = 'Buscar...',
    className
}: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <div className={cn(
            "relative group",
            isFocused && "scale-[1.01] transition-transform duration-200",
            className
        )}>
            {/* Halo de gradiente */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isFocused && "opacity-100"
            )} />

            {/* Input container */}
            <div className="relative">
                <Search className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 pointer-events-none",
                    isFocused
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                )} />

                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={cn(
                        "w-full h-12 pl-12 pr-12 bg-white dark:bg-gray-800 border-2 rounded-xl font-medium",
                        "text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                        isFocused
                            ? "border-blue-500 dark:border-blue-500 shadow-lg shadow-blue-500/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                />

                {/* Botón limpiar */}
                {value && (
                    <button
                        onClick={() => onChange('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        type="button"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                )}
            </div>
        </div>
    )
}
