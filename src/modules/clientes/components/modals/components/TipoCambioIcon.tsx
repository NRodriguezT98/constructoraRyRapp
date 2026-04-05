/**
 * Componente: Icono de Tipo de Cambio
 * Renderiza el icono correcto con el color apropiado según el tipo de cambio
 * ✅ Separación de responsabilidades: Solo presentación, usa helpers para lógica
 */

'use client'

import { getTipoCambioColor, getTipoCambioIcon } from '../historial-helpers'

interface TipoCambioIconProps {
  tipoCambio: string
  className?: string
}

export function TipoCambioIcon({
  tipoCambio,
  className = 'w-4 h-4',
}: TipoCambioIconProps) {
  const IconComponent = getTipoCambioIcon(tipoCambio)
  const iconColor = getTipoCambioColor(tipoCambio)

  return <IconComponent className={`${className} ${iconColor}`} />
}
