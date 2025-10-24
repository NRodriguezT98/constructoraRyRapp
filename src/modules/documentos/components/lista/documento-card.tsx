'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
    AlertCircle,
    Archive,
    Calendar,
    Download,
    Edit3,
    Eye,
    FileText,
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
import { useDocumentoCard } from '../../hooks'
import { CategoriaIcon } from '../shared/categoria-icon'

interface DocumentoCardProps {
  documento: DocumentoProyecto
  categoria?: { nombre: string; color: string; icono: string }
  onView: (documento: DocumentoProyecto) => void
  onDownload: (documento: DocumentoProyecto) => void
  onToggleImportante: (documento: DocumentoProyecto) => void
  onArchive: (documento: DocumentoProyecto) => void
  onDelete: (documento: DocumentoProyecto) => void
  onRename?: (documento: DocumentoProyecto) => void
}

export function DocumentoCard({
  documento,
  categoria,
  onView,
  onDownload,
  onToggleImportante,
  onArchive,
  onDelete,
  onRename,
}: DocumentoCardProps) {
  const { menuAbierto, menuRef, toggleMenu, cerrarMenu } = useDocumentoCard()

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className='group relative flex h-full min-h-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800'
    >
      {/* Badge de importante */}
      {documento.es_importante && (
        <div className='absolute right-4 top-4 z-10'>
          <div className='flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-xs font-medium text-white shadow-lg'>
            <Star size={12} className='fill-white' />
            Importante
          </div>
        </div>
      )}

      {/* Badge de vencimiento */}
      {estaVencido && (
        <div className='absolute left-4 top-4 z-10'>
          <div className='flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white shadow-lg'>
            <AlertCircle size={12} />
            Vencido
          </div>
        </div>
      )}
      {!estaVencido && estaProximoAVencer && (
        <div className='absolute left-4 top-4 z-10'>
          <div className='flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white shadow-lg'>
            <AlertCircle size={12} />
            Por vencer
          </div>
        </div>
      )}

      <div className='flex flex-1 flex-col p-6'>
        {/* Header con icono y menú */}
        <div className='mb-4 flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            {categoria ? (
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'>
                <CategoriaIcon
                  icono={categoria.icono}
                  color={categoria.color}
                  size={24}
                />
              </div>
            ) : (
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700'>
                <FileText size={24} className='text-gray-400' />
              </div>
            )}

            <div className='min-w-0 flex-1'>
              {categoria && (
                <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                  {categoria.nombre}
                </span>
              )}
            </div>
          </div>

          {/* Menú de acciones */}
          <div className='relative' ref={menuRef}>
            <button
              onClick={toggleMenu}
              className='rounded-lg p-2 opacity-0 transition-colors hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-700'
            >
              <MoreVertical size={18} className='text-gray-500' />
            </button>

            {menuAbierto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className='absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800'
              >
                <button
                  onClick={() => {
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
                    onClick={() => {
                      onRename(documento)
                      cerrarMenu()
                    }}
                    className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  >
                    <Edit3 size={16} />
                    Renombrar
                  </button>
                )}

                <button
                  onClick={() => {
                    onArchive(documento)
                    cerrarMenu()
                  }}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                >
                  <Archive size={16} />
                  Archivar
                </button>

                <div className='my-2 border-t border-gray-200 dark:border-gray-700' />

                <button
                  onClick={() => {
                    onDelete(documento)
                    cerrarMenu()
                  }}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Título y descripción */}
        <div className='mb-4'>
          <h3 className='mb-1 line-clamp-2 font-semibold text-gray-900 dark:text-white'>
            {documento.titulo}
          </h3>
          {documento.descripcion && (
            <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
              {documento.descripcion}
            </p>
          )}
        </div>

        {/* Información del archivo */}
        <div className='mb-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
          <span className='font-medium uppercase'>
            {getFileExtension(documento.nombre_archivo)}
          </span>
          <span>•</span>
          <span>{formatFileSize(documento.tamano_bytes)}</span>
          {documento.version > 1 && (
            <>
              <span>•</span>
              <span>v{documento.version}</span>
            </>
          )}
        </div>

        {/* Etiquetas */}
        {documento.etiquetas && documento.etiquetas.length > 0 && (
          <div className='mb-4 flex flex-wrap gap-2'>
            {documento.etiquetas.slice(0, 3).map((etiqueta, index) => (
              <span
                key={index}
                className='inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              >
                <Tag size={10} />
                {etiqueta}
              </span>
            ))}
            {documento.etiquetas.length > 3 && (
              <span className='inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400'>
                +{documento.etiquetas.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Fechas */}
        <div className='mb-4 space-y-2 text-xs'>
          {documento.fecha_documento && (
            <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
              <Calendar size={14} />
              <span>
                {format(
                  new Date(documento.fecha_documento),
                  "d 'de' MMMM, yyyy",
                  { locale: es }
                )}
              </span>
            </div>
          )}
          {documento.fecha_vencimiento && (
            <div
              className={`flex items-center gap-2 ${estaVencido ? 'text-red-600 dark:text-red-400' : estaProximoAVencer ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <AlertCircle size={14} />
              <span>
                Vence:{' '}
                {format(
                  new Date(documento.fecha_vencimiento),
                  "d 'de' MMMM, yyyy",
                  { locale: es }
                )}
              </span>
            </div>
          )}
        </div>

        {/* Acciones principales */}
        <div className='mt-auto flex gap-2'>
          <button
            onClick={() => onView(documento)}
            className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700'
          >
            <Eye size={16} />
            Ver
          </button>
          <button
            onClick={() => onDownload(documento)}
            className='rounded-xl bg-gray-100 px-4 py-2.5 text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          >
            <Download size={16} />
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
  )
}
