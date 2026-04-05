'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, DollarSign } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type { Negociacion } from '@/modules/clientes/types'

interface ResumenNegociacionProps {
  negociacion: Negociacion
  clienteId: string
}

export function ResumenNegociacion({
  negociacion,
  clienteId,
}: ResumenNegociacionProps) {
  const valorTotal =
    negociacion.valor_total_pagar || negociacion.valor_total || 0
  const totalAbonado = negociacion.total_abonado || 0
  const saldoPendiente = negociacion.saldo_pendiente || 0
  const porcentaje = Math.min(negociacion.porcentaje_pagado || 0, 100)

  const estaCompleta = porcentaje >= 100

  const proyecto = negociacion.viviendas?.manzanas?.proyectos?.nombre
  const manzana = negociacion.viviendas?.manzanas?.nombre
  const numero = negociacion.viviendas?.numero

  const ubicacion = [
    manzana && `Manzana ${manzana}`,
    numero && `Casa ${numero}`,
  ]
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
      className='relative overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800'
    >
      {/* Top accent bar */}
      <div
        className={`absolute left-0 right-0 top-0 h-0.5 ${estaCompleta ? 'bg-emerald-500' : 'bg-cyan-500'}`}
      />

      <div className='p-4'>
        {/* Header row */}
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                estaCompleta
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-cyan-100 dark:bg-cyan-900/30'
              }`}
            >
              {estaCompleta ? (
                <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              ) : (
                <DollarSign className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
              )}
            </div>
            <div>
              <p className='text-xs font-bold text-gray-800 dark:text-gray-100'>
                {estaCompleta ? 'Negociación Completada' : 'Negociación Activa'}
              </p>
              {proyecto && (
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {proyecto}
                  {ubicacion ? ` · ${ubicacion}` : ''}
                </p>
              )}
            </div>
          </div>

          <a
            href={`/abonos/${clienteId}`}
            className='flex items-center gap-1 text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-200'
          >
            <Clock className='h-3 w-3' />
            Ver abonos
            <ArrowRight className='h-3 w-3' />
          </a>
        </div>

        {/* Financial stats row */}
        <div className='mb-3 grid grid-cols-3 gap-3'>
          <div className='rounded-lg border border-gray-100 bg-gray-50 p-2.5 text-center dark:border-gray-700/50 dark:bg-gray-900/40'>
            <p className='mb-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Valor Total
            </p>
            <p className='text-sm font-bold text-gray-800 dark:text-gray-100'>
              {formatCurrency(valorTotal)}
            </p>
            <p className='mt-0.5 text-[10px] text-gray-400 dark:text-gray-500'>
              Precio de la vivienda
            </p>
          </div>
          <div className='rounded-lg border border-emerald-100 bg-emerald-50 p-2.5 text-center dark:border-emerald-800/40 dark:bg-emerald-900/20'>
            <p className='mb-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-500'>
              Abonado
            </p>
            <p className='text-sm font-bold text-emerald-700 dark:text-emerald-400'>
              {formatCurrency(totalAbonado)}
            </p>
            <p className='mt-0.5 text-[10px] text-emerald-500/70 dark:text-emerald-500/50'>
              Total pagado a la fecha
            </p>
          </div>
          <div
            className={`rounded-lg border p-2.5 text-center ${
              saldoPendiente > 0
                ? 'border-amber-100 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20'
                : 'border-emerald-100 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/20'
            }`}
          >
            <p
              className={`mb-0.5 text-[10px] font-medium uppercase tracking-wide ${
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
            <p className='mt-0.5 text-[10px] text-gray-400 dark:text-gray-500'>
              Resta por pagar
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className='flex items-center gap-2.5'>
          <div className='h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
            <motion.div
              className={`h-full rounded-full ${progressColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <span className='w-10 text-right text-xs font-bold text-gray-600 dark:text-gray-400'>
            {Math.round(porcentaje)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
