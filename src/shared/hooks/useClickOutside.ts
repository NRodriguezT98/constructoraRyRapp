import { useEffect, useRef } from 'react'

/**
 * Hook para detectar clicks fuera de un elemento
 * @param callback - Función a ejecutar cuando se hace click fuera
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    callback: () => void
) {
    const ref = useRef<T>(null)

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback()
            }
        }

        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [callback])

    return ref
}