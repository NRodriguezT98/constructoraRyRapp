'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Calendar, FileText, Folder, Loader2, Save, Tag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatDateForInput } from '@/lib/utils/date.utils'
import { cn } from '@/shared/utils/helpers'
import { useDocumentoEditar } from '../../hooks'
import { useDetectarCambiosDocumento } from '../../hooks/useDetectarCambiosDocumento'
import type { CategoriaDocumento, DocumentoProyecto } from '../../types'
import { EtiquetasInput } from '../shared/etiquetas-input'
import { ConfirmarCambiosDocumentoModal } from './ConfirmarCambiosDocumentoModal'

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
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [mostrarConfirmacionCambios, setMostrarConfirmacionCambios] = useState(false)

  // Detectar cambios con el hook
  const resumenCambios = useDetectarCambiosDocumento(documento, {
    titulo: titulo.trim(),
    descripcion: descripcion.trim() || undefined,
    categoria_id: categoriaId || undefined,
    fecha_documento: fechaDocumento || null,
    fecha_vencimiento: fechaVencimiento || null,
    etiquetas: etiquetas.length > 0 ? etiquetas : undefined
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
        documento.fecha_documento ? formatDateForInput(documento.fecha_documento) : ''
      )
      setFechaVencimiento(
        documento.fecha_vencimiento ? formatDateForInput(documento.fecha_vencimiento) : ''
      )
      setEtiquetas(documento.etiquetas || [])
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
    const success = await editarMetadatos(documento.id, {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      categoria_id: categoriaId || undefined,
      fecha_documento: fechaDocumento || null,
      fecha_vencimiento: fechaVencimiento || null,
      etiquetas: etiquetas.length > 0 ? etiquetas : undefined
    })

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
          <div key="modal-editar-documento" className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            />

        {/* Modal - Tamaño más grande y consistente con formulario de subir */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className='relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-2xl'
        >
          {/* Header verde del módulo de proyectos */}
          <div className='sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-4 rounded-t-2xl'>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FileText size={20} className="text-white" />
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

          {/* Formulario con diseño de 2 columnas */}
          <form onSubmit={handleSubmit} className='p-6'>
            {/* Grid de 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* COLUMNA IZQUIERDA: Información Principal */}
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 shadow-lg space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Información del Documento
                  </h3>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Título del documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type='text'
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    minLength={3}
                    maxLength={200}
                    disabled={editando}
                    className={cn(
                      'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
                      'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
                      'disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800',
                      'border-gray-200 dark:border-gray-700'
                    )}
                    placeholder='Ej: Contrato de compraventa'
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mínimo 3 caracteres, máximo 200
                  </p>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    disabled={editando}
                    rows={3}
                    maxLength={1000}
                    className={cn(
                      'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all resize-none',
                      'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
                      'disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800',
                      'border-gray-200 dark:border-gray-700'
                    )}
                    placeholder='Descripción opcional del documento...'
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Opcional, máximo 1000 caracteres
                  </p>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Folder size={14} />
                    Categoría
                  </label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    disabled={editando}
                    className={cn(
                      'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
                      'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
                      'disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800',
                      'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <option value=''>Sin categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Categoriza el documento para mejor organización
                  </p>
                </div>
              </div>

              {/* COLUMNA DERECHA: Fechas y Etiquetas */}
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 shadow-lg space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Fechas y Opciones
                  </h3>
                </div>

                {/* Fechas en grid de 2 columnas */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Fecha del documento */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <Calendar size={12} />
                        Fecha del documento
                      </label>
                      <input
                        type='date'
                        value={fechaDocumento}
                        onChange={(e) => setFechaDocumento(e.target.value)}
                        disabled={editando}
                        className={cn(
                          'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
                          'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
                          'disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800',
                          'border-gray-200 dark:border-gray-700'
                        )}
                      />
                    </div>

                    {/* Fecha de vencimiento */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <AlertCircle size={12} />
                        Vencimiento
                      </label>
                      <input
                        type='date'
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
                        disabled={editando}
                        min={fechaDocumento || undefined}
                        className={cn(
                          'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900/50 border rounded-lg transition-all',
                          'focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent',
                          'disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800',
                          'border-gray-200 dark:border-gray-700'
                        )}
                      />
                    </div>
                  </div>

                  {/* Checkbox solo si expira */}
                  {fechaVencimiento && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 pl-1">
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="w-3 h-3 rounded"
                      />
                      <span>Solo si expira</span>
                    </div>
                  )}
                </div>

                {/* Etiquetas */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Tag size={14} />
                    Etiquetas
                  </label>
                  <EtiquetasInput
                    value={etiquetas}
                    onChange={setEtiquetas}
                  />
                </div>
              </div>
            </div>

            {/* Info del archivo (no editable) */}
            <div className='rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 p-4 mb-4'>
              <div className='flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300'>
                <AlertCircle size={16} className='mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium'>
                    Archivo actual: {documento.titulo}.pdf
                  </p>
                  <p className='mt-1 text-xs'>
                    Para cambiar el archivo, usa "Nueva Versión" (versionado) o "Reemplazar Archivo" (admin).
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
              <button
                type='button'
                onClick={handleClose}
                disabled={editando}
                className='flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50'
              >
                Cancelar
              </button>
              <div className="flex-1 relative group">
                <button
                  type='submit'
                  disabled={editando || !titulo.trim() || !hayCambios}
                  className='w-full rounded-lg bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                    No hay cambios para guardar
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
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
              key="modal-confirmacion-cerrar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 z-10 flex items-center justify-center p-4'
            >
              {/* Backdrop adicional */}
              <div className='absolute inset-0 bg-black/30' onClick={cancelarCerrar} />

              {/* Modal de confirmación */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className='relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700'
              >
                <div className='flex items-start gap-4'>
                  <div className='w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0'>
                    <AlertCircle className='w-5 h-5 text-amber-600 dark:text-amber-400' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                      ¿Descartar cambios?
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Tienes cambios sin guardar. Si cierras ahora, perderás todos los cambios realizados.
                    </p>
                  </div>
                </div>

                <div className='flex gap-3 mt-6'>
                  <button
                    onClick={cancelarCerrar}
                    className='flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all'
                  >
                    Continuar editando
                  </button>
                  <button
                    onClick={confirmarCerrar}
                    className='flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-sm font-semibold text-white hover:from-red-700 hover:to-rose-700 transition-all'
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
