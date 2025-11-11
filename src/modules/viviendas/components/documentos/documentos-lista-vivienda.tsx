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

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Download,
    Eye,
    FileText,
    Search,
    Star,
    Trash2,
    Upload,
    X
} from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'

import { useDocumentosListaVivienda, type OrdenDocumentos } from '../../hooks/useDocumentosListaVivienda'
import { useDocumentosPapelera } from '../../hooks/useDocumentosPapelera'

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
  const { perfil } = useAuth()
  const esAdministrador = perfil?.rol === 'Administrador'

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

  // 🗑️ Hook de papelera (siempre se ejecuta, pero query solo se activa para Admin)
  const {
    documentosEliminados,
    cantidadEliminados,
    handleRestaurar,
    handleEliminarPermanente,
    isRestaurando,
    isEliminandoPermanente,
    isLoading: isLoadingPapelera
  } = useDocumentosPapelera({ viviendaId })

  // Estados UI
  const [pestana, setPestana] = useState<'activos' | 'papelera'>('activos')
  const [categoriasAbiertas, setCategoriasAbiertas] = useState<Record<string, boolean>>({})
  const [documentosExpandidos, setDocumentosExpandidos] = useState<Set<string>>(new Set())
  const [versionesCargadas, setVersionesCargadas] = useState<Record<string, any[]>>({})
  const [cargandoVersiones, setCargandoVersiones] = useState<Set<string>>(new Set())
  const [documentoIdHistorial, setDocumentoIdHistorial] = useState<string | null>(null)
  const [documentoNuevaVersion, setDocumentoNuevaVersion] = useState<{
    id: string
    titulo: string
  } | null>(null)
  const [documentoRenombrar, setDocumentoRenombrar] = useState<{
    id: string
    titulo: string
  } | null>(null)

  const toggleCategoria = (categoria: string) => {
    setCategoriasAbiertas((prev) => ({
      ...prev,
      [categoria]: !prev[categoria],
    }))
  }

  const toggleExpansionDocumento = async (docId: string) => {
    const estaExpandido = documentosExpandidos.has(docId)

    if (estaExpandido) {
      // Colapsar
      setDocumentosExpandidos(prev => {
        const nuevo = new Set(prev)
        nuevo.delete(docId)
        return nuevo
      })
    } else {
      // Expandir - cargar versiones si no están cargadas
      if (!versionesCargadas[docId]) {
        setCargandoVersiones(prev => new Set(prev).add(docId))
        try {
          const { documentosViviendaService } = await import('../../services/documentos-vivienda.service')
          const versiones = await documentosViviendaService.obtenerVersionesEliminadas(docId)
          setVersionesCargadas(prev => ({ ...prev, [docId]: versiones }))
        } catch (error) {
          console.error('Error al cargar versiones:', error)
        } finally {
          setCargandoVersiones(prev => {
            const nuevo = new Set(prev)
            nuevo.delete(docId)
            return nuevo
          })
        }
      }

      setDocumentosExpandidos(prev => new Set(prev).add(docId))
    }
  }

  // 👁️ Handler: Ver documento en nueva pestaña
  const handleVerDocumento = (url: string, titulo: string) => {
    if (!url) {
      alert('No hay URL de archivo disponible')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // 📥 Handler: Descargar documento
  const handleDescargarDocumento = async (url: string, titulo: string) => {
    if (!url) {
      alert('No hay URL de archivo disponible')
      return
    }

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const urlBlob = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = urlBlob
      a.download = titulo
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(urlBlob)
    } catch (error) {
      console.error('Error al descargar:', error)
      alert('Error al descargar el archivo')
    }
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

  // Si no hay documentos activos pero es Admin, permitir acceso a papelera
  const noHayDocumentosActivos = documentos.length === 0

  return (
    <div className="space-y-4">
      {/* ✅ PESTAÑAS: Activos / Papelera (solo Admin) - SIEMPRE VISIBLE PARA ADMIN */}
      {esAdministrador && (
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setPestana('activos')}
            className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
              pestana === 'activos'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Activos
              <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium">
                {documentos.length}
              </span>
            </span>
            {pestana === 'activos' && (
              <motion.div
                layoutId="pestana-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-400"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => setPestana('papelera')}
            className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
              pestana === 'papelera'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Papelera
              {cantidadEliminados > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium">
                  {cantidadEliminados}
                </span>
              )}
            </span>
            {pestana === 'papelera' && (
              <motion.div
                layoutId="pestana-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>
      )}

      {/* Mensaje cuando no hay documentos activos (solo visible en pestaña activos) */}
      {noHayDocumentosActivos && pestana === 'activos' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <div className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              No hay documentos activos
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Esta vivienda no tiene documentos cargados todavía
              {esAdministrador && cantidadEliminados > 0 && (
                <span className="block mt-2">
                  💡 Hay {cantidadEliminados} documento{cantidadEliminados !== 1 ? 's' : ''} en la papelera
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Banner de advertencia si falta certificado - Solo en pestaña activos */}
      {pestana === 'activos' && !noHayDocumentosActivos && !tieneCertificadoTradicion && (
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

      {/* BARRA DE ACCIONES COMPACTA - Solo visible en pestaña Activos */}
      {pestana === 'activos' && !noHayDocumentosActivos && (
        <>
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
        </>
      )}

      {/* 📄 CONTENIDO: Pestaña Activos */}
      {pestana === 'activos' && (
        <>
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
      </>
      )}

      {/* Pestaña Papelera */}
      {pestana === 'papelera' && (
        <div className="space-y-6">
          {/* Lista de Documentos Eliminados */}
          {isLoadingPapelera ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : documentosEliminados.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Trash2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No hay documentos eliminados</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Los documentos eliminados aparecerán aquí
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {documentosEliminados.map((doc) => {
                const estaExpandido = documentosExpandidos.has(doc.id)
                const versiones = versionesCargadas[doc.id] || []
                const cargando = cargandoVersiones.has(doc.id)
                const metadata = doc.metadata as Record<string, any> | null
                const tieneVersiones = (metadata?.versiones_eliminadas || 1) > 1

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg border-2 border-red-200 dark:border-red-900/50 shadow-sm overflow-hidden"
                  >
                    {/* Card principal */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Botón expandir/colapsar */}
                        {tieneVersiones && (
                          <button
                            onClick={() => toggleExpansionDocumento(doc.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors mt-0.5"
                            disabled={cargando}
                          >
                            {cargando ? (
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : estaExpandido ? (
                              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            )}
                          </button>
                        )}

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{doc.titulo}</h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                              <span className="font-medium">Eliminado por:</span>{' '}
                              {metadata?.eliminado_por || 'Desconocido'}
                            </p>
                            <p>
                              <span className="font-medium">Fecha:</span>{' '}
                              {metadata?.fecha_eliminacion
                                ? new Date(metadata.fecha_eliminacion as string).toLocaleString('es-CO')
                                : 'Desconocida'}
                            </p>
                            <p>
                              <span className="font-medium">Motivo:</span>{' '}
                              {metadata?.motivo_eliminacion || 'No especificado'}
                            </p>
                            <p>
                              <span className="font-medium">Versiones eliminadas:</span>{' '}
                              <span className="inline-flex items-center gap-1">
                                {metadata?.versiones_eliminadas || 1}
                                {tieneVersiones && (
                                  <span className="text-xs text-orange-600 dark:text-orange-400">
                                    ({estaExpandido ? 'expandido' : 'clic para ver'})
                                  </span>
                                )}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {/* Botones de acción principal */}
                          <div className="flex items-center gap-2">
                            {doc.url_storage && (
                              <>
                                <button
                                  onClick={() => handleVerDocumento(doc.url_storage, doc.titulo)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                                  title="Ver documento"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Ver
                                </button>
                                <button
                                  onClick={() => handleDescargarDocumento(doc.url_storage, doc.titulo)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                                  title="Descargar documento"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Descargar
                                </button>
                              </>
                            )}
                          </div>
                          {/* Botones de restaurar/eliminar */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRestaurar(doc.id, doc.titulo)}
                              disabled={isRestaurando}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ↩️ Restaurar Todo
                            </button>
                            <button
                              onClick={() => handleEliminarPermanente(doc.id, doc.titulo, false)}
                              disabled={isEliminandoPermanente}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              🔥 Eliminar Todo
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lista de versiones expandible */}
                    <AnimatePresence>
                      {estaExpandido && versiones.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10"
                        >
                          <div className="p-4">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              📑 Versiones anteriores ({versiones.length}):
                            </h4>
                            <div className="space-y-2">
                              {versiones.map((version) => (
                                <div
                                  key={version.id}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                      Versión {version.version}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      Creada: {new Date(version.fecha_creacion).toLocaleString('es-CO')}
                                    </p>
                                    {version.metadata?.eliminado_por && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Eliminada por: {version.metadata.eliminado_por}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    {/* Botones ver/descargar */}
                                    {version.url_storage && (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => handleVerDocumento(version.url_storage, `${doc.titulo} (v${version.version})`)}
                                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                          title="Ver documento"
                                        >
                                          <Eye className="w-3 h-3" />
                                          Ver
                                        </button>
                                        <button
                                          onClick={() => handleDescargarDocumento(version.url_storage, `${doc.titulo} (v${version.version})`)}
                                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                                          title="Descargar"
                                        >
                                          <Download className="w-3 h-3" />
                                          Descargar
                                        </button>
                                      </div>
                                    )}
                                    {/* Botones restaurar/eliminar */}
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => handleRestaurar(version.id, `${doc.titulo} (v${version.version})`)}
                                        disabled={isRestaurando}
                                        className="px-2 py-1 text-xs rounded bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 transition-colors"
                                      >
                                        ↩️ Restaurar
                                      </button>
                                      <button
                                        onClick={() => handleEliminarPermanente(version.id, `${doc.titulo} (v${version.version})`, true)}
                                        disabled={isEliminandoPermanente}
                                        className="px-2 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-colors"
                                      >
                                        🔥 Eliminar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

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
