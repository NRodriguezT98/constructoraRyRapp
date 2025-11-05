/**
 * Utilidades de formateo para auditorías
 *
 * ✅ SOLO funciones puras sin side effects
 * ✅ Sin estado, sin hooks, sin JSX
 */

/**
 * Formatea una fecha al formato español completo
 */
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Formatea un número como dinero en pesos colombianos
 */
export function formatearDinero(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor)
}

/**
 * Obtiene el label de una acción de auditoría
 */
export function getAccionLabel(accion: string): string {
  switch (accion) {
    case 'CREATE': return 'Creación'
    case 'UPDATE': return 'Actualización'
    case 'DELETE': return 'Eliminación'
    default: return accion
  }
}
