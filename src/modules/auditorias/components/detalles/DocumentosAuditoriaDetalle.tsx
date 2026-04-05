'use client'

/**
 * 📄 Componente de detalles de auditoría para DOCUMENTOS
 * Muestra de forma visual y amigable las operaciones sobre documentos:
 * - Marcar versión como errónea
 * - Marcar versión como obsoleta
 * - Restaurar estado de versión
 * - Reemplazo de archivo
 */

import {
  AlertTriangle,
  Clock,
  Download,
  FileQuestion,
  FileText,
  Package,
  RefreshCw,
  RotateCcw,
  User,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'

interface DocumentosAuditoriaDetalleProps {
  metadata: Record<string, unknown>
  datosAnteriores?: Record<string, unknown>
  datosNuevos?: Record<string, unknown>
  usuarioEmail: string
  usuarioNombres?: string
  fechaEvento: string
}

interface DetalleSubProps {
  metadata: Record<string, unknown>
  usuarioEmail: string
  usuarioNombres?: string
  fechaEvento: string
}

interface DetalleGenericoSubProps {
  metadata: Record<string, unknown>
  datosAnteriores?: Record<string, unknown>
  datosNuevos?: Record<string, unknown>
}

/** Safely extract a string from Record<string, unknown> */
function str(
  obj: Record<string, unknown> | unknown,
  key: string,
  fallback = ''
): string {
  if (
    obj != null &&
    typeof obj === 'object' &&
    key in (obj as Record<string, unknown>)
  ) {
    const val = (obj as Record<string, unknown>)[key]
    return val != null ? String(val) : fallback
  }
  return fallback
}

/** Safely extract nested object from metadata */
function nested(
  meta: Record<string, unknown>,
  key: string
): Record<string, unknown> {
  const val = meta[key]
  return val != null && typeof val === 'object' && !Array.isArray(val)
    ? (val as Record<string, unknown>)
    : {}
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
    return (
      <VersionErroneaDetalle
        metadata={metadata}
        usuarioEmail={usuarioEmail}
        usuarioNombres={usuarioNombres}
        fechaEvento={fechaEvento}
      />
    )
  }

  if (tipoOperacion === 'MARCAR_VERSION_OBSOLETA') {
    return (
      <VersionObsoletaDetalle
        metadata={metadata}
        usuarioEmail={usuarioEmail}
        usuarioNombres={usuarioNombres}
        fechaEvento={fechaEvento}
      />
    )
  }

  if (tipoOperacion === 'RESTAURAR_ESTADO_VERSION') {
    return (
      <RestaurarEstadoDetalle
        metadata={metadata}
        usuarioEmail={usuarioEmail}
        usuarioNombres={usuarioNombres}
        fechaEvento={fechaEvento}
      />
    )
  }

  if (tipoOperacion === 'REEMPLAZO_ARCHIVO') {
    return (
      <ReemplazoArchivoDetalle
        metadata={metadata}
        usuarioEmail={usuarioEmail}
        usuarioNombres={usuarioNombres}
        fechaEvento={fechaEvento}
      />
    )
  }

  // Fallback genérico
  return (
    <DetalleGenerico
      metadata={metadata}
      datosAnteriores={datosAnteriores}
      datosNuevos={datosNuevos}
    />
  )
}

// ============================================================================
// 🚨 VERSIÓN MARCADA COMO ERRÓNEA
// ============================================================================

