'use client'

/**
 * ðŸ“¤ MODAL PARA SUBIR NUEVA VERSIÃ“N DE DOCUMENTO (PROYECTOS)
 *
 * Modal compacto diseño basado en Document Edit Metadatos Modal
 * - Campos: archivo, tÃ­tulo editable, fecha documento, fecha vencimiento opcional, descripción cambios
 * - Colores: Verde/Esmeralda (tema Proyectos)
 * - Portal rendering para z-index garantizado
 */

import { ChangeEvent, FormEvent, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Calendar, FileText, Upload, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { formatDateForDB, formatDateForInput, getTodayDateString } from '@/lib/utils/date.utils'
import { DocumentosViviendaService } from '@/modules/viviendas/services/documentos'
import type { DocumentoVivienda } from '@/modules/viviendas/types/documento-vivienda.types'

interface DocumentoNuevaVersionModalProps {
  isOpen: boolean
  documento: DocumentoVivienda
  onClose: () => void
  onSuccess?: () => void
}

export function DocumentoNuevaVersionModal({
  isOpen,
  documento,
  onClose,
  onSuccess
}: DocumentoNuevaVersionModalProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Estados del formulario
  const [archivo, setArchivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState(documento.titulo)
  const [fechaDocumento, setFechaDocumento] = useState(
    documento.fecha_documento ? formatDateForInput(documento.fecha_documento) : getTodayDateString()
  )
  const [fechaVencimiento, setFechaVencimiento] = useState(
    documento.fecha_vencimiento ? formatDateForInput(documento.fecha_vencimiento) : ''
  )
  const [cambios, setCambios] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo PDF, imágenes, Word o Excel')
      return
    }

    // Validar tamaño (50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setError('El archivo no puede superar los 50MB')
      return
    }

    setError(null)
    setArchivo(file)

    // Auto-completar tÃ­tulo con nombre del archivo (sin extensiÃ³n)
    const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
    setTitulo(nombreSinExtension)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!archivo) {
      setError('Debes seleccionar un archivo')
      return
    }

    if (!titulo.trim()) {
      setError('Debes ingresar un tÃ­tulo para el documento')
      return
    }

    //  Validación: Fecha de vencimiento no puede ser anterior a fecha de documento
    if (fechaDocumento && fechaVencimiento) {
      const fechaDoc = new Date(fechaDocumento)
      const fechaVenc = new Date(fechaVencimiento)

      if (fechaVenc < fechaDoc) {
        setError('La fecha de vencimiento no puede ser anterior a la fecha del documento')
        toast.error('Fecha de vencimiento inVálida')
        return
      }
    }

    if (!user) {
      setError('Debes iniciar sesiÃ³n')
      return
    }

    setSubiendo(true)
    setError(null)

    try {
      await DocumentosViviendaService.crearNuevaVersion(
        documento.id,
        archivo,
        user.id,
        cambios.trim() || undefined,
        titulo.trim(),
        fechaDocumento ? formatDateForDB(fechaDocumento) : undefined,
        fechaVencimiento ? formatDateForDB(fechaVencimiento) : undefined
      )

      // Invalidar cachÃ© de React Query
      queryClient.invalidateQueries({
        queryKey: ['documentos-vivienda', documento.vivienda_id],
      })

      toast.success('Nueva versión creada exitosamente')
      onSuccess?.()
      handleClose()
    } catch (error: any) {
      console.error('Error al crear nueva versión:', error)
      setError(error?.message || 'Error al subir la nueva versión')
      toast.error('Error al crear nueva versión')
    } finally {
      setSubiendo(false)
    }
  }

  const handleClose = () => {
    if (subiendo) return
    setArchivo(null)
    setTitulo(documento.titulo)
    setFechaDocumento(documento.fecha_documento ? formatDateForInput(documento.fecha_documento) : getTodayDateString())
    setFechaVencimiento(documento.fecha_vencimiento ? formatDateForInput(documento.fecha_vencimiento) : '')
    setCambios('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  //  Advertencia si fecha nueva es anterior a la actual
  const fechaActual = documento.fecha_documento ? new Date(documento.fecha_documento) : null
  const fechaNueva = fechaDocumento ? new Date(fechaDocumento) : null
  const mostrarAdvertenciaFecha = fechaActual && fechaNueva && fechaNueva < fechaActual

  //  Validación en tiempo real: Fecha de vencimiento vs Fecha de documento
  const fechaDoc = fechaDocumento ? new Date(fechaDocumento) : null
  const fechaVenc = fechaVencimiento ? new Date(fechaVencimiento) : null
  const fechaVencimientoInvalida = fechaDoc && fechaVenc && fechaVenc < fechaDoc

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
        >
          {/* Header - Verde/Esmeralda (tema Proyectos) */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Subir Nueva versión
                  </h2>
                  <p className="text-sm text-white/90 mt-0.5">
                    {documento.titulo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={subiendo}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
              >
                š ï¸ {error}
              </motion.div>
            )}

            {/* Archivo */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nuevo archivo *
              </label>
              {!archivo ? (
                <label
                  htmlFor="file-upload-version"
                  className="
                    group flex cursor-pointer flex-col items-center justify-center gap-3
                    rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-6
                    transition-all hover:border-green-500 hover:bg-green-100
                    dark:border-green-700 dark:bg-green-950/30 dark:hover:border-green-600
                  "
                >
                  <div className="rounded-full bg-green-100 p-3 group-hover:bg-green-200 dark:bg-green-900/30">
                    <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Seleccionar archivo
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PDF, imágenes, Word, Excel €¢ máx. 50MB
                    </p>
                  </div>
                  <input
                    id="file-upload-version"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    disabled={subiendo}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {archivo.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(archivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setArchivo(null)
                      setTitulo(documento.titulo) // Restaurar tÃ­tulo original
                    }}
                    className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    disabled={subiendo}
                  >
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {/* TÃ­tulo del documento */}
            {archivo && (
              <>
                <div>
                  <label htmlFor="titulo" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    TÃ­tulo del documento *
                  </label>
                  <input
                    id="titulo"
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Certificado de Tradición Actualizado"
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-green-600"
                    disabled={subiendo}
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    ðŸ’¡ Puedes editar el tÃ­tulo para hacerlo más descriptivo
                  </p>
                </div>

                {/* Grid de fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha del documento */}
                  <div>
                    <label htmlFor="fecha-documento" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Calendar className="inline w-3.5 h-3.5 mr-1" />
                      Fecha del documento
                    </label>
                    <input
                      id="fecha-documento"
                      type="date"
                      value={fechaDocumento}
                      onChange={(e) => setFechaDocumento(e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-green-600"
                      disabled={subiendo}
                    />
                  </div>

                  {/* Fecha de vencimiento */}
                  <div>
                    <label htmlFor="fecha-vencimiento" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Calendar className="inline w-3.5 h-3.5 mr-1" />
                      Fecha de vencimiento (opcional)
                    </label>
                    <input
                      id="fecha-vencimiento"
                      type="date"
                      value={fechaVencimiento}
                      onChange={(e) => setFechaVencimiento(e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-green-600"
                      disabled={subiendo}
                    />
                  </div>
                </div>

                {/* Advertencia de fecha anterior */}
                {mostrarAdvertenciaFecha && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        <strong>Advertencia:</strong> La fecha del nuevo documento es anterior a la versión actual. ¿Estás seguro de continuar?
                      </p>
                    </div>
                  </motion.div>
                )}

                {/*  Advertencia de fecha de vencimiento inVálida */}
                {fechaVencimientoInvalida && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-500" />
                      <p className="text-xs text-red-700 dark:text-red-300">
                        <strong>Error:</strong> La fecha de vencimiento no puede ser anterior a la fecha del documento.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* descripción de cambios */}
                <div>
                  <label htmlFor="cambios" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    descripción de cambios (opcional)
                  </label>
                  <textarea
                    id="cambios"
                    value={cambios}
                    onChange={(e) => setCambios(e.target.value)}
                    placeholder="Ej: ActualizaciÃ³n con información más reciente del cliente"
                    rows={3}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-green-600"
                    disabled={subiendo}
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Explica brevemente qué© cambiÃ³ en esta versión
                  </p>
                </div>
              </>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={subiendo}
                className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!archivo || !titulo.trim() || subiendo || fechaVencimientoInvalida}
                className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-green-500/20"
              >
                {subiendo ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  'Subir Nueva versión'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  // Renderizar en Portal para garantizar z-index
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
