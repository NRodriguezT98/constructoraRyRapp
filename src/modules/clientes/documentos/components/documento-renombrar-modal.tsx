'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Edit3, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface DocumentoRenombrarModalProps {
  isOpen: boolean
  tituloActual: string
  esCedula?: boolean
  onClose: () => void
  onRenombrar: (nuevoTitulo: string) => Promise<void>
}

export function DocumentoRenombrarModal({
  isOpen,
  tituloActual,
  esCedula = false,
  onClose,
  onRenombrar,
}: DocumentoRenombrarModalProps) {
  const [nuevoTitulo, setNuevoTitulo] = useState(tituloActual)
  const [renombrando, setRenombrando] = useState(false)
  const [error, setError] = useState('')

  // Resetear al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setNuevoTitulo(tituloActual)
      setError('')
    }
  }, [isOpen, tituloActual])

  const validarTitulo = (titulo: string): boolean => {
    if (!titulo || titulo.trim().length === 0) {
      setError('El título no puede estar vacío')
      return false
    }

    if (titulo.length > 200) {
      setError('El título no puede exceder 200 caracteres')
      return false
    }

    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarTitulo(nuevoTitulo)) return

    if (nuevoTitulo.trim() === tituloActual) {
      toast.info('El título no ha cambiado')
      onClose()
      return
    }

    setRenombrando(true)
    try {
      await onRenombrar(nuevoTitulo.trim())
      toast.success(
        esCedula ? 'Cédula renombrada exitosamente' : 'Documento renombrado exitosamente'
      )
      onClose()
    } catch (err: any) {
      console.error('Error al renombrar:', err)
      toast.error(err.message || 'Error al renombrar el documento')
      setError(err.message || 'Error al renombrar')
    } finally {
      setRenombrando(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !renombrando) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-md rounded-2xl border border-purple-200 bg-white p-6 shadow-2xl dark:border-purple-800 dark:bg-gray-800"
              onKeyDown={handleKeyDown}
            >
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl ${esCedula ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'} p-2.5`}>
                    <Edit3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {esCedula ? 'Renombrar Cédula' : 'Renombrar Documento'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cambia el nombre que se muestra
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  disabled={renombrando}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Nuevo título
                  </label>
                  <input
                    type="text"
                    value={nuevoTitulo}
                    onChange={(e) => {
                      setNuevoTitulo(e.target.value)
                      if (error) validarTitulo(e.target.value)
                    }}
                    disabled={renombrando}
                    autoFocus
                    maxLength={200}
                    className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white ${
                      error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600'
                    }`}
                    placeholder="Ej: Cédula de Ciudadanía (Actualizada)"
                  />

                  {/* Contador de caracteres */}
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    {error ? (
                      <span className="text-red-600">{error}</span>
                    ) : (
                      <span className="text-gray-400">
                        Máximo 200 caracteres
                      </span>
                    )}
                    <span className={`${nuevoTitulo.length > 180 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {nuevoTitulo.length}/200
                    </span>
                  </div>
                </div>

                {/* Info adicional para cédula */}
                {esCedula && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      💡 <strong>Nota:</strong> Solo se cambia el nombre que se muestra.
                      El archivo físico en el servidor mantiene su nombre original.
                    </p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={renombrando}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={renombrando || !!error || nuevoTitulo.trim() === tituloActual}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      esCedula
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    }`}
                  >
                    {renombrando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Renombrando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Renombrar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
