'use client'

/**
 * ✏️ MODAL PARA RENOMBRAR DOCUMENTO
 *
 * Modal simple para cambiar el título de un documento
 * ✅ Usa Portal para renderizar en document.body (z-index garantizado)
 * ✅ Usa mutation de React Query para invalidar cache automáticamente
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit3, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { type ActualizarDocumentoParams, documentosViviendaService } from '../../services/documentos-vivienda.service'

interface DocumentoRenombrarModalProps {
  isOpen: boolean
  documentoId: string
  tituloActual: string
  onClose: () => void
  onSuccess?: () => void
}

export function DocumentoRenombrarModal({
  isOpen,
  documentoId,
  tituloActual,
  onClose,
  onSuccess
}: DocumentoRenombrarModalProps) {
  const [nuevoTitulo, setNuevoTitulo] = useState(tituloActual)
  const [error, setError] = useState<string | null>(null)

  const queryClient = useQueryClient()

  // ✅ Mutation para actualizar documento con invalidación de cache
  const actualizarMutation = useMutation({
    mutationFn: (params: ActualizarDocumentoParams) =>
      documentosViviendaService.actualizarDocumento(params),
    onSuccess: () => {
      // Invalidar todas las queries de documentos para refrescar
      queryClient.invalidateQueries({ queryKey: ['documentos-vivienda'] })
      queryClient.invalidateQueries({ queryKey: ['documento-versiones'] })
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!nuevoTitulo.trim()) {
      setError('El título no puede estar vacío')
      return
    }

    if (nuevoTitulo.trim() === tituloActual.trim()) {
      setError('El nuevo título es igual al actual')
      return
    }

    setError(null)

    try {
      await actualizarMutation.mutateAsync({
        id: documentoId,
        titulo: nuevoTitulo.trim()
      })

      toast.success('Documento renombrado exitosamente')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Error al renombrar documento:', error)
      setError(error?.message || 'Error al renombrar el documento')
      toast.error('Error al renombrar documento')
    }
  }

  const handleClose = () => {
    if (actualizarMutation.isPending) return
    setNuevoTitulo(tituloActual)
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
                <Edit3 className="w-5 h-5" />
                Renombrar Documento
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={actualizarMutation.isPending}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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

            {/* Título actual */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Título actual
              </label>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {tituloActual}
              </p>
            </div>

            {/* Nuevo título */}
            <div>
              <label htmlFor="nuevo-titulo" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nuevo título *
              </label>
              <input
                id="nuevo-titulo"
                type="text"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                placeholder="Ingresa el nuevo título"
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-orange-600"
                disabled={actualizarMutation.isPending}
                autoFocus
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                💡 Elige un nombre descriptivo y fácil de identificar
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={actualizarMutation.isPending}
                className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!nuevoTitulo.trim() || nuevoTitulo.trim() === tituloActual.trim() || actualizarMutation.isPending}
                className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-orange-700 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actualizarMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </div>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  // ✅ Renderizar en Portal para garantizar z-index sobre todo
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
