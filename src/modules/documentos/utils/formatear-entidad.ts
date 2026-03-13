/**
 * Formatea el nombre de una entidad financiera con formato de título
 * Ejemplo: "COMFANDI" -> "Comfandi"
 * Ejemplo: "CAJA COMPENSACIÓN" -> "Caja Compensación"
 */
export function formatearEntidad(entidad: string | null | undefined): string {
  if (!entidad || entidad === '') {
    return ''
  }

  return String(entidad)
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
