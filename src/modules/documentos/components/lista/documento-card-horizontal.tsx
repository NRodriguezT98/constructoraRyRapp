'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Archive,
    Calendar,
    Download,
    Edit3,
    Eye,
    FileText,
    FileUp,
    FolderPlus,
    History,
    Lock,
    MoreVertical,
    Star,
    Tag,
    Trash2,
} from 'lucide-react'

import {
    DocumentoProyecto,
    formatFileSize,
    getFileExtension,
} from '../../../../types/documento.types'
import {
    DocumentoNuevaVersionModal,
    DocumentoVersionesModal
} from '../../../clientes/documentos/components'
import { useDocumentoCard } from '../../hooks'
import { BadgeEstadoProceso } from '../badge-estado-proceso'
import { CategoriaIcon } from '../shared/categoria-icon'

interface DocumentoCardHorizontalProps {
  documento: DocumentoProyecto
  categoria?: { nombre: string; color: string; icono: string }
  onView: (documento: DocumentoProyecto) => void
  onDownload: (documento: DocumentoProyecto) => void
  onToggleImportante: (documento: DocumentoProyecto) => void
  onArchive: (documento: DocumentoProyecto) => void
  onDelete: (documento: DocumentoProyecto) => void
  onRename?: (documento: DocumentoProyecto) => void
  onAsignarCategoria?: (documento: DocumentoProyecto) => void
  onRefresh?: () => void | Promise<void> // 🆕 Callback para refrescar después de versión
}

