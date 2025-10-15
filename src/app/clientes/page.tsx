'use client'

import { motion } from 'framer-motion'
import { Users, UserPlus, Phone, Mail } from 'lucide-react'

export default function ClientesPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 p-6 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/30'>
      <div className='container mx-auto px-6 py-6'>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <div className='mb-6 inline-flex rounded-3xl bg-gradient-to-r from-purple-500 to-violet-600 p-4 shadow-xl'>
            <Users className='h-16 w-16 text-white' />
          </div>
          <h1 className='mb-4 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-5xl font-bold text-transparent'>
            Gestión de Clientes
          </h1>
          <p className='mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300'>
            Administra tu base de clientes y relaciones comerciales
          </p>
          <div className='rounded-2xl border border-purple-200 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-purple-800 dark:bg-gray-800/80'>
            <p className='text-lg text-gray-700 dark:text-gray-300'>
              👥 Módulo en construcción...
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
