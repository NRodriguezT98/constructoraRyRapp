'use client'

/**
 * 🗑️ COMPONENTE: Papelera Contextual
 *
 * Muestra documentos eliminados de una entidad específica (vivienda, proyecto, cliente, etc.)
 * - Contextual: Solo documentos de la entidad actual
 * - Restaurar: Vuelve el documento a estado 'activo'
 * - Eliminar definitivo: Borra permanentemente (con confirmación doble)
 */

import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'

import { useDocumentosPapeleraV2 } from '@/modules/viviendas/hooks/useDocumentosPapelera.v2'
import { EmptyState } from '@/shared/components/layout/EmptyState'
import { LoadingState } from '@/shared/components/layout/LoadingState'
import { type ModuleName } from '@/shared/config/module-themes'
import { TipoEntidad } from '../../types'

interface DocumentosPapeleraContextualProps {
  entidadId: string
  tipoEntidad: TipoEntidad
  moduleName?: ModuleName
}

export function DocumentosPapeleraContextual({
  entidadId,
  tipoEntidad,
  moduleName = 'proyectos',
}: DocumentosPapeleraContextualProps) {
  // Solo implementado para viviendas por ahora
  if (tipoEntidad !== 'vivienda') {
    return (
      <EmptyState
        icon={<Trash2 className="w-12 h-12" />}
        title="Papelera no disponible"
        description={`La papelera contextual aún no está implementada para ${tipoEntidad}s`}
      />
    )
  }

  const {
    documentosEliminados,
    isLoading,
    cantidadEliminados,
    restaurarDocumento,
    eliminarDefinitivo,
  } = useDocumentosPapeleraV2({ viviendaId: entidadId })

  if (isLoading) {
    return <LoadingState message="Cargando documentos eliminados..." />
  }

  if (cantidadEliminados === 0) {
    return (
      <EmptyState
        icon={<Trash2 className="w-12 h-12" />}
        title="Papelera vacía"
        description="No hay documentos eliminados en esta vivienda"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* ⚠️ Advertencia */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-4"
      >
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
              Documentos Eliminados
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              • <strong>Restaurar:</strong> Devuelve el documento a la lista activa<br />
              • <strong>Eliminar Definitivo:</strong> Borra permanentemente (NO reversible)
            </p>
          </div>
        </div>
      </motion.div>

      {/* 📋 Lista de documentos eliminados */}
      <div className="space-y-3">
        {documentosEliminados.map((documento, index) => (
          <motion.div
            key={documento.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Info del documento */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {documento.titulo}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Versión {documento.version}
                  </span>
                  {documento.total_versiones > 1 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {documento.total_versiones} versiones totales
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => restaurarDocumento(documento.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-medium transition-colors"
                  title="Restaurar documento"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restaurar
                </button>

                <button
                  onClick={() => eliminarDefinitivo(documento.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium transition-colors"
                  title="Eliminar permanentemente"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contador */}
      <p className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium">
        {cantidadEliminados} documento{cantidadEliminados !== 1 ? 's' : ''} eliminado{cantidadEliminados !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
