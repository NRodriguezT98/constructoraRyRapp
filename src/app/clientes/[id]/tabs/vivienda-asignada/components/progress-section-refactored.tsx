/**
 * ============================================
 * COMPONENTE: ProgressSection (No usado actualmente)
 * ============================================
 *
 * Sección legacy de progreso. Reemplazada por ProgressBarProminente.
 * Mantener para compatibilidad.
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

export function ProgressSection() {
  return (
    <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20'>
      <p className='text-sm text-yellow-800 dark:text-yellow-200'>
        ⚠️ Componente legacy - Usar ProgressBarProminente en su lugar
      </p>
    </div>
  )
}
