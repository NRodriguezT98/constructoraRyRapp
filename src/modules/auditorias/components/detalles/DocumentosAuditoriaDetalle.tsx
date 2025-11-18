'use client'

/**
 * 📄 Componente de detalles de auditoría para DOCUMENTOS
 * Muestra de forma visual y amigable las operaciones sobre documentos:
 * - Marcar versión como errónea
 * - Marcar versión como obsoleta
 * - Restaurar estado de versión
 * - Reemplazo de archivo
 */

import { formatDateCompact } from '@/lib/utils/date.utils'
import { AlertTriangle, Clock, Download, FileQuestion, FileText, Package, RefreshCw, RotateCcw, User } from 'lucide-react'

interface DocumentosAuditoriaDetalleProps {
  metadata: any
  datosAnteriores?: any
  datosNuevos?: any
  usuarioEmail: string
  usuarioNombres?: string
  fechaEvento: string
}

export function DocumentosAuditoriaDetalle({
  metadata,
  datosAnteriores,
  datosNuevos,
  usuarioEmail,
  usuarioNombres,
  fechaEvento,
}: DocumentosAuditoriaDetalleProps) {
  const tipoOperacion = metadata?.tipo_operacion

  // 🎨 Renderizar según tipo de operación
  if (tipoOperacion === 'MARCAR_VERSION_ERRONEA') {
    return <VersionErroneaDetalle metadata={metadata} usuarioEmail={usuarioEmail} usuarioNombres={usuarioNombres} fechaEvento={fechaEvento} />
  }

  if (tipoOperacion === 'MARCAR_VERSION_OBSOLETA') {
    return <VersionObsoletaDetalle metadata={metadata} usuarioEmail={usuarioEmail} usuarioNombres={usuarioNombres} fechaEvento={fechaEvento} />
  }

  if (tipoOperacion === 'RESTAURAR_ESTADO_VERSION') {
    return <RestaurarEstadoDetalle metadata={metadata} usuarioEmail={usuarioEmail} usuarioNombres={usuarioNombres} fechaEvento={fechaEvento} />
  }

  if (tipoOperacion === 'REEMPLAZO_ARCHIVO') {
    return <ReemplazoArchivoDetalle metadata={metadata} usuarioEmail={usuarioEmail} usuarioNombres={usuarioNombres} fechaEvento={fechaEvento} />
  }

  // Fallback genérico
  return <DetalleGenerico metadata={metadata} datosAnteriores={datosAnteriores} datosNuevos={datosNuevos} />
}

// ============================================================================
// 🚨 VERSIÓN MARCADA COMO ERRÓNEA
// ============================================================================

