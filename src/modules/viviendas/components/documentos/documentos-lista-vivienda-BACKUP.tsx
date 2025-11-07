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

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Upload,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useDocumentosListaVivienda, type OrdenDocumentos } from '../../hooks/useDocumentosListaVivienda'
import { DocumentoNuevaVersionModal } from './documento-nueva-version-modal'
import { DocumentoVersionesModalVivienda } from './documento-versiones-modal-vivienda'
import { documentosListaStyles as styles } from './documentos-lista.styles'

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
    documentosRecientes,
    estadisticas,
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
          <FolderOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
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
    <div className={styles.container}>
      {/* Banner de advertencia si falta certificado */}
      {!tieneCertificadoTradicion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.warningBanner.container}
        >
          <div className={styles.warningBanner.content}>
            <div className={styles.warningBanner.iconContainer}>
              <AlertTriangle className={styles.warningBanner.icon} />
            </div>
            <div className={styles.warningBanner.textContainer}>
              <h4 className={styles.warningBanner.title}>
                ⚠️ Falta Certificado de Tradición y Libertad
              </h4>
              <p className={styles.warningBanner.description}>
                Este documento es fundamental para la vivienda. Se recomienda subirlo lo antes
                posible.
              </p>
              {onSubirDocumento && (
                <button onClick={onSubirDocumento} className={styles.warningBanner.button}>
                  <Upload className="h-4 w-4" />
                  Subir Certificado de Tradición
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Estadísticas */}
      <div className={styles.estadisticas.container}>
        <div className={styles.estadisticas.item}>
          <div className={styles.estadisticas.value}>{estadisticas.totalDocumentos}</div>
          <div className={styles.estadisticas.label}>Documentos</div>
        </div>
        <div className={styles.estadisticas.item}>
          <div className={styles.estadisticas.value}>{estadisticas.totalImportantes}</div>
          <div className={styles.estadisticas.label}>Importantes</div>
        </div>
        <div className={styles.estadisticas.item}>
          <div className={styles.estadisticas.value}>{estadisticas.totalCategorias}</div>
          <div className={styles.estadisticas.label}>Categorías</div>
        </div>
        <div className={styles.estadisticas.item}>
          <div className={styles.estadisticas.value}>{estadisticas.espacioUsadoMB}</div>
          <div className={styles.estadisticas.label}>MB Usados</div>
        </div>
      </div>

      {/* 🔍 FASE 2: Barra de Filtros Avanzada */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.filtrosAvanzados.container}
      >
        {/* Fila superior: Búsqueda + Categoría */}
        <div className={styles.filtrosAvanzados.filaSuperior}>
          {/* Barra de búsqueda */}
          <div className={styles.filtrosAvanzados.busqueda.container}>
            <label htmlFor="busqueda-docs" className={styles.filtrosAvanzados.busqueda.label}>
              Buscar documentos
            </label>
            <Search className={styles.filtrosAvanzados.busqueda.icon} />
            <input
              id="busqueda-docs"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título, descripción o categoría..."
              className={styles.filtrosAvanzados.busqueda.input}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className={styles.filtrosAvanzados.busqueda.clearButton}
                title="Limpiar búsqueda"
              >
                <X className={styles.filtrosAvanzados.busqueda.clearIcon} />
              </button>
            )}
          </div>

          {/* Filtro por categoría */}
          <div className={styles.filtrosAvanzados.categoria.container}>
            <label htmlFor="filtro-categoria" className={styles.filtrosAvanzados.categoria.label}>
              Filtrar por categoría
            </label>
            <select
              id="filtro-categoria"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className={styles.filtrosAvanzados.categoria.select}
            >
              <option value="todas">Todas las categorías</option>
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.filtrosAvanzados.categoria.icon} />
          </div>
        </div>

        {/* Fila inferior: Chips de filtros + Ordenamiento */}
        <div className={styles.filtrosAvanzados.filaInferior}>
          {/* Chips de filtros activos */}
          <div className={styles.filtrosAvanzados.chips.container}>
            {/* Chip: Solo Importantes */}
            <button
              onClick={() => setSoloImportantes(!soloImportantes)}
              className={styles.filtrosAvanzados.chips.chip}
              style={{
                opacity: soloImportantes ? 1 : 0.5,
                borderWidth: soloImportantes ? '2px' : '1px',
              }}
            >
              <Star className={styles.filtrosAvanzados.chips.chipIcon} />
              Solo Importantes
              {soloImportantes && (
                <span className={styles.filtrosAvanzados.chips.removeButton}>
                  <X className={styles.filtrosAvanzados.chips.removeIcon} />
                </span>
              )}
            </button>

            {/* Chip: Filtro activo (categoría) */}
            {categoriaFiltro !== 'todas' && (
              <button
                onClick={() => setCategoriaFiltro('todas')}
                className={styles.filtrosAvanzados.chips.chip}
              >
                <Filter className={styles.filtrosAvanzados.chips.chipIcon} />
                {categoriaFiltro}
                <span className={styles.filtrosAvanzados.chips.removeButton}>
                  <X className={styles.filtrosAvanzados.chips.removeIcon} />
                </span>
              </button>
            )}

            {/* Chip: Búsqueda activa */}
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className={styles.filtrosAvanzados.chips.chip}
              >
                <Search className={styles.filtrosAvanzados.chips.chipIcon} />
                "{busqueda.substring(0, 20)}{busqueda.length > 20 ? '...' : ''}"
                <span className={styles.filtrosAvanzados.chips.removeButton}>
                  <X className={styles.filtrosAvanzados.chips.removeIcon} />
                </span>
              </button>
            )}
          </div>

          {/* Ordenamiento + Contador */}
          <div className="flex items-center gap-3">
            <div className={styles.filtrosAvanzados.ordenamiento.container}>
              <label
                htmlFor="ordenamiento"
                className={styles.filtrosAvanzados.ordenamiento.label}
              >
                Ordenar:
              </label>
              <select
                id="ordenamiento"
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value as OrdenDocumentos)}
                className={styles.filtrosAvanzados.ordenamiento.select}
              >
                <option value="fecha-desc">Más reciente</option>
                <option value="fecha-asc">Más antiguo</option>
                <option value="nombre-asc">Nombre A-Z</option>
                <option value="nombre-desc">Nombre Z-A</option>
                <option value="categoria">Por categoría</option>
              </select>
            </div>

            <p className={styles.filtrosAvanzados.contador}>
              {documentosFiltrados.length} resultado{documentosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Documentos Importantes */}
      {documentosImportantes.length > 0 && (
        <div className={styles.importantes.container}>
          <div className={styles.importantes.header}>
            <h3 className={styles.importantes.title}>
              <Star className="w-5 h-5 text-red-600" />
              Documentos Importantes
              <span className={styles.importantes.badge}>{documentosImportantes.length}</span>
            </h3>
          </div>
          <div className="space-y-2">
            {documentosImportantes.map((doc) => (
              <DocumentoCard
                key={doc.id}
                documento={doc}
                onVer={handleVer}
                onDescargar={handleDescargar}
                onNuevaVersion={() => setDocumentoNuevaVersion({ id: doc.id, titulo: doc.titulo })}
                onHistorial={() => setDocumentoIdHistorial(doc.id)}
                onEliminar={canDelete ? handleEliminar : undefined}
                isViendoDocumento={isViendoDocumento}
                isDescargando={isDescargando}
                isEliminando={isEliminando}
              />
            ))}
          </div>
        </div>
      )}

      {/* Documentos Recientes */}
      {documentosRecientes.length > 0 && (
        <div className={styles.recientes.container}>
          <div className={styles.recientes.header}>
            <h3 className={styles.recientes.title}>
              <Clock className="w-4 h-4" />
              Recientes (últimos 7 días)
            </h3>
          </div>
          <div className="space-y-1">
            {documentosRecientes.map((doc) => (
              <div key={doc.id} className={styles.recientes.item}>
                <div className={styles.recientes.info}>
                  <p className={styles.recientes.nombre}>{doc.titulo}</p>
                  <p className={styles.recientes.meta}>
                    {doc.categoria?.nombre} •{' '}
                    {new Date(doc.fecha_creacion).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className={styles.recientes.actions}>
                  <button
                    onClick={() => handleVer(doc.id)}
                    className={`${styles.actionButton.base} ${styles.actionButton.ver}`}
                    title="Ver"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDescargar(doc.id, doc.nombre_original)}
                    className={`${styles.actionButton.base} ${styles.actionButton.descargar}`}
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos por Categoría */}
      <div className={styles.categorias.container}>
        <h3 className={styles.categorias.header}>
          <FolderOpen className="w-5 h-5" />
          Por Categoría
        </h3>
        <div className="space-y-3">
          {Object.entries(documentosPorCategoria).map(([categoria, grupo]) => (
            <CategoriaAccordion
              key={categoria}
              categoria={categoria}
              color={grupo.color}
              documentos={grupo.documentos}
              isOpen={categoriasAbiertas[categoria]}
              onToggle={() => toggleCategoria(categoria)}
              onVer={handleVer}
              onDescargar={handleDescargar}
              onNuevaVersion={(id, titulo) => setDocumentoNuevaVersion({ id, titulo })}
              onHistorial={setDocumentoIdHistorial}
              onEliminar={canDelete ? handleEliminar : undefined}
              isViendoDocumento={isViendoDocumento}
              isDescargando={isDescargando}
              isEliminando={isEliminando}
            />
          ))}
        </div>
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
    </div>
  )
}

// Componente auxiliar para card de documento
interface DocumentoCardProps {
  documento: any
  onVer: (id: string) => void
  onDescargar: (id: string, nombreOriginal: string) => void
  onNuevaVersion: () => void
  onHistorial: () => void
  onEliminar?: (id: string, titulo: string) => void
  isViendoDocumento: boolean
  isDescargando: boolean
  isEliminando: boolean
}

function DocumentoCard({
  documento: doc,
  onVer,
  onDescargar,
  onNuevaVersion,
  onHistorial,
  onEliminar,
  isViendoDocumento,
  isDescargando,
  isEliminando,
}: DocumentoCardProps) {
  return (
    <div className={styles.docCard.container}>
      <div className={styles.docCard.iconContainer}>
        <FileText className={styles.docCard.icon} />
      </div>
      <div className={styles.docCard.content}>
        <h4 className={styles.docCard.title}>{doc.titulo}</h4>
        <div className={styles.docCard.meta}>
          {doc.categoria && (
            <span
              className={styles.docCard.badge}
              style={{
                backgroundColor: `${doc.categoria.color}20`,
                color: doc.categoria.color,
              }}
            >
              {doc.categoria.nombre}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(doc.fecha_creacion).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      </div>
      <div className={styles.docCard.actions}>
        <button
          onClick={() => onVer(doc.id)}
          disabled={isViendoDocumento}
          className={`${styles.actionButton.base} ${styles.actionButton.ver}`}
          title="Ver"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDescargar(doc.id, doc.nombre_original)}
          disabled={isDescargando}
          className={`${styles.actionButton.base} ${styles.actionButton.descargar}`}
          title="Descargar"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={onNuevaVersion}
          className={`${styles.actionButton.base} ${styles.actionButton.nuevaVersion}`}
          title="Nueva Versión"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={onHistorial}
          className={`${styles.actionButton.base} ${styles.actionButton.historial}`}
          title="Historial"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        {onEliminar && (
          <button
            onClick={() => onEliminar(doc.id, doc.titulo)}
            disabled={isEliminando}
            className={`${styles.actionButton.base} ${styles.actionButton.eliminar}`}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Componente auxiliar para accordion de categoría
interface CategoriaAccordionProps {
  categoria: string
  color: string
  documentos: any[]
  isOpen: boolean
  onToggle: () => void
  onVer: (id: string) => void
  onDescargar: (id: string, nombreOriginal: string) => void
  onNuevaVersion: (id: string, titulo: string) => void
  onHistorial: (id: string) => void
  onEliminar?: (id: string, titulo: string) => void
  isViendoDocumento: boolean
  isDescargando: boolean
  isEliminando: boolean
}

function CategoriaAccordion({
  categoria,
  color,
  documentos,
  isOpen,
  onToggle,
  onVer,
  onDescargar,
  onNuevaVersion,
  onHistorial,
  onEliminar,
  isViendoDocumento,
  isDescargando,
  isEliminando,
}: CategoriaAccordionProps) {
  return (
    <div className={styles.accordion.container} style={{ borderColor: `${color}40` }}>
      <button
        onClick={onToggle}
        className={styles.accordion.trigger}
        style={{ background: `linear-gradient(to right, ${color}, ${color}DD)` }}
      >
        <div className={styles.accordion.triggerContent}>
          <FolderOpen className={styles.accordion.icon} />
          <span className={styles.accordion.title}>{categoria}</span>
          <span className={styles.accordion.counter}>{documentos.length}</span>
        </div>
        {isOpen ? (
          <ChevronUp className={styles.accordion.chevron} />
        ) : (
          <ChevronDown className={styles.accordion.chevron} />
        )}
      </button>
      {isOpen && (
        <div className={styles.accordion.content}>
          {documentos.map((doc) => (
            <DocumentoCard
              key={doc.id}
              documento={doc}
              onVer={onVer}
              onDescargar={onDescargar}
              onNuevaVersion={() => onNuevaVersion(doc.id, doc.titulo)}
              onHistorial={() => onHistorial(doc.id)}
              onEliminar={onEliminar}
              isViendoDocumento={isViendoDocumento}
              isDescargando={isDescargando}
              isEliminando={isEliminando}
            />
          ))}
        </div>
      )}
    </div>
  )
}
