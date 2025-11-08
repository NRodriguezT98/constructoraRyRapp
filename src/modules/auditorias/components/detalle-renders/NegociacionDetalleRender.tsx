/**
 * NegociacionDetalleRender - Renderizado de detalles de auditoría para módulo Negociaciones
 *
 * ✅ Componente presentacional puro
 * ✅ < 100 líneas
 * ✅ Sin lógica compleja
 */

import { Building2, CreditCard, DollarSign, Home, User } from 'lucide-react'

import { formatearDinero } from '../../utils/formatters'

interface NegociacionDetalleRenderProps {
  metadata: Record<string, any>
}

export function NegociacionDetalleRender({ metadata }: NegociacionDetalleRenderProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Cliente
          </label>
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {metadata.cliente_nombre || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Documento
          </label>
          <div className="text-base text-gray-900 dark:text-white">
            {metadata.cliente_documento || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Vivienda
          </label>
          <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
            <Home className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            {metadata.vivienda_nombre || `#${metadata.vivienda_numero}` || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Proyecto
          </label>
          <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {metadata.proyecto_nombre || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Valor Total
          </label>
          <div className="flex items-center gap-2 text-base font-bold text-green-600 dark:text-green-400">
            <DollarSign className="w-5 h-5" />
            {metadata.negociacion_valor_formateado || formatearDinero(metadata.negociacion_valor_total || 0)}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Estado
          </label>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold capitalize">
            {metadata.negociacion_estado || 'N/A'}
          </span>
        </div>

        {metadata.negociacion_cuota_inicial && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Cuota Inicial
            </label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <CreditCard className="w-5 h-5 text-gray-400" />
              {formatearDinero(metadata.negociacion_cuota_inicial)}
            </div>
          </div>
        )}

        {metadata.negociacion_saldo_pendiente && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Saldo Pendiente
            </label>
            <div className="text-base font-bold text-red-600 dark:text-red-400">
              {formatearDinero(metadata.negociacion_saldo_pendiente)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
