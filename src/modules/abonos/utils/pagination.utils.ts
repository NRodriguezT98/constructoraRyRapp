/**
 * Genera el array de números/puntos suspensivos para un paginador.
 *
 * Ejemplos:
 *   current=1, total=3  → [1, 2, 3]
 *   current=5, total=10 → [1, '...', 4, 5, 6, '...', 10]
 *   current=9, total=10 → [1, '...', 6, 7, 8, 9, 10]
 */
export function getPaginationPages(
  current: number,
  total: number
): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3)
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}
