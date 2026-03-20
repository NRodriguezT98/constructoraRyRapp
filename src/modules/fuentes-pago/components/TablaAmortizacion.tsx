'use client'

import { AlertTriangle, Calendar, CheckCircle2, Clock, TrendingDown } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { PeriodoCredito } from '@/modules/fuentes-pago/types'

interface TablaAmortizacionProps {
  periodos: PeriodoCredito[]
}

const ESTADO_CONFIG = {
  Cubierto: {
    label: 'Cubierto',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    icon: CheckCircle2,
  },
  'En curso': {
    label: 'En curso',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-800 dark:text-indigo-200',
    icon: Clock,
  },
  Atrasado: {
    label: 'Atrasado',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    icon: TrendingDown,
  },
  Futuro: {
    label: 'Futuro',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-500 dark:text-gray-400',
    icon: Calendar,
  },
} as const

export function TablaAmortizacion({ periodos }: TablaAmortizacionProps) {
  const hayAtrasados = periodos.some(p => p.estado_periodo === 'Atrasado')

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">N°</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Vencimiento</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Valor Cuota</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Capital Aplicado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Déficit</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Mora Sugerida</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {periodos.map((periodo) => {
              const cfg = ESTADO_CONFIG[periodo.estado_periodo] ?? ESTADO_CONFIG.Futuro
              const EstadoIcon = cfg.icon

              return (
                <tr
                  key={periodo.id}
                  className={`bg-white dark:bg-gray-900 ${periodo.estado_periodo === 'Atrasado' ? 'bg-red-50/50 dark:bg-red-900/5' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{periodo.numero_cuota}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                      {formatDateCompact(periodo.fecha_vencimiento)}
                    </div>
                    {periodo.dias_atraso > 0 ? (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {periodo.dias_atraso} día(s) de atraso
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    ${periodo.valor_cuota.toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    ${periodo.capital_aplicado.toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {periodo.deficit > 0 ? (
                      <span className="font-medium text-red-600 dark:text-red-400">
                        ${periodo.deficit.toLocaleString('es-CO')}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {periodo.mora_sugerida > 0 ? (
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        ~${periodo.mora_sugerida.toLocaleString('es-CO')}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <EstadoIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {hayAtrasados ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-900/10">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-200">
            Hay períodos con déficit. Registra un abono para cubrir el atraso. La mora es una sugerencia que puedes incluir al registrar el abono.
          </p>
        </div>
      ) : null}
    </div>
  )
}
