/**
 * Modal de Edición de Documentos
 *
 * Permite editar:
 * - Título del documento
 * - Metadata personalizado (número de resolución, fecha, etc.)
 */

'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, DollarSign, Edit3, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import type { DocumentoProyecto } from '@/types/documento.types'

interface DocumentoEditModalProps {
  isOpen: boolean
  documento: DocumentoProyecto | null
  onClose: () => void
  onSave: (documentoId: string, cambios: DocumentoEditData) => Promise<void>
}

export interface DocumentoEditData {
  titulo: string
  metadata?: Record<string, any>
}

export function DocumentoEditModal({
  isOpen,
  documento,
  onClose,
  onSave,
}: DocumentoEditModalProps) {
  const [titulo, setTitulo] = useState('')
  const [numeroResolucion, setNumeroResolucion] = useState('')
  const [fechaResolucion, setFechaResolucion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // Resetear al abrir
  useEffect(() => {
    if (isOpen && documento) {
      setTitulo(documento.titulo || '')
      setNumeroResolucion(documento.metadata?.numero_resolucion || '')
      setFechaResolucion(documento.metadata?.fecha_resolucion || '')
      setError('')
    }
  }, [isOpen, documento])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!documento) return

    if (!titulo || titulo.trim().length === 0) {
      setError('El título no puede estar vacío')
      return
    }

    if (titulo.length > 200) {
      setError('El título no puede exceder 200 caracteres')
      return
    }

    setGuardando(true)
    setError('')

    try {
      // Construir metadata actualizado
      const metadataActualizado = {
        ...documento.metadata,
        numero_resolucion: numeroResolucion || undefined,
        fecha_resolucion: fechaResolucion || undefined,
      }

      await onSave(documento.id, {
        titulo: titulo.trim(),
        metadata: metadataActualizado,
      })

      toast.success('Documento actualizado exitosamente')
      onClose()
    } catch (err: any) {
      console.error('Error al actualizar documento:', err)
      const mensaje = err.message || 'Error al actualizar el documento'
      toast.error(mensaje)
      setError(mensaje)
    } finally {
      setGuardando(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !guardando) {
      onClose()
    }
  }

  if (!isOpen || !documento) return null

  // Determinar si el documento es de tipo subsidio (tiene metadata de resolución)
  const esSubsidio = documento.metadata?.tipo_fuente?.includes('Subsidio') || false

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={guardando ? undefined : onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/30">
                  <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Editar Documento
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={guardando}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Título del Documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={guardando}
                  className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-400 dark:focus:bg-gray-900"
                  placeholder="Ingrese el título del documento"
                  maxLength={200}
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {titulo.length}/200 caracteres
                </p>
              </div>

              {/* Campos de Subsidio - Solo si aplica */}
              {esSubsidio && (
                <>
                  {/* Número de Resolución */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <DollarSign className="h-4 w-4" />
                      Número de Resolución
                      <span className="text-xs font-normal text-gray-500">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={numeroResolucion}
                      onChange={(e) => setNumeroResolucion(e.target.value)}
                      disabled={guardando}
                      className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-400 dark:focus:bg-gray-900"
                      placeholder="Ej: 12345678"
                    />
                  </div>

                  {/* Fecha de Resolución - Solo si hay número */}
                  {numeroResolucion && (
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Calendar className="h-4 w-4" />
                        Fecha de Resolución
                        <span className="text-xs font-normal text-gray-500">(Opcional)</span>
                      </label>
                      <input
                        type="date"
                        value={fechaResolucion}
                        onChange={(e) => setFechaResolucion(e.target.value)}
                        disabled={guardando}
                        className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-400 dark:focus:bg-gray-900"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={guardando}
                  className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:opacity-50 dark:from-blue-500 dark:to-indigo-500"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
