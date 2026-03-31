'use client'

/**
 * 📦 COMPONENTE: Lista de Documentos Archivados
 *
 * Muestra documentos con estado='archivado' del proyecto actual
 * - Similar a DocumentosEliminadosLista pero contextual al proyecto
 * - Acción principal: Restaurar (volver a activos)
 * - No permite eliminar (solo desde vista activos)
 */

import { AnimatePresence } from 'framer-motion'
import { Archive, PackageOpen, RefreshCw } from 'lucide-react'

import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { LoadingSpinner } from '@/shared/components/ui/Loading'
import { type ModuleName } from '@/shared/config/module-themes'

import {
  useDocumentosArchivadosQuery,
  useRestaurarDocumentoMutation,
} from '../../hooks/useDocumentosQuery'
import { type TipoEntidad } from '../../types/entidad.types'

import { DocumentoCardArchivado } from './DocumentoCardArchivado'

interface DocumentosArchivadosListaProps {
  entidadId: string
  tipoEntidad: TipoEntidad
  moduleName?: ModuleName
  onViewDocumento?: (documento: DocumentoProyecto) => void
}

export function DocumentosArchivadosLista({
  entidadId,
  tipoEntidad,
  moduleName = 'proyectos',
  onViewDocumento,
}: DocumentosArchivadosListaProps) {
  const { documentos, cargando, refrescar } = useDocumentosArchivadosQuery(
    entidadId,
    tipoEntidad
  )
  const restaurarMutation = useRestaurarDocumentoMutation(
    entidadId,
    tipoEntidad
  )

  const handleRestaurar = async (documento: DocumentoProyecto) => {
    await restaurarMutation.mutateAsync(documento.id)
  }

  if (cargando) {
    return <LoadingSpinner />
  }

  if (documentos.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title='No hay documentos archivados'
        description='Los documentos que archives aparecerán aquí'
      />
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header con contador */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Archive className='h-5 w-5 text-gray-600 dark:text-gray-400' />
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Documentos Archivados
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {documentos.length}{' '}
              {documentos.length === 1 ? 'documento' : 'documentos'}
            </p>
          </div>
        </div>

        <button
          onClick={() => refrescar()}
          className='inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        >
          <RefreshCw className='h-4 w-4' />
          Actualizar
        </button>
      </div>

      {/* Lista de documentos archivados */}
      <div className='grid grid-cols-1 gap-3'>
        <AnimatePresence mode='popLayout'>
          {documentos.map(documento => (
            <DocumentoCardArchivado
              key={documento.id}
              documento={documento}
              onRestaurar={() => handleRestaurar(documento)}
              onView={
                onViewDocumento ? () => onViewDocumento(documento) : undefined
              }
              moduleName={moduleName}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
