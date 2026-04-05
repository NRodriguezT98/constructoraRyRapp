/**
 * ArchivarProyectoModal - Modal de confirmación para archivar proyecto
 * ✅ Confirmación obligatoria
 * ✅ Motivo opcional
 * ✅ Información sobre archivado (soft delete)
 */

'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Archive, Loader2, X } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

interface ArchivarProyectoModalProps {
  isOpen: boolean
  nombreProyecto: string
  onConfirm: (motivo?: string) => Promise<void>
  onCancel: () => void
  archivando?: boolean
}

export function ArchivarProyectoModal({
  isOpen,
  nombreProyecto,
  onConfirm,
  onCancel,
  archivando = false,
}: ArchivarProyectoModalProps) {
  const [motivo, setMotivo] = useState('')

  const handleConfirmar = async () => {
    await onConfirm(motivo.trim() || undefined)
    setMotivo('') // Reset
  }

  const handleCancelar = () => {
    setMotivo('') // Reset
    onCancel()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelar}
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className='relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30'>
                  <Archive className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                </div>
                <div>
                  <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
                    Archivar Proyecto
                  </h2>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    El proyecto se ocultará de la lista principal
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelar}
                disabled={archivando}
                className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Content */}
            <div className='space-y-4 p-6'>
              {/* Advertencia informativa */}
              <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20'>
                <div className='flex gap-3'>
                  <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
                  <div className='flex-1 text-sm'>
                    <p className='mb-2 font-medium text-amber-900 dark:text-amber-200'>
                      ¿Estás seguro de archivar este proyecto?
                    </p>
                    <p className='mb-1 text-amber-800 dark:text-amber-300'>
                      <strong className='font-semibold'>Proyecto:</strong>{' '}
                      {nombreProyecto}
                    </p>
                    <ul className='mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-400'>
                      <li>✓ El proyecto se ocultará de la lista principal</li>
                      <li>✓ Los datos NO se eliminarán (soft delete)</li>
                      <li>✓ Podrás restaurarlo cuando quieras</li>
                      <li>✓ Las viviendas y documentos se mantienen</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Motivo (opcional) */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Motivo del archivado (opcional)
                </label>
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  disabled={archivando}
                  rows={3}
                  maxLength={500}
                  className={cn(
                    'w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm transition-all dark:bg-gray-900/50',
                    'focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400',
                    'disabled:bg-gray-50 disabled:opacity-50 dark:disabled:bg-gray-800',
                    'border-gray-200 dark:border-gray-700'
                  )}
                  placeholder='Ej: Proyecto finalizado en 2024, cliente canceló contrato, etc.'
                />
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  {motivo.length}/500 caracteres
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className='flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700'>
              <button
                onClick={handleCancelar}
                disabled={archivando}
                className='rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={archivando}
                className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {archivando ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Archivando...
                  </>
                ) : (
                  <>
                    <Archive className='h-4 w-4' />
                    Archivar Proyecto
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
