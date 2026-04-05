'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Wallet } from 'lucide-react'

import Link from 'next/link'

import { TiposFuentesPagoCard } from '@/modules/admin/components/TiposFuentesPagoCard'

export default function TiposFuentesPagoContent() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 p-6 dark:from-gray-900 dark:via-blue-900/20 dark:to-cyan-900/30'>
      <div className='container mx-auto max-w-4xl'>
        {/* Header con navegación */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='mb-6'
        >
          <Link
            href='/admin'
            className='mb-4 inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='text-sm font-medium'>Volver a Administración</span>
          </Link>

          <div className='text-center'>
            <div className='mb-4 inline-flex rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 p-3 shadow-lg'>
              <Wallet className='h-10 w-10 text-white' />
            </div>
            <h1 className='mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent'>
              Formas de Pago del Sistema
            </h1>
            <p className='mx-auto mb-6 max-w-2xl text-base text-gray-600 dark:text-gray-300'>
              Instala las 4 formas de pago que utilizan tus clientes para
              comprar viviendas
            </p>
          </div>
        </motion.div>

        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TiposFuentesPagoCard />
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='mt-6 rounded-xl border border-blue-200 bg-white/60 p-4 backdrop-blur-sm dark:border-blue-800 dark:bg-gray-800/60'
        >
          <h3 className='mb-2 text-sm font-semibold text-gray-900 dark:text-white'>
            ℹ️ ¿Qué hace esta herramienta?
          </h3>
          <ul className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 dark:text-blue-400'>•</span>
              <span>
                Instala las <strong>4 formas de pago</strong> que tus clientes
                utilizan: Cuota Inicial, Crédito Hipotecario, Subsidio Mi Casa
                Ya y Subsidio de Caja
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 dark:text-blue-400'>•</span>
              <span>
                Cada forma de pago incluye su{' '}
                <strong>configuración completa</strong>: icono, color y opciones
                de uso
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 dark:text-blue-400'>•</span>
              <span>
                Si ya las instalaste antes,{' '}
                <strong>actualiza su información</strong> sin borrar nada
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 dark:text-blue-400'>•</span>
              <span>
                <strong>No pierdas datos:</strong> las negociaciones de clientes
                quedan intactas
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 dark:text-blue-400'>•</span>
              <span>
                Solo necesitas hacerlo <strong>una vez</strong> (o cuando
                quieras actualizar la configuración)
              </span>
            </li>
          </ul>

          <div className='mt-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20'>
            <p className='text-sm text-green-800 dark:text-green-200'>
              <strong>✅ Operación segura:</strong> Puedes ejecutar esta acción
              las veces que necesites. Si las formas de pago ya existen, solo
              actualizará su configuración sin afectar las negociaciones de tus
              clientes.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
