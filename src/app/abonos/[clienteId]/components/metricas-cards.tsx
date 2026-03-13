'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react'

interface MetricasCardsProps {
  metricas: {
    valorTotal: number
    totalAbonado: number
    saldoPendiente: number
    porcentajePagado: number
  }
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const CIRCUNFERENCIA = 2 * Math.PI * 36

export function MetricasCards({ metricas }: MetricasCardsProps) {
  const pct = Math.min(Math.max(metricas.porcentajePagado, 0), 100)
  const offset = CIRCUNFERENCIA - (pct / 100) * CIRCUNFERENCIA

  const ringColor =
    pct >= 80 ? '#10b981' :
    pct >= 40 ? '#3b82f6' :
    '#f59e0b'

  const cards = [
    {
      label: 'Valor Total',
      value: formatCurrency(metricas.valorTotal),
      Icon: DollarSign,
      gradient: 'from-blue-500 to-indigo-600',
      glow: 'rgba(59,130,246,0.2)',
      valueColor: 'text-gray-900 dark:text-white',
    },
    {
      label: 'Total Abonado',
      value: formatCurrency(metricas.totalAbonado),
      Icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'rgba(16,185,129,0.2)',
      valueColor: 'text-emerald-600 dark:text-emerald-300',
      hasBar: true,
    },
    {
      label: 'Saldo Pendiente',
      value: formatCurrency(metricas.saldoPendiente),
      Icon: TrendingDown,
      gradient: 'from-amber-500 to-orange-600',
      glow: 'rgba(249,115,22,0.2)',
      valueColor: 'text-amber-600 dark:text-amber-300',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3">
      {cards.map(({ label, value, Icon, gradient, glow, valueColor, hasBar }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          whileHover={{ y: -3, boxShadow: `0 12px 32px ${glow}` }}
          className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.06] shadow-sm dark:shadow-none backdrop-blur p-4 transition-all duration-300"
        >
          {/* Hover glow overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: `radial-gradient(circle at bottom right, ${glow}, transparent 70%)` }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500 dark:text-white/50 font-medium">{label}</p>
            </div>
            <p className={`text-lg font-extrabold leading-tight ${valueColor}`}>{value}</p>
            {hasBar ? (
              <div className="mt-3 h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                />
              </div>
            ) : null}
          </div>
        </motion.div>
      ))}

      {/* Anillo de progreso SVG */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-center justify-center rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.06] shadow-sm dark:shadow-none backdrop-blur p-3 min-w-[110px]"
      >
        <div className="relative flex items-center justify-center">
          <svg width="90" height="90" viewBox="0 0 90 90" style={{ filter: `drop-shadow(0 0 8px ${ringColor}60)` }}>
            {/* Pista */}
            <circle
              cx="45" cy="45" r="36"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="7"
            />
            {/* Progreso */}
            <motion.circle
              cx="45" cy="45" r="36"
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA}
              initial={{ strokeDashoffset: CIRCUNFERENCIA }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
          </svg>
          {/* Texto centrado */}
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white">{pct.toFixed(0)}%</span>
            <span className="text-[9px] text-gray-400 dark:text-white/40 mt-0.5 uppercase tracking-wider">pagado</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
