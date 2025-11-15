'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Archive,
    Calendar,
    Clock,
    Crown,
    Download,
    Edit,
    Edit3,
    Eye,
    FileText,
    FileUp,
    History,
    Lock,
    MoreVertical,
    RefreshCw,
    Star,
    Tag,
    Trash2,
    Upload,
    User,
} from 'lucide-react'

import {
    formatDateCompact
} from '@/lib/utils/date.utils'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import {
    DocumentoProyecto,
    formatFileSize,
    getFileExtension,
} from '../../../../types/documento.types'
import { useDocumentoCard } from '../../hooks'
import type { CategoriaDocumento } from '../../types'
import { BadgeEstadoProceso } from '../badge-estado-proceso'
import {
    DocumentoEditarMetadatosModal,
    DocumentoNuevaVersionModal,
    DocumentoReemplazarArchivoModal,
    DocumentoVersionesModal
} from '../modals'
import { CategoriaIcon } from '../shared/categoria-icon'

interface DocumentoCardProps {
  documento: DocumentoProyecto
  categoria?: { nombre: string; color: string; icono: string }
  categorias?: CategoriaDocumento[] // 🆕 Para el modal de editar
  onView: (documento: DocumentoProyecto) => void
  onDownload: (documento: DocumentoProyecto) => void
  onToggleImportante: (documento: DocumentoProyecto) => void
  onArchive: (documento: DocumentoProyecto) => void
  onDelete: (documento: DocumentoProyecto) => void
  onRename?: (documento: DocumentoProyecto) => void
  onRefresh?: () => void | Promise<void> // 🆕 Callback para refrescar después de versión/edición
  moduleName?: ModuleName // 🎨 Tema del módulo padre
}

