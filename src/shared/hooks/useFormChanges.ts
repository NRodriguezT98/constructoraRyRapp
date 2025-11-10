/**
 * useFormChanges - Hook para detectar cambios en formularios
 *
 * Características:
 * - Detecta cambios entre valores iniciales y actuales
 * - Lista específica de campos modificados
 * - Comparación deep para objetos/arrays
 * - Útil para habilitar/deshabilitar botón de guardar
 *
 * Uso:
 * ```tsx
 * const { hasChanges, changes, changedFields } = useFormChanges(
 *   formValues,
 *   initialData,
 *   ['nombre', 'ubicacion', 'descripcion']
 * )
 * ```
 */

import { useMemo } from 'react'

// ============================================================================
// TIPOS
// ============================================================================

interface FieldChange {
  field: string
  label: string
  oldValue: any
  newValue: any
}

interface UseFormChangesOptions {
  /**
   * Campos a ignorar en la comparación
   * Útil para campos como timestamps, IDs generados, etc.
   */
  ignoreFields?: string[]

  /**
   * Función custom de comparación
   * Por defecto usa isEqual de lodash
   */
  compareFunction?: (a: any, b: any) => boolean

  /**
   * Nombres legibles de los campos
   * { nombre: 'Nombre del Proyecto', ubicacion: 'Ubicación' }
   */
  fieldLabels?: Record<string, string>
}

// ============================================================================
// HELPER: Comparación profunda (si no usas lodash)
// ============================================================================

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Detecta cambios entre valores iniciales y actuales del formulario
 */
export function useFormChanges<T extends Record<string, any>>(
  currentValues: T,
  initialValues: T,
  options: UseFormChangesOptions = {}
) {
  const {
    ignoreFields = [],
    compareFunction = deepEqual,
    fieldLabels = {},
  } = options

  // ============================================================================
  // DETECTAR SI HAY CAMBIOS (booleano simple)
  // ============================================================================

  const hasChanges = useMemo(() => {
    // Obtener todas las claves únicas de ambos objetos
    const allKeys = new Set([
      ...Object.keys(currentValues),
      ...Object.keys(initialValues),
    ])

    // Filtrar campos ignorados
    const keysToCheck = Array.from(allKeys).filter(
      (key) => !ignoreFields.includes(key)
    )

    // Comparar cada campo
    for (const key of keysToCheck) {
      const currentValue = currentValues[key]
      const initialValue = initialValues[key]

      // Si son diferentes, hay cambios
      if (!compareFunction(currentValue, initialValue)) {
        return true
      }
    }

    return false
  }, [currentValues, initialValues, ignoreFields, compareFunction])

  // ============================================================================
  // LISTA DE CAMPOS MODIFICADOS
  // ============================================================================

  const changedFields = useMemo(() => {
    const fields: string[] = []

    const allKeys = new Set([
      ...Object.keys(currentValues),
      ...Object.keys(initialValues),
    ])

    const keysToCheck = Array.from(allKeys).filter(
      (key) => !ignoreFields.includes(key)
    )

    for (const key of keysToCheck) {
      const currentValue = currentValues[key]
      const initialValue = initialValues[key]

      if (!compareFunction(currentValue, initialValue)) {
        fields.push(key)
      }
    }

    return fields
  }, [currentValues, initialValues, ignoreFields, compareFunction])

  // ============================================================================
  // LISTA DETALLADA DE CAMBIOS (con valores old/new)
  // ============================================================================

  const changes = useMemo(() => {
    const changesList: FieldChange[] = []

    for (const field of changedFields) {
      const label = fieldLabels[field] || field
      const oldValue = initialValues[field]
      const newValue = currentValues[field]

      changesList.push({
        field,
        label,
        oldValue,
        newValue,
      })
    }

    return changesList
  }, [changedFields, currentValues, initialValues, fieldLabels])

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Verifica si un campo específico fue modificado
   */
  const isFieldChanged = (fieldName: string): boolean => {
    return changedFields.includes(fieldName)
  }

  /**
   * Obtiene el cambio específico de un campo
   */
  const getFieldChange = (fieldName: string): FieldChange | undefined => {
    return changes.find((change) => change.field === fieldName)
  }

  /**
   * Cuenta cuántos campos fueron modificados
   */
  const changesCount = changedFields.length

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estados principales
    hasChanges,
    changedFields,
    changes,
    changesCount,

    // Helpers
    isFieldChanged,
    getFieldChange,
  }
}

// ============================================================================
// EJEMPLO DE USO
// ============================================================================

/*
import { useFormChanges } from './useFormChanges'

function MyForm() {
  const initialData = {
    nombre: 'Proyecto Original',
    ubicacion: 'Medellín',
    descripcion: 'Descripción original',
    manzanas: [{ nombre: 'A', totalViviendas: 10 }]
  }

  const formValues = watch() // De React Hook Form

  const {
    hasChanges,
    changes,
    changesCount,
    isFieldChanged
  } = useFormChanges(formValues, initialData, {
    ignoreFields: ['id', 'created_at'], // Ignorar timestamps
    fieldLabels: {
      nombre: 'Nombre del Proyecto',
      ubicacion: 'Ubicación',
      descripcion: 'Descripción',
      manzanas: 'Manzanas'
    }
  })

  return (
    <div>
      {hasChanges && (
        <div className="bg-yellow-50 p-4 rounded">
          <p className="font-medium">{changesCount} cambio(s) detectado(s):</p>
          <ul>
            {changes.map(change => (
              <li key={change.field}>
                • {change.label}: "{change.oldValue}" → "{change.newValue}"
              </li>
            ))}
          </ul>
        </div>
      )}

      <button disabled={!hasChanges}>
        Guardar Cambios
      </button>
    </div>
  )
}
*/
