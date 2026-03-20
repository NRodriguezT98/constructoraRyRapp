'use client'

import { getFuenteColor } from '../hooks'

interface Fuente {
  tipo: string
  monto_aprobado: number
  capital_para_cierre?: number | null
}

interface BarraFinancieraProps {
  fuentesPago: Fuente[]
  valorVivienda: number
}

export function BarraFinanciera({ fuentesPago, valorVivienda }: BarraFinancieraProps) {
  if (!valorVivienda || fuentesPago.length === 0) return null

  const totalFuentes = fuentesPago.reduce((s, f) => s + (f.capital_para_cierre ?? f.monto_aprobado ?? 0), 0)
  const escala = Math.max(valorVivienda, totalFuentes)

  return (
    <div className="space-y-2">
      {/* Barra proporcional */}
      <div className="flex h-6 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700/60">
        {fuentesPago.map((fuente, i) => {
          const montoCierre = fuente.capital_para_cierre ?? fuente.monto_aprobado
          const pct = escala > 0 ? (montoCierre / escala) * 100 : 0
          const color = getFuenteColor(fuente.tipo)
          return (
            <div
              key={fuente.tipo + i}
              title={`${fuente.tipo}: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(fuente.monto_aprobado)}`}
              className={`${color.barra} transition-all duration-500 first:rounded-l-lg`}
              style={{ width: `${pct}%` }}
            />
          )
        })}

        {/* Segmento vacío si hay déficit */}
        {totalFuentes < valorVivienda && (
          <div
            className="flex-1 bg-red-200/60 dark:bg-red-900/30"
            title="Monto no cubierto"
            style={{
              width: `${((valorVivienda - totalFuentes) / escala) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {fuentesPago.map((fuente, i) => {
          const color = getFuenteColor(fuente.tipo)
          const montoCierre = fuente.capital_para_cierre ?? fuente.monto_aprobado
          return (
            <div key={fuente.tipo + i} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${color.barra}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {fuente.tipo}:{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(montoCierre)}
                </span>
              </span>
            </div>
          )
        })}
        {totalFuentes < valorVivienda && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-300 dark:bg-red-700 flex-shrink-0" />
            <span className="text-xs text-red-500 dark:text-red-400">
              Faltante:{' '}
              <span className="font-medium tabular-nums">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valorVivienda - totalFuentes)}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
