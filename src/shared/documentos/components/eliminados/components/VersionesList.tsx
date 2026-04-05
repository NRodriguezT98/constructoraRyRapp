import { useState } from 'react'

import { Calendar, Eye, HardDrive, Loader2, Upload, User } from 'lucide-react'
import { toast } from 'sonner'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatFileSize } from '@/lib/utils/format.utils'
import { logger } from '@/lib/utils/logger'
import { Badge } from '@/shared/components/ui/badge'
import { DocumentosStorageService } from '@/shared/documentos/services/documentos-storage.service'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'
import type { TipoEntidad } from '@/shared/documentos/types/entidad.types'

import { DocumentoViewer } from '../../viewer/documento-viewer'

// Tipo extendido con relación usuario (FK join)
type DocumentoConUsuario = DocumentoProyecto & {
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }
}

interface VersionesListProps {
  versiones: DocumentoConUsuario[]
  modulo: 'proyectos' | 'viviendas' | 'clientes'
  isLoading: boolean
  seleccionadas: Set<string>
  onVersionToggle: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onRestoreSelected: () => void
  totalVersiones: number
  isRestoring: boolean
}

/**
 * Lista expandible de versiones eliminadas (solo lectura)
 * Muestra información de todas las versiones sin selección individual
 */
export function VersionesList({
  versiones,
  modulo,
  isLoading,
  seleccionadas: _seleccionadas,
  onVersionToggle: _onVersionToggle,
  onSelectAll: _onSelectAll,
  onDeselectAll: _onDeselectAll,
  onRestoreSelected: _onRestoreSelected,
  totalVersiones: _totalVersiones,
  isRestoring: _isRestoring,
}: VersionesListProps) {
  // Estado del modal de visualización
  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState<DocumentoConUsuario | null>(null)
  const [urlPreview, setUrlPreview] = useState<string>('')

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 p-8'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Cargando versiones...
        </p>
      </div>
    )
  }

  if (!versiones || versiones.length === 0) {
    return (
      <div className='p-8 text-center'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          No se encontraron versiones eliminadas
        </p>
      </div>
    )
  }

  return (
    <div className='border-t border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/20'>
      {/* Header simplificado */}
      <div className='mb-3 flex items-center justify-between'>
        <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
          Versiones eliminadas ({versiones.length})
        </h4>
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Solo lectura • Use &quot;Restaurar todo&quot; para recuperar todas las
          versiones
        </p>
      </div>

      {/* Lista de versiones (sin checkboxes) */}
      <div className='space-y-2'>
        {versiones.map(version => (
          <div
            key={version.id}
            className='block rounded-lg border border-gray-200 bg-white p-3 transition-all dark:border-gray-700 dark:bg-gray-800'
          >
            <div className='flex items-start gap-3'>
              {/* Info de versión */}
              <div className='min-w-0 flex-1 space-y-2'>
                {/* Header versión */}
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='text-xs'>
                      v{version.version}
                    </Badge>
                    <h5 className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                      {version.titulo}
                    </h5>
                  </div>
                  {/* Botón Ver - Abre modal de visualización */}
                  <button
                    onClick={async () => {
                      try {
                        const tipoEntidadMap: Record<string, TipoEntidad> = {
                          proyectos: 'proyecto',
                          viviendas: 'vivienda',
                          clientes: 'cliente',
                        }
                        const tipoEntidad = tipoEntidadMap[modulo] || 'proyecto'
                        const url =
                          await DocumentosStorageService.obtenerUrlDescarga(
                            version.url_storage,
                            tipoEntidad
                          )

                        // Abrir en modal con URL precargada
                        setUrlPreview(url)
                        setDocumentoSeleccionado(version)
                      } catch (error) {
                        logger.error(
                          'Error al obtener URL del documento:',
                          error
                        )
                        toast.error('❌ Error al cargar el documento')
                      }
                    }}
                    className='inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-rose-500 to-pink-500 px-2 py-1 text-xs font-medium text-white shadow-sm transition-all hover:from-rose-600 hover:to-pink-600'
                  >
                    <Eye className='h-3 w-3' />
                    Ver
                  </button>
                </div>

                {/* Metadata grid */}
                <div className='grid grid-cols-1 gap-2 text-xs sm:grid-cols-2'>
                  {/* Fecha documento */}
                  <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                    <Calendar className='h-3.5 w-3.5 flex-shrink-0' />
                    <span className='min-w-[120px] font-medium'>
                      Fecha documento:
                    </span>
                    {version.fecha_documento ? (
                      <span>{formatDateCompact(version.fecha_documento)}</span>
                    ) : (
                      <span className='italic text-gray-400'>
                        No especificada
                      </span>
                    )}
                  </div>

                  {/* Fecha subida */}
                  <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                    <Upload className='h-3.5 w-3.5 flex-shrink-0' />
                    <span className='min-w-[120px] font-medium'>
                      Fecha de subida:
                    </span>
                    <span>{formatDateCompact(version.fecha_creacion)}</span>
                  </div>

                  {/* Subido por */}
                  {version.usuario && (
                    <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                      <User className='h-3.5 w-3.5 flex-shrink-0' />
                      <span className='min-w-[120px] font-medium'>
                        Subido por:
                      </span>
                      <span>
                        {version.usuario.nombres} {version.usuario.apellidos}
                      </span>
                    </div>
                  )}

                  {/* Tamaño */}
                  {version.tamano_bytes && (
                    <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                      <HardDrive className='h-3.5 w-3.5 flex-shrink-0' />
                      <span className='min-w-[120px] font-medium'>Tamaño:</span>
                      <span>{formatFileSize(version.tamano_bytes)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de visualización de documento */}
      {documentoSeleccionado && (
        <DocumentoViewer
          documento={documentoSeleccionado}
          isOpen={!!documentoSeleccionado}
          onClose={() => {
            setDocumentoSeleccionado(null)
            setUrlPreview('')
          }}
          urlPreview={urlPreview}
          moduleName={modulo}
        />
      )}
    </div>
  )
}
