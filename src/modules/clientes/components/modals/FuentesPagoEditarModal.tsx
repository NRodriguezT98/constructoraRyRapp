'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    DollarSign,
    FileText,
    Plus,
    Save,
    Trash2,
    X
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface FuentePago {
  id?: string
  tipo: string
  entidad?: string
  monto_aprobado: number
  monto_recibido: number
}

interface FuentesPagoEditarModalProps {
  isOpen: boolean
  onClose: () => void
  fuentesActuales: FuentePago[]
  valorFinal?: number
  onGuardar: (fuentes: Partial<FuentePago>[], motivoCambio: string) => Promise<void>
}

export function FuentesPagoEditarModal({
  isOpen,
  onClose,
  fuentesActuales,
  onGuardar,
}: FuentesPagoEditarModalProps) {
  const [fuentes, setFuentes] = useState<Partial<FuentePago>[]>(
    fuentesActuales.map((f) => ({ ...f }))
  )
  const [motivoCambio, setMotivoCambio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // âœ… Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFuentes(fuentesActuales.map((f) => ({ ...f })))
      setMotivoCambio('')
      setError(null)
    }
  }, [isOpen, fuentesActuales])

  // âœ… Calcular total de fuentes
  const totalFuentes = useMemo(() => {
    return fuentes.reduce((sum, f) => sum + (Number(f.monto_aprobado) || 0), 0)
  }, [fuentes])

  const agregarFuente = () => {
    setFuentes([
      ...fuentes,
      {
        tipo: '',
        entidad: '',
        monto_aprobado: 0,
        monto_recibido: 0,
      },
    ])
  }

  const eliminarFuente = (index: number) => {
    setFuentes(fuentes.filter((_, i) => i !== index))
  }

  const actualizarFuente = (index: number, campo: string, valor: any) => {
    const nuevasFuentes = [...fuentes]

    // âœ… Convertir a número si es campo de monto
    const valorFinal = (campo === 'monto_aprobado' || campo === 'monto_recibido')
      ? Number(valor) || 0
      : valor

    nuevasFuentes[index] = {
      ...nuevasFuentes[index],
      [campo]: valorFinal,
    }

    setFuentes(nuevasFuentes)
  }

  const handleGuardar = async () => {
    // Validar motivo obligatorio
    if (!motivoCambio.trim()) {
      setError('Debes proporcionar un motivo para este cambio')
      return
    }

    // Validar fuentes
    const fuentesValidas = fuentes.filter(
      (f) => f.tipo && f.monto_aprobado && f.monto_aprobado > 0
    )

    if (fuentesValidas.length === 0) {
      setError('Debe haber al menos una fuente de pago válida')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onGuardar(fuentesValidas, motivoCambio)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Editar Fuentes de Pago
                      </h2>
                      <p className="text-blue-100 text-sm">
                        {fuentes.length} fuente(s) configurada(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Motivo del Cambio (OBLIGATORIO) */}
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
                  <label className="flex items-center gap-2 text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    <FileText className="w-4 h-4" />
                    ¿Por qué estás realizando este cambio? *
                  </label>
                  <textarea
                    value={motivoCambio}
                    onChange={(e) => setMotivoCambio(e.target.value)}
                    placeholder="Ejemplo: Cliente no fue aprobado para subsidio, se cambia por crédito hipotecario..."
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all text-sm resize-none"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Este motivo quedará registrado en el historial de versiones
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {/* Fuentes de Pago */}
                <div className="space-y-3">
                  {fuentes.map((fuente, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Fuente {index + 1}
                        </p>
                        {fuentes.length > 1 && (
                          <button
                            onClick={() => eliminarFuente(index)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Tipo */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Tipo de Fuente *
                          </label>
                          <select
                            value={fuente.tipo || ''}
                            onChange={(e) => actualizarFuente(index, 'tipo', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                            required
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Crédito Hipotecario">Crédito Hipotecario</option>
                            <option value="Subsidio Caja Compensación">Subsidio Caja</option>
                            <option value="Subsidio Nacional">Subsidio Nacional</option>
                            <option value="Cuota Inicial">Cuota Inicial</option>
                            <option value="Recursos Propios">Recursos Propios</option>
                          </select>
                        </div>

                        {/* Entidad */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Entidad
                          </label>
                          <input
                            type="text"
                            value={fuente.entidad || ''}
                            onChange={(e) => actualizarFuente(index, 'entidad', e.target.value)}
                            placeholder="Banco, Caja..."
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                          />
                        </div>

                        {/* Monto Aprobado */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Monto Aprobado *
                          </label>
                          <input
                            type="number"
                            value={fuente.monto_aprobado || 0}
                            onChange={(e) =>
                              actualizarFuente(index, 'monto_aprobado', parseFloat(e.target.value))
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                            required
                          />
                        </div>

                        {/* Monto Recibido */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Monto Recibido
                          </label>
                          <input
                            type="number"
                            value={fuente.monto_recibido || 0}
                            onChange={(e) =>
                              actualizarFuente(index, 'monto_recibido', parseFloat(e.target.value))
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Botón Agregar */}
                  <button
                    onClick={agregarFuente}
                    className="w-full p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-medium">Agregar otra fuente</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
