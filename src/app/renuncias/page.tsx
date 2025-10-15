'use client'

import { motion } from 'framer-motion'
import { FileX, AlertTriangle, Clock, UserMinus } from 'lucide-react'

export default function RenunciasPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 p-6 dark:from-gray-900 dark:via-red-900/20 dark:to-rose-900/30'>
      <div className='container mx-auto px-6 py-6'>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <div className='mb-6 inline-flex rounded-3xl bg-gradient-to-r from-red-500 to-rose-600 p-4 shadow-xl'>
            <FileX className='h-16 w-16 text-white' />
          </div>
          <h1 className='mb-4 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-5xl font-bold text-transparent'>
            Gestión de Renuncias
          </h1>
          <p className='mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300'>
            Administra las renuncias y cancelaciones de contratos
          </p>
          <div className='rounded-2xl border border-red-200 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-red-800 dark:bg-gray-800/80'>
            <p className='text-lg text-gray-700 dark:text-gray-300'>
              📋 Módulo en construcción...
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
