'use client'

import { motion } from 'framer-motion'
import { AlertCircle, DollarSign, Info } from 'lucide-react'

import { Label } from '@/components/ui/label'

import type { FuentePagoConAbonos } from '../../types'

import { modalStyles } from './styles'

interface CampoMontoProps {
  esDesembolso: boolean
  fuente: FuentePagoConAbonos
  monto: string
  montoAutomatico: number | null
  saldoPendiente: number
  montoIngresado: number
  error?: string
  onChange: (value: string) => void
  formatCurrency: (value: number) => string
}

export function CampoMonto({
  esDesembolso,
  fuente: _fuente,
  monto,
  montoAutomatico,
  saldoPendiente,
  montoIngresado,
  error,
  onChange,
  formatCurrency,
}: CampoMontoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Label htmlFor='monto' className={modalStyles.form.label}>
        <DollarSign className={modalStyles.form.labelIcon} />
        {esDesembolso ? 'Monto del Desembolso' : 'Monto del Abono'}
        <span className={modalStyles.form.required}>*</span>
      </Label>

      {esDesembolso && montoAutomatico ? (
        <div className='flex items-center gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2.5 dark:border-emerald-700 dark:bg-emerald-900/20'>
          <Info className='h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400' />
          <div>
            <p className='text-sm font-bold text-emerald-700 dark:text-emerald-300'>
              {formatCurrency(montoAutomatico)}
            </p>
            <p className='text-xs text-emerald-600 dark:text-emerald-400'>
              Monto aprobado (automático)
            </p>
          </div>
        </div>
      ) : (
        <div className='space-y-1'>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400'>
              $
            </span>
            <input
              id='monto'
              type='number'
              inputMode='numeric'
              min='1'
              step='1000'
              value={monto}
              onChange={e => onChange(e.target.value)}
              className={`${modalStyles.form.input} pl-6 ${error ? 'border-red-400 focus:ring-red-400/20' : ''}`}
              placeholder='0'
            />
          </div>
          {error ? (
            <p className='flex items-center gap-1 text-xs text-red-500'>
              <AlertCircle className='h-3 w-3 flex-shrink-0' />
              {error}
            </p>
          ) : (
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Saldo pendiente:{' '}
              <span className='font-medium'>
                {formatCurrency(saldoPendiente)}
              </span>
              {montoIngresado > 0 ? (
                <span className='ml-2 text-emerald-600 dark:text-emerald-400'>
                  → Restante:{' '}
                  {formatCurrency(Math.max(0, saldoPendiente - montoIngresado))}
                </span>
              ) : null}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
