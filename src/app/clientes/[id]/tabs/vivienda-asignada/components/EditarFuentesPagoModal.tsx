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
  detalles?: string
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

  const actualizarFuente = (
    index: number,
    campo: keyof FuentePagoEditable,
    valor: string | number
  ) => {
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
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className='relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800'
        >
          {/* Header */}
          <div className='bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='flex items-center gap-2 text-xl font-bold text-white'>
                  <DollarSign className='h-6 w-6' />
                  Editar Fuentes de Pago
                </h2>
                {viviendaNumero && (
                  <p className='mt-1 text-sm text-cyan-100'>
                    {viviendaNumero} • {clienteNombre}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className='rounded-lg p-2 transition-colors hover:bg-white/20'
              >
                <X className='h-5 w-5 text-white' />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className='max-h-[60vh] overflow-y-auto p-6'>
            {/* Resumen */}
            <div className='mb-6 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50'>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <p className='mb-1 text-xs text-gray-600 dark:text-gray-400'>
                    Valor Final
                  </p>
                  <p className='text-lg font-bold text-gray-900 dark:text-white'>
                    ${valorFinal.toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className='mb-1 text-xs text-gray-600 dark:text-gray-400'>
                    Total Fuentes
                  </p>
                  <p className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                    ${totalFuentes.toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className='mb-1 text-xs text-gray-600 dark:text-gray-400'>
                    Diferencia
                  </p>
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
            <div className='space-y-3'>
              {fuentes.map((fuente, index) => (
                <div
                  key={index}
                  className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50'
                >
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    <div>
                      <label className='mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300'>
                        Tipo
                      </label>
                      <select
                        value={fuente.tipo}
                        onChange={e =>
                          actualizarFuente(index, 'tipo', e.target.value)
                        }
                        className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900'
                      >
                        <option>Recursos Propios</option>
                        <option>Crédito Hipotecario</option>
                        <option>Subsidio</option>
                        <option>Cesantías</option>
                      </select>
                    </div>

                    <div>
                      <label className='mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300'>
                        Monto
                      </label>
                      <input
                        type='number'
                        value={fuente.monto}
                        onChange={e =>
                          actualizarFuente(
                            index,
                            'monto',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900'
                      />
                    </div>

                    <div>
                      <label className='mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300'>
                        Entidad
                      </label>
                      <input
                        type='text'
                        value={fuente.entidad || ''}
                        onChange={e =>
                          actualizarFuente(index, 'entidad', e.target.value)
                        }
                        className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900'
                      />
                    </div>

                    <div className='flex items-end gap-2'>
                      <div className='flex-1'>
                        <label className='mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300'>
                          Referencia
                        </label>
                        <input
                          type='text'
                          value={fuente.numero_referencia || ''}
                          onChange={e =>
                            actualizarFuente(
                              index,
                              'numero_referencia',
                              e.target.value
                            )
                          }
                          className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900'
                        />
                      </div>
                      <button
                        onClick={() => eliminarFuente(index)}
                        className='rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={agregarFuente}
                className='flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-gray-600 transition-colors hover:border-cyan-500 hover:text-cyan-600 dark:border-gray-600 dark:text-gray-400 dark:hover:text-cyan-400'
              >
                <Plus className='h-4 w-4' />
                Agregar Fuente
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className='border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50'>
            <div className='flex items-center justify-end gap-3'>
              <button
                onClick={onClose}
                className='rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando || diferencia !== 0}
                className='rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
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