export function DocumentoCardHorizontal({
  documento,
  categoria,
  onView,
  onDownload,
  onToggleImportante,
  onArchive,
  onDelete,
  onRename,
  onAsignarCategoria,
  onRefresh, // 🆕 Prop de refresh
}: DocumentoCardHorizontalProps) {
  const {
    menuAbierto,
    menuRef,
    toggleMenu,
    cerrarMenu,
    estaProtegido,
    procesoInfo,
    estadoProceso, // ✅ NUEVO
    verificando,
    modalVersionesAbierto,
    abrirModalVersiones,
    cerrarModalVersiones,
    modalNuevaVersionAbierto,
    abrirModalNuevaVersion,
    cerrarModalNuevaVersion,
  } = useDocumentoCard(documento.id)

  const esDocumentoDeProceso = documento.etiquetas?.some(
    etiqueta => etiqueta.toLowerCase() === 'proceso' || etiqueta.toLowerCase() === 'negociación'
  )

  const tieneVersiones = documento.version > 1 || documento.documento_padre_id

  const estaProximoAVencer = documento.fecha_vencimiento
    ? new Date(documento.fecha_vencimiento) <=
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false

  const estaVencido = documento.fecha_vencimiento
    ? new Date(documento.fecha_vencimiento) < new Date()
    : false

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className='group relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'
    >
      {/* SECCIÓN IZQUIERDA: Icono de categoría compacto */}
      <div className='flex flex-shrink-0'>
        {/* Icono de categoría */}
        <div className='relative'>
          {categoria ? (
            <div
              className='flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br shadow-md'
              style={{
                background: `linear-gradient(135deg, ${categoria.color}22, ${categoria.color}44)`
              }}
            >
              <CategoriaIcon
                icono={categoria.icono}
                color={categoria.color}
                size={24}
              />
            </div>
          ) : (
            <div className='flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 shadow-md dark:bg-gray-700'>
              <FileText size={24} className='text-gray-400' />
            </div>
          )}

          {/* Badge de importante (esquina del icono) */}
          {documento.es_importante && (
            <div className='absolute -right-1 -top-1'>
              <div className='flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 shadow-lg'>
                <Star size={10} className='fill-white text-white' />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN CENTRO: Información principal */}
      <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
        {/* Badge de categoría + Badges de vencimiento */}
        <div className='flex items-center gap-2'>
          {/* Badge de categoría (compacto) */}
          {categoria && (
            <span
              className='inline-flex max-w-[160px] items-center gap-1 truncate rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm'
              style={{ backgroundColor: categoria.color }}
              title={categoria.nombre}
            >
              {categoria.nombre}
            </span>
          )}

          {/* Badges de vencimiento */}
          {estaVencido && (
            <span className='flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300'>
              <AlertCircle size={12} />
              Vencido
            </span>
          )}
          {!estaVencido && estaProximoAVencer && (
            <span className='flex items-center gap-1 rounded-md bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'>
              <AlertCircle size={12} />
              Por vencer
            </span>
          )}

          {/* Badge de proceso completado */}
          {estaProtegido && procesoInfo && (
            <span className='flex items-center gap-1.5 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
              <Lock size={12} />
              Proceso Completado
              {procesoInfo.pasoNombre && <span className='opacity-75'>• {procesoInfo.pasoNombre}</span>}
            </span>
          )}
        </div>

        {/* Título */}
        <div className='flex items-start gap-2'>
          <h3 className='flex-1 truncate text-base font-semibold text-gray-900 dark:text-white'>
            {documento.titulo}
          </h3>
        </div>

        {/* Descripción */}
        {documento.descripcion && (
          <p className='line-clamp-1 text-sm text-gray-600 dark:text-gray-400'>
            {documento.descripcion}
          </p>
        )}

        {/* Metadatos compactos */}
        <div className='flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
          {/* Tipo y tamaño */}
          <div className='flex items-center gap-1.5'>
            <span className='rounded bg-gray-100 px-1.5 py-0.5 font-mono font-semibold uppercase dark:bg-gray-700'>
              {getFileExtension(documento.nombre_archivo)}
            </span>
            <span>{formatFileSize(documento.tamano_bytes)}</span>
          </div>

          {/* Versión */}
          {documento.version > 1 && (
            <>
              <span className='text-gray-300 dark:text-gray-600'>•</span>
              <span className='font-medium'>Versión {documento.version}</span>
            </>
          )}

          {/* Fecha documento */}
          {documento.fecha_documento && (
            <>
              <span className='text-gray-300 dark:text-gray-600'>•</span>
              <div className='flex items-center gap-1'>
                <Calendar size={12} />
                <span>
                  {format(new Date(documento.fecha_documento), 'd MMM yyyy', { locale: es })}
                </span>
              </div>
            </>
          )}

          {/* Fecha vencimiento */}
          {documento.fecha_vencimiento && (
            <>
              <span className='text-gray-300 dark:text-gray-600'>•</span>
              <div
                className={`flex items-center gap-1 ${
                  estaVencido
                    ? 'font-semibold text-red-600 dark:text-red-400'
                    : estaProximoAVencer
                    ? 'font-semibold text-orange-600 dark:text-orange-400'
                    : ''
                }`}
              >
                <AlertCircle size={12} />
                <span>
                  Vence: {format(new Date(documento.fecha_vencimiento), 'd MMM yyyy', { locale: es })}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Etiquetas */}
        {documento.etiquetas && documento.etiquetas.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {documento.etiquetas.slice(0, 4).map((etiqueta, index) => (
              <span
                key={index}
                className='inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
              >
                <Tag size={10} />
                {etiqueta}
              </span>
            ))}
            {documento.etiquetas.length > 4 && (
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
                +{documento.etiquetas.length - 4} más
              </span>
            )}
          </div>
        )}

        {/* ✅ NUEVO: Badge de estado del proceso */}
        {estadoProceso.esDeProceso && estadoProceso.estadoPaso && (
          <div className='mt-2'>
            <BadgeEstadoProceso estadoPaso={estadoProceso.estadoPaso} />
          </div>
        )}
      </div>

      {/* SECCIÓN DERECHA: Acciones */}
      <div className='flex flex-shrink-0 items-center gap-2'>
        {/* Botón Ver (principal) */}
        <button
          onClick={() => onView(documento)}
          className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
        >
          <Eye size={16} />
          <span className='hidden sm:inline'>Ver</span>
        </button>

        {/* Botón Descargar */}
        <button
          onClick={() => onDownload(documento)}
          className='flex items-center justify-center rounded-lg bg-gray-100 p-2.5 text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          title='Descargar'
        >
          <Download size={18} />
        </button>

        {/* Botón Asignar Categoría */}
        {onAsignarCategoria && (
          <button
            onClick={() => onAsignarCategoria(documento)}
            className='flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5 text-white transition-all hover:from-amber-600 hover:to-orange-600'
            title={categoria ? `Cambiar categoría (actual: ${categoria.nombre})` : 'Asignar categoría'}
          >
            <FolderPlus size={18} />
          </button>
        )}

        {/* Menú de opciones */}
        <div className='relative z-30' ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleMenu()
            }}
            className='flex items-center justify-center rounded-lg p-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            title='Más opciones'
          >
            <MoreVertical size={18} className='text-gray-500' />
          </button>

          <AnimatePresence>
            {menuAbierto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className='absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800'
              >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleImportante(documento)
                  cerrarMenu()
                }}
                className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                <Star
                  size={16}
                  className={
                    documento.es_importante
                      ? 'fill-yellow-500 text-yellow-500'
                      : ''
                  }
                />
                {documento.es_importante
                  ? 'Quitar importante'
                  : 'Marcar importante'}
              </button>

              {onRename && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onRename(documento)
                    cerrarMenu()
                  }}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  <Edit3 size={16} />
                  Renombrar
                </button>
              )}

              {/* Botón Ver Historial - si tiene versiones */}
              {tieneVersiones && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    abrirModalVersiones()
                  }}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20'
                >
                  <History size={16} />
                  Ver Historial (v{documento.version})
                </button>
              )}

              {/* Botón Nueva Versión - solo para documentos de proceso */}
              {esDocumentoDeProceso && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    abrirModalNuevaVersion()
                  }}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                >
                  <FileUp size={16} />
                  Nueva Versión
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onArchive(documento)
                  cerrarMenu()
                }}
                className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                <Archive size={16} />
                Archivar
              </button>

              <div className='my-2 border-t border-gray-200 dark:border-gray-700' />

              {/* Botón eliminar - oculto si el documento está protegido */}
              {!estaProtegido && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete(documento)
                    cerrarMenu()
                  }}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              )}

              {/* Mensaje informativo si está protegido */}
              {estaProtegido && (
                <div className='px-4 py-3 text-xs text-gray-500 dark:text-gray-400'>
                  <div className='flex items-start gap-2'>
                    <Lock size={14} className='mt-0.5 flex-shrink-0 text-emerald-600' />
                    <div>
                      <p className='font-medium text-emerald-600 dark:text-emerald-400'>
                        Documento protegido
                      </p>
                      <p className='mt-1 leading-relaxed'>
                        Este documento pertenece a un proceso completado y no puede eliminarse.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Barra de color lateral (izquierda) */}
      {categoria && (
        <div
          className='absolute left-0 top-0 h-full w-1'
          style={{ backgroundColor: categoria.color }}
        />
      )}

      {/* Modales */}
      <DocumentoVersionesModal
        isOpen={modalVersionesAbierto}
        documentoId={documento.id}
        onClose={cerrarModalVersiones}
        onVersionRestaurada={async () => {
          cerrarModalVersiones()
          // 🆕 Refrescar lista de documentos
          await onRefresh?.()
        }}
      />

      <DocumentoNuevaVersionModal
        isOpen={modalNuevaVersionAbierto}
        documento={documento as any}
        onClose={cerrarModalNuevaVersion}
        onVersionCreada={async () => {
          cerrarModalNuevaVersion()
          // 🆕 Refrescar lista de documentos
          await onRefresh?.()
        }}
      />
    </motion.div>
  )
}
