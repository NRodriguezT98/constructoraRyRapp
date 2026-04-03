'use client'

import { motion } from 'framer-motion'

import type { Cliente } from '@/modules/clientes/types'

interface EstadisticasComercialesProps {
  estadisticas: {
    total_negociaciones: number
    negociaciones_activas: number
    negociaciones_completadas: number
  }
  cliente: Cliente
}

export function EstadisticasComerciales({
  estadisticas,
  cliente,
}: EstadisticasComercialesProps) {
  const intereses = cliente.intereses?.length || 0

  const pills = [
    {
      label: 'Asignaciones',
      value: estadisticas.total_negociaciones,
      color: 'bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300',
    },
    {
      label: 'En Proceso',
      value: estadisticas.negociaciones_activas,
      color:
        estadisticas.negociaciones_activas > 0
          ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-300 dark:ring-cyan-700'
          : 'bg-gray-100 dark:bg-gray-700/60 text-gray-400 dark:text-gray-500',
    },
    {
      label: 'Pagadas',
      value: estadisticas.negociaciones_completadas,
      color:
        estadisticas.negociaciones_completadas > 0
          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
          : 'bg-gray-100 dark:bg-gray-700/60 text-gray-400 dark:text-gray-500',
    },
    {
      label: 'Intereses',
      value: intereses,
      color:
        intereses > 0
          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
          : 'bg-gray-100 dark:bg-gray-700/60 text-gray-400 dark:text-gray-500',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className='flex flex-wrap items-center gap-2'
    >
      <p className='mr-1 text-xs font-medium text-gray-400 dark:text-gray-500'>
        Actividad:
      </p>
      {pills.map(pill => (
        <span
          key={pill.label}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${pill.color}`}
        >
          <span className='font-bold'>{pill.value}</span>
          {pill.label}
        </span>
      ))}
    </motion.div>
  )
}
