/**
 * 🎨 COMPONENTE REUTILIZABLE: PromptModal
 *
 * Modal con campo de input para capturar texto del usuario
 * - Validación personalizable
 * - Placeholder dinámico
 * - Glassmorphism + animaciones
 * - Type-safe
 *
 * @example
 * ```tsx
 * <PromptModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={(value) => console.log(value)}
 *   title="Nombre de categoría"
 *   message="Ingresa el nombre de la nueva categoría"
 *   placeholder="Ej: Contratos"
 *   defaultValue=""
 *   validate={(val) => val.length >= 3}
 *   errorMessage="Mínimo 3 caracteres"
 * />
 * ```
 */

'use client'

import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MessageSquare, X } from 'lucide-react'
import { useState } from 'react'

interface PromptModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (value: string) => void
  title: string
  message?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  loadingText?: string
  validate?: (value: string) => boolean
  errorMessage?: string
  inputType?: 'text' | 'number' | 'email'
  maxLength?: number
}

export function PromptModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = 'Ingresa un valor...',
  defaultValue = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  loadingText = 'Procesando...',
  validate,
  errorMessage = 'Valor inválido',
  inputType = 'text',
  maxLength,
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState('')

  const handleConfirm = () => {
    // Validación
    if (validate && !validate(value)) {
      setError(errorMessage)
      return
    }

    // Si no hay validación, verificar que no esté vacío
    if (!validate && !value.trim()) {
      setError('Este campo es requerido')
      return
    }

    onConfirm(value.trim())
  }

  const handleClose = () => {
    setValue(defaultValue)
    setError('')
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    setError('') // Limpiar error al escribir
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="
                relative w-full max-w-md
                bg-white dark:bg-gray-800
                rounded-2xl shadow-2xl
                border-2 border-blue-200 dark:border-blue-800
                overflow-hidden
              "
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                {/* Botón cerrar */}
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Icono */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                    <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Título */}
                <h2 className="text-xl font-bold text-center text-blue-900 dark:text-blue-100">
                  {title}
                </h2>
              </div>

              {/* Contenido */}
              <div className="px-6 pb-6">
                {/* Mensaje opcional */}
                {message && (
                  <p className="text-center text-gray-700 dark:text-gray-300 mb-4 text-sm">
                    {message}
                  </p>
                )}

                {/* Input */}
                <div className="mb-4">
                  <label htmlFor="prompt-input" className="sr-only">
                    {title}
                  </label>
                  <input
                    id="prompt-input"
                    type={inputType}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={isLoading}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        handleConfirm()
                      }
                      if (e.key === 'Escape') {
                        handleClose()
                      }
                    }}
                    className={`
                      w-full px-4 py-3 rounded-lg
                      bg-gray-50 dark:bg-gray-900/50
                      border-2 transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        error
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                      }
                    `}
                  />

                  {/* Contador de caracteres */}
                  {maxLength && (
                    <div className="flex items-center justify-between mt-1 px-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {error || '\u00A0'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {value.length}/{maxLength}
                      </span>
                    </div>
                  )}

                  {/* Mensaje de error */}
                  {error && !maxLength && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 px-1">
                      {error}
                    </p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 border-2"
                  >
                    {cancelText}
                  </Button>

                  <Button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {loadingText}
                      </>
                    ) : (
                      confirmText
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
