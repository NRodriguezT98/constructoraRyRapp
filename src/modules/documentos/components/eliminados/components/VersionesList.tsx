import { Badge } from '@/components/ui/badge'
import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatFileSize } from '@/lib/utils/format.utils'
import { DocumentosService } from '@/modules/documentos/services/documentos.service'
import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'
import { Calendar, Eye, HardDrive, Loader2, Upload, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
  seleccionadas,
  onVersionToggle,
  onSelectAll,
  onDeselectAll,
  onRestoreSelected,
  totalVersiones,
  isRestoring,
}: VersionesListProps) {
  // Estado del modal de visualización
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoConUsuario | null>(null)
  const [urlPreview, setUrlPreview] = useState<string>('')

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cargando versiones...
        </p>
      </div>
    )
  }

  if (!versiones || versiones.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No se encontraron versiones eliminadas
        </p>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-900/20">
      {/* Header simplificado */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Versiones eliminadas ({versiones.length})
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Solo lectura • Use "Restaurar todo" para recuperar todas las versiones
        </p>
      </div>

      {/* Lista de versiones (sin checkboxes) */}
      <div className="space-y-2">
        {versiones.map((version) => (
          <div
            key={version.id}
            className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Info de versión */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Header versión */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      v{version.version}
                    </Badge>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {version.titulo}
                    </h5>
                  </div>
                  {/* Botón Ver - Abre modal de visualización */}
                  <button
                    onClick={async () => {
                      try {
                        let url: string

                        if (modulo === 'viviendas') {
                          // Importar servicio de viviendas dinámicamente
                          const { DocumentosStorageService } = await import('@/modules/viviendas/services/documentos/documentos-storage.service')
                          url = await DocumentosStorageService.obtenerUrlDescarga(version.url_storage)
                        } else {
                          // Servicio de proyectos
                          url = await DocumentosService.obtenerUrlDescarga(version.url_storage)
                        }

                        // Abrir en modal con URL precargada
                        setUrlPreview(url)
                        setDocumentoSeleccionado(version)
                      } catch (error) {
                        console.error('Error al obtener URL del documento:', error)
                        toast.error('❌ Error al cargar el documento')
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white transition-all shadow-sm"
                  >
                    <Eye className="w-3 h-3" />
                    Ver
                  </button>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Fecha documento */}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium min-w-[120px]">Fecha documento:</span>
                    {version.fecha_documento ? (
                      <span>{formatDateCompact(version.fecha_documento)}</span>
                    ) : (
                      <span className="italic text-gray-400">No especificada</span>
                    )}
                  </div>

                  {/* Fecha subida */}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium min-w-[120px]">Fecha de subida:</span>
                    <span>{formatDateCompact(version.fecha_creacion)}</span>
                  </div>

                  {/* Subido por */}
                  {version.usuario && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <User className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-medium min-w-[120px]">Subido por:</span>
                      <span>
                        {version.usuario.nombres} {version.usuario.apellidos}
                      </span>
                    </div>
                  )}

                  {/* Tamaño */}
                  {version.tamano_bytes && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <HardDrive className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-medium min-w-[120px]">Tamaño:</span>
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
