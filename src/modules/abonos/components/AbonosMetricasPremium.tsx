'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Users, Wallet } from 'lucide-react'

import {
  metricasIconColors as colors,
  seleccionClienteStyles as styles,
} from '../styles/seleccion-cliente.styles'

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

interface AbonosMetricasPremiumProps {
  totalClientes: number
  totalAbonado: number
  totalVentas: number
  saldoPendiente: number
}

export function AbonosMetricasPremium({
  totalClientes,
  totalAbonado,
  totalVentas,
  saldoPendiente,
}: AbonosMetricasPremiumProps) {
  const items = [
    {
      icon: Users,
      label: 'Clientes Activos',
      displayValue: totalClientes.toString(),
      bg: `bg-gradient-to-br ${colors.clientes.gradient}`,
      shadow: 'shadow-violet-500/50',
      value:
        'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent',
      glow: colors.clientes.glowColor,
    },
    {
      icon: DollarSign,
      label: 'Total Abonado',
      displayValue: formatCOP(totalAbonado),
      bg: `bg-gradient-to-br ${colors.abonado.gradient}`,
      shadow: 'shadow-green-500/50',
      value:
        'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent',
      glow: colors.abonado.glowColor,
    },
    {
      icon: TrendingUp,
      label: 'Total Ventas',
      displayValue: formatCOP(totalVentas),
      bg: `bg-gradient-to-br ${colors.ventas.gradient}`,
      shadow: 'shadow-purple-500/50',
      value:
        'bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent',
      glow: colors.ventas.glowColor,
    },
    {
      icon: Wallet,
      label: 'Saldo Pendiente',
      displayValue: formatCOP(saldoPendiente),
      bg: `bg-gradient-to-br ${colors.pendiente.gradient}`,
      shadow: 'shadow-orange-500/50',
      value:
        'bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent',
      glow: colors.pendiente.glowColor,
    },
  ]

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={styles.metricas.grid}
    >
      {items.map(item => (
        <motion.div
          key={item.label}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={styles.metricas.card}
        >
          <div className={`${styles.metricas.cardGlow} ${item.glow}`} />
          <div className={styles.metricas.content}>
            <div
              className={`${styles.metricas.iconCircle} ${item.bg} ${item.shadow}`}
            >
              <item.icon className={styles.metricas.icon} />
            </div>
            <div className={styles.metricas.textGroup}>
              <p className={`${styles.metricas.value} ${item.value}`}>
                {item.displayValue}
              </p>
              <p className={styles.metricas.label}>{item.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
