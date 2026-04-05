/**
 * Componente: Content de Administración de Fuentes de Pago
 *
 * Client Component con el contenido principal de la página.
 * Muestra la lista de tipos de fuentes de pago con todas las funcionalidades CRUD.
 */

'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Sparkles } from 'lucide-react'

import Link from 'next/link'

import { TiposFuentesPagoLista } from '@/modules/configuracion/components'

export function FuentesPagoAdminContent() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/10 dark:to-indigo-950/10'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Breadcrumb */}
        <div className='mb-6'>
          <Link
            href='/admin'
            className='inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver a Administración
          </Link>
        </div>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl shadow-blue-500/20 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800'
        >
          {/* Pattern Overlay */}
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />

          {/* Content */}
          <div className='relative z-10'>
            <div className='mb-4 flex items-center gap-4'>
              <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                <Shield className='h-8 w-8 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-white'>
                  Administración de Fuentes de Pago
                </h1>
                <p className='mt-1 text-sm text-blue-100 dark:text-blue-200'>
                  Configura las fuentes de pago disponibles en el sistema
                </p>
              </div>
            </div>

            {/* Info Cards */}
            <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div className='rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm'>
                <div className='mb-2 flex items-center gap-2'>
                  <Sparkles className='h-5 w-5 text-yellow-300' />
                  <p className='text-xs font-semibold uppercase tracking-wide text-white'>
                    Dinámico
                  </p>
                </div>
                <p className='text-sm text-blue-100'>
                  Las fuentes se cargan desde la base de datos en tiempo real
                </p>
              </div>

              <div className='rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm'>
                <div className='mb-2 flex items-center gap-2'>
                  <Shield className='h-5 w-5 text-green-300' />
                  <p className='text-xs font-semibold uppercase tracking-wide text-white'>
                    Seguro
                  </p>
                </div>
                <p className='text-sm text-blue-100'>
                  Solo administradores pueden crear y modificar fuentes
                </p>
              </div>

              <div className='rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm'>
                <div className='mb-2 flex items-center gap-2'>
                  <svg
                    className='h-5 w-5 text-purple-300'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                  <p className='text-xs font-semibold uppercase tracking-wide text-white'>
                    Sin Deploy
                  </p>
                </div>
                <p className='text-sm text-blue-100'>
                  Cambios inmediatos sin necesidad de compilar código
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TiposFuentesPagoLista />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30'
        >
          <p className='text-sm text-blue-900 dark:text-blue-100'>
            <strong>💡 Tip:</strong> Las fuentes de pago configuradas aquí
            estarán disponibles automáticamente en el módulo de negociaciones al
            asignar viviendas.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
