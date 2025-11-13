import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatFileSize } from '@/lib/utils/format.utils'
import { DocumentosService } from '@/modules/documentos/services/documentos.service'
import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'
import { Calendar, Eye, HardDrive, Loader2, Upload, User } from 'lucide-react'
import { toast } from 'sonner'

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
 * Lista expandible de versiones eliminadas con selección
 * Permite restauración selectiva de versiones específicas
 */
export function VersionesList({
  versiones,
  isLoading,
  seleccionadas,
  onVersionToggle,
  onSelectAll,
  onDeselectAll,
  onRestoreSelected,
  totalVersiones,
  isRestoring,
}: VersionesListProps) {
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
      {/* Header con controles de selección */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Versiones eliminadas ({versiones.length})
        </h4>
        <div className="flex items-center gap-2">
          {seleccionadas.size > 0 && (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {seleccionadas.size} seleccionadas
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={onRestoreSelected}
                disabled={isRestoring}
                className="h-7 px-2 text-xs bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 shadow-sm"
              >
                {isRestoring ? 'Restaurando...' : 'Restaurar seleccionadas'}
              </Button>
            </>
          )}
          <button
            onClick={seleccionadas.size === totalVersiones ? onDeselectAll : onSelectAll}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
          >
            {seleccionadas.size === totalVersiones ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>
        </div>
      </div>

      {/* Lista de versiones */}
      <div className="space-y-2">
        {versiones.map((version) => (
          <div
            key={version.id}
            className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={seleccionadas.has(version.id)}
                  onChange={(e) => {
                    e.stopPropagation()
                    onVersionToggle(version.id)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-2 focus:ring-rose-500 cursor-pointer"
                />
              </div>

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
                  {/* Botón Ver */}
                  <button
                    onClick={async () => {
                      try {
                        const url = await DocumentosService.obtenerUrlDescarga(version.url_storage)
                        window.open(url, '_blank')
                      } catch (error) {
                        console.error('Error al abrir documento:', error)
                        toast.error('❌ Error al abrir el documento')
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
                    <span>{formatDateCompact(version.fecha_documento)}</span>
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
    </div>
  )
}
