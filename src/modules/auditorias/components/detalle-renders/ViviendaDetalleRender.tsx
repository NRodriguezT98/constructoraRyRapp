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
  metadata: Record<string, unknown>
}

export function ViviendaDetalleRender({ metadata }: ViviendaDetalleRenderProps) {
  const get = (key: string, fallback = 'N/A'): string =>
    metadata[key] != null ? String(metadata[key]) : fallback

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Nombre
          </label>
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <Home className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            {get('vivienda_nombre')}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Número
          </label>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            #{get('vivienda_numero')}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Valor Base
          </label>
          <div className="flex items-center gap-2 text-base font-bold text-green-600 dark:text-green-400">
            <DollarSign className="w-5 h-5" />
            {metadata.vivienda_valor_formateado != null
              ? get('vivienda_valor_formateado')
              : formatearDinero(Number(metadata.vivienda_valor_base ?? 0))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Estado
          </label>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold capitalize">
            {get('vivienda_estado')}
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Área
          </label>
          <div className="text-base text-gray-900 dark:text-white">
            {get('vivienda_area')} m²
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Habitaciones / Baños
          </label>
          <div className="text-base text-gray-900 dark:text-white">
            {get('vivienda_habitaciones', '0')} hab. / {get('vivienda_banos', '0')} baños
          </div>
        </div>

        {metadata.proyecto_nombre != null && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Proyecto
            </label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {get('proyecto_nombre')}
            </div>
          </div>
        )}

        {metadata.manzana_nombre != null && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Manzana
            </label>
            <div className="text-base text-gray-900 dark:text-white">
              Manzana {get('manzana_nombre')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
