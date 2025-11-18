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
  metadata: Record<string, any>
}

export function DocumentoReemplazoDetalleRender({ metadata }: DocumentoReemplazoDetalleRenderProps) {
  const tipoOperacion = metadata.tipo_operacion || 'N/A'
  const tipoOperacionLabel = getTipoOperacionLabel(tipoOperacion)
  const justificacion = metadata.justificacion || 'Sin justificación registrada'
  const versionAfectada = metadata.version_afectada || 'N/A'
  const archivoAnterior = metadata.archivo_anterior || {}
  const archivoNuevo = metadata.archivo_nuevo || {}
  const adminVerificado = metadata.admin_verificado || false
  const cambioCritico = metadata.cambio_critico || false

  return (
    <div className="space-y-4">
      {/* Advertencia de cambio crítico */}
      {cambioCritico && (
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="flex-shrink-0 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                ⚠️ Operación Administrativa Crítica
              </h4>
              <p className="mt-1 text-xs text-orange-800 dark:text-orange-400">
                Reemplazo de archivo realizado por administrador. Esta acción es irreversible y no genera versión nueva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de operación */}
        <InfoCard
          icon={Shield}
          label="Tipo de Operación"
          value={tipoOperacionLabel}
        />

        {/* Versión afectada */}
        <InfoCard
          icon={FileText}
          label="Versión Afectada"
          value={`v${versionAfectada}`}
        />

        {/* Admin verificado */}
        <InfoCard
          icon={Shield}
          label="Verificación Admin"
          value={adminVerificado ? '✅ Contraseña confirmada' : '❌ No verificado'}
        />

        {/* Cambio crítico */}
        <InfoCard
          icon={AlertTriangle}
          label="Nivel de Criticidad"
          value={cambioCritico ? '🔴 Alta' : '🟡 Media'}
        />
      </div>

      {/* Justificación */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Justificación del Reemplazo
          </h4>
        </div>
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          {justificacion}
        </p>
      </div>

      {/* Comparación de archivos */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <HardDrive size={16} className="text-purple-600 dark:text-purple-400" />
          Comparación de Archivos
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Archivo anterior */}
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-red-200 dark:border-red-800">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-red-600 dark:text-red-500" />
              </div>
              <h5 className="text-sm font-semibold text-red-900 dark:text-red-300">
                Archivo Eliminado (Backup)
              </h5>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">Nombre</p>
                <p className="text-sm font-semibold text-red-900 dark:text-red-100 break-all">
                  {archivoAnterior.nombre || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">Tamaño</p>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  {archivoAnterior.tamano_formateado || 'N/A'}
                </p>
              </div>
              {archivoAnterior.url_backup && (
                <a
                  href={archivoAnterior.url_backup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Eye className="w-4 h-4" />
                  Ver Archivo Original
                </a>
              )}
              {!archivoAnterior.url_backup && archivoAnterior.ruta && (
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
                  <p className="text-xs text-red-700 dark:text-red-400 font-mono break-all">
                    {archivoAnterior.ruta}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1 italic">
                    ⚠️ URL de descarga no disponible
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Archivo nuevo */}
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-green-200 dark:border-green-800">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600 dark:text-green-500" />
              </div>
              <h5 className="text-sm font-semibold text-green-900 dark:text-green-300">
                Archivo Nuevo (Actual)
              </h5>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Nombre</p>
                <p className="text-sm font-semibold text-green-900 dark:text-green-100 break-all">
                  {archivoNuevo.nombre || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Tamaño</p>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  {archivoNuevo.tamano_formateado || 'N/A'}
                </p>
              </div>
              {archivoNuevo.url_actual && (
                <a
                  href={archivoNuevo.url_actual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Eye className="w-4 h-4" />
                  Ver Archivo Actual
                </a>
              )}
              {!archivoNuevo.url_actual && archivoNuevo.ruta && (
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded border border-green-300 dark:border-green-700">
                  <p className="text-xs text-green-700 dark:text-green-400 font-mono break-all">
                    {archivoNuevo.ruta}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1 italic">
                    ⚠️ URL de descarga no disponible
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información técnica adicional */}
      {(metadata.ip_origen || metadata.user_agent) && (
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
            Información Técnica
          </h4>
          <div className="space-y-1">
            {metadata.ip_origen && (
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>IP:</strong> {metadata.ip_origen}
              </p>
            )}
            {metadata.user_agent && (
              <p className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all">
                <strong>User Agent:</strong> {metadata.user_agent}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
