import { useState, useEffect } from 'react'

/**
 * Hook para persistir estado en localStorage
 * @param key - Clave en localStorage
 * @param initialValue - Valor inicial si no existe en localStorage
 * @returns [value, setValue] - Estado y función para actualizar
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
    // Estado para almacenar el valor
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue
        }

        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(`Error loading localStorage key "${key}":`, error)
            return initialValue
        }
    })

    // Función para actualizar el valor
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Permitir que value sea una función para la misma API que useState
            const valueToStore = value instanceof Function ? value(storedValue) : value

            setStoredValue(valueToStore)

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
        }
    }

    // Sincronizar con otros tabs/ventanas
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    setStoredValue(JSON.parse(e.newValue))
                } catch (error) {
                    console.error(`Error parsing localStorage change for key "${key}":`, error)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [key])

    return [storedValue, setValue]
}