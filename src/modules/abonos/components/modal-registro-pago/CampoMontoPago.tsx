'use client'

import { Lock } from 'lucide-react'

import type { ModoRegistro } from '../../types'
import { formatCurrency, type ColorScheme } from './ModalRegistroPago.styles'

interface CampoMontoPagoProps {
  modo: ModoRegistro
  monto: string
  onMontoChange: (value: string) => void
  saldoPendiente: number
  montoAprobado: number | null
  colorScheme: ColorScheme
  error?: string
}

export function CampoMontoPago({
  modo,
  monto,
  onMontoChange,
  saldoPendiente,
  montoAprobado,
  colorScheme,
  error,
}: CampoMontoPagoProps) {
  const montoNum = parseFloat(monto) || 0
  const saldoRestante = saldoPendiente - montoNum
  const excedeSaldo = montoNum > saldoPendiente && montoNum > 0

  if (modo === 'desembolso') {
    // ── Readonly card: desembolso total aprobado ────────────────────────────
    return (
      <div className={`relative rounded-xl border-2 p-4 ${colorScheme.desembolsoCard}`}>
        <Lock className="absolute top-3 right-3 w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Monto del desembolso
        </p>
        {montoAprobado != null && montoAprobado > 0 ? (
          <p className={`text-3xl font-black ${colorScheme.textAccent}`}>
            {formatCurrency(montoAprobado)}
          </p>
        ) : (
          <p className="text-lg font-semibold text-gray-400 dark:text-gray-500 italic">
            Pendiente de aprobación
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Desembolso total aprobado · No modificable
        </p>
      </div>
    )
  }

  // ── Editable: abono parcial ─────────────────────────────────────────────────
  return (
    <div>
      <label htmlFor="monto-abono" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1.5">
        Monto del abono <span className="text-red-500">*</span>
      </label>
      <div className={`relative flex items-center border-2 rounded-xl transition-all ${error ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-gray-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20'} bg-gray-50 dark:bg-gray-800/80`}>
        <span className="pl-4 text-gray-500 dark:text-gray-400 font-semibold text-base select-none">$</span>
        <input
          id="monto-abono"
          type="number"
          min={0}
          step={1000}
          value={monto}
          onChange={(e) => onMontoChange(e.target.value)}
          placeholder="0"
          className="flex-1 pl-2 pr-4 py-2.5 bg-transparent text-base font-semibold text-gray-900 dark:text-white outline-none"
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      ) : montoNum > 0 ? (
        <p className={`mt-1.5 text-xs font-medium ${excedeSaldo ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {excedeSaldo
            ? `⚠ Excede el saldo en ${formatCurrency(Math.abs(saldoRestante))}`
            : `Saldo restante: ${formatCurrency(saldoRestante)}`}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Saldo disponible: {formatCurrency(saldoPendiente)}
        </p>
      )}
    </div>
  )
}
