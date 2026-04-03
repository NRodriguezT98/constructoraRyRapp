import { Calendar, ChevronDown, ChevronUp, FileText, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { formatDateCompact } from '@/lib/utils/date.utils'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'

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
    <div className='flex items-start gap-3 p-4'>
      {/* Icono */}
      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600'>
        <FileText className='h-5 w-5 text-white' />
      </div>

      {/* Info principal */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <h3 className='truncate font-semibold text-gray-900 dark:text-white'>
              {documento.titulo}
            </h3>
            <div className='mt-1 flex flex-wrap items-center gap-2'>
              <Badge variant='outline' className='text-xs'>
                Versión {documento.version}
              </Badge>
              <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                <Calendar className='h-3 w-3' />
                {formatDateCompact(documento.fecha_documento || '')}
              </div>
              {documento.usuario && (
                <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                  <User className='h-3 w-3' />
                  {documento.usuario.nombres} {documento.usuario.apellidos}
                </div>
              )}
            </div>
          </div>

          {/* Botón expandir */}
          <button
            onClick={onToggle}
            className='flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            aria-label={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? (
              <ChevronUp className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            ) : (
              <ChevronDown className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
