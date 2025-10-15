/**
 * Utilidades de validación
 */

// Validar email
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Validar teléfono colombiano
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(\+57)?[\s-]?3[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}$/
    return phoneRegex.test(phone)
}

// Validar URL
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

// Validar RUT/NIT colombiano
export const isValidNIT = (nit: string): boolean => {
    const cleaned = nit.replace(/[^0-9]/g, '')
    return cleaned.length >= 9 && cleaned.length <= 10
}

// Validar cédula colombiana
export const isValidCC = (cc: string): boolean => {
    const cleaned = cc.replace(/[^0-9]/g, '')
    return cleaned.length >= 6 && cleaned.length <= 10
}

// Validar que un string no esté vacío
export const isNotEmpty = (str: string): boolean => {
    return str.trim().length > 0
}

// Validar rango de números
export const isInRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
}

// Validar longitud de string
export const hasValidLength = (str: string, min: number, max: number): boolean => {
    return str.length >= min && str.length <= max
}

// Validar que sea un número
export const isNumeric = (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value)
}

// Validar que sea un entero
export const isInteger = (value: any): boolean => {
    return Number.isInteger(Number(value))
}

// Validar que sea positivo
export const isPositive = (value: number): boolean => {
    return value > 0
}

// Validar fecha
export const isValidDate = (date: string): boolean => {
    const d = new Date(date)
    return d instanceof Date && !isNaN(d.getTime())
}

// Validar que una fecha sea futura
export const isFutureDate = (date: string): boolean => {
    return new Date(date) > new Date()
}

// Validar que una fecha sea pasada
export const isPastDate = (date: string): boolean => {
    return new Date(date) < new Date()
}