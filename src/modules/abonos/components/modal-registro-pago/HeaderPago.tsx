'use client'

import { Landmark, Wallet } from 'lucide-react'

import type { FuentePagoConAbonos, ModoRegistro } from '../../types'
import { formatCurrency, type ColorScheme } from './ModalRegistroPago.styles'

interface HeaderPagoProps {
  modo: ModoRegistro
  fuenteSeleccionada: FuentePagoConAbonos
  fuentesPago: FuentePagoConAbonos[]
  colorScheme: ColorScheme
  onFuenteChange: (f: FuentePagoConAbonos) => void
}

export function HeaderPago({
  modo,
  fuenteSeleccionada,
  fuentesPago,
  colorScheme,
  onFuenteChange,
}: HeaderPagoProps) {
  const esDesembolso = modo === 'desembolso'

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colorScheme.gradient} px-5 py-4`}>
      {/* Efecto de luz */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-3xl opacity-5 pointer-events-none" />

      {/* Título + badge */}
      <div className="relative z-10 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center flex-shrink-0">
          {esDesembolso
            ? <Landmark className="w-5 h-5 text-white" />
            : <Wallet className="w-5 h-5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white">
              Registrar {esDesembolso ? 'Desembolso' : 'Abono'}
            </h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${esDesembolso ? colorScheme.headerBadgeDesembolso : colorScheme.headerBadgeAbono}`}>
              {esDesembolso ? '🏦 Desembolso único · No editable' : '💰 Abono parcial'}
            </span>
          </div>
          <p className="text-white/80 text-xs mt-0.5">{fuenteSeleccionada.tipo}</p>
        </div>
      </div>

      {/* Selector de fuente (solo si hay más de una) */}
      {fuentesPago.length > 1 ? (
        <div className="relative z-10 mt-3 flex items-center gap-2 flex-wrap">
          {fuentesPago.map((fuente) => (
            <button
              key={fuente.id}
              type="button"
              onClick={() => onFuenteChange(fuente)}
              className={
                fuente.id === fuenteSeleccionada.id
                  ? 'text-xs px-2.5 py-1 rounded-lg bg-white/30 border border-white/60 text-white font-semibold'
                  : 'text-xs px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all'
              }
            >
              {fuente.tipo}
            </button>
          ))}
        </div>
      ) : null}

      {/* Info: monto aprobado + saldo */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 mt-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider mb-0.5">Monto aprobado</p>
            <p className="text-white font-bold text-base">
              {fuenteSeleccionada.monto_aprobado != null
                ? formatCurrency(fuenteSeleccionada.monto_aprobado)
                : 'Por confirmar'}
            </p>
          </div>
          <div>
            <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider mb-0.5">Saldo pendiente</p>
            <p className="text-white font-bold text-base">
              {formatCurrency(fuenteSeleccionada.saldo_pendiente ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
