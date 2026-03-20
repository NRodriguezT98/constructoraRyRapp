/** Helpers de formato para inputs numéricos del modal de rebalanceo */

export function parseMonto(raw: string): number {
  const cleaned = raw.replace(/[^0-9]/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

export function formatMontoInput(value: number): string {
  if (!value) return ''
  return value.toLocaleString('es-CO')
}
