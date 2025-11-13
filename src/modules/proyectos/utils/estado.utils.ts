/**
 * estado.utils - Utilidades para formatear estados de proyectos
 * ✅ Funciones puras
 * ✅ Reutilizables
 */

export type EstadoProyecto =
  | 'en_planificacion'
  | 'en_proceso'
  | 'en_construccion'
  | 'completado'
  | 'pausado'

/**
 * Formatea el estado del proyecto para mostrar en UI
 */
export function formatearEstadoProyecto(estado: string): string {
  const estadosMap: Record<string, string> = {
    en_planificacion: 'En Planificación',
    en_proceso: 'En Proceso',
    en_construccion: 'En Construcción',
    completado: 'Completado',
    pausado: 'Pausado',
  }
  return estadosMap[estado] || estado
}

/**
 * Obtiene el color para el badge de estado
 */
export function getEstadoColor(estado: string): {
  bg: string
  border: string
  text: string
} {
  const esEnProceso = estado === 'en_proceso' || estado === 'en_construccion'
  const esCompletado = estado === 'completado'

  if (esCompletado) {
    return {
      bg: 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40',
      border: 'border-green-200 dark:border-green-800/50',
      text: 'text-green-700 dark:text-green-300',
    }
  }

  if (esEnProceso) {
    return {
      bg: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40',
      border: 'border-blue-200 dark:border-blue-800/50',
      text: 'text-blue-700 dark:text-blue-300',
    }
  }

  return {
    bg: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/40 dark:to-gray-700/40',
    border: 'border-gray-300 dark:border-gray-600/50',
    text: 'text-gray-700 dark:text-gray-300',
  }
}
