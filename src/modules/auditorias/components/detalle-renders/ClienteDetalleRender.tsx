/**
 * ClienteDetalleRender - Renderizado de detalles de auditoría para módulo Clientes
 *
 * ✅ Componente presentacional puro
 * ✅ < 100 líneas
 * ✅ Sin lógica compleja
 */

import { MapPin, Phone, User, Users } from 'lucide-react'

interface ClienteDetalleRenderProps {
  metadata: Record<string, any>
}

export function ClienteDetalleRender({ metadata }: ClienteDetalleRenderProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Nombre Completo
          </label>
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {metadata.cliente_nombre_completo || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Documento
          </label>
          <div className="text-base text-gray-900 dark:text-white">
            {metadata.cliente_tipo_documento || 'CC'} {metadata.cliente_numero_documento || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Teléfono
          </label>
          <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
            <Phone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            {metadata.cliente_telefono || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Email
          </label>
          <div className="text-base text-gray-900 dark:text-white">
            {metadata.cliente_email || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Ciudad
          </label>
          <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
            <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
            {metadata.cliente_ciudad || 'N/A'}, {metadata.cliente_departamento || 'N/A'}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Estado
          </label>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold capitalize">
            {metadata.cliente_estado || 'N/A'}
          </span>
        </div>

        {metadata.cliente_origen && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Origen
            </label>
            <div className="text-base text-gray-900 dark:text-white">
              {metadata.cliente_origen}
            </div>
          </div>
        )}

        {metadata.cliente_referido_por && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Referido por
            </label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <Users className="w-5 h-5 text-gray-400" />
              {metadata.cliente_referido_por}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
