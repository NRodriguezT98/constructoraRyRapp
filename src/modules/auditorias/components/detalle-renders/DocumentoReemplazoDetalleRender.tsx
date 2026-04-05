/**
 * DocumentoReemplazoDetalleRender - Render especializado para reemplazos de archivos
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Muestra detalles de metadata de reemplazos de documentos
 * ✅ Compatible con sistema de auditoría detallada
 */

'use client'

import { AlertTriangle, Eye, FileText, HardDrive, Shield } from 'lucide-react'

import { getTipoOperacionLabel } from '../../utils/formatters'
import { InfoCard } from '../shared'

interface DocumentoReemplazoDetalleRenderProps {
  metadata: Record<string, unknown>
}

interface ArchivoInfo {
  nombre?: string
  tamano_formateado?: string
  url_backup?: string
  url_actual?: string
  ruta?: string
}

export function DocumentoReemplazoDetalleRender({
  metadata,
}: DocumentoReemplazoDetalleRenderProps) {
  const get = (key: string, fallback = 'N/A'): string =>
    metadata[key] != null ? String(metadata[key]) : fallback

  const tipoOperacion = String(metadata.tipo_operacion ?? 'N/A')
  const tipoOperacionLabel = getTipoOperacionLabel(tipoOperacion)
  const justificacion = get('justificacion', 'Sin justificación registrada')
  const versionAfectada = get('version_afectada')
  const archivoAnterior = (metadata.archivo_anterior ?? {}) as ArchivoInfo
  const archivoNuevo = (metadata.archivo_nuevo ?? {}) as ArchivoInfo
  const adminVerificado = Boolean(metadata.admin_verificado)
  const cambioCritico = Boolean(metadata.cambio_critico)

  return (
    <div className='space-y-4'>
      {/* Advertencia de cambio crítico */}
      {cambioCritico && (
        <div className='rounded-lg border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-900/20'>
          <div className='flex items-start gap-3'>
            <AlertTriangle
              size={20}
              className='mt-0.5 flex-shrink-0 text-orange-600 dark:text-orange-400'
            />
            <div>
              <h4 className='text-sm font-semibold text-orange-900 dark:text-orange-300'>
                ⚠️ Operación Administrativa Crítica
              </h4>
              <p className='mt-1 text-xs text-orange-800 dark:text-orange-400'>
                Reemplazo de archivo realizado por administrador. Esta acción es
                irreversible y no genera versión nueva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de información */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Tipo de operación */}
        <InfoCard
          icon={Shield}
          label='Tipo de Operación'
          value={tipoOperacionLabel}
        />

        {/* Versión afectada */}
        <InfoCard
          icon={FileText}
          label='Versión Afectada'
          value={`v${versionAfectada}`}
        />

        {/* Admin verificado */}
        <InfoCard
          icon={Shield}
          label='Verificación Admin'
          value={
            adminVerificado ? '✅ Contraseña confirmada' : '❌ No verificado'
          }
        />

        {/* Cambio crítico */}
        <InfoCard
          icon={AlertTriangle}
          label='Nivel de Criticidad'
          value={cambioCritico ? '🔴 Alta' : '🟡 Media'}
        />
      </div>

      {/* Justificación */}
      <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50'>
        <div className='mb-2 flex items-center gap-2'>
          <FileText size={16} className='text-blue-600 dark:text-blue-400' />
          <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
            Justificación del Reemplazo
          </h4>
        </div>
        <p className='text-xs leading-relaxed text-gray-700 dark:text-gray-300'>
          {justificacion}
        </p>
      </div>

      {/* Comparación de archivos */}
      <div className='space-y-3'>
        <h4 className='flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
          <HardDrive
            size={16}
            className='text-purple-600 dark:text-purple-400'
          />
          Comparación de Archivos
        </h4>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Archivo anterior */}
          <div className='rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20'>
            <div className='mb-3 flex items-center gap-2 border-b border-red-200 pb-3 dark:border-red-800'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30'>
                <FileText className='h-4 w-4 text-red-600 dark:text-red-500' />
              </div>
              <h5 className='text-sm font-semibold text-red-900 dark:text-red-300'>
                Archivo Eliminado (Backup)
              </h5>
            </div>
            <div className='space-y-3'>
              <div>
                <p className='mb-1 text-xs font-medium text-red-600 dark:text-red-400'>
                  Nombre
                </p>
                <p className='break-all text-sm font-semibold text-red-900 dark:text-red-100'>
                  {archivoAnterior.nombre || 'N/A'}
                </p>
              </div>
              <div>
                <p className='mb-1 text-xs font-medium text-red-600 dark:text-red-400'>
                  Tamaño
                </p>
                <p className='text-sm font-medium text-red-900 dark:text-red-100'>
                  {archivoAnterior.tamano_formateado || 'N/A'}
                </p>
              </div>
              {archivoAnterior.url_backup && (
                <a
                  href={archivoAnterior.url_backup}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex w-full transform items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:bg-red-700 hover:shadow-xl dark:bg-red-700 dark:hover:bg-red-600'
                >
                  <Eye className='h-4 w-4' />
                  Ver Archivo Original
                </a>
              )}
              {!archivoAnterior.url_backup && archivoAnterior.ruta && (
                <div className='rounded border border-red-300 bg-red-100 p-2 dark:border-red-700 dark:bg-red-900/30'>
                  <p className='break-all font-mono text-xs text-red-700 dark:text-red-400'>
                    {archivoAnterior.ruta}
                  </p>
                  <p className='mt-1 text-xs italic text-red-600 dark:text-red-500'>
                    ⚠️ URL de descarga no disponible
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Archivo nuevo */}
          <div className='rounded-xl border-2 border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20'>
            <div className='mb-3 flex items-center gap-2 border-b border-green-200 pb-3 dark:border-green-800'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30'>
                <FileText className='h-4 w-4 text-green-600 dark:text-green-500' />
              </div>
              <h5 className='text-sm font-semibold text-green-900 dark:text-green-300'>
                Archivo Nuevo (Actual)
              </h5>
            </div>
            <div className='space-y-3'>
              <div>
                <p className='mb-1 text-xs font-medium text-green-600 dark:text-green-400'>
                  Nombre
                </p>
                <p className='break-all text-sm font-semibold text-green-900 dark:text-green-100'>
                  {archivoNuevo.nombre || 'N/A'}
                </p>
              </div>
              <div>
                <p className='mb-1 text-xs font-medium text-green-600 dark:text-green-400'>
                  Tamaño
                </p>
                <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                  {archivoNuevo.tamano_formateado || 'N/A'}
                </p>
              </div>
              {archivoNuevo.url_actual && (
                <a
                  href={archivoNuevo.url_actual}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex w-full transform items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:bg-green-700 hover:shadow-xl dark:bg-green-700 dark:hover:bg-green-600'
                >
                  <Eye className='h-4 w-4' />
                  Ver Archivo Actual
                </a>
              )}
              {!archivoNuevo.url_actual && archivoNuevo.ruta && (
                <div className='rounded border border-green-300 bg-green-100 p-2 dark:border-green-700 dark:bg-green-900/30'>
                  <p className='break-all font-mono text-xs text-green-700 dark:text-green-400'>
                    {archivoNuevo.ruta}
                  </p>
                  <p className='mt-1 text-xs italic text-green-600 dark:text-green-500'>
                    ⚠️ URL de descarga no disponible
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información técnica adicional */}
      {(metadata.ip_origen != null || metadata.user_agent != null) && (
        <div className='rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50'>
          <h4 className='mb-2 text-xs font-semibold text-gray-900 dark:text-white'>
            Información Técnica
          </h4>
          <div className='space-y-1'>
            {metadata.ip_origen != null && (
              <p className='text-xs text-gray-700 dark:text-gray-300'>
                <strong>IP:</strong> {get('ip_origen')}
              </p>
            )}
            {metadata.user_agent != null && (
              <p className='break-all font-mono text-xs text-gray-700 dark:text-gray-300'>
                <strong>User Agent:</strong> {get('user_agent')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
