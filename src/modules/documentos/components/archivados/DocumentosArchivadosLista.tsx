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

import { EmptyState } from '@/shared/components/ui/EmptyState'
import { LoadingSpinner } from '@/shared/components/ui/Loading'
import { type ModuleName } from '@/shared/config/module-themes'
import type { DocumentoProyecto } from '@/types/documento.types'
import {
  useDocumentosArchivadosQuery,
  useRestaurarDocumentoMutation,
} from '../../hooks/useDocumentosQuery'

import { DocumentoCardArchivado } from './DocumentoCardArchivado'

interface DocumentosArchivadosListaProps {
  proyectoId: string
  moduleName?: ModuleName
}

export function DocumentosArchivadosLista({
  proyectoId,
  moduleName = 'proyectos',
}: DocumentosArchivadosListaProps) {
  const { documentos, cargando, refrescar } = useDocumentosArchivadosQuery(proyectoId)
  const restaurarMutation = useRestaurarDocumentoMutation(proyectoId)

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
        title="No hay documentos archivados"
        description="Los documentos que archives aparecerán aquí"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Documentos Archivados
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {documentos.length} {documentos.length === 1 ? 'documento' : 'documentos'}
            </p>
          </div>
        </div>

        <button
          onClick={() => refrescar()}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Lista de documentos archivados */}
      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {documentos.map((documento) => (
            <DocumentoCardArchivado
              key={documento.id}
              documento={documento}
              onRestaurar={() => handleRestaurar(documento)}
              moduleName={moduleName}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
