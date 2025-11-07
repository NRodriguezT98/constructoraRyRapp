'use client'

/**
 * 📁 COMPONENTE: CarpetaDocumentos (Recursivo)
 *
 * Componente recursivo para mostrar carpetas jerárquicas estilo Google Drive
 * - Soporte para subcarpetas ilimitadas
 * - Expansión/colapso de carpetas
 * - Contador de documentos
 * - Colores e iconos personalizados
 */

import { AnimatePresence, motion } from 'framer-motion'
import {
    ChevronDown,
    ChevronRight,
    Edit,
    Folder,
    FolderOpen,
    FolderPlus,
    MoreVertical,
    Trash2
} from 'lucide-react'
import { useState } from 'react'
import { type CarpetaConSubcarpetas } from '../../services/carpetas-vivienda.service'
import { type DocumentoVivienda } from '../../services/documentos-vivienda.service'
import { DocumentoCardCompacto } from './documento-card-compacto'

interface CarpetaDocumentosProps {
  carpeta: CarpetaConSubcarpetas
  documentos: DocumentoVivienda[]
  nivel?: number
  onCrearSubcarpeta?: (carpetaPadreId: string) => void
  onEditarCarpeta?: (carpetaId: string) => void
  onEliminarCarpeta?: (carpetaId: string) => void
  onVerDocumento: (id: string) => void
  onDescargarDocumento: (id: string, nombreOriginal: string) => void
  onNuevaVersionDocumento?: (id: string, titulo: string) => void
  onHistorialDocumento?: (id: string) => void
  onEliminarDocumento?: (id: string, titulo: string) => void
  isViendoDocumento?: boolean
  isDescargando?: boolean
  isEliminando?: boolean
}

export function CarpetaDocumentos({
  carpeta,
  documentos,
  nivel = 0,
  onCrearSubcarpeta,
  onEditarCarpeta,
  onEliminarCarpeta,
  onVerDocumento,
  onDescargarDocumento,
  onNuevaVersionDocumento,
  onHistorialDocumento,
  onEliminarDocumento,
  isViendoDocumento,
  isDescargando,
  isEliminando
}: CarpetaDocumentosProps) {
  const [isExpanded, setIsExpanded] = useState(nivel < 2) // Auto-expandir primeros 2 niveles
  const [showDropdown, setShowDropdown] = useState(false)

  // Filtrar documentos de esta carpeta
  const documentosCarpeta = documentos.filter(doc => doc.carpeta_id === carpeta.id)
  const totalDocumentos = documentosCarpeta.length

  // Contar documentos totales incluyendo subcarpetas (recursivo)
  const contarDocumentosRecursivo = (carp: CarpetaConSubcarpetas): number => {
    const docsDirectos = documentos.filter(doc => doc.carpeta_id === carp.id).length
    const docsSubcarpetas = carp.subcarpetas.reduce(
      (sum, sub) => sum + contarDocumentosRecursivo(sub),
      0
    )
    return docsDirectos + docsSubcarpetas
  }

  const totalConSubcarpetas = contarDocumentosRecursivo(carpeta)
  const tieneContenido = totalConSubcarpetas > 0 || carpeta.subcarpetas.length > 0

  // Indentación por nivel
  const paddingLeft = nivel * 24

  return (
    <div className="relative">
      {/* Header de carpeta */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!tieneContenido}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg
            transition-all duration-200
            ${tieneContenido ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : 'cursor-default'}
            ${isExpanded ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}
          `}
        >
          {/* Chevron de expansión */}
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {tieneContenido ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            ) : (
              <div className="w-4 h-4" /> // Espacio vacío si no tiene contenido
            )}
          </div>

          {/* Ícono de carpeta */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${carpeta.color}15`,
              borderColor: `${carpeta.color}40`,
              borderWidth: '1px'
            }}
          >
            {isExpanded ? (
              <FolderOpen className="w-4 h-4" style={{ color: carpeta.color }} />
            ) : (
              <Folder className="w-4 h-4" style={{ color: carpeta.color }} />
            )}
          </div>

          {/* Nombre y contador */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {carpeta.nombre}
              </span>
              {carpeta.es_carpeta_sistema && (
                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  Sistema
                </span>
              )}
            </div>
            {carpeta.descripcion && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {carpeta.descripcion}
              </p>
            )}
          </div>

          {/* Contador de documentos */}
          <div className="flex items-center gap-2">
            {totalConSubcarpetas > 0 && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${carpeta.color}15`,
                  color: carpeta.color
                }}
              >
                {totalConSubcarpetas} doc{totalConSubcarpetas !== 1 ? 's' : ''}
              </span>
            )}

            {/* Menú de acciones (solo para carpetas no-sistema) */}
            {!carpeta.es_carpeta_sistema && (
              <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDropdown(!showDropdown)
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown de acciones */}
                <AnimatePresence>
                  {showDropdown && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />

                      {/* Menu */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onCrearSubcarpeta?.(carpeta.id)
                            setShowDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <FolderPlus className="w-4 h-4" />
                          Nueva subcarpeta
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditarCarpeta?.(carpeta.id)
                            setShowDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <Edit className="w-4 h-4" />
                          Editar carpeta
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEliminarCarpeta?.(carpeta.id)
                            setShowDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar carpeta
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </button>
      </motion.div>

      {/* Contenido expandible */}
      <AnimatePresence>
        {isExpanded && tieneContenido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 mt-1">
              {/* Documentos de esta carpeta */}
              {documentosCarpeta.map((doc) => (
                <div
                  key={doc.id}
                  style={{ paddingLeft: `${paddingLeft + 48}px` }}
                >
                  <DocumentoCardCompacto
                    documento={doc}
                    onVer={onVerDocumento}
                    onDescargar={onDescargarDocumento}
                    onNuevaVersion={onNuevaVersionDocumento}
                    onHistorial={onHistorialDocumento}
                    onEliminar={onEliminarDocumento}
                    isViendoDocumento={isViendoDocumento}
                    isDescargando={isDescargando}
                    isEliminando={isEliminando}
                    mostrarCategoria={false} // No mostrar categoría en vista de carpetas
                  />
                </div>
              ))}

              {/* Subcarpetas (RECURSIÓN) */}
              {carpeta.subcarpetas.map((subcarpeta) => (
                <CarpetaDocumentos
                  key={subcarpeta.id}
                  carpeta={subcarpeta}
                  documentos={documentos}
                  nivel={nivel + 1}
                  onCrearSubcarpeta={onCrearSubcarpeta}
                  onEditarCarpeta={onEditarCarpeta}
                  onEliminarCarpeta={onEliminarCarpeta}
                  onVerDocumento={onVerDocumento}
                  onDescargarDocumento={onDescargarDocumento}
                  onNuevaVersionDocumento={onNuevaVersionDocumento}
                  onHistorialDocumento={onHistorialDocumento}
                  onEliminarDocumento={onEliminarDocumento}
                  isViendoDocumento={isViendoDocumento}
                  isDescargando={isDescargando}
                  isEliminando={isEliminando}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
