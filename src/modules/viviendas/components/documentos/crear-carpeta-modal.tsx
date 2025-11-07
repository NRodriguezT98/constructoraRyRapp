'use client'

/**
 * 📁 MODAL: Crear/Editar Carpeta
 *
 * Modal para crear nueva carpeta o editar existente
 * - Selección de carpeta padre (para subcarpetas)
 * - Color personalizado con presets
 * - Validación de formulario
 */

import { AnimatePresence, motion } from 'framer-motion'
import { Folder, FolderPlus, Palette, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { type CarpetaVivienda } from '../../services/carpetas-vivienda.service'

interface CrearCarpetaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    nombre: string
    descripcion?: string
    color: string
    carpetaPadreId?: string | null
  }) => Promise<void>
  carpetaPadreId?: string | null
  carpetasDisponibles: CarpetaVivienda[]
  carpetaEditar?: CarpetaVivienda | null
}

const COLORES_PRESET = [
  { nombre: 'Rojo', valor: '#EF4444' },
  { nombre: 'Naranja', valor: '#F59E0B' },
  { nombre: 'Amarillo', valor: '#EAB308' },
  { nombre: 'Verde', valor: '#10B981' },
  { nombre: 'Azul', valor: '#3B82F6' },
  { nombre: 'Índigo', valor: '#6366F1' },
  { nombre: 'Púrpura', valor: '#A855F7' },
  { nombre: 'Rosa', valor: '#EC4899' },
  { nombre: 'Gris', valor: '#6B7280' },
]

export function CrearCarpetaModal({
  isOpen,
  onClose,
  onSubmit,
  carpetaPadreId,
  carpetasDisponibles,
  carpetaEditar
}: CrearCarpetaModalProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [padreSeleccionado, setPadreSeleccionado] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const esEdicion = !!carpetaEditar

  // Inicializar formulario
  useEffect(() => {
    if (isOpen) {
      if (carpetaEditar) {
        // Modo edición
        setNombre(carpetaEditar.nombre)
        setDescripcion(carpetaEditar.descripcion || '')
        setColor(carpetaEditar.color)
        setPadreSeleccionado(carpetaEditar.carpeta_padre_id)
      } else {
        // Modo creación
        setNombre('')
        setDescripcion('')
        setColor('#3B82F6')
        setPadreSeleccionado(carpetaPadreId || null)
      }
      setError('')
    }
  }, [isOpen, carpetaEditar, carpetaPadreId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (nombre.length > 100) {
      setError('El nombre no puede exceder 100 caracteres')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        color,
        carpetaPadreId: padreSeleccionado
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar carpeta')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtrar carpetas que pueden ser padres (excluir la carpeta actual y sus descendientes)
  const carpetasPadreDisponibles = carpetasDisponibles.filter(c => {
    // No puede ser padre de sí misma
    if (carpetaEditar && c.id === carpetaEditar.id) return false
    // TODO: Verificar que no sea descendiente (evitar ciclos)
    return true
  })

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <FolderPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {esEdicion ? 'Editar Carpeta' : 'Nueva Carpeta'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {esEdicion ? 'Modificar información de la carpeta' : 'Crear nueva carpeta para organizar documentos'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la carpeta *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Documentos Legales"
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {nombre.length}/100 caracteres
                  </p>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción breve de la carpeta..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 resize-none"
                  />
                </div>

                {/* Carpeta padre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Carpeta padre (opcional)
                  </label>
                  <select
                    value={padreSeleccionado || ''}
                    onChange={(e) => setPadreSeleccionado(e.target.value || null)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100"
                  >
                    <option value="">📁 Carpeta raíz (sin padre)</option>
                    {carpetasPadreDisponibles
                      .filter(c => !c.carpeta_padre_id) // Solo carpetas raíz
                      .map(carpeta => (
                        <option key={carpeta.id} value={carpeta.id}>
                          📂 {carpeta.nombre}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Selecciona una carpeta padre para crear una subcarpeta
                  </p>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Color de la carpeta
                  </label>
                  <div className="grid grid-cols-9 gap-2">
                    {COLORES_PRESET.map((preset) => (
                      <button
                        key={preset.valor}
                        type="button"
                        onClick={() => setColor(preset.valor)}
                        className={`
                          w-full aspect-square rounded-lg transition-all
                          ${color === preset.valor
                            ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110'
                            : 'hover:scale-105'
                          }
                        `}
                        style={{ backgroundColor: preset.valor }}
                        title={preset.nombre}
                      />
                    ))}
                  </div>

                  {/* Vista previa */}
                  <div className="mt-4 p-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${color}15`,
                          borderColor: `${color}40`,
                          borderWidth: '1px'
                        }}
                      >
                        <Folder className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {nombre || 'Nombre de carpeta'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Vista previa
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !nombre.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Carpeta'}
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
