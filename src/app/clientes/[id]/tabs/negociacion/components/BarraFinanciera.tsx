'use client'

import { formatCurrency } from '@/shared/utils/format'

import { getFuenteColor } from '../hooks'

interface Fuente {
  tipo: string
  monto_aprobado: number
  capital_para_cierre?: number | null
}

interface TipoFuente {
  nombre: string
  color?: string | null
}

interface BarraFinancieraProps {
  fuentesPago: Fuente[]
  valorVivienda: number
  tiposFuentes?: TipoFuente[]
}

export function BarraFinanciera({
  fuentesPago,
  valorVivienda,
  tiposFuentes = [],
}: BarraFinancieraProps) {
  if (!valorVivienda || fuentesPago.length === 0) return null

  const totalFuentes = fuentesPago.reduce(
    (s, f) => s + (f.capital_para_cierre ?? f.monto_aprobado ?? 0),
    0
  )
  const escala = Math.max(valorVivienda, totalFuentes)

  const getColorToken = (tipo: string) =>
    tiposFuentes.find(t => t.nombre === tipo)?.color ?? undefined

  return (
    <div className='space-y-1.5'>
      {/* Barra proporcional — slim */}
      <div className='flex h-3 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner dark:bg-gray-700/60'>
        {fuentesPago.map((fuente, i) => {
          const montoCierre =
            fuente.capital_para_cierre ?? fuente.monto_aprobado
          const pct = escala > 0 ? (montoCierre / escala) * 100 : 0
          const color = getFuenteColor(getColorToken(fuente.tipo))
          return (
            <div
              key={fuente.tipo + i}
              title={`${fuente.tipo}: ${formatCurrency(montoCierre)} (${pct.toFixed(1)}%)`}
              className={`${color.barra} cursor-default transition-all duration-500 first:rounded-l-full`}
              style={{ width: `${pct}%` }}
            />
          )
        })}
        {totalFuentes < valorVivienda ? (
          <div
            className='flex-1 bg-red-200/60 dark:bg-red-900/30'
            title={`Faltante: ${formatCurrency(valorVivienda - totalFuentes)}`}
            style={{
              width: `${((valorVivienda - totalFuentes) / escala) * 100}%`,
            }}
          />
        ) : null}
      </div>

      {/* Leyenda compacta inline */}
      <div className='flex flex-wrap items-center gap-x-3 gap-y-0.5'>
        {fuentesPago.map((fuente, i) => {
          const color = getFuenteColor(getColorToken(fuente.tipo))
          const montoCierre =
            fuente.capital_para_cierre ?? fuente.monto_aprobado
          const pct =
            escala > 0 ? ((montoCierre / escala) * 100).toFixed(0) : '0'
          return (
            <div key={fuente.tipo + i} className='flex items-center gap-1'>
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${color.barra}`}
              />
              <span className='text-[11px] text-gray-500 dark:text-gray-400'>
                {fuente.tipo}{' '}
                <span className='font-semibold tabular-nums text-gray-700 dark:text-gray-300'>
                  {pct}%
                </span>
              </span>
            </div>
          )
        })}
        {totalFuentes < valorVivienda ? (
          <div className='flex items-center gap-1'>
            <span className='h-2 w-2 flex-shrink-0 rounded-full bg-red-300 dark:bg-red-700' />
            <span className='text-[11px] text-red-500 dark:text-red-400'>
              Faltante{' '}
              <span className='font-semibold tabular-nums'>
                {(((valorVivienda - totalFuentes) / escala) * 100).toFixed(0)}%
              </span>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
