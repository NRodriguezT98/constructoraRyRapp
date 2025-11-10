'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertTriangle,
    FileText,
    Loader2,
    Lock,
    RefreshCw,
    Shield,
    Upload,
    X
} from 'lucide-react'
import { useState } from 'react'

import { useDocumentoReemplazarArchivo } from '../../hooks'
import type { DocumentoProyecto } from '../../types'

interface DocumentoReemplazarArchivoModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  onClose: () => void
  onReemplazado?: () => void | Promise<void>
}

export function DocumentoReemplazarArchivoModal({
  isOpen,
  documento,
  onClose,
  onReemplazado
}: DocumentoReemplazarArchivoModalProps) {
  const { reemplazando, progreso, reemplazarArchivo } = useDocumentoReemplazarArchivo()

  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null)
  const [justificacion, setJustificacion] = useState('')
  const [password, setPassword] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNuevoArchivo(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNuevoArchivo(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nuevoArchivo) {
      return
    }

    const success = await reemplazarArchivo(
      {
        id: documento.id,
        nombre_archivo: documento.nombre_archivo,
        ruta_storage: documento.ruta_storage,
        tamano_bytes: documento.tamano_bytes,
        version: documento.version
      },
      {
        nuevoArchivo,
        justificacion,
        password
      }
    )

    if (success) {
      await onReemplazado?.()
      handleClose()
    }
  }

  const handleClose = () => {
    if (!reemplazando) {
      setNuevoArchivo(null)
      setJustificacion('')
      setPassword('')
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
          className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className='relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-2xl'
        >
          {/* Header con advertencia */}
          <div className='sticky top-0 z-10 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4'>
            <div className='flex items-start justify-between'>
              <div className='flex items-start gap-3'>
                <div className='rounded-lg bg-white/20 p-2'>
                  <Shield size={24} className='text-white' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white flex items-center gap-2'>
                    Reemplazar Archivo
                    <span className='text-xs font-medium px-2 py-0.5 rounded-full bg-white/20'>
                      Solo Admin
                    </span>
                  </h2>
                  <p className='mt-1 text-sm text-orange-100'>
                    Acción administrativa con validación de seguridad
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={reemplazando}
                className='rounded-lg p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50'
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Advertencia */}
          <div className='mx-6 mt-6 rounded-lg border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-900/20'>
            <div className='flex gap-3'>
              <AlertTriangle size={20} className='flex-shrink-0 text-orange-600 dark:text-orange-400' />
              <div className='flex-1'>
                <h3 className='font-semibold text-orange-900 dark:text-orange-300'>
                  ⚠️ Advertencia Importante
                </h3>
                <ul className='mt-2 space-y-1 text-sm text-orange-800 dark:text-orange-400'>
                  <li>• El archivo actual será <strong>eliminado permanentemente</strong></li>
                  <li>• <strong>No se creará una nueva versión</strong> (sin versionado)</li>
                  <li>• Esta acción quedará <strong>registrada en auditoría</strong></li>
                  <li>• Solo usar para corrección inmediata de errores administrativos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className='p-6 space-y-5'>
            {/* Archivo actual */}
            <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50'>
              <div className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                <FileText size={16} />
                Archivo actual (v{documento.version}):
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400 font-mono'>
                {documento.nombre_archivo}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
                {(documento.tamano_bytes / 1024).toFixed(2)} KB
              </p>
            </div>

            {/* Subir nuevo archivo */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                <Upload size={16} />
                Nuevo archivo *
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
                } ${reemplazando ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  type='file'
                  onChange={handleFileChange}
                  disabled={reemplazando}
                  accept='.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx'
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed'
                />

                <div className='flex flex-col items-center gap-2'>
                  <div className='rounded-full bg-blue-100 p-3 dark:bg-blue-900/30'>
                    <Upload size={24} className='text-blue-600 dark:text-blue-400' />
                  </div>

                  {nuevoArchivo ? (
                    <>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {nuevoArchivo.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {(nuevoArchivo.size / 1024).toFixed(2)} KB
                      </p>
                      <button
                        type='button'
                        onClick={() => setNuevoArchivo(null)}
                        disabled={reemplazando}
                        className='text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400'
                      >
                        Cambiar archivo
                      </button>
                    </>
                  ) : (
                    <>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        Arrastra un archivo o haz clic para seleccionar
                      </p>
                      <p className='text-xs text-gray-500'>
                        PDF, JPG, PNG, DOC, XLS (máx. 50MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Justificación */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                <FileText size={16} />
                Justificación *
              </label>
              <textarea
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                required
                minLength={10}
                disabled={reemplazando}
                rows={3}
                className='w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 resize-none'
                placeholder='Explica por qué estás reemplazando este archivo (mínimo 10 caracteres)...'
              />
              <p className='mt-1 text-xs text-gray-500'>
                {justificacion.length}/10 caracteres mínimos
              </p>
            </div>

            {/* Contraseña de confirmación */}
            <div>
              <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                <Lock size={16} />
                Confirma tu contraseña *
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={reemplazando}
                className='w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900'
                placeholder='Tu contraseña de administrador'
              />
              <p className='mt-1 text-xs text-gray-500'>
                Por seguridad, debes confirmar tu identidad
              </p>
            </div>

            {/* Barra de progreso */}
            {reemplazando && progreso > 0 && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>Progreso</span>
                  <span className='font-medium text-orange-600 dark:text-orange-400'>
                    {progreso}%
                  </span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso}%` }}
                    transition={{ duration: 0.3 }}
                    className='h-full bg-gradient-to-r from-orange-500 to-red-500'
                  />
                </div>
              </div>
            )}

            {/* Botones */}
            <div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
              <button
                type='button'
                onClick={handleClose}
                disabled={reemplazando}
                className='flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={reemplazando || !nuevoArchivo || justificacion.length < 10 || !password}
                className='flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {reemplazando ? (
                  <>
                    <Loader2 size={16} className='animate-spin' />
                    Reemplazando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Confirmar Reemplazo
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
