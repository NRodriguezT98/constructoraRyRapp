'use client'

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  DollarSign,
  Percent,
} from 'lucide-react'

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

interface FuenteCardPlanProps {
  fuente: FuentePago
  valorVivienda: number
  docsPendientes?: DocsPendientesInfo
  /** Color token from tipos_fuentes_pago.color in BD (e.g. 'blue', 'emerald'). Drives the card accent color. */
  colorToken?: string
}

export function FuenteCardPlan({
  fuente,
  valorVivienda,
  docsPendientes,
  colorToken,
}: FuenteCardPlanProps) {
  const color = getFuenteColor(colorToken)
  // Para créditos: usar capital_para_cierre como monto de referencia (el capital aprobado,
  // sin intereses). Para otras fuentes: monto_aprobado como siempre.
  const esCredito = esCreditoConstructora(fuente.tipo)
  const montoReferencia = fuente.capital_para_cierre ?? fuente.monto_aprobado
  const pct =
    valorVivienda > 0
      ? ((montoReferencia / valorVivienda) * 100).toFixed(1)
      : '0'

  // Desglose crédito
  const interesesCredito =
    esCredito && fuente.capital_para_cierre
      ? fuente.monto_aprobado - fuente.capital_para_cierre
      : null

  const tienePendientes = (docsPendientes?.total ?? 0) > 0
  const pendientesTotal = docsPendientes?.total ?? 0
  const pendientesOblig = docsPendientes?.obligatorios ?? 0

  return (
    <div className='flex items-start gap-3 rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-sm dark:border-gray-700/50 dark:bg-gray-800/60'>
      {/* Indicator strip */}
      <div
        className={`w-1 self-stretch rounded-full ${color.barra} flex-shrink-0`}
      />

      <div className='min-w-0 flex-1'>
        {/* Header row */}
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 space-y-0.5'>
            <p className='text-sm font-semibold leading-tight text-gray-900 dark:text-white'>
              {fuente.tipo}
            </p>
            {fuente.entidad && (
              <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                <Building2 className='h-3 w-3 flex-shrink-0' />
                <span className='truncate'>{fuente.entidad}</span>
              </div>
            )}
          </div>

          <div className='flex-shrink-0 text-right'>
            <p className='text-base font-bold tabular-nums text-gray-900 dark:text-white'>
              {formatCurrency(montoReferencia)}
            </p>
            <p className={`text-xs font-medium tabular-nums ${color.texto}`}>
              {pct}%
            </p>
            {esCredito && interesesCredito !== null && interesesCredito > 0 ? (
              <p className='mt-0.5 flex items-center justify-end gap-1 text-xs text-violet-500 dark:text-violet-400'>
                <Percent className='h-2.5 w-2.5' />
                Intereses: {formatCurrency(interesesCredito)}
              </p>
            ) : null}
          </div>
        </div>

        {/* Progress bar de lo ya pagado */}
        {montoReferencia > 0 && (
          <div className='mt-2 space-y-1'>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700'>
              <div
                className={`h-full rounded-full ${color.barra} opacity-80 transition-all duration-500`}
                style={{
                  width: `${Math.min(100, ((fuente.monto_recibido ?? 0) / montoReferencia) * 100)}%`,
                }}
              />
            </div>
            <div className='flex items-center justify-between text-xs text-gray-400 dark:text-gray-500'>
              <span className='flex items-center gap-1'>
                <DollarSign className='h-3 w-3' />
                Recibido: {formatCurrency(fuente.monto_recibido ?? 0)}
              </span>

              {/* Estado documentos: usa datos reales de la vista */}
              {docsPendientes !== undefined ? (
                tienePendientes ? (
                  <span className='flex items-center gap-1 font-medium text-amber-500 dark:text-amber-400'>
                    <AlertCircle className='h-3 w-3 flex-shrink-0' />
                    {pendientesTotal} doc{pendientesTotal !== 1 ? 's' : ''}{' '}
                    pendiente{pendientesTotal !== 1 ? 's' : ''}
                    {pendientesOblig > 0 && (
                      <span className='ml-0.5 text-red-500 dark:text-red-400'>
                        ({pendientesOblig} oblig.)
                      </span>
                    )}
                  </span>
                ) : (
                  <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='h-3 w-3' />
                    Docs completos
                  </span>
                )
              ) : null}
            </div>
          </div>
        )}

        {/* Lista de docs pendientes con distinción visual obligatorio/opcional */}
        {tienePendientes &&
          docsPendientes &&
          docsPendientes.docs.length > 0 && (
            <div className='mt-1.5 space-y-0.5'>
              {docsPendientes.docs.slice(0, 4).map((doc, i) => (
                <div key={i} className='flex items-center gap-1.5 text-xs'>
                  {doc.obligatorio ? (
                    <span
                      className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400 dark:bg-red-500'
                      title='Obligatorio'
                    />
                  ) : (
                    <span
                      className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600'
                      title='Opcional'
                    />
                  )}
                  <span
                    className={`truncate ${doc.obligatorio ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
                  >
                    {doc.nombre}
                  </span>
                  {doc.obligatorio ? (
                    <span className='flex-shrink-0 text-xs text-red-400 dark:text-red-500'>
                      obligatorio
                    </span>
                  ) : (
                    <span className='flex-shrink-0 text-xs text-gray-300 dark:text-gray-600'>
                      opcional
                    </span>
                  )}
                </div>
              ))}
              {docsPendientes.docs.length > 4 && (
                <p className='pl-3 text-xs text-gray-400 dark:text-gray-500'>
                  y {docsPendientes.docs.length - 4} más…
                </p>
              )}
            </div>
          )}
      </div>
    </div>
  )
}
