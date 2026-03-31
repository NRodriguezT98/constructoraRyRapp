'use client'

import { AlertCircle, Building2, CheckCircle2, ChevronDown, DollarSign } from 'lucide-react'

import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import { formatCurrency } from '@/shared/utils/format'

import { getFuenteColor } from '../hooks'

interface DocPendienteInfo {
  nombre: string
  obligatorio: boolean
}

interface DocsPendientesInfo {
  total: number
  obligatorios: number
  docs: DocPendienteInfo[]
}

interface FuenteMiniCardProps {
  fuente: FuentePago
  valorVivienda: number
  docsPendientes?: DocsPendientesInfo
  colorToken?: string
  cuotasExpandidas?: boolean
  onToggleCuotas?: () => void
}

export function FuenteMiniCard({
  fuente,
  valorVivienda,
  docsPendientes,
  colorToken,
  cuotasExpandidas,
  onToggleCuotas,
}: FuenteMiniCardProps) {
  const color = getFuenteColor(colorToken)
  const esCredito = esCreditoConstructora(fuente.tipo)
  const montoRef = fuente.capital_para_cierre ?? fuente.monto_aprobado
  const pct = valorVivienda > 0 ? ((montoRef / valorVivienda) * 100).toFixed(1) : '0'
  const recibido = fuente.monto_recibido ?? 0
  const pctRecibido = montoRef > 0 ? Math.min(100, (recibido / montoRef) * 100) : 0
  const pendientes = docsPendientes?.total ?? 0
  const pendOblig = docsPendientes?.obligatorios ?? 0

  return (
    <div className="group relative rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 overflow-hidden hover:shadow-md transition-shadow">
      {/* Top color accent */}
      <div className={`h-1 ${color.barra}`} />

      <div className="p-3 space-y-2">
        {/* Name + percentage */}
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate">
              {fuente.tipo}
            </p>
            {fuente.entidad ? (
              <p className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{fuente.entidad}</span>
              </p>
            ) : null}
          </div>
          <span className={`text-[10px] font-bold ${color.texto} flex-shrink-0 tabular-nums`}>
            {pct}%
          </span>
        </div>

        {/* Monto */}
        <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums leading-none">
          {formatCurrency(montoRef)}
        </p>

        {/* Progress bar + recibido */}
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full ${color.barra} opacity-80 transition-all duration-500`}
              style={{ width: `${pctRecibido}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              Rec: <span className="font-medium tabular-nums">{formatCurrency(recibido)}</span>
            </span>
            {pendientes > 0 ? (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-500 dark:text-amber-400 font-medium">
                <AlertCircle className="w-2.5 h-2.5" />
                {pendOblig > 0 ? `${pendOblig} obl.` : `${pendientes} pend.`}
              </span>
            ) : docsPendientes !== undefined ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            ) : null}
          </div>
        </div>

        {/* Crédito constructora: cuotas toggle */}
        {esCredito && onToggleCuotas ? (
          <button
            type="button"
            onClick={onToggleCuotas}
            className="flex items-center gap-1 w-full pt-1.5 border-t border-gray-100 dark:border-gray-700/50 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            Plan de cuotas
            <ChevronDown
              className={`w-3 h-3 ml-auto transition-transform duration-200 ${cuotasExpandidas ? 'rotate-180' : ''}`}
            />
          </button>
        ) : null}
      </div>
    </div>
  )
}
