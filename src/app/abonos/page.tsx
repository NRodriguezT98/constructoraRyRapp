'use client'

import { motion } from 'framer-motion'
import { CreditCard, DollarSign, TrendingUp, Receipt } from 'lucide-react'

export default function AbonosPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 p-6 dark:from-gray-900 dark:via-orange-900/20 dark:to-amber-900/30'>
      <div className='container mx-auto px-6 py-6'>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <div className='mb-6 inline-flex rounded-3xl bg-gradient-to-r from-orange-500 to-amber-600 p-4 shadow-xl'>
            <CreditCard className='h-16 w-16 text-white' />
          </div>
          <h1 className='mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-5xl font-bold text-transparent'>
            Gestión de Abonos
          </h1>
          <p className='mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300'>
            Controla todos los pagos y abonos de tus clientes
          </p>
          <div className='rounded-2xl border border-orange-200 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-orange-800 dark:bg-gray-800/80'>
            <p className='text-lg text-gray-700 dark:text-gray-300'>
              💳 Módulo en construcción...
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
