'use client'

import type { CuotaVigente } from '@/modules/fuentes-pago/types'

interface ConfirmacionPagoCuotaProps {
  cuota: CuotaVigente
  procesando: boolean
  error: string | null
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmacionPagoCuota({
  cuota,
  procesando,
  error,
  onConfirmar,
  onCancelar,
}: ConfirmacionPagoCuotaProps) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800/50 dark:bg-green-900/10">
      <p className="mb-3 text-sm font-semibold text-green-900 dark:text-green-100">
        Confirmar pago — Cuota N°{cuota.numero_cuota}
      </p>

      <div className="mb-4 space-y-1 text-xs text-gray-700 dark:text-gray-300">
        <div className="flex justify-between">
          <span>Valor cuota:</span>
          <span className="font-medium">${cuota.valor_cuota.toLocaleString('es-CO')}</span>
        </div>
        {cuota.mora_aplicada > 0 ? (
          <div className="flex justify-between">
            <span>Mora aplicada:</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              +${cuota.mora_aplicada.toLocaleString('es-CO')}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-green-200 pt-1 dark:border-green-700">
          <span className="font-semibold">Total a pagar:</span>
          <span className="font-bold text-green-700 dark:text-green-300">
            ${cuota.total_a_cobrar.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {error ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          onClick={onCancelar}
          disabled={procesando}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          disabled={procesando}
          className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {procesando ? 'Registrando...' : 'Confirmar Pago'}
        </button>
      </div>
    </div>
  )
}
