/**
 * ClienteDetalleRender - Renderizado de detalles de auditoría para módulo Clientes
 *
 * ✅ Componente presentacional puro
 * ✅ < 100 líneas
 * ✅ Sin lógica compleja
 */

import { MapPin, Phone, User, Users } from 'lucide-react'

interface ClienteDetalleRenderProps {
  metadata: Record<string, unknown>
}

export function ClienteDetalleRender({ metadata }: ClienteDetalleRenderProps) {
  const get = (key: string, fallback = 'N/A'): string =>
    metadata[key] != null ? String(metadata[key]) : fallback

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Nombre Completo
          </label>
          <div className='flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white'>
            <User className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            {get('cliente_nombre_completo')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Documento
          </label>
          <div className='text-base text-gray-900 dark:text-white'>
            {get('cliente_tipo_documento', 'CC')}{' '}
            {get('cliente_numero_documento')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Teléfono
          </label>
          <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
            <Phone className='h-5 w-5 text-cyan-600 dark:text-cyan-400' />
            {get('cliente_telefono')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Email
          </label>
          <div className='text-base text-gray-900 dark:text-white'>
            {get('cliente_email')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Ciudad
          </label>
          <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
            <MapPin className='h-5 w-5 text-red-600 dark:text-red-400' />
            {get('cliente_ciudad')}, {get('cliente_departamento')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Estado
          </label>
          <span className='inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-bold capitalize text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
            {get('cliente_estado')}
          </span>
        </div>

        {metadata.cliente_origen != null && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Origen
            </label>
            <div className='text-base text-gray-900 dark:text-white'>
              {get('cliente_origen')}
            </div>
          </div>
        )}

        {metadata.cliente_referido_por != null && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Referido por
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Users className='h-5 w-5 text-gray-400' />
              {get('cliente_referido_por')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
