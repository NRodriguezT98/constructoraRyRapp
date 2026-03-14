'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, DollarSign } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type { Negociacion } from '@/modules/clientes/types'

interface ResumenNegociacionProps {
  negociacion: Negociacion
  clienteId: string
}

export function ResumenNegociacion({ negociacion, clienteId }: ResumenNegociacionProps) {
  const valorTotal = negociacion.valor_total || 0
  const totalAbonado = negociacion.total_abonado || 0
  const saldoPendiente = negociacion.saldo_pendiente || 0
  const porcentaje = Math.min(negociacion.porcentaje_pagado || 0, 100)

  const estaCompleta = porcentaje >= 100

  const proyecto = negociacion.viviendas?.manzanas?.proyectos?.nombre
  const manzana = negociacion.viviendas?.manzanas?.nombre
  const numero = negociacion.viviendas?.numero

  const ubicacion = [manzana && `Mza. ${manzana}`, numero && `Casa ${numero}`]
    .filter(Boolean)
    .join(' · ')

  const progressColor = estaCompleta
    ? 'bg-emerald-500'
    : porcentaje >= 60
      ? 'bg-blue-500'
      : porcentaje >= 30
        ? 'bg-amber-500'
        : 'bg-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 shadow-sm"
    >
      {/* Top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${estaCompleta ? 'bg-emerald-500' : 'bg-cyan-500'}`}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                estaCompleta
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-cyan-100 dark:bg-cyan-900/30'
              }`}
            >
              {estaCompleta ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <DollarSign className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-100">
                {estaCompleta ? 'Negociación Completada' : 'Negociación Activa'}
              </p>
              {proyecto && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {proyecto}
                  {ubicacion ? ` · ${ubicacion}` : ''}
                </p>
              )}
            </div>
          </div>

          <a
            href={`/abonos/${clienteId}`}
            className="flex items-center gap-1 text-[11px] font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200 transition-colors"
          >
            <Clock className="w-3 h-3" />
            Ver abonos
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* Financial stats row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
              Valor Total
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {formatCurrency(valorTotal)}
            </p>
          </div>
          <div className="text-center p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
            <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-500 uppercase tracking-wide mb-0.5">
              Abonado
            </p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(totalAbonado)}
            </p>
          </div>
          <div
            className={`text-center p-2.5 rounded-lg border ${
              saldoPendiente > 0
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40'
                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40'
            }`}
          >
            <p
              className={`text-[10px] font-medium uppercase tracking-wide mb-0.5 ${
                saldoPendiente > 0
                  ? 'text-amber-600 dark:text-amber-500'
                  : 'text-emerald-600 dark:text-emerald-500'
              }`}
            >
              Saldo
            </p>
            <p
              className={`text-sm font-bold ${
                saldoPendiente > 0
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {formatCurrency(saldoPendiente)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${progressColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-10 text-right">
            {Math.round(porcentaje)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
