import { Badge } from '@/components/ui/badge'
import { formatDateCompact } from '@/lib/utils/date.utils'
import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'
import { Calendar, ChevronDown, ChevronUp, FileText, User } from 'lucide-react'

// Tipo extendido con relación usuario (FK join)
type DocumentoConUsuario = DocumentoProyecto & {
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }
}

interface DocumentoEliminadoHeaderProps {
  documento: DocumentoConUsuario
  isExpanded: boolean
  onToggle: () => void
}

/**
 * Header de card de documento eliminado (Papelera)
 * Muestra: Título, versión, metadata básica, botón expandir
 */
export function DocumentoEliminadoHeader({
  documento,
  isExpanded,
  onToggle,
}: DocumentoEliminadoHeaderProps) {
  return (
    <div className="p-4 flex items-start gap-3">
      {/* Icono */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-white" />
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {documento.titulo}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                Versión {documento.version}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                {formatDateCompact(documento.fecha_documento)}
              </div>
              {documento.usuario && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <User className="w-3 h-3" />
                  {documento.usuario.nombres} {documento.usuario.apellidos}
                </div>
              )}
            </div>
          </div>

          {/* Botón expandir */}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            aria-label={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
