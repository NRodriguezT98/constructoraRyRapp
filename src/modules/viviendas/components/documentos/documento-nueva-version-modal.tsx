'use client'

/**
 * 📤 MODAL PARA SUBIR NUEVA VERSIÓN
 *
 * Modal simple para subir una nueva versión de un documento existente
 * ✅ Usa Portal para renderizar en document.body (z-index garantizado)
 */

import { useAuth } from '@/contexts/auth-context'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Upload, X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { DocumentosViviendaService } from '../../services/documentos-vivienda.service'

interface DocumentoNuevaVersionModalProps {
  isOpen: boolean
  documentoId: string
  documentoTitulo: string
  onClose: () => void
  onSuccess?: () => void
}

export function DocumentoNuevaVersionModal({
  isOpen,
  documentoId,
  documentoTitulo,
  onClose,
  onSuccess
}: DocumentoNuevaVersionModalProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient() // ✅ NUEVO: Para invalidar caché
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cambios, setCambios] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const service = new DocumentosViviendaService()

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos PDF, JPG o PNG')
      return
    }

    // Validar tamaño (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('El archivo no puede superar los 10MB')
      return
    }

    setError(null)
    setArchivo(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!archivo) {
      setError('Debes seleccionar un archivo')
      return
    }

    if (!user) {
      setError('Debes iniciar sesión')
      return
    }

    setSubiendo(true)
    setError(null)

    try {
      const nuevaVersion = await service.crearNuevaVersion(
        documentoId,
        archivo,
        user.id,
        cambios || undefined
      )

      // ✅ NUEVO: Invalidar caché de React Query para actualizar la lista
      if (nuevaVersion?.vivienda_id) {
        queryClient.invalidateQueries({
          queryKey: ['documentos-vivienda', nuevaVersion.vivienda_id],
        })
      }

      toast.success('Nueva versión creada exitosamente')
      onSuccess?.()
      onClose()
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
    setCambios('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Nueva Versión
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={subiendo}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/90 mt-1">
              {documentoTitulo}
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
              >
                ⚠️ {error}
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
                    rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-6
                    transition-all hover:border-orange-500 hover:bg-orange-100
                    dark:border-orange-700 dark:bg-orange-950/30 dark:hover:border-orange-600
                  "
                >
                  <div className="rounded-full bg-orange-100 p-3 group-hover:bg-orange-200 dark:bg-orange-900/30">
                    <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Seleccionar archivo
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PDF, JPG o PNG • Máx. 10MB
                    </p>
                  </div>
                  <input
                    id="file-upload-version"
                    type="file"
                    onChange={handleFileSelect}
                    accept="application/pdf,image/jpeg,image/jpg,image/png"
                    className="hidden"
                    disabled={subiendo}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border-2 border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white">
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
                    onClick={() => setArchivo(null)}
                    className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    disabled={subiendo}
                  >
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Descripción de cambios */}
            <div>
              <label htmlFor="cambios" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Descripción de cambios (opcional)
              </label>
              <textarea
                id="cambios"
                value={cambios}
                onChange={(e) => setCambios(e.target.value)}
                placeholder="Ej: Actualización con información más reciente"
                rows={3}
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-orange-600"
                disabled={subiendo}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
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
                disabled={!archivo || subiendo}
                className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-orange-700 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {subiendo ? (
                  <>
                    <div className="mx-auto h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </>
                ) : (
                  'Subir Nueva Versión'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  // ✅ Renderizar en Portal para garantizar z-index sobre todo (incluyendo sidebar)
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
