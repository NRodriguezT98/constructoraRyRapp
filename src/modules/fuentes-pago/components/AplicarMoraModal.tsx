/**
 * AplicarMoraModal
 *
 * Modal para registrar mora en una cuota vencida.
 * Pre-rellena con la mora sugerida según la tasa de la BD (no hardcodeada).
 * El admin puede ajustar el monto antes de confirmar.
 */

'use client'

import { AlertTriangle, DollarSign, X } from 'lucide-react'
import { useState } from 'react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { CuotaVigente } from '@/modules/fuentes-pago/types'

interface AplicarMoraModalProps {
  cuota: CuotaVigente
  moraSugerida: number
  procesando: boolean
  onConfirmar: (mora: number, notas?: string) => Promise<void>
  onCerrar: () => void
}

export function AplicarMoraModal({ cuota, moraSugerida, procesando, onConfirmar, onCerrar }: AplicarMoraModalProps) {
  const [moraStr, setMoraStr] = useState<string>(moraSugerida > 0 ? moraSugerida.toLocaleString('es-CO') : '')
  const [notas, setNotas] = useState('')

  const mora = Number(moraStr.replace(/\./g, '').replace(/,/g, ''))
  const totalConMora = cuota.valor_cuota + mora

  const handleConfirmar = async () => {
    if (!mora || mora < 0) return
    await onConfirmar(mora, notas || undefined)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-mora-title"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md sm:inset-0 sm:flex sm:items-center sm:justify-center"
      >
        <div className="w-full rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-red-600 to-orange-600 px-5 py-4">
            <div className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5" />
              <h2 id="modal-mora-title" className="text-base font-bold">
                Aplicar Mora — Cuota #{cuota.numero_cuota}
              </h2>
            </div>
            <button
              onClick={onCerrar}
              disabled={procesando}
              aria-label="Cerrar"
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            {/* Info cuota */}
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vencimiento</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDateCompact(cuota.fecha_vencimiento)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Días vencida</p>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    {cuota.dias_mora} días
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor cuota</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${cuota.valor_cuota.toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mora sugerida</p>
                  <p className="font-medium text-orange-600 dark:text-orange-400">
                    {moraSugerida > 0 ? `$${moraSugerida.toLocaleString('es-CO')}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Input mora */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <DollarSign className="h-4 w-4 text-red-500" />
                Valor de la mora <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={moraStr}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '')
                    const num = Number(clean)
                    setMoraStr(num > 0 ? num.toLocaleString('es-CO') : '')
                  }}
                  placeholder="0"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white py-2 pl-7 pr-4 text-gray-900 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Puedes ajustar el monto. El sugerido se calcula con la tasa de mora configurada en el crédito.
              </p>
            </div>

            {/* Notas */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notas (opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                placeholder="Ej: Mora aplicada el 15-ene-2026 por atraso"
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Resumen total */}
            {mora > 0 ? (
              <div className="rounded-lg bg-red-50 px-4 py-3 dark:bg-red-900/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Cuota original:</span>
                  <span className="text-gray-900 dark:text-white">${cuota.valor_cuota.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600 dark:text-red-400">+ Mora:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">+${mora.toLocaleString('es-CO')}</span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-red-200 pt-1 text-sm dark:border-red-800/50">
                  <span className="font-semibold text-gray-900 dark:text-white">Total a cobrar:</span>
                  <span className="text-base font-bold text-red-700 dark:text-red-300">
                    ${totalConMora.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onCerrar}
                disabled={procesando}
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={procesando || !mora || mora <= 0}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-red-700 hover:to-orange-700 disabled:opacity-50"
              >
                {procesando ? 'Aplicando...' : 'Aplicar Mora'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
