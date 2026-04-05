'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  DollarSign,
  FileText,
  Layers,
  Settings,
  Wallet,
} from 'lucide-react'

import Link from 'next/link'

export function FuentesPagoHubContent() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Header con breadcrumb */}
        <div className='mb-2 flex items-center gap-3'>
          <Link
            href='/admin'
            className='inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-700/80'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Volver al Panel
            </span>
          </Link>
        </div>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 p-8 shadow-2xl dark:from-blue-700 dark:via-cyan-700 dark:to-indigo-800'
        >
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
          <div className='relative z-10'>
            <div className='mb-3 flex items-center gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm'>
                <Layers className='h-10 w-10 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-white'>
                  Fuentes de Pago
                </h1>
                <p className='mt-1 text-sm text-blue-100 dark:text-blue-200'>
                  Centro de control • Configuración completa del módulo
                </p>
              </div>
            </div>
            <p className='max-w-3xl text-base text-white/90'>
              Gestión centralizada de tipos de fuentes, requisitos documentales
              y configuración de entidades financieras para el sistema de
              negociaciones.
            </p>
          </div>
        </motion.div>

        {/* Grid de Submódulos */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* Configuración de Fuentes (ORIGINAL) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Link href='/admin/fuentes-pago' className='group block'>
              <div className='h-full rounded-xl border border-blue-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl dark:border-blue-800 dark:bg-gray-800/80'>
                <div className='mb-4 flex items-center gap-4'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'>
                    <DollarSign className='h-8 w-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                      Configuración
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Fuentes de pago
                    </p>
                  </div>
                </div>
                <p className='mb-4 min-h-[60px] text-sm text-gray-600 dark:text-gray-300'>
                  Administra los tipos de fuentes de pago disponibles en el
                  sistema para negociaciones. Configura opciones dinámicas y
                  personaliza el flujo.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                    ⚙️ Activo
                  </span>
                  <ArrowRight className='h-5 w-5 text-blue-600 transition-transform group-hover:translate-x-1 dark:text-blue-400' />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Campos Dinámicos (NUEVA UI) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Link
              href='/admin/configuracion/fuentes-pago'
              className='group block'
            >
              <div className='h-full rounded-xl border border-emerald-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl dark:border-emerald-800 dark:bg-gray-800/80'>
                <div className='mb-4 flex items-center gap-4'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg'>
                    <Settings className='h-8 w-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400'>
                      Campos Dinámicos
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Configurador visual
                    </p>
                  </div>
                </div>
                <p className='mb-4 min-h-[60px] text-sm text-gray-600 dark:text-gray-300'>
                  Configura campos personalizados para cada tipo de fuente con
                  drag & drop. Agrega, edita y reordena campos sin código.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
                    ✨ Nuevo
                  </span>
                  <ArrowRight className='h-5 w-5 text-emerald-600 transition-transform group-hover:translate-x-1 dark:text-emerald-400' />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Requisitos de Fuentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Link href='/admin/requisitos-fuentes' className='group block'>
              <div className='h-full rounded-xl border border-purple-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl dark:border-purple-800 dark:bg-gray-800/80'>
                <div className='mb-4 flex items-center gap-4'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg'>
                    <Settings className='h-8 w-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400'>
                      Requisitos
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Documentos requeridos
                    </p>
                  </div>
                </div>
                <p className='mb-4 min-h-[60px] text-sm text-gray-600 dark:text-gray-300'>
                  Configura los documentos y requisitos necesarios para cada
                  tipo de fuente de pago. Define alcance específico o compartido
                  entre clientes.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
                    📋 Activo
                  </span>
                  <ArrowRight className='h-5 w-5 text-purple-600 transition-transform group-hover:translate-x-1 dark:text-purple-400' />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Tipos Oficiales (Seed) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Link href='/admin/tipos-fuentes-pago' className='group block'>
              <div className='h-full rounded-xl border border-cyan-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl dark:border-cyan-800 dark:bg-gray-800/80'>
                <div className='mb-4 flex items-center gap-4'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg'>
                    <Wallet className='h-8 w-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-400'>
                      Tipos Oficiales
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      4 fuentes base
                    </p>
                  </div>
                </div>
                <p className='mb-4 min-h-[60px] text-sm text-gray-600 dark:text-gray-300'>
                  Instala o actualiza las 4 formas de pago que utilizan los
                  clientes: Cuota Inicial, Crédito Hipotecario, Mi Casa Ya y
                  Subsidio de Caja. Si ya existen, actualiza su configuración.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'>
                    🔒 IDs Fijos
                  </span>
                  <ArrowRight className='h-5 w-5 text-cyan-600 transition-transform group-hover:translate-x-1 dark:text-cyan-400' />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Entidades Financieras */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Link href='/admin/entidades-financieras' className='group block'>
              <div className='h-full rounded-xl border border-orange-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl dark:border-orange-800 dark:bg-gray-800/80'>
                <div className='mb-4 flex items-center gap-4'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg'>
                    <Building2 className='h-8 w-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400'>
                      Entidades Financieras
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Bancos y cajas
                    </p>
                  </div>
                </div>
                <p className='mb-4 min-h-[60px] text-sm text-gray-600 dark:text-gray-300'>
                  Administra bancos, cajas de compensación y cooperativas que
                  utilizan los clientes para Créditos Hipotecarios y Subsidios
                  de Caja.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'>
                    🏦 Entidades
                  </span>
                  <ArrowRight className='h-5 w-5 text-orange-600 transition-transform group-hover:translate-x-1 dark:text-orange-400' />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='rounded-xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80'
        >
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
              <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <h3 className='mb-2 text-lg font-bold text-gray-900 dark:text-white'>
                ¿Cómo usar este módulo?
              </h3>
              <ol className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
                <li className='flex items-center gap-2'>
                  <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                    1
                  </span>
                  <span>
                    <strong>Tipos Oficiales:</strong> Instala las 4 formas de
                    pago base del sistema (solo necesitas hacerlo una vez)
                  </span>
                </li>
                <li className='flex items-center gap-2'>
                  <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                    2
                  </span>
                  <span>
                    <strong>Entidades Financieras:</strong> Configura los bancos
                    y cajas de compensación disponibles para créditos y
                    subsidios
                  </span>
                </li>
                <li className='flex items-center gap-2'>
                  <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                    3
                  </span>
                  <span>
                    <strong>Requisitos:</strong> Define qué documentos necesitas
                    que suban los clientes para cada forma de pago
                  </span>
                </li>
                <li className='flex items-center gap-2'>
                  <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                    4
                  </span>
                  <span>
                    <strong>Configuración:</strong> Personaliza opciones
                    adicionales según tus necesidades (opcional)
                  </span>
                </li>
              </ol>
              <div className='mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20'>
                <p className='text-sm text-blue-900 dark:text-blue-100'>
                  <strong>ℹ️ Nota:</strong> Si las fuentes ya existen, el
                  sistema las actualizará automáticamente sin perder
                  información.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
