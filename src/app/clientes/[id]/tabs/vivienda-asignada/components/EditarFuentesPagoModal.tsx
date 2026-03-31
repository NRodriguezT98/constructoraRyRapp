/**
 * ============================================
 * COMPONENTE: EditarFuentesPagoModal
 * ============================================
 *
 * Modal para editar fuentes de pago de una vivienda asignada.
 * Permite agregar, editar y eliminar fuentes.
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { DollarSign, Plus, Trash2, X } from 'lucide-react'

import { logger } from '@/lib/utils/logger'

export interface FuentePagoEditable {
  id?: string
  tipo: string
  monto: number
  entidad?: string
  numero_referencia?: string
}

interface EditarFuentesPagoModalProps {
  isOpen: boolean
  onClose: () => void
  fuentesActuales: FuentePagoEditable[]
  valorFinal: number
  onGuardar: (fuentes: FuentePagoEditable[]) => Promise<void>
  viviendaNumero?: string
  clienteNombre?: string
}

export function EditarFuentesPagoModal({
  isOpen,
  onClose,
  fuentesActuales,
  valorFinal,
  onGuardar,
  viviendaNumero,
  clienteNombre,
}: EditarFuentesPagoModalProps) {
  const [fuentes, setFuentes] = useState<FuentePagoEditable[]>(fuentesActuales)
  const [guardando, setGuardando] = useState(false)

  const totalFuentes = fuentes.reduce((acc, f) => acc + (f.monto || 0), 0)
  const diferencia = valorFinal - totalFuentes

  const agregarFuente = () => {
    setFuentes([
      ...fuentes,
      {
        tipo: 'Recursos Propios',
        monto: 0,
        entidad: '',
        numero_referencia: '',
      },
    ])
  }

  const actualizarFuente = (index: number, campo: keyof FuentePagoEditable, valor: any) => {
    const nuevasFuentes = [...fuentes]
    nuevasFuentes[index] = { ...nuevasFuentes[index], [campo]: valor }
    setFuentes(nuevasFuentes)
  }

  const eliminarFuente = (index: number) => {
    setFuentes(fuentes.filter((_, i) => i !== index))
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      await onGuardar(fuentes)
      onClose()
    } catch (error) {
      logger.error('Error al guardar fuentes:', error)
    } finally {
      setGuardando(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Editar Fuentes de Pago
                </h2>
                {viviendaNumero && (
                  <p className="text-sm text-cyan-100 mt-1">
                    {viviendaNumero} • {clienteNombre}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Resumen */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Valor Final</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${valorFinal.toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Fuentes</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${totalFuentes.toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Diferencia</p>
                  <p
                    className={`text-lg font-bold ${
                      diferencia === 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    ${Math.abs(diferencia).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Fuentes */}
            <div className="space-y-3">
              {fuentes.map((fuente, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo
                      </label>
                      <select
                        value={fuente.tipo}
                        onChange={(e) => actualizarFuente(index, 'tipo', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                      >
                        <option>Recursos Propios</option>
                        <option>Crédito Hipotecario</option>
                        <option>Subsidio</option>
                        <option>Cesantías</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Monto
                      </label>
                      <input
                        type="number"
                        value={fuente.monto}
                        onChange={(e) =>
                          actualizarFuente(index, 'monto', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Entidad
                      </label>
                      <input
                        type="text"
                        value={fuente.entidad || ''}
                        onChange={(e) => actualizarFuente(index, 'entidad', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Referencia
                        </label>
                        <input
                          type="text"
                          value={fuente.numero_referencia || ''}
                          onChange={(e) =>
                            actualizarFuente(index, 'numero_referencia', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                        />
                      </div>
                      <button
                        onClick={() => eliminarFuente(index)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={agregarFuente}
                className="w-full py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Fuente
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando || diferencia !== 0}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
