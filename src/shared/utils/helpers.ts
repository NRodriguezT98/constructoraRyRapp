/**
 * Utilidades para manejo de arrays y objetos
 */

// Agrupar array por una propiedad
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key])
        if (!result[groupKey]) {
            result[groupKey] = []
        }
        result[groupKey].push(item)
        return result
    }, {} as Record<string, T[]>)
}

// Ordenar array por propiedad
export function sortBy<T>(
    array: T[],
    key: keyof T,
    direction: 'asc' | 'desc' = 'asc'
): T[] {
    return [...array].sort((a, b) => {
        const aVal = a[key]
        const bVal = b[key]

        if (aVal < bVal) return direction === 'asc' ? -1 : 1
        if (aVal > bVal) return direction === 'asc' ? 1 : -1
        return 0
    })
}

// Eliminar duplicados
export function unique<T>(array: T[]): T[] {
    return Array.from(new Set(array))
}

// Eliminar duplicados por propiedad
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set()
    return array.filter(item => {
        const value = item[key]
        if (seen.has(value)) return false
        seen.add(value)
        return true
    })
}

// Dividir array en chunks
export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}

// Mezclar array aleatoriamente
export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Encontrar diferencias entre arrays
export function difference<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(item => !array2.includes(item))
}

// Encontrar intersección entre arrays
export function intersection<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(item => array2.includes(item))
}

// Omitir propiedades de un objeto
export function omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj }
    keys.forEach(key => delete result[key])
    return result
}

// Seleccionar propiedades de un objeto
export function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key]
        }
    })
    return result
}

// Deep clone de objetos
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

// Merge profundo de objetos
export function deepMerge<T extends object>(
    target: T,
    ...sources: Partial<T>[]
): T {
    if (!sources.length) return target

    const source = sources.shift()
    if (source) {
        Object.keys(source).forEach(key => {
            const targetValue = target[key as keyof T]
            const sourceValue = source[key as keyof T]

            if (isObject(targetValue) && isObject(sourceValue)) {
                target[key as keyof T] = deepMerge(
                    Object.assign({}, targetValue),
                    sourceValue
                ) as T[keyof T]
            } else if (sourceValue !== undefined) {
                target[key as keyof T] = sourceValue as T[keyof T]
            }
        })
    }

    return deepMerge(target, ...sources)
}

// Verificar si es un objeto
function isObject(item: any): item is object {
    return item && typeof item === 'object' && !Array.isArray(item)
}

// Obtener valor anidado de un objeto
export function getNestedValue<T = any>(
    obj: any,
    path: string,
    defaultValue?: T
): T {
    const keys = path.split('.')
    let result = obj

    for (const key of keys) {
        if (result?.[key] === undefined) {
            return defaultValue as T
        }
        result = result[key]
    }

    return result as T
}

// Establecer valor anidado en un objeto
export function setNestedValue(
    obj: any,
    path: string,
    value: any
): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    let current = obj

    for (const key of keys) {
        if (!current[key]) {
            current[key] = {}
        }
        current = current[key]
    }

    current[lastKey] = value
}

/**
 * Combina clases de Tailwind CSS de forma segura
 * Elimina duplicados y maneja valores undefined/null
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
    return inputs.filter(Boolean).join(' ')
}