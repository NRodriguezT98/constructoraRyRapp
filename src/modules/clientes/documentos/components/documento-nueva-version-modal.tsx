'use client'

/**
 * 📝 MODAL DE NUEVA VERSIÓN
 *
 * Permite subir una nueva versión de un documento existente
 * con descripción de cambios
 */

import { useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { FileUp, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'

import { DocumentosClienteService } from '../services/documentos-cliente.service'
import type { DocumentoCliente } from '../types'

interface DocumentoNuevaVersionModalProps {
  isOpen: boolean
  documento: DocumentoCliente | null
  onClose: () => void
  onVersionCreada?: () => void
}

export function DocumentoNuevaVersionModal({
  isOpen,
  documento,
  onClose,
  onVersionCreada
}: DocumentoNuevaVersionModalProps) {
  const { user } = useAuth()
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cambios, setCambios] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const inputFileRef = useRef<HTMLInputElement>(null)

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setArchivo(file)
    }
  }

  const handleSubir = async () => {
    if (!archivo || !documento || !user) {
      toast.error('Faltan datos requeridos')
      return
    }

    if (!cambios.trim()) {
      toast.error('Por favor describe los cambios realizados')
      return
    }

    setSubiendo(true)
    try {
      await DocumentosClienteService.crearNuevaVersion(
        documento.id,
        archivo,
        user.id,
        cambios.trim()
      )

      toast.success('Nueva versión creada correctamente')
      limpiarFormulario()
      onVersionCreada?.()
      onClose()
    } catch (error) {
      console.error('Error al crear nueva versión:', error)
      toast.error('Error al crear nueva versión')
    } finally {
      setSubiendo(false)
    }
  }

  const limpiarFormulario = () => {
    setArchivo(null)
    setCambios('')
    if (inputFileRef.current) {
      inputFileRef.current.value = ''
    }
  }

  const handleCerrar = () => {
    if (!subiendo) {
      limpiarFormulario()
      onClose()
    }
  }

  if (!isOpen || !documento) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleCerrar}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileUp className="w-5 h-5" />
                Subir Nueva Versión
              </h2>
              <button
                type="button"
                onClick={handleCerrar}
                disabled={subiendo}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/90 mt-1">
              {documento.titulo}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Info actual */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Versión actual:</strong> v{documento.version}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                <strong>Nueva versión será:</strong> v{documento.version + 1}
              </p>
            </div>

            {/* Selector de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Archivo <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => inputFileRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                  ${archivo
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }
                `}
              >
                <input
                  ref={inputFileRef}
                  type="file"
                  onChange={handleArchivoSeleccionado}
                  className="hidden"
                  disabled={subiendo}
                />
                {archivo ? (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-blue-600" />
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {archivo.name}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {(archivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setArchivo(null)
                        if (inputFileRef.current) {
                          inputFileRef.current.value = ''
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      Cambiar archivo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click para seleccionar archivo
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción de cambios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción de cambios <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cambios}
                onChange={(e) => setCambios(e.target.value)}
                placeholder="Ejemplo: Actualización de firma, corrección de fecha, documento completado..."
                rows={4}
                disabled={subiendo}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Esta descripción ayudará a identificar qué cambió en esta versión
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCerrar}
              disabled={subiendo}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubir}
              disabled={!archivo || !cambios.trim() || subiendo}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {subiendo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Subir Nueva Versión
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
