'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  FileText,
  Folder,
  Loader2,
  Save,
  X,
} from 'lucide-react'

import { formatDateForInput } from '@/lib/utils/date.utils'
import { cn } from '@/shared/utils/helpers'

import { useDocumentoEditar } from '../../hooks'
import { useDetectarCambiosDocumento } from '../../hooks/useDetectarCambiosDocumento'
import type {
  CategoriaDocumento,
  DocumentoProyecto,
  TipoEntidad,
} from '../../types'

// COMENTADO: Funcionalidad de etiquetas eliminada
// import { EtiquetasInput } from '../shared/etiquetas-input'
import { ConfirmarCambiosDocumentoModal } from './ConfirmarCambiosDocumentoModal'

interface DocumentoEditarMetadatosModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  categorias: CategoriaDocumento[]
  tipoEntidad?: TipoEntidad
  onClose: () => void
  onEditado?: () => void | Promise<void>
}

export function DocumentoEditarMetadatosModal({
  isOpen,
  documento,
  categorias,
  tipoEntidad = 'proyecto',
  onClose,
  onEditado,
}: DocumentoEditarMetadatosModalProps) {
  const { editando, editarMetadatos } = useDocumentoEditar()

  // Estados del formulario
  const [titulo, setTitulo] = useState(documento.titulo)
  const [descripcion, setDescripcion] = useState(documento.descripcion || '')
  const [categoriaId, setCategoriaId] = useState(documento.categoria_id || '')
  const [fechaDocumento, setFechaDocumento] = useState(
    documento.fecha_documento
      ? formatDateForInput(documento.fecha_documento)
      : ''
  )
  const [fechaVencimiento, setFechaVencimiento] = useState(
    documento.fecha_vencimiento
      ? formatDateForInput(documento.fecha_vencimiento)
      : ''
  )
  // COMENTADO: Funcionalidad de etiquetas eliminada
  // const [etiquetas, setEtiquetas] = useState<string[]>(documento.etiquetas || [])
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [mostrarConfirmacionCambios, setMostrarConfirmacionCambios] =
    useState(false)

  // Detectar cambios con el hook
  const resumenCambios = useDetectarCambiosDocumento(documento, {
    titulo: titulo.trim(),
    descripcion: descripcion.trim() || undefined,
    categoria_id: categoriaId || undefined,
    fecha_documento: fechaDocumento || null,
    fecha_vencimiento: fechaVencimiento || null,
    // etiquetas: etiquetas.length > 0 ? etiquetas : undefined // COMENTADO
  })

  // Detectar si hay cambios sin guardar (para modal de cierre)
  const hayCambios = resumenCambios.hayCambios

  // Resetear formulario cuando cambia el documento
  useEffect(() => {
    if (isOpen) {
      setTitulo(documento.titulo)
      setDescripcion(documento.descripcion || '')
      setCategoriaId(documento.categoria_id || '')
      setFechaDocumento(
        documento.fecha_documento
          ? formatDateForInput(documento.fecha_documento)
          : ''
      )
      setFechaVencimiento(
        documento.fecha_vencimiento
          ? formatDateForInput(documento.fecha_vencimiento)
          : ''
      )
      // setEtiquetas(documento.etiquetas || []) // COMENTADO: Funcionalidad eliminada
    }
  }, [isOpen, documento])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Si no hay cambios, cerrar directamente
    if (!hayCambios) {
      onClose()
      return
    }

    // Mostrar modal de confirmación de cambios
    setMostrarConfirmacionCambios(true)
  }

  const confirmarGuardar = async () => {
    const success = await editarMetadatos(
      documento.id,
      {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        categoria_id: categoriaId || undefined,
        fecha_documento: fechaDocumento || null,
        fecha_vencimiento: fechaVencimiento || null,
        // etiquetas: etiquetas.length > 0 ? etiquetas : undefined // COMENTADO
      },
      tipoEntidad
    )

    if (success) {
      setMostrarConfirmacionCambios(false)
      await onEditado?.()
      onClose()
    }
  }

  const handleClose = () => {
    if (editando) return

    if (hayCambios) {
      setMostrarConfirmacion(true)
    } else {
      onClose()
    }
  }

  const confirmarCerrar = () => {
    setMostrarConfirmacion(false)
    onClose()
  }

  const cancelarCerrar = () => {
    setMostrarConfirmacion(false)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Modal Principal */}
      <AnimatePresence>
        {isOpen && (
          <div
            key='modal-editar-documento'
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            />

            {/* Modal - Tamaño consistente con formulario de subir (columna única) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className='relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
            >
              {/* Header verde del módulo de proyectos */}
              <div className='sticky top-0 z-10 flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                    <FileText size={20} className='text-white' />
                  </div>
                  <div>
                    <h2 className='text-lg font-bold text-white'>
                      Editar Documento
                    </h2>
                    <p className='mt-0.5 text-xs text-green-100'>
                      Modifica la información sin cambiar el archivo
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={editando}
                  className='rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50'
                >
                  <X size={20} />
                </button>
              </div>

              {/* Formulario con diseño de columna única (igual a subir documento) */}
              <form onSubmit={handleSubmit} className='p-6'>
                {/* Card única con todo el formulario */}
                <div className='mb-4 space-y-0'>
                  <div className='space-y-3 rounded-xl border border-gray-200/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'>
                    {/* Header */}
                    <div className='flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600'>
                        <FileText className='h-4 w-4 text-white' />
                      </div>
                      <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                        Información del Documento
                      </h3>
                    </div>

                    {/* Título */}
                    <div>
                      <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
                        Título del documento{' '}
                        <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        value={titulo}
                        onChange={e => setTitulo(e.target.value)}
                        required
                        minLength={3}
                        maxLength={200}
                        disabled={editando}
                        className={cn(
                          'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all dark:bg-gray-900/50',
                          'focus:border-transparent focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400',
                          'disabled:bg-gray-50 disabled:opacity-50 dark:disabled:bg-gray-800',
                          'border-gray-200 dark:border-gray-700'
                        )}
                        placeholder='Ej: Contrato de compraventa'
                      />
                      <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                        Mínimo 3 caracteres, máximo 200
                      </p>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className='mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300'>
                        Descripción
                      </label>
                      <textarea
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        disabled={editando}
                        rows={2}
                        maxLength={1000}
                        className={cn(
                          'w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm transition-all dark:bg-gray-900/50',
                          'focus:border-transparent focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400',
                          'disabled:bg-gray-50 disabled:opacity-50 dark:disabled:bg-gray-800',
                          'border-gray-200 dark:border-gray-700'
                        )}
                        placeholder='Descripción opcional del documento...'
                      />
                      <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                        Opcional, máximo 1000 caracteres
                      </p>
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
                        <Folder size={14} />
                        Categoría
                      </label>
                      <select
                        value={categoriaId}
                        onChange={e => setCategoriaId(e.target.value)}
                        disabled={editando}
                        className={cn(
                          'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all dark:bg-gray-900/50',
                          'focus:border-transparent focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400',
                          'disabled:bg-gray-50 disabled:opacity-50 dark:disabled:bg-gray-800',
                          'border-gray-200 dark:border-gray-700',
                          'text-gray-900 dark:text-gray-100',
                          '[&>option]:bg-white [&>option]:text-gray-900',
                          'dark:[&>option]:bg-gray-800 dark:[&>option]:text-gray-100'
                        )}
                      >
                        <option value=''>Sin categoría</option>
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                      <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                        Categoriza el documento para mejor organización
                      </p>
                    </div>

                    {/* Fechas en grid de 2 columnas */}
                    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                      {/* Fecha del documento */}
                      <div>
                        <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
                          <Calendar size={12} />
                          Fecha del documento
                        </label>
                        <input
                          type='date'
                          value={fechaDocumento}
                          onChange={e => setFechaDocumento(e.target.value)}
                          disabled={editando}
                          className={cn(
                            'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all dark:bg-gray-900/50',
                            'focus:border-transparent focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400',
                            'disabled:bg-gray-50 disabled:opacity-50 dark:disabled:bg-gray-800',
                            'border-gray-200 dark:border-gray-700'
                          )}
                        />
                      </div>

                      {/* Fecha de vencimiento */}
                      <div>
                        <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
                          <AlertCircle size={12} />
                          Vencimiento
                        </label>
                        <input
                          type='date'
                          value={fechaVencimiento}
                          onChange={e => setFechaVencimiento(e.target.value)}
                          disabled={editando}
                          min={fechaDocumento || undefined}
                          className={cn(
                            'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all dark:bg-gray-900/50',
                            'focus:border-transparent focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400',
                            'disabled:bg-gray-50 disabled:opacity-50 dark:disabled:bg-gray-800',
                            'border-gray-200 dark:border-gray-700'
                          )}
                        />
                      </div>
                    </div>

                    {/* COMENTADO: Funcionalidad de etiquetas eliminada */}
                    {/* <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Tag size={14} />
                    Etiquetas
                  </label>
                  <EtiquetasInput
                    value={etiquetas}
                    onChange={setEtiquetas}
                  />
                </div> */}
                  </div>
                </div>

                {/* Info del archivo (no editable) */}
                <div className='mb-4 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 dark:border-amber-800 dark:from-amber-900/20 dark:to-yellow-900/20'>
                  <div className='flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300'>
                    <AlertCircle size={16} className='mt-0.5 flex-shrink-0' />
                    <div>
                      <p className='font-medium'>
                        Archivo actual: {documento.titulo}.pdf
                      </p>
                      <p className='mt-1 text-xs'>
                        Para cambiar el archivo, usa &quot;Nueva Versión&quot;
                        (versionado) o &quot;Reemplazar Archivo&quot; (admin).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className='flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700'>
                  <button
                    type='button'
                    onClick={handleClose}
                    disabled={editando}
                    className='flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700/50'
                  >
                    Cancelar
                  </button>
                  <div className='group relative flex-1'>
                    <button
                      type='submit'
                      disabled={editando || !titulo.trim() || !hayCambios}
                      className='flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50'
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
                    {/* Tooltip cuando no hay cambios */}
                    {!hayCambios && !editando && (
                      <div className='pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700'>
                        No hay cambios para guardar
                        <div className='absolute left-1/2 top-full -mt-1 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700'></div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Modal de Confirmación de Cambios Sin Guardar */}
            <AnimatePresence>
              {mostrarConfirmacion && (
                <motion.div
                  key='modal-confirmacion-cerrar'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='absolute inset-0 z-10 flex items-center justify-center p-4'
                >
                  {/* Backdrop adicional */}
                  <div
                    className='absolute inset-0 bg-black/30'
                    onClick={cancelarCerrar}
                  />

                  {/* Modal de confirmación */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={e => e.stopPropagation()}
                    className='relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800'
                  >
                    <div className='flex items-start gap-4'>
                      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
                        <AlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                      </div>
                      <div className='flex-1'>
                        <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                          ¿Descartar cambios?
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Tienes cambios sin guardar. Si cierras ahora, perderás
                          todos los cambios realizados.
                        </p>
                      </div>
                    </div>

                    <div className='mt-6 flex gap-3'>
                      <button
                        onClick={cancelarCerrar}
                        className='flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      >
                        Continuar editando
                      </button>
                      <button
                        onClick={confirmarCerrar}
                        className='flex-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-red-700 hover:to-rose-700'
                      >
                        Descartar cambios
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación de Cambios ANTES de Guardar */}
      <ConfirmarCambiosDocumentoModal
        isOpen={mostrarConfirmacionCambios}
        onClose={() => setMostrarConfirmacionCambios(false)}
        onConfirm={confirmarGuardar}
        cambios={resumenCambios}
        isLoading={editando}
        nombreCategoria={categorias.find(c => c.id === categoriaId)?.nombre}
      />
    </>
  )
}
