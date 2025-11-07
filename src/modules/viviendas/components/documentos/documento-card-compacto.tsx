'use client'

/**
 * 📄 COMPONENTE: DocumentoCardCompacto
 *
 * Card de documento en formato tabla compacta (estilo Gmail/Notion)
 * - Diseño horizontal con acciones inline siempre visibles
 * - Optimizado para maximizar información en mínimo espacio
 * - Hover states sutiles
 */

import { motion } from 'framer-motion'
import {
    Download,
    Eye,
    FileText,
    MoreVertical,
    RotateCcw,
    Star,
    Trash2,
    Upload
} from 'lucide-react'
import { type DocumentoVivienda } from '../../services/documentos-vivienda.service'

interface DocumentoCardCompactoProps {
  documento: DocumentoVivienda
  onVer: (id: string) => void
  onDescargar: (id: string, nombreOriginal: string) => void
  onHistorial: (id: string) => void
  onNuevaVersion?: (id: string, titulo: string) => void
  onEliminar?: (id: string, titulo: string) => void
  isViendoDocumento?: boolean | string | null
  isDescargando?: boolean | string | null
  isEliminando?: boolean | string | null
  mostrarCategoria?: boolean
}

export function DocumentoCardCompacto({
  documento,
  onVer,
  onDescargar,
  onHistorial,
  onNuevaVersion,
  onEliminar,
  isViendoDocumento,
  isDescargando,
  isEliminando,
  mostrarCategoria = true
}: DocumentoCardCompactoProps) {
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `${diffDays} días`

    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  }

  const formatearTamano = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const cargandoVer = typeof isViendoDocumento === 'string'
    ? isViendoDocumento === documento.id
    : isViendoDocumento === true
  const cargandoDescargar = typeof isDescargando === 'string'
    ? isDescargando === documento.id
    : isDescargando === true
  const cargandoEliminar = typeof isEliminando === 'string'
    ? isEliminando === documento.id
    : isEliminando === true

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700
                 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600
                 transition-colors duration-150"
    >
      {/* Icono + Info principal (70%) */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icono */}
        <div className="flex-shrink-0">
          <FileText className="w-5 h-5 text-orange-600 dark:text-orange-500" />
        </div>

        {/* Información del documento */}
        <div className="flex-1 min-w-0">
          {/* Título */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onVer(documento.id)}
              className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate
                       hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-left"
              disabled={cargandoVer}
            >
              {documento.titulo}
            </button>

            {documento.es_importante && (
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {mostrarCategoria && documento.categoria && (
              <>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20
                               text-purple-700 dark:text-purple-400 font-medium">
                  {documento.categoria.nombre}
                </span>
                <span>·</span>
              </>
            )}
            <span>{formatearFecha(documento.fecha_creacion || new Date().toISOString())}</span>
            <span>·</span>
            <span>{formatearTamano(documento.tamano_bytes)}</span>
            {documento.version > 1 && (
              <>
                <span>·</span>
                <span className="text-orange-600 dark:text-orange-500 font-medium">
                  v{documento.version}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Acciones (30%) - siempre visibles en hover */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Ver */}
        <button
          onClick={() => onVer(documento.id)}
          disabled={cargandoVer}
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                   text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                   disabled:opacity-50 transition-colors"
          title="Ver documento"
        >
          {cargandoVer ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>

        {/* Descargar */}
        <button
          onClick={() => onDescargar(documento.id, documento.nombre_original)}
          disabled={cargandoDescargar}
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                   text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                   disabled:opacity-50 transition-colors"
          title="Descargar"
        >
          {cargandoDescargar ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>

        {/* Historial */}
        <button
          onClick={() => onHistorial(documento.id)}
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                   text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                   transition-colors"
          title="Ver historial de versiones"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Menú adicional */}
        <div className="relative group/menu">
          <button
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
                     transition-colors"
            title="Más opciones"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 dark:border-gray-700
                        bg-white dark:bg-gray-800 shadow-lg opacity-0 invisible group-hover/menu:opacity-100
                        group-hover/menu:visible transition-all z-50">
            {onNuevaVersion && (
              <button
                onClick={() => onNuevaVersion(documento.id, documento.titulo)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg transition-colors
                         flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Nueva versión
              </button>
            )}

            {onEliminar && (
              <button
                onClick={() => onEliminar(documento.id, documento.titulo)}
                disabled={cargandoEliminar}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-900/20 last:rounded-b-lg transition-colors
                         flex items-center gap-2 disabled:opacity-50"
              >
                {cargandoEliminar ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
