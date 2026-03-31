'use client'

import { motion } from 'framer-motion'
import { CreditCard } from 'lucide-react'

import { Label } from '@/components/ui/label'

import { METODOS_PAGO } from '../../constants'

import { modalStyles } from './styles'

interface MetodosPagoSelectorProps {
  metodoSeleccionado: string
  onSelect: (metodo: string) => void
}

export function MetodosPagoSelector({
  metodoSeleccionado,
  onSelect,
}: MetodosPagoSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Label className={modalStyles.form.label}>
        <CreditCard className={modalStyles.form.labelIcon} />
        Método de pago
        <span className={modalStyles.form.required}>*</span>
      </Label>
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {METODOS_PAGO.map(metodo => (
          <button
            key={metodo.value}
            type='button'
            onClick={() => onSelect(metodo.value)}
            className={`rounded-xl border-2 px-3 py-2 text-xs font-medium transition-all ${
              metodoSeleccionado === metodo.value
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {metodo.label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
