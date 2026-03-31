/**
 * Modal para Crear/Editar Notas Manuales en Historial
 * ✅ Usa React Query para carga optimizada (cache + pre-fetch)
 * Permite agregar contexto adicional no capturado por eventos automáticos
 */

'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, FileEdit, Loader2, Save, Star, X } from 'lucide-react'

import { logger } from '@/lib/utils/logger'
import { useNotaPorId } from '@/modules/clientes/hooks/useNotaPorId'
import { useNotasHistorial } from '@/modules/clientes/hooks/useNotasHistorial'

interface NotaModalProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  clienteNombre: string
  notaId?: string | null // Para modo edición
}

export function NotaModal({ isOpen, onClose, clienteId, clienteNombre, notaId }: NotaModalProps) {
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [esImportante, setEsImportante] = useState(false)

  const modoEdicion = !!notaId
  const { crearNota, actualizarNota, isCreando, isActualizando } = useNotasHistorial(clienteId)

  // ✅ REACT QUERY: Datos desde cache (pre-cargados, instantáneos)
  const { data: notaData } = useNotaPorId(notaId)

  // Sincronizar formulario cuando cambien los datos
  useEffect(() => {
    if (notaData && modoEdicion) {
      // Modo edición: datos desde cache (instantáneo)
      setTitulo(notaData.titulo)
      setContenido(notaData.contenido)
      setEsImportante(notaData.es_importante)
    } else if (!modoEdicion) {
      // Reset para nueva nota
      setTitulo('')
      setContenido('')
      setEsImportante(false)
    }
  }, [notaData, modoEdicion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (titulo.trim().length < 3) {
      return
    }

    if (contenido.trim().length < 10) {
      return
    }

    try {
      let result

      if (modoEdicion && notaId) {
        // Modo edición
        result = await actualizarNota({
          notaId,
          datos: {
            titulo: titulo.trim(),
            contenido: contenido.trim(),
            es_importante: esImportante,
          }
        })
      } else {
        // Modo creación
        result = await crearNota({
          cliente_id: clienteId,
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          es_importante: esImportante,
        })
      }

      // Si fue exitoso, resetear form y cerrar modal
      if (result.success) {
        setTitulo('')
        setContenido('')
        setEsImportante(false)
        onClose()
      }
    } catch (error) {
      // Error ya manejado por el hook (toast.error)
      logger.error('Error en handleSubmit:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FileEdit className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {modoEdicion ? 'Editar Nota' : 'Agregar Nota al Historial'}
                </h3>
                <p className="text-purple-100 text-sm">Cliente: {clienteNombre}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Título de la nota *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Llamada telefónica - Consulta sobre disponibilidad"
              maxLength={200}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {titulo.length}/200 caracteres
            </p>
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Contenido de la nota *
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describe el evento, conversación o información relevante..."
              rows={6}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm resize-none"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {contenido.length} caracteres (mínimo 10)
            </p>
          </div>

          {/* Marcar como importante */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
            <input
              type="checkbox"
              id="es-importante"
              checked={esImportante}
              onChange={(e) => setEsImportante(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <div className="flex-1">
              <label
                htmlFor="es-importante"
                className="flex items-center gap-2 text-sm font-semibold text-yellow-900 dark:text-yellow-100 cursor-pointer"
              >
                <Star className="w-4 h-4" />
                Marcar como importante
              </label>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                Las notas importantes se destacarán con una estrella en el historial
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Esta nota se agregará al historial del cliente y será visible para todos los usuarios.
              Solo tú o un administrador podrán editarla o eliminarla.
            </p>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreando || isActualizando}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <motion.button
              type="submit"
              disabled={isCreando || isActualizando || titulo.trim().length < 3 || contenido.trim().length < 10}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {(isCreando || isActualizando) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {modoEdicion ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {modoEdicion ? 'Actualizar Nota' : 'Guardar Nota'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