function VersionErroneaDetalle({
  metadata,
  usuarioEmail,
  usuarioNombres,
  fechaEvento,
}: DetalleSubProps) {
  const doc = nested(metadata, 'documento')
  const versionCorrecta = nested(metadata, 'version_correcta')
  const hasVersionCorrecta = metadata.version_correcta != null

  return (
    <div className='space-y-4'>
      {/* Header con icono y título */}
      <div className='flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30'>
          <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-500' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-red-900 dark:text-red-100'>
            Versión Marcada como Errónea
          </h3>
          <p className='mt-1 text-sm text-red-700 dark:text-red-300'>
            Esta versión contiene información incorrecta y no debe ser utilizada
          </p>
        </div>
      </div>

      {/* Información del documento */}
      <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-3 flex items-center gap-2'>
          <FileText className='h-4 w-4 text-gray-500' />
          <h4 className='font-semibold text-gray-900 dark:text-white'>
            Documento Afectado
          </h4>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Título</p>
            <p className='font-medium text-gray-900 dark:text-white'>
              {str(doc, 'titulo', 'Sin título')}
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Versión</p>
            <p className='font-medium text-gray-900 dark:text-white'>
              Versión {str(doc, 'version')}
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Categoría
            </p>
            <p className='font-medium text-gray-900 dark:text-white'>
              {str(doc, 'categoria')}
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Estado Anterior
            </p>
            <span className='inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'>
              {str(doc, 'estado_anterior', 'Válida')}
            </span>
          </div>
        </div>
      </div>

      {/* Motivo */}
      <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
        <div className='mb-2 flex items-center gap-2'>
          <FileQuestion className='h-4 w-4 text-amber-600 dark:text-amber-500' />
          <h4 className='font-semibold text-amber-900 dark:text-amber-100'>
            Motivo del Marcado
          </h4>
        </div>
        <p className='text-amber-800 dark:text-amber-200'>
          {str(metadata, 'motivo_cambio')}
        </p>
      </div>

      {/* Versión correcta (si existe) */}
      {hasVersionCorrecta && (
        <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20'>
          <div className='mb-2 flex items-center gap-2'>
            <FileText className='h-4 w-4 text-green-600 dark:text-green-500' />
            <h4 className='font-semibold text-green-900 dark:text-green-100'>
              Versión Correcta
            </h4>
          </div>
          <p className='text-sm text-green-800 dark:text-green-200'>
            La versión correcta que reemplaza este error está identificada con
            ID:{' '}
            <code className='rounded bg-green-100 px-1.5 py-0.5 text-xs dark:bg-green-900/30'>
              {str(versionCorrecta, 'id')}
            </code>
          </p>
        </div>
      )}

      {/* Usuario y fecha */}
      <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-gray-500' />
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Marcado por
            </p>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
              {usuarioNombres || usuarioEmail}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-gray-500' />
          <div className='text-right'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Fecha</p>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
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

function VersionObsoletaDetalle({
  metadata,
  usuarioEmail,
  usuarioNombres,
  fechaEvento,
}: DetalleSubProps) {
  const doc = nested(metadata, 'documento')

  return (
    <div className='space-y-4'>
      <div className='flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800'>
          <Package className='h-5 w-5 text-gray-600 dark:text-gray-400' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Versión Marcada como Obsoleta
          </h3>
          <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
            Esta versión ya no es relevante y ha sido reemplazada
          </p>
        </div>
      </div>

      <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-3 flex items-center gap-2'>
          <FileText className='h-4 w-4 text-gray-500' />
          <h4 className='font-semibold text-gray-900 dark:text-white'>
            Documento
          </h4>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Título</p>
            <p className='font-medium text-gray-900 dark:text-white'>
              {str(doc, 'titulo')}
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Versión</p>
            <p className='font-medium text-gray-900 dark:text-white'>
              Versión {str(doc, 'version')}
            </p>
          </div>
        </div>
      </div>

      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'>
        <h4 className='mb-2 font-semibold text-gray-900 dark:text-white'>
          Razón de Obsolescencia
        </h4>
        <p className='text-gray-700 dark:text-gray-300'>
          {str(metadata, 'razon_obsolescencia')}
        </p>
      </div>

      <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-gray-500' />
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Marcado por
            </p>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
              {usuarioNombres || usuarioEmail}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-gray-500' />
          <div className='text-right'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Fecha</p>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
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

function RestaurarEstadoDetalle({
  metadata,
  usuarioEmail,
  usuarioNombres,
  fechaEvento,
}: DetalleSubProps) {
  const doc = nested(metadata, 'documento')
  const restauracion = nested(metadata, 'restauracion')
  const hasMotivoOriginal = restauracion.motivo_original != null

  return (
    <div className='space-y-4'>
      <div className='flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30'>
          <RotateCcw className='h-5 w-5 text-green-600 dark:text-green-500' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-green-900 dark:text-green-100'>
            Estado Restaurado a Válido
          </h3>
          <p className='mt-1 text-sm text-green-700 dark:text-green-300'>
            La versión ha sido restaurada y ahora es válida para uso
          </p>
        </div>
      </div>

      <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-3 flex items-center gap-2'>
          <FileText className='h-4 w-4 text-gray-500' />
          <h4 className='font-semibold text-gray-900 dark:text-white'>
            Documento
          </h4>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Título</p>
            <p className='font-medium text-gray-900 dark:text-white'>
              {str(doc, 'titulo')}
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Versión</p>
            <p className='font-medium text-gray-900 dark:text-white'>
              Versión {str(doc, 'version')}
            </p>
          </div>
        </div>
      </div>

      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
        <h4 className='mb-3 font-semibold text-blue-900 dark:text-blue-100'>
          Detalles de Restauración
        </h4>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-blue-700 dark:text-blue-300'>
              Estado anterior:
            </span>
            <span className='inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium capitalize text-red-700 dark:bg-red-900/30 dark:text-red-400'>
              {str(restauracion, 'desde_estado')}
            </span>
          </div>
          {hasMotivoOriginal && (
            <div>
              <p className='mb-1 text-sm text-blue-700 dark:text-blue-300'>
                Motivo original:
              </p>
              <p className='text-sm italic text-blue-800 dark:text-blue-200'>
                &quot;{str(restauracion, 'motivo_original')}&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-gray-500' />
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Restaurado por
            </p>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
              {usuarioNombres || usuarioEmail}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-gray-500' />
          <div className='text-right'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Fecha</p>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
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

function ReemplazoArchivoDetalle({
  metadata,
  usuarioEmail,
  usuarioNombres,
  fechaEvento,
}: DetalleSubProps) {
  const archivoOriginal = nested(metadata, 'archivo_original')
  const archivoNuevo = nested(metadata, 'archivo_nuevo')
  const comparacion = nested(metadata, 'comparacion')
  const tiempo = nested(metadata, 'tiempo')
  const contexto = nested(metadata, 'contexto')
  const hasContexto = metadata.contexto != null
  const hasComparacion = metadata.comparacion != null
  const urlBackup = str(archivoOriginal, 'url_backup')
  const urlActual = str(archivoNuevo, 'url_actual')
  const nombreOriginal = str(archivoOriginal, 'nombre')

  return (
    <div className='space-y-4'>
      <div className='flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
          <RefreshCw className='h-5 w-5 text-blue-600 dark:text-blue-500' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-blue-900 dark:text-blue-100'>
            Archivo Reemplazado
          </h3>
          <p className='mt-1 text-sm text-blue-700 dark:text-blue-300'>
            El contenido del documento fue actualizado con un nuevo archivo
          </p>
        </div>
      </div>

      {/* Información del documento */}
      {hasContexto && (
        <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-3 flex items-center gap-2'>
            <FileText className='h-4 w-4 text-gray-500' />
            <h4 className='font-semibold text-gray-900 dark:text-white'>
              Documento
            </h4>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>Título</p>
              <p className='font-medium text-gray-900 dark:text-white'>
                {str(contexto, 'titulo')}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Versión
              </p>
              <p className='font-medium text-gray-900 dark:text-white'>
                Versión {str(contexto, 'version')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Motivo del reemplazo */}
      <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
        <h4 className='mb-2 font-semibold text-amber-900 dark:text-amber-100'>
          Justificación
        </h4>
        <p className='text-amber-800 dark:text-amber-200'>
          {str(metadata, 'motivo_reemplazo')}
        </p>
      </div>

      {/* Comparación de archivos */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Archivo original */}
        <div className='rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20'>
          <div className='mb-3 flex items-center gap-2 border-b border-red-200 pb-3 dark:border-red-800'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30'>
              <FileText className='h-4 w-4 text-red-600 dark:text-red-500' />
            </div>
            <h4 className='font-semibold text-red-900 dark:text-red-100'>
              Archivo Original (Reemplazado)
            </h4>
          </div>
          <div className='space-y-3'>
            <div>
              <p className='mb-1 text-xs font-medium text-red-600 dark:text-red-400'>
                Documento
              </p>
              <p className='text-base font-semibold text-red-900 dark:text-red-100'>
                {str(contexto, 'titulo', 'Sin título')}
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex-1'>
                <p className='mb-1 text-xs text-red-600 dark:text-red-400'>
                  Tamaño
                </p>
                <p className='font-medium text-red-900 dark:text-red-100'>
                  {str(archivoOriginal, 'tamano_mb')} MB
                </p>
              </div>
              <div className='flex-1'>
                <p className='mb-1 text-xs text-red-600 dark:text-red-400'>
                  Formato
                </p>
                <p className='text-xs font-medium uppercase text-red-900 dark:text-red-100'>
                  {nombreOriginal.split('.').pop() || 'N/A'}
                </p>
              </div>
            </div>
            {urlBackup && (
              <a
                href={urlBackup}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex w-full transform items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:bg-red-700 hover:shadow-xl dark:bg-red-700 dark:hover:bg-red-600'
              >
                <Download className='h-4 w-4' />
                Ver Archivo Original (Backup)
              </a>
            )}
          </div>
        </div>

        {/* Archivo nuevo */}
        <div className='rounded-xl border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20'>
          <div className='mb-3 flex items-center gap-2 border-b border-green-200 pb-3 dark:border-green-800'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30'>
              <FileText className='h-4 w-4 text-green-600 dark:text-green-500' />
            </div>
            <h4 className='font-semibold text-green-900 dark:text-green-100'>
              Archivo Actual (Nuevo)
            </h4>
          </div>
          <div className='space-y-3'>
            <div>
              <p className='mb-1 text-xs font-medium text-green-600 dark:text-green-400'>
                Documento
              </p>
              <p className='text-base font-semibold text-green-900 dark:text-green-100'>
                {str(contexto, 'titulo', 'Sin título')}
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex-1'>
                <p className='mb-1 text-xs text-green-600 dark:text-green-400'>
                  Tamaño
                </p>
                <p className='font-medium text-green-900 dark:text-green-100'>
                  {str(archivoNuevo, 'tamano_mb')} MB
                </p>
              </div>
              <div className='flex-1'>
                <p className='mb-1 text-xs text-green-600 dark:text-green-400'>
                  Formato
                </p>
                <p className='text-xs font-medium uppercase text-green-900 dark:text-green-100'>
                  {str(archivoNuevo, 'nombre').split('.').pop() || 'N/A'}
                </p>
              </div>
            </div>
            {urlActual && (
              <a
                href={urlActual}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex w-full transform items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:bg-green-700 hover:shadow-xl dark:bg-green-700 dark:hover:bg-green-600'
              >
                <Download className='h-4 w-4' />
                Ver Archivo Actual
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {hasComparacion && (
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'>
          <h4 className='mb-3 font-semibold text-gray-900 dark:text-white'>
            Comparación
          </h4>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Diferencia
              </p>
              <p className='font-medium text-gray-900 dark:text-white'>
                {str(comparacion, 'diferencia_mb')} MB
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>Cambio</p>
              <p className='font-medium text-gray-900 dark:text-white'>
                {str(comparacion, 'porcentaje_cambio')}%
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Horas transcurridas
              </p>
              <p className='font-medium text-gray-900 dark:text-white'>
                {str(tiempo, 'horas_transcurridas')}h
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-gray-500' />
          <div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Reemplazado por
            </p>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
              {usuarioNombres || usuarioEmail}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-gray-500' />
          <div className='text-right'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Fecha</p>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>
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

function DetalleGenerico({ metadata }: DetalleGenericoSubProps) {
  return (
    <div className='space-y-4'>
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'>
        <h4 className='mb-2 font-semibold text-gray-900 dark:text-white'>
          Metadata Adicional
        </h4>
        <pre className='max-h-64 overflow-auto rounded bg-gray-900 p-3 text-xs text-gray-100 dark:bg-black'>
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </div>
    </div>
  )
}
