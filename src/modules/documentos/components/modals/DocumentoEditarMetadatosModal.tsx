'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Calendar, FileText, Loader2, Save, Tag as TagIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatDateForInput } from '@/lib/utils/date.utils'
import { useDocumentoEditar } from '../../hooks'
import type { CategoriaDocumento, DocumentoProyecto } from '../../types'

interface DocumentoEditarMetadatosModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  categorias: CategoriaDocumento[]
  onClose: () => void
  onEditado?: () => void | Promise<void>
}

export function DocumentoEditarMetadatosModal({
  isOpen,
  documento,
  categorias,
  onClose,
  onEditado
}: DocumentoEditarMetadatosModalProps) {
  const { editando, editarMetadatos } = useDocumentoEditar()

  // Estados del formulario
  const [titulo, setTitulo] = useState(documento.titulo)
  const [descripcion, setDescripcion] = useState(documento.descripcion || '')
  const [categoriaId, setCategoriaId] = useState(documento.categoria_id || '')
  const [fechaDocumento, setFechaDocumento] = useState(
    documento.fecha_documento ? formatDateForInput(documento.fecha_documento) : ''
  )
  const [fechaVencimiento, setFechaVencimiento] = useState(
    documento.fecha_vencimiento ? formatDateForInput(documento.fecha_vencimiento) : ''
  )
  const [etiquetas, setEtiquetas] = useState<string[]>(documento.etiquetas || [])
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('')

  // Resetear formulario cuando cambia el documento
  useEffect(() => {
    if (isOpen) {
      setTitulo(documento.titulo)
      setDescripcion(documento.descripcion || '')
      setCategoriaId(documento.categoria_id || '')
      setFechaDocumento(
        documento.fecha_documento ? formatDateForInput(documento.fecha_documento) : ''
      )
      setFechaVencimiento(
        documento.fecha_vencimiento ? formatDateForInput(documento.fecha_vencimiento) : ''
      )
      setEtiquetas(documento.etiquetas || [])
      setNuevaEtiqueta('')
    }
  }, [isOpen, documento])

  const agregarEtiqueta = () => {
    const etiquetaLimpia = nuevaEtiqueta.trim()
    if (etiquetaLimpia && !etiquetas.includes(etiquetaLimpia)) {
      setEtiquetas([...etiquetas, etiquetaLimpia])
      setNuevaEtiqueta('')
    }
  }

  const eliminarEtiqueta = (etiqueta: string) => {
    setEtiquetas(etiquetas.filter(e => e !== etiqueta))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await editarMetadatos(documento.id, {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      categoria_id: categoriaId || undefined,
      fecha_documento: fechaDocumento || null,
      fecha_vencimiento: fechaVencimiento || null,
      etiquetas: etiquetas.length > 0 ? etiquetas : undefined
    })

    if (success) {
      await onEditado?.()
      onClose()
    }
  }

  const handleClose = () => {
    if (!editando) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className='relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-2xl'
        >
          {/* Header */}
          <div className='sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800'>
            <div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Editar Documento
              </h2>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                Modifica la información del documento sin cambiar el archivo
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={editando}
              className='rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-300'
            >
              <X size={20} />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className='p-6 space-y-5'>
            {/* Título */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                <FileText size={16} />
                Título del documento *
              </label>
              <input
                type='text'
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                minLength={3}
                disabled={editando}
                className='w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900'
                placeholder='Ej: Contrato de compraventa'
              />
            </div>

            {/* Descripción */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                <FileText size={16} />
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={editando}
                rows={3}
                className='w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 resize-none'
                placeholder='Descripción opcional del documento...'
              />
            </div>

            {/* Categoría */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                <TagIcon size={16} />
                Categoría
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                disabled={editando}
                className='w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900'
              >
                <option value=''>Sin categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fechas */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Fecha del documento */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  <Calendar size={16} />
                  Fecha del documento
                </label>
                <input
                  type='date'
                  value={fechaDocumento}
                  onChange={(e) => setFechaDocumento(e.target.value)}
                  disabled={editando}
                  className='w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900'
                />
              </div>

              {/* Fecha de vencimiento */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  <Calendar size={16} />
                  Fecha de vencimiento
                </label>
                <input
                  type='date'
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  disabled={editando}
                  min={fechaDocumento || undefined}
                  className='w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900'
                />
              </div>
            </div>

            {/* Etiquetas */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                <TagIcon size={16} />
                Etiquetas
              </label>

              {/* Input para agregar etiquetas */}
              <div className='flex gap-2 mb-3'>
                <input
                  type='text'
                  value={nuevaEtiqueta}
                  onChange={(e) => setNuevaEtiqueta(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      agregarEtiqueta()
                    }
                  }}
                  disabled={editando}
                  className='flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900'
                  placeholder='Escribe y presiona Enter...'
                />
                <button
                  type='button'
                  onClick={agregarEtiqueta}
                  disabled={editando || !nuevaEtiqueta.trim()}
                  className='px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  Agregar
                </button>
              </div>

              {/* Lista de etiquetas */}
              {etiquetas.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {etiquetas.map((etiqueta) => (
                    <span
                      key={etiqueta}
                      className='inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    >
                      {etiqueta}
                      <button
                        type='button'
                        onClick={() => eliminarEtiqueta(etiqueta)}
                        disabled={editando}
                        className='hover:text-blue-900 dark:hover:text-blue-100 disabled:opacity-50'
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Info del archivo (no editable) */}
            <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50'>
              <div className='flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <AlertCircle size={16} className='mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium text-gray-700 dark:text-gray-300'>
                    Archivo actual: {documento.nombre_archivo}
                  </p>
                  <p className='mt-1'>
                    Para cambiar el archivo, usa la opción "Nueva Versión" (versionado) o "Reemplazar Archivo" (solo admin).
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={handleClose}
                disabled={editando}
                className='flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={editando || !titulo.trim()}
                className='flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {editando ? (
                  <>
                    <Loader2 size={16} className='animate-spin' />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
