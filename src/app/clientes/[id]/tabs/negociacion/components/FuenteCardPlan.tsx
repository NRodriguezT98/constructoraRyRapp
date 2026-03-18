'use client'

import { AlertCircle, Building2, CheckCircle2, DollarSign } from 'lucide-react'

import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
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

interface FuenteCardPlanProps {
  fuente: FuentePago
  valorVivienda: number
  docsPendientes?: DocsPendientesInfo
  /** Color token from tipos_fuentes_pago.color in BD (e.g. 'blue', 'emerald'). Drives the card accent color. */
  colorToken?: string
}

export function FuenteCardPlan({ fuente, valorVivienda, docsPendientes, colorToken }: FuenteCardPlanProps) {
  const color = getFuenteColor(colorToken)
  const pct = valorVivienda > 0 ? ((fuente.monto_aprobado / valorVivienda) * 100).toFixed(1) : '0'

  const tienePendientes = (docsPendientes?.total ?? 0) > 0
  const pendientesTotal = docsPendientes?.total ?? 0
  const pendientesOblig = docsPendientes?.obligatorios ?? 0

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/50 shadow-sm">
      {/* Indicator strip */}
      <div className={`w-1 self-stretch rounded-full ${color.barra} flex-shrink-0`} />

      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {fuente.tipo}
            </p>
            {fuente.entidad && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{fuente.entidad}</span>
              </div>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">
              {formatCurrency(fuente.monto_aprobado)}
            </p>
            <p className={`text-xs font-medium tabular-nums ${color.texto}`}>{pct}%</p>
          </div>
        </div>

        {/* Progress bar de lo ya pagado */}
        {fuente.monto_aprobado > 0 && (
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${color.barra} opacity-80 transition-all duration-500`}
                style={{
                  width: `${Math.min(100, ((fuente.monto_recibido ?? 0) / fuente.monto_aprobado) * 100)}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Recibido: {formatCurrency(fuente.monto_recibido ?? 0)}
              </span>

              {/* Estado documentos: usa datos reales de la vista */}
              {docsPendientes !== undefined ? (
                tienePendientes ? (
                  <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {pendientesTotal} doc{pendientesTotal !== 1 ? 's' : ''} pendiente{pendientesTotal !== 1 ? 's' : ''}
                    {pendientesOblig > 0 && (
                      <span className="text-red-500 dark:text-red-400 ml-0.5">
                        ({pendientesOblig} oblig.)
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Docs completos
                  </span>
                )
              ) : null}
            </div>
          </div>
        )}

        {/* Lista de docs pendientes con distinción visual obligatorio/opcional */}
        {tienePendientes && docsPendientes && docsPendientes.docs.length > 0 && (
          <div className="mt-1.5 space-y-0.5">
            {docsPendientes.docs.slice(0, 4).map((doc, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                {doc.obligatorio ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 flex-shrink-0" title="Obligatorio" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" title="Opcional" />
                )}
                <span className={`truncate ${doc.obligatorio ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                  {doc.nombre}
                </span>
                {doc.obligatorio ? (
                  <span className="text-[10px] text-red-400 dark:text-red-500 flex-shrink-0">obligatorio</span>
                ) : (
                  <span className="text-[10px] text-gray-300 dark:text-gray-600 flex-shrink-0">opcional</span>
                )}
              </div>
            ))}
            {docsPendientes.docs.length > 4 && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 pl-3">
                y {docsPendientes.docs.length - 4} más…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
