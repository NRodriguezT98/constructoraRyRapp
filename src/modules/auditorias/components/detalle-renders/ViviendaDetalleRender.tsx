/**
 * ViviendaDetalleRender - Renderizado de detalles de auditoría para módulo Viviendas
 *
 * ✅ Componente presentacional puro
 * ✅ < 150 líneas
 * ✅ Sin lógica compleja
 */

import { Building2, DollarSign, Home } from 'lucide-react'
import { formatearDinero } from '../../utils/formatters'

interface ViviendaDetalleRenderProps {
  metadata: Record<string, any>
}

export function ViviendaDetalleRender({ metadata }: ViviendaDetalleRenderProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Nombre
          </label>
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <Home className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            {metadata.vivienda_nombre || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Número
          </label>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            #{metadata.vivienda_numero || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Valor Base
          </label>
          <div className="flex items-center gap-2 text-base font-bold text-green-600 dark:text-green-400">
            <DollarSign className="w-5 h-5" />
            {metadata.vivienda_valor_formateado || formatearDinero(metadata.vivienda_valor_base || 0)}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Estado
          </label>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold capitalize">
            {metadata.vivienda_estado || 'N/A'}
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Área
          </label>
          <div className="text-base text-gray-900 dark:text-white">
            {metadata.vivienda_area || 'N/A'} m²
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Habitaciones / Baños
          </label>
          <div className="text-base text-gray-900 dark:text-white">
            {metadata.vivienda_habitaciones || 0} hab. / {metadata.vivienda_banos || 0} baños
          </div>
        </div>

        {metadata.proyecto_nombre && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Proyecto
            </label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {metadata.proyecto_nombre}
            </div>
          </div>
        )}

        {metadata.manzana_nombre && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Manzana
            </label>
            <div className="text-base text-gray-900 dark:text-white">
              Manzana {metadata.manzana_nombre}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
