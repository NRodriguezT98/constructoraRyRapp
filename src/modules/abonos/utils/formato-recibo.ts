/**
 * Formatea un número de recibo al formato estándar de RyR Constructora.
 * Ejemplo: 1 → "RYR-0001", 42 → "RYR-0042"
 */
export function formatearNumeroRecibo(numero: number): string {
  return `RYR-${String(numero).padStart(4, '0')}`
}
