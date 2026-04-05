/**
 * MetricasHistorial - Panel de métricas de actividad
 * Muestra estadísticas resumidas del historial del cliente
 */

'use client'

import { motion } from 'framer-motion'
import { Activity, AlertCircle, Calendar, TrendingUp } from 'lucide-react'

interface MetricasHistorialProps {
  total: number
  estaSemana: number
  esteMes: number
  criticos: number
}

export function MetricasHistorial({
  total,
  estaSemana,
  esteMes,
  criticos,
}: MetricasHistorialProps) {
  const metricas = [
    {
      label: 'Total',
      valor: total,
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50 dark:bg-blue-950/30',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Esta semana',
      valor: estaSemana,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50 dark:bg-green-950/30',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Este mes',
      valor: esteMes,
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50 dark:bg-purple-950/30',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Críticos',
      valor: criticos,
      icon: AlertCircle,
      color: 'from-red-500 to-orange-500',
      bgLight: 'bg-red-50 dark:bg-red-950/30',
      textColor: 'text-red-600 dark:text-red-400',
    },
  ]

  return (
    <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
      {metricas.map((metrica, index) => {
        const Icon = metrica.icon

        return (
          <motion.div
            key={metrica.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`${metrica.bgLight} rounded-lg border border-gray-200 p-3 transition-all dark:border-gray-700`}
          >
            <div className='flex items-center gap-3'>
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${metrica.color} flex items-center justify-center shadow-md`}
              >
                <Icon className='h-5 w-5 text-white' strokeWidth={2.5} />
              </div>
              <div className='flex-1'>
                <p className={`text-2xl font-bold ${metrica.textColor}`}>
                  {metrica.valor}
                </p>
                <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                  {metrica.label}
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
