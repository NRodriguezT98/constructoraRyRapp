/**
 * ============================================
 * COMPONENTE: FuentePagoCardHeader
 * ============================================
 *
 * Componente especializado para el header de la tarjeta.
 * Responsabilidades:
 * - Mostrar tipo + entidad
 * - Icono dinámico
 * - Estado visual
 * - Botón de expansión
 */

import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { memo } from 'react'

interface FuentePagoCardHeaderProps {
  tipo: string
  entidad?: string | null
  icono: LucideIcon
  colores: {
    gradientFrom: string
    gradientTo: string
  }
  estadoVisual: {
    label: string
    color: string
  }
  isExpanded: boolean
  onToggleExpand: () => void
}

export const FuentePagoCardHeader = memo(function FuentePagoCardHeader({
  tipo,
  entidad,
  icono: IconoTipo,
  colores,
  estadoVisual,
  isExpanded,
  onToggleExpand,
}: FuentePagoCardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        {/* Icono dinámico */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(to bottom right, ${colores.gradientFrom}, ${colores.gradientTo})`
          }}
        >
          <IconoTipo className="w-4 h-4 text-white" />
        </div>

        {/* Tipo + Entidad */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {tipo}
            </h3>
            {entidad && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {entidad}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Estado + Botón expandir */}
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium ${estadoVisual.color}`}>
          {estadoVisual.label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation() // Prevenir propagación del evento
            onToggleExpand()
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isExpanded ? "Colapsar detalles" : "Expandir detalles"}
        >
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </div>
  )
})
