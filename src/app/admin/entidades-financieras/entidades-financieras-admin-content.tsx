/**
 * Page Content: Entidades Financieras Admin
 *
 * Página de administración de entidades financieras.
 * Usa componentes del módulo de configuración.
 */

'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Landmark } from 'lucide-react'

import Link from 'next/link'

import { EntidadesFinancierasLista } from '@/modules/configuracion/components/EntidadesFinancierasLista'
import { useEntidadesFinancierasStats } from '@/modules/configuracion/hooks/useEntidadesFinancieras'

export function EntidadesFinancierasAdminContent() {
  const { data: stats } = useEntidadesFinancierasStats()

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 px-4 py-8 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/30 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl shadow-blue-500/20 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800'
        >
          {/* Pattern overlay */}
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />

          <div className='relative z-10'>
            {/* Breadcrumb */}
            <Link
              href='/admin'
              className='mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-100 transition-colors hover:text-white'
            >
              <ArrowLeft className='h-4 w-4' />
              Volver al Panel
            </Link>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm'>
                  <Building2 className='h-8 w-8 text-white' />
                </div>
                <div className='space-y-1'>
                  <h1 className='text-3xl font-bold text-white'>
                    Entidades Financieras
                  </h1>
                  <p className='text-sm text-blue-100 dark:text-blue-200'>
                    Administra bancos, cajas de compensación y cooperativas
                  </p>
                </div>
              </div>

              {stats ? (
                <div className='hidden items-center gap-3 lg:flex'>
                  <div className='rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md'>
                    <p className='text-2xl font-bold text-white'>
                      {stats.activas}
                    </p>
                    <p className='text-xs text-blue-100'>Activas</p>
                  </div>
                  <div className='rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md'>
                    <p className='text-2xl font-bold text-white'>
                      {stats.porTipo.Banco}
                    </p>
                    <p className='text-xs text-blue-100'>Bancos</p>
                  </div>
                  <div className='rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md'>
                    <p className='text-2xl font-bold text-white'>
                      {stats.porTipo['Caja de Compensación']}
                    </p>
                    <p className='text-xs text-blue-100'>Cajas</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* Métricas Mobile */}
        {stats ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='grid grid-cols-3 gap-3 lg:hidden'
          >
            <div className='rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800'>
              <p className='bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent'>
                {stats.activas}
              </p>
              <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                Activas
              </p>
            </div>
            <div className='rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800'>
              <p className='bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-2xl font-bold text-transparent'>
                {stats.porTipo.Banco}
              </p>
              <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                Bancos
              </p>
            </div>
            <div className='rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800'>
              <p className='bg-gradient-to-br from-orange-600 to-amber-600 bg-clip-text text-2xl font-bold text-transparent'>
                {stats.porTipo['Caja de Compensación']}
              </p>
              <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                Cajas
              </p>
            </div>
          </motion.div>
        ) : null}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30'
        >
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50'>
              <Landmark className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='flex-1'>
              <h3 className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                ¿Qué son las Entidades Financieras?
              </h3>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                Son los bancos, cajas de compensación y cooperativas que usarás
                al configurar fuentes de pago en las negociaciones. Reemplazan
                el hardcoding anterior con un sistema dinámico administrable.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lista Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EntidadesFinancierasLista />
        </motion.div>
      </div>
    </div>
  )
}
