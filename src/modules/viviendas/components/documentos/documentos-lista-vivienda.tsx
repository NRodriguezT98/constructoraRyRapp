'use client'

/**
 * 📄 COMPONENTE MEJORADO: DocumentosListaVivienda
 *
 * Vista optimizada con agrupación inteligente por categorías
 * - Documentos importantes arriba
 * - Agrupación por categorías colapsables
 * - Documentos recientes
 * - Estadísticas
 */

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ChevronDown,
  FileText,
  Search,
  Star,
  Upload,
  X
} from 'lucide-react'

import { useDocumentosListaVivienda, type OrdenDocumentos } from '../../hooks/useDocumentosListaVivienda'

import { DocumentoCardCompacto } from './documento-card-compacto'
import { DocumentoNuevaVersionModal } from './documento-nueva-version-modal'
import { DocumentoRenombrarModal } from './documento-renombrar-modal'
import { DocumentoVersionesModalVivienda } from './documento-versiones-modal-vivienda'

interface DocumentosListaViviendaProps {
  viviendaId: string
  onSubirDocumento?: () => void
}

export function DocumentosListaVivienda({
  viviendaId,
  onSubirDocumento,
}: DocumentosListaViviendaProps) {
  const {
    documentos,
    documentosFiltrados,
    documentosPorCategoria,
    documentosImportantes,
    documentosRecientes: _documentosRecientes,
    estadisticas: _estadisticas,
    categoriasDisponibles,
    isLoading,
    error,

    // Filtros y búsqueda
    busqueda,
    setBusqueda,
    categoriaFiltro,
    setCategoriaFiltro,
    soloImportantes,
    setSoloImportantes,
    ordenamiento,
    setOrdenamiento,

    // Actions
    handleVer,
    handleDescargar,
    handleEliminar,
    isViendoDocumento,
    isDescargando,
    isEliminando,
    canDelete,
    tieneCertificadoTradicion,
  } = useDocumentosListaVivienda({ viviendaId })

  const [categoriasAbiertas, setCategoriasAbiertas] = useState<Record<string, boolean>>({})
  const [documentoIdHistorial, setDocumentoIdHistorial] = useState<string | null>(null)
  const [documentoNuevaVersion, setDocumentoNuevaVersion] = useState<{
    id: string
    titulo: string
  } | null>(null)
  const [documentoRenombrar, setDocumentoRenombrar] = useState<{
    id: string
    titulo: string
  } | null>(null) // ✅ NUEVO

  const toggleCategoria = (categoria: string) => {
    setCategoriasAbiertas((prev) => ({
      ...prev,
      [categoria]: !prev[categoria],
    }))
  }

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
        <p className="text-sm text-red-700 dark:text-red-400">⚠️ Error al cargar documentos: {error}</p>
      </div>
    )
  }

  if (documentos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="py-12 text-center">
          <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No hay documentos adjuntos
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Esta vivienda no tiene documentos cargados todavía
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Banner de advertencia si falta certificado */}
      {!tieneCertificadoTradicion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 dark:text-red-100">
                Falta Certificado de Tradición y Libertad
              </h4>
              <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                Este documento es fundamental para la vivienda.
              </p>
              {onSubirDocumento && (
                <button
                  onClick={onSubirDocumento}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-medium transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Subir Certificado
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* BARRA DE ACCIONES COMPACTA - Todo en una línea */}
      <div className="flex items-center gap-3">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtro Categoría */}
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[180px]"
        >
          <option value="todas">📁 Todas las categorías</option>
          {categoriasDisponibles.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Toggle Importantes */}
        <button
          onClick={() => setSoloImportantes(!soloImportantes)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            soloImportantes
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <Star className="h-4 w-4" fill={soloImportantes ? 'currentColor' : 'none'} />
          <span className="hidden sm:inline">Importantes</span>
        </button>

        {/* Ordenamiento */}
        <select
          value={ordenamiento}
          onChange={(e) => setOrdenamiento(e.target.value as OrdenDocumentos)}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[140px]"
        >
          <option value="reciente">📅 Más reciente</option>
          <option value="antiguo">📅 Más antiguo</option>
          <option value="nombre">🔤 Nombre A-Z</option>
          <option value="tamano">📏 Tamaño</option>
        </select>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {documentosFiltrados.length} documento{documentosFiltrados.length !== 1 ? 's' : ''}
          {categoriaFiltro !== 'todas' && ` en ${categoriaFiltro}`}
          {busqueda && ` con "${busqueda}"`}
        </p>
      </div>

      {/* ⭐ Documentos Importantes */}
      {documentosImportantes.length > 0 && (
        <div className="rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
              Documentos Importantes
            </h3>
            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100">
              {documentosImportantes.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {documentosImportantes.map((doc) => (
              <DocumentoCardCompacto
                key={doc.id}
                documento={doc}
                onVer={handleVer}
                onDescargar={handleDescargar}
                onNuevaVersion={(id, titulo) => setDocumentoNuevaVersion({ id, titulo })}
                onRenombrar={(id, titulo) => setDocumentoRenombrar({ id, titulo })} // ✅ NUEVO
                onHistorial={setDocumentoIdHistorial}
                onEliminar={canDelete ? handleEliminar : undefined}
                isViendoDocumento={isViendoDocumento}
                isDescargando={isDescargando}
                isEliminando={isEliminando}
                mostrarCategoria={true}
              />
            ))}
          </div>
        </div>
      )}

      {/*  Documentos por Categoría - MODERN COLLAPSIBLE */}
      <div className="space-y-2">
        {Object.entries(documentosPorCategoria).map(([categoria, grupo]) => {
          const isOpen = categoriasAbiertas[categoria] ?? false

          return (
            <motion.div
              key={categoria}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800"
            >
              {/* Header - Always visible */}
              <button
                onClick={() => toggleCategoria(categoria)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors rounded-t-lg"
              >
                {/* Chevron */}
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </motion.div>

                {/* Icon */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${grupo.color}20` }}
                >
                  <FileText className="w-4 h-4" style={{ color: grupo.color }} />
                </div>

                {/* Category Name */}
                <h3 className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {categoria}
                </h3>

                {/* Counter Badge */}
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${grupo.color}20`,
                    color: grupo.color,
                  }}
                >
                  {grupo.documentos.length}
                </span>
              </button>

              {/* Content - Collapsible */}
              <motion.div
                initial={false}
                animate={{
                  height: isOpen ? 'auto' : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: isOpen ? 'visible' : 'hidden' }}
              >
                <div className="px-4 pb-3 space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-2 rounded-b-lg">
                  {grupo.documentos.map((doc) => (
                    <DocumentoCardCompacto
                      key={doc.id}
                      documento={doc}
                      onVer={handleVer}
                      onDescargar={handleDescargar}
                      onNuevaVersion={(id, titulo) => setDocumentoNuevaVersion({ id, titulo })}
                      onRenombrar={(id, titulo) => setDocumentoRenombrar({ id, titulo })}
                      onHistorial={setDocumentoIdHistorial}
                      onEliminar={canDelete ? handleEliminar : undefined}
                      isViendoDocumento={isViendoDocumento}
                      isDescargando={isDescargando}
                      isEliminando={isEliminando}
                      mostrarCategoria={false}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Modales */}
      {documentoNuevaVersion && (
        <DocumentoNuevaVersionModal
          isOpen={!!documentoNuevaVersion}
          documentoId={documentoNuevaVersion.id}
          documentoTitulo={documentoNuevaVersion.titulo}
          onClose={() => setDocumentoNuevaVersion(null)}
          onSuccess={() => setDocumentoNuevaVersion(null)}
        />
      )}

      {documentoIdHistorial && (
        <DocumentoVersionesModalVivienda
          isOpen={!!documentoIdHistorial}
          documentoId={documentoIdHistorial}
          onClose={() => setDocumentoIdHistorial(null)}
        />
      )}

      {documentoRenombrar && (
        <DocumentoRenombrarModal
          isOpen={!!documentoRenombrar}
          documentoId={documentoRenombrar.id}
          tituloActual={documentoRenombrar.titulo}
          onClose={() => setDocumentoRenombrar(null)}
          onSuccess={() => setDocumentoRenombrar(null)}
        />
      )}
    </div>
  )
}
