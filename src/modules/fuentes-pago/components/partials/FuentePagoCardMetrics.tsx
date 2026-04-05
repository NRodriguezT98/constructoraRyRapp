/**
 * ============================================
 * COMPONENTE: FuentePagoCardMetrics
 * ============================================
 *
 * Componente especializado para métricas financieras.
 * Responsabilidades:
 * - Mostrar totales, abonado, pendiente
 * - Barra de progreso visual
 * - Formateo de moneda
 */

import { memo } from 'react'

interface MetricasFinancieras {
  total: number
  abonado: number
  pendiente: number
  porcentajePagado: number
}

interface FuentePagoCardMetricsProps {
  metricas: MetricasFinancieras
  formatCurrency: (amount: number) => string
  colores: {
    gradientFrom: string
    gradientTo: string
  }
}

export const FuentePagoCardMetrics = memo(function FuentePagoCardMetrics({
  metricas,
  formatCurrency,
  colores,
}: FuentePagoCardMetricsProps) {
  return (
    <div className='space-y-2'>
      {/* Línea 2: Métricas financieras */}
      <div className='flex items-center justify-between text-sm'>
        <div className='flex items-center gap-4'>
          <div>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              Total:
            </span>
            <span className='ml-1 font-bold text-gray-900 dark:text-white'>
              {formatCurrency(metricas.total)}
            </span>
          </div>
          <div>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              Abonado:
            </span>
            <span className='ml-1 font-semibold text-green-600 dark:text-green-400'>
              {formatCurrency(metricas.abonado)}
            </span>
          </div>
          <div>
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              Pendiente:
            </span>
            <span className='ml-1 font-semibold text-orange-600 dark:text-orange-400'>
              {formatCurrency(metricas.pendiente)}
            </span>
          </div>
        </div>

        {/* Porcentaje */}
        <div className='text-right'>
          <span
            className='text-sm font-bold'
            style={{ color: colores.gradientFrom }}
          >
            {metricas.porcentajePagado}%
          </span>
        </div>
      </div>

      {/* Línea 3: Barra de progreso */}
      <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
        <div
          className='h-2 rounded-full transition-all duration-500'
          style={{
            width: `${metricas.porcentajePagado}%`,
            background: `linear-gradient(to right, ${colores.gradientFrom}, ${colores.gradientTo})`,
          }}
        />
      </div>
    </div>
  )
})