export function DocumentoCard({
  documento,
  categoria,
  categorias = [], // 🆕 Default a array vacío
  onView,
  onDownload,
  onToggleImportante,
  onArchive,
  onDelete,
  onRename,
  onRefresh, // 🆕 Prop de refresh
  moduleName = 'proyectos', // 🎨 Default a proyectos
}: DocumentoCardProps) {
  // 🎨 Obtener tema dinámico
  const theme = moduleThemes[moduleName]

  // 🎯 TODA la lógica en el hook
  const {
    esAdmin,
    puedeEliminar,
    menuAbierto,
    menuRef,
    toggleMenu,
    cerrarMenu,
    modalEditarAbierto,
    abrirModalEditar,
    cerrarModalEditar,
    modalReemplazarAbierto,
    abrirModalReemplazar,
    cerrarModalReemplazar,
    estaProtegido,
    procesoInfo,
    estadoProceso,
    verificando,
    modalVersionesAbierto,
    abrirModalVersiones,
    cerrarModalVersiones,
    modalNuevaVersionAbierto,
    abrirModalNuevaVersion,
    cerrarModalNuevaVersion,
    estaProximoAVencer,
    estaVencido,
    diasParaVencer,
    esDocumentoDeProceso,
    tieneVersiones,
  } = useDocumentoCard({ documento, esDocumentoProyecto: true })

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        className={`group relative flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${menuAbierto ? 'z-50' : 'z-0'}`}
      >
      <div className='flex flex-1 flex-col p-4'>
        {/* Header: Icon + Categoría + Menú */}
        <div className='mb-3 flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            {/* Icono de categoría */}
            {categoria ? (
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${theme.classes.gradient.background} dark:${theme.classes.gradient.backgroundDark}`}>
                <CategoriaIcon
                  icono={categoria.icono}
                  color={categoria.color}
                  size={20}
                />
              </div>
            ) : (
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700'>
                <FileText size={20} className='text-gray-400' />
              </div>
            )}

            {/* Título + Badges inline */}
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2 mb-1'>
                {/* Título truncado con tooltip */}
                <h3
                  className='font-semibold text-gray-900 dark:text-white truncate text-sm'
                  title={documento.titulo}
                >
                  {documento.titulo}
                </h3>

                {/* Badge importante */}
                {documento.es_importante && (
                  <Star size={14} className='flex-shrink-0 fill-yellow-500 text-yellow-500' />
                )}
              </div>

              {/* Categoría + Tipo + Tamaño */}
              <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                {categoria && (
                  <>
                    <span className='font-medium'>{categoria.nombre}</span>
                    <span>•</span>
                  </>
                )}
                <span className='font-medium uppercase'>
                  {getFileExtension(documento.nombre_archivo)}
                </span>
                <span>•</span>
                <span>{formatFileSize(documento.tamano_bytes)}</span>
                {documento.version > 1 && (
                  <>
                    <span>•</span>
                    <span className='font-medium text-purple-600 dark:text-purple-400'>v{documento.version}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Menú de acciones */}
          <div className='relative flex-shrink-0' ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleMenu()
              }}
              className='rounded-lg p-2 opacity-0 transition-colors hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-700'
            >
              <MoreVertical size={18} className='text-gray-500' />
            </button>

            <AnimatePresence>
              {menuAbierto && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className='absolute right-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-gray-200 bg-white py-1 shadow-2xl dark:border-gray-700 dark:bg-gray-800'
                >
                {/* Marcar/Quitar importante */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onToggleImportante(documento)
                    cerrarMenu()
                  }}
                  className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
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
                    className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    <Edit3 size={16} />
                    Renombrar
                  </button>
                )}

                {/* Separador - Sección de edición */}
                <div className='my-1 border-t border-gray-200 dark:border-gray-700' />

                {/* 🆕 Botón Editar Metadatos - para todos los usuarios */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    abrirModalEditar()
                  }}
                  className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                >
                  <Edit size={16} />
                  Editar Documento
                </button>

                {/* Botón Ver Historial - si tiene versiones */}
                {tieneVersiones && (
                  <>
                    {/* Separador entre Editar y Ver Historial */}
                    <div className='my-1 border-t border-gray-200 dark:border-gray-700' />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        abrirModalVersiones()
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20'
                    >
                      <History size={16} />
                      Ver Historial (v{documento.version})
                    </button>
                  </>
                )}

                {/* Separador - Sección de versionado */}
                {esDocumentoDeProceso && (
                  <div className='my-1 border-t border-gray-200 dark:border-gray-700' />
                )}

                {/* Botón Nueva Versión - siempre visible para proyectos */}
                {esDocumentoDeProceso && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      abrirModalNuevaVersion()
                    }}
                    className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                  >
                    <FileUp size={16} />
                    Nueva Versión
                  </button>
                )}

                {/* 🆕 Botón Reemplazar Archivo - SOLO ADMIN */}
                {esAdmin && (
                  <>
                    <div className='my-1 border-t border-gray-200 dark:border-gray-700' />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        abrirModalReemplazar()
                      }}
                      className='relative flex w-full items-center gap-2 px-3 py-2 text-left text-sm bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30 transition-all'
                    >
                      <RefreshCw size={16} />
                      <span>Reemplazar Archivo</span>
                      <Crown size={13} className='ml-auto text-amber-500 dark:text-amber-400' />
                    </button>
                  </>
                )}

                {/* Separador - Sección de archivo */}
                <div className='my-1 border-t border-gray-200 dark:border-gray-700' />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onArchive(documento)
                    cerrarMenu()
                  }}
                  className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  <Archive size={16} />
                  Archivar
                </button>

                {/* Separador antes de eliminar */}
                {!estaProtegido && puedeEliminar && (
                  <div className='my-1 border-t border-gray-200 dark:border-gray-700' />
                )}

                {/* Botón eliminar - oculto si no tiene permiso o está protegido */}
                {!estaProtegido && puedeEliminar && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onDelete(documento)
                      cerrarMenu()
                    }}
                    className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
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

        {/* Descripción (si existe) - Compacta */}
        {documento.descripcion && (
          <p className='mb-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2'>
            {documento.descripcion}
          </p>
        )}

        {/* Metadatos en grid 2x2 con títulos */}
        <div className='mb-3 grid grid-cols-2 gap-2.5 text-xs'>
          {/* FILA 1: Fecha del documento + Fecha de expiración */}

          {/* Fecha de emisión del documento */}
          {documento.fecha_documento ? (
            <div className='flex flex-col gap-0.5'>
              <span className='text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide'>
                Emisión
              </span>
              <div className='flex items-center gap-1.5 text-gray-600 dark:text-gray-400'>
                <Calendar size={12} className='flex-shrink-0 text-blue-500 dark:text-blue-400' />
                <span className='truncate' title={`Fecha del documento: ${formatDateCompact(documento.fecha_documento)}`}>
                  {formatDateCompact(documento.fecha_documento)}
                </span>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-0.5'>
              <span className='text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide'>
                Emisión
              </span>
              <div className='flex items-center gap-1.5 text-gray-400 dark:text-gray-500'>
                <Calendar size={12} className='flex-shrink-0' />
                <span className='text-xs'>Sin fecha</span>
              </div>
            </div>
          )}

          {/* Fecha de expiración */}
          <div className='flex flex-col gap-0.5'>
            <span className='text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide'>
              Expiración
            </span>
            {documento.fecha_vencimiento ? (
              <div className='flex items-center gap-1.5'>
                {estaVencido ? (
                  <span className='inline-flex items-center gap-1 rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400'>
                    <AlertCircle size={12} />
                    Vencido hace {Math.abs(diasParaVencer!)}d
                  </span>
                ) : diasParaVencer !== null && diasParaVencer <= 30 ? (
                  <span className='inline-flex items-center gap-1 rounded-md bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'>
                    <Clock size={12} />
                    Vence en {diasParaVencer}d
                  </span>
                ) : (
                  <div className='flex items-center gap-1.5 text-gray-600 dark:text-gray-400'>
                    <Clock size={12} className='flex-shrink-0 text-orange-500 dark:text-orange-400' />
                    <span className='truncate' title={`Vence: ${formatDateCompact(documento.fecha_vencimiento)}`}>
                      {formatDateCompact(documento.fecha_vencimiento)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center gap-1.5 text-gray-400 dark:text-gray-500'>
                <Clock size={12} className='flex-shrink-0' />
                <span className='text-xs'>No expira</span>
              </div>
            )}
          </div>

          {/* FILA 2: Subido por + Fecha de subida */}

          {/* Subido por (usuario) */}
          <div className='flex flex-col gap-0.5'>
            <span className='text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide'>
              Subido por
            </span>
            <div className='flex items-center gap-1.5 text-gray-600 dark:text-gray-400'>
              <User size={12} className='flex-shrink-0 text-purple-500 dark:text-purple-400' />
              <span className='truncate' title={`${documento.usuario ? `${documento.usuario.nombres} ${documento.usuario.apellidos}` : 'Desconocido'}`}>
                {documento.usuario ? `${documento.usuario.nombres} ${documento.usuario.apellidos}` : 'Desconocido'}
              </span>
            </div>
          </div>

          {/* Fecha de subida al sistema */}
          <div className='flex flex-col gap-0.5'>
            <span className='text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide'>
              Fecha de carga
            </span>
            <div className='flex items-center gap-1.5 text-gray-600 dark:text-gray-400'>
              <Upload size={12} className='flex-shrink-0 text-green-500 dark:text-green-400' />
              <span className='truncate' title={`Subido: ${formatDateCompact(documento.fecha_creacion)} a las ${format(new Date(documento.fecha_creacion), "hh:mm:ss a", { locale: es })}`}>
                {formatDateCompact(documento.fecha_creacion)} {format(new Date(documento.fecha_creacion), "hh:mm:ss a")}
              </span>
            </div>
          </div>
        </div>

        {/* Etiquetas compactas */}
        {documento.etiquetas && documento.etiquetas.length > 0 && (
          <div className='mb-3 flex flex-wrap gap-1.5'>
            {documento.etiquetas.slice(0, 2).map((etiqueta, index) => (
              <span
                key={index}
                className='inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              >
                <Tag size={10} />
                {etiqueta}
              </span>
            ))}
            {documento.etiquetas.length > 2 && (
              <span className='inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
                +{documento.etiquetas.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Badge de estado del proceso */}
        {estadoProceso.esDeProceso && estadoProceso.estadoPaso && (
          <div className='mb-3'>
            <BadgeEstadoProceso estadoPaso={estadoProceso.estadoPaso} />
          </div>
        )}

        {/* Badge de proceso completado */}
        {estaProtegido && procesoInfo && (
          <div className='mb-3'>
            <div className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
              <Lock size={12} />
              <span>Proceso Completado</span>
              {procesoInfo.pasoNombre && (
                <span className='opacity-75'>• {procesoInfo.pasoNombre}</span>
              )}
            </div>
          </div>
        )}

        {/* Acciones principales - MÁS COMPACTAS */}
        <div className='mt-auto flex gap-2'>
          <button
            onClick={() => onView(documento)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg ${theme.classes.button.primary} px-3 py-2 text-sm font-medium`}
          >
            <Eye size={14} />
            Ver
          </button>
          <button
            onClick={() => onDownload(documento)}
            className='rounded-lg bg-gray-100 px-3 py-2 text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Barra de color de categoría */}
      {categoria && (
        <div
          className='h-1 w-full'
          style={{
            background: `linear-gradient(to right, ${categoria.color}, transparent)`,
          }}
        />
      )}
      </motion.div>

      {/* Modales - FUERA del contenedor de la card */}
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
        onSuccess={async () => {
          cerrarModalNuevaVersion()
          // Refrescar lista de documentos
          await onRefresh?.()
        }}
      />

      {/* 🆕 Modal Editar Metadatos */}
      <DocumentoEditarMetadatosModal
        isOpen={modalEditarAbierto}
        documento={documento}
        categorias={categorias}
        onClose={cerrarModalEditar}
        onEditado={async () => {
          cerrarModalEditar()
          if (onRefresh) await onRefresh()
        }}
      />

      {/* 🆕 Modal Reemplazar Archivo (Solo Admin) */}
      {esAdmin && (
        <DocumentoReemplazarArchivoModal
          isOpen={modalReemplazarAbierto}
          documento={documento}
          onClose={cerrarModalReemplazar}
          onReemplazado={async () => {
            cerrarModalReemplazar()
            await onRefresh?.()
          }}
        />
      )}
    </>
  )
}