function VersionErroneaDetalle({ metadata, usuarioEmail, usuarioNombres, fechaEvento }: any) {
  const doc = metadata?.documento
  const versionCorrecta = metadata?.version_correcta

  return (
    <div className="space-y-4">
      {/* Header con icono y título */}
      <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 dark:text-red-100 text-lg">
            Versión Marcada como Errónea
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Esta versión contiene información incorrecta y no debe ser utilizada
          </p>
        </div>
      </div>

      {/* Información del documento */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-gray-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Documento Afectado</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Título</p>
            <p className="font-medium text-gray-900 dark:text-white">{doc?.titulo || 'Sin título'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Versión</p>
            <p className="font-medium text-gray-900 dark:text-white">Versión {doc?.version}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Categoría</p>
            <p className="font-medium text-gray-900 dark:text-white">{doc?.categoria}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Estado Anterior</p>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              {doc?.estado_anterior || 'Válida'}
            </span>
          </div>
        </div>
      </div>

      {/* Motivo */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileQuestion className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <h4 className="font-semibold text-amber-900 dark:text-amber-100">Motivo del Marcado</h4>
        </div>
        <p className="text-amber-800 dark:text-amber-200">{metadata?.motivo_cambio}</p>
      </div>

      {/* Versión correcta (si existe) */}
      {versionCorrecta && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-green-600 dark:text-green-500" />
            <h4 className="font-semibold text-green-900 dark:text-green-100">Versión Correcta</h4>
          </div>
          <p className="text-sm text-green-800 dark:text-green-200">
            La versión correcta que reemplaza este error está identificada con ID: <code className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">{versionCorrecta.id}</code>
          </p>
        </div>
      )}

      {/* Usuario y fecha */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Marcado por</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {usuarioNombres || usuarioEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {formatDateCompact(fechaEvento)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 📦 VERSIÓN MARCADA COMO OBSOLETA
// ============================================================================

function VersionObsoletaDetalle({ metadata, usuarioEmail, usuarioNombres, fechaEvento }: any) {
  const doc = metadata?.documento

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Versión Marcada como Obsoleta
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Esta versión ya no es relevante y ha sido reemplazada
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-gray-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Documento</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Título</p>
            <p className="font-medium text-gray-900 dark:text-white">{doc?.titulo}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Versión</p>
            <p className="font-medium text-gray-900 dark:text-white">Versión {doc?.version}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Razón de Obsolescencia</h4>
        <p className="text-gray-700 dark:text-gray-300">{metadata?.razon_obsolescencia}</p>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Marcado por</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {usuarioNombres || usuarioEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {formatDateCompact(fechaEvento)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ♻️ RESTAURAR ESTADO DE VERSIÓN
// ============================================================================

function RestaurarEstadoDetalle({ metadata, usuarioEmail, usuarioNombres, fechaEvento }: any) {
  const doc = metadata?.documento
  const restauracion = metadata?.restauracion

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
          <RotateCcw className="w-5 h-5 text-green-600 dark:text-green-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg">
            Estado Restaurado a Válido
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            La versión ha sido restaurada y ahora es válida para uso
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-gray-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Documento</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Título</p>
            <p className="font-medium text-gray-900 dark:text-white">{doc?.titulo}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Versión</p>
            <p className="font-medium text-gray-900 dark:text-white">Versión {doc?.version}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Detalles de Restauración</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">Estado anterior:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium capitalize">
              {restauracion?.desde_estado}
            </span>
          </div>
          {restauracion?.motivo_original && (
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Motivo original:</p>
              <p className="text-sm text-blue-800 dark:text-blue-200 italic">"{restauracion.motivo_original}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Restaurado por</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {usuarioNombres || usuarioEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {formatDateCompact(fechaEvento)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 🔄 REEMPLAZO DE ARCHIVO
// ============================================================================

function ReemplazoArchivoDetalle({ metadata, usuarioEmail, usuarioNombres, fechaEvento }: any) {
  const archivoOriginal = metadata?.archivo_original
  const archivoNuevo = metadata?.archivo_nuevo
  const comparacion = metadata?.comparacion
  const tiempo = metadata?.tiempo
  const contexto = metadata?.contexto

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">
            Archivo Reemplazado
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            El contenido del documento fue actualizado con un nuevo archivo
          </p>
        </div>
      </div>

      {/* Información del documento */}
      {contexto && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Documento</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Título</p>
              <p className="font-medium text-gray-900 dark:text-white">{contexto.titulo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Versión</p>
              <p className="font-medium text-gray-900 dark:text-white">Versión {contexto.version}</p>
            </div>
          </div>
        </div>
      )}

      {/* Motivo del reemplazo */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Justificación</h4>
        <p className="text-amber-800 dark:text-amber-200">{metadata?.motivo_reemplazo}</p>
      </div>

      {/* Comparación de archivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Archivo original */}
        <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-red-200 dark:border-red-800">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-red-600 dark:text-red-500" />
            </div>
            <h4 className="font-semibold text-red-900 dark:text-red-100">Archivo Original (Reemplazado)</h4>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">Documento</p>
              <p className="font-semibold text-red-900 dark:text-red-100 text-base">{contexto?.titulo || 'Sin título'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">Tamaño</p>
                <p className="font-medium text-red-900 dark:text-red-100">{archivoOriginal?.tamano_mb} MB</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">Formato</p>
                <p className="font-medium text-red-900 dark:text-red-100 uppercase text-xs">
                  {archivoOriginal?.nombre?.split('.').pop() || 'N/A'}
                </p>
              </div>
            </div>
            {archivoOriginal?.url_backup && (
              <a
                href={archivoOriginal.url_backup}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Ver Archivo Original (Backup)
              </a>
            )}
          </div>
        </div>

        {/* Archivo nuevo */}
        <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-green-200 dark:border-green-800">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-500" />
            </div>
            <h4 className="font-semibold text-green-900 dark:text-green-100">Archivo Actual (Nuevo)</h4>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Documento</p>
              <p className="font-semibold text-green-900 dark:text-green-100 text-base">{contexto?.titulo || 'Sin título'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Tamaño</p>
                <p className="font-medium text-green-900 dark:text-green-100">{archivoNuevo?.tamano_mb} MB</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Formato</p>
                <p className="font-medium text-green-900 dark:text-green-100 uppercase text-xs">
                  {archivoNuevo?.nombre?.split('.').pop() || 'N/A'}
                </p>
              </div>
            </div>
            {archivoNuevo?.url_actual && (
              <a
                href={archivoNuevo.url_actual}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Ver Archivo Actual
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {comparacion && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Comparación</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Diferencia</p>
              <p className="font-medium text-gray-900 dark:text-white">{comparacion.diferencia_mb} MB</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cambio</p>
              <p className="font-medium text-gray-900 dark:text-white">{comparacion.porcentaje_cambio}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Horas transcurridas</p>
              <p className="font-medium text-gray-900 dark:text-white">{tiempo?.horas_transcurridas}h</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Reemplazado por</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {usuarioNombres || usuarioEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {formatDateCompact(fechaEvento)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 📋 FALLBACK GENÉRICO
// ============================================================================

function DetalleGenerico({ metadata, datosAnteriores, datosNuevos }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Metadata Adicional</h4>
        <pre className="text-xs bg-gray-900 dark:bg-black text-gray-100 p-3 rounded overflow-auto max-h-64">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </div>
    </div>
  )
}
