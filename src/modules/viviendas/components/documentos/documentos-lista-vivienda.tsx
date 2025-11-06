/**
 * ============================================
 * COMPONENTE: DocumentosListaVivienda
 * ============================================
 * Componente presentacional puro para listar documentos de vivienda
 * SOLO UI - Toda la lógica está en useDocumentosListaVivienda
 */

'use client'

import { motion } from 'framer-motion'
import { Download, FileText, FolderOpen, Trash2 } from 'lucide-react'
import { useDocumentosListaVivienda } from '../../hooks/useDocumentosListaVivienda'

interface DocumentosListaViviendaProps {
  viviendaId: string
}

export function DocumentosListaVivienda({ viviendaId }: DocumentosListaViviendaProps) {
  const {
    documentos,
    isLoading,
    error,
    handleDescargar,
    handleEliminar,
    isDescargando,
    isEliminando,
    canDelete,
  } = useDocumentosListaVivienda({ viviendaId })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 animate-pulse text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">Cargando documentos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-700 dark:text-red-400">
          ⚠️ Error al cargar documentos: {error}
        </p>
      </div>
    )
  }

  if (documentos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="py-12 text-center">
          <FolderOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No hay documentos adjuntos
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Esta vivienda no tiene documentos cargados todavía
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>📄 Certificado de Tradición y Libertad</li>
            <li>📐 Planos y diseños</li>
            <li>📝 Escrituras</li>
            <li>🏗️ Licencias de construcción</li>
            <li>📋 Otros documentos legales</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documentos.map((doc) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative overflow-hidden rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 transition-all hover:shadow-lg dark:border-orange-800 dark:from-orange-950/30 dark:to-amber-950/30"
        >
          <div className="flex items-start gap-4">
            {/* Icono */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white shadow-lg">
              <FileText className="h-6 w-6" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h4 className="mb-1 font-bold text-gray-900 dark:text-gray-100">
                {doc.titulo}
              </h4>

              {doc.descripcion && (
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  {doc.descripcion}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {/* Categoría */}
                {doc.categoria && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${doc.categoria.color}20`,
                      color: doc.categoria.color,
                    }}
                  >
                    {doc.categoria.nombre}
                  </span>
                )}

                {/* Estado */}
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  {doc.estado === 'activo' ? 'Disponible' : doc.estado}
                </span>

                {/* Fecha */}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(doc.fecha_creacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>

                {/* Importante */}
                {doc.es_importante && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    ⭐ Importante
                  </span>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-start gap-2">
              <button
                onClick={() => handleDescargar(doc.id, doc.nombre_original)}
                disabled={isDescargando}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Descargar"
              >
                <Download className="h-4 w-4" />
              </button>

              {canDelete && (
                <button
                  onClick={() => handleEliminar(doc.id, doc.titulo)}
                  disabled={isEliminando}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
