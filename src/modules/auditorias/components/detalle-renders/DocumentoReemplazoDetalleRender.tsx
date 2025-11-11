/**
 * DocumentoReemplazoDetalleRender - Render especializado para reemplazos de archivos
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Muestra detalles de metadata de reemplazos de documentos
 * ✅ Compatible con sistema de auditoría detallada
 */

'use client'

import { AlertTriangle, FileText, HardDrive, Shield } from 'lucide-react'

import { InfoCard } from '../shared'

interface DocumentoReemplazoDetalleRenderProps {
  metadata: Record<string, any>
}

export function DocumentoReemplazoDetalleRender({ metadata }: DocumentoReemplazoDetalleRenderProps) {
  const tipoOperacion = metadata.tipo_operacion || 'N/A'
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
          value={tipoOperacion}
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
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <h5 className="text-xs font-semibold text-red-900 dark:text-red-300">
                Archivo Eliminado
              </h5>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-red-800 dark:text-red-400">
                <strong>Nombre:</strong> {archivoAnterior.nombre || 'N/A'}
              </p>
              <p className="text-xs text-red-800 dark:text-red-400">
                <strong>Tamaño:</strong> {archivoAnterior.tamano_formateado || 'N/A'}
              </p>
              <p className="text-xs text-red-700 dark:text-red-500 font-mono break-all">
                {archivoAnterior.ruta || 'N/A'}
              </p>
            </div>
          </div>

          {/* Archivo nuevo */}
          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <h5 className="text-xs font-semibold text-green-900 dark:text-green-300">
                Archivo Nuevo
              </h5>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-green-800 dark:text-green-400">
                <strong>Nombre:</strong> {archivoNuevo.nombre || 'N/A'}
              </p>
              <p className="text-xs text-green-800 dark:text-green-400">
                <strong>Tamaño:</strong> {archivoNuevo.tamano_formateado || 'N/A'}
              </p>
              <p className="text-xs text-green-700 dark:text-green-500 font-mono break-all">
                {archivoNuevo.ruta || 'N/A'}
              </p>
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
