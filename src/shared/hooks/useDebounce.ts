import { useEffect, useState } from 'react'

/**
 * Hook para debounce de valores
 * Útil para búsquedas, auto-guardado, etc.
 * @param value - Valor a debounce
 * @param delay - Delay en milisegundos (default: 500ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        // Actualizar el valor debounced después del delay
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Limpiar el timeout si el valor cambia antes del delay
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}