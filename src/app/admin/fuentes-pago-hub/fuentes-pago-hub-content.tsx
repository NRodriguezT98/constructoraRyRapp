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
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header con breadcrumb */}
        <div className='flex items-center gap-3 mb-2'>
          <Link
            href='/admin'
            className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-all shadow-sm'
          >
            <ArrowLeft className='w-4 h-4' />
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Volver al Panel
            </span>
          </Link>
        </div>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 dark:from-blue-700 dark:via-cyan-700 dark:to-indigo-800 p-8 shadow-2xl'
        >
          <div className='absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
          <div className='relative z-10'>
            <div className='flex items-center gap-4 mb-3'>
              <div className='w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center'>
                <Layers className='w-10 h-10 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-white'>
                  Fuentes de Pago
                </h1>
                <p className='text-blue-100 dark:text-blue-200 text-sm mt-1'>
                  Centro de control • Configuración completa del módulo
                </p>
              </div>
            </div>
            <p className='text-white/90 text-base max-w-3xl'>
              Gestión centralizada de tipos de fuentes, requisitos documentales
              y configuración de entidades financieras para el sistema de
              negociaciones.
            </p>
          </div>
        </motion.div>

        {/* Grid de Submódulos */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Configuración de Fuentes (ORIGINAL) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Link href='/admin/fuentes-pago' className='block group'>
              <div className='rounded-xl border border-blue-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-blue-800 dark:bg-gray-800/80 hover:shadow-2xl transition-all h-full'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg'>
                    <DollarSign className='w-8 h-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                      Configuración
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Fuentes de pago
                    </p>
                  </div>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300 mb-4 min-h-[60px]'>
                  Administra los tipos de fuentes de pago disponibles en el
                  sistema para negociaciones. Configura opciones dinámicas y
                  personaliza el flujo.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300'>
                    ⚙️ Activo
                  </span>
                  <ArrowRight className='w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform' />
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
            <Link href='/admin/configuracion/fuentes-pago' className='block group'>
              <div className='rounded-xl border border-emerald-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-emerald-800 dark:bg-gray-800/80 hover:shadow-2xl transition-all h-full'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg'>
                    <Settings className='w-8 h-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'>
                      Campos Dinámicos
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Configurador visual
                    </p>
                  </div>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300 mb-4 min-h-[60px]'>
                  Configura campos personalizados para cada tipo de fuente con drag & drop. Agrega, edita y reordena campos sin código.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                    ✨ Nuevo
                  </span>
                  <ArrowRight className='w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform' />
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
            <Link href='/admin/requisitos-fuentes' className='block group'>
              <div className='rounded-xl border border-purple-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-purple-800 dark:bg-gray-800/80 hover:shadow-2xl transition-all h-full'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg'>
                    <Settings className='w-8 h-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors'>
                      Requisitos
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Documentos requeridos
                    </p>
                  </div>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300 mb-4 min-h-[60px]'>
                  Configura los documentos y requisitos necesarios para cada
                  tipo de fuente de pago. Define alcance específico o
                  compartido entre clientes.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs font-medium text-purple-700 dark:text-purple-300'>
                    📋 Activo
                  </span>
                  <ArrowRight className='w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform' />
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
            <Link href='/admin/tipos-fuentes-pago' className='block group'>
              <div className='rounded-xl border border-cyan-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-cyan-800 dark:bg-gray-800/80 hover:shadow-2xl transition-all h-full'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg'>
                    <Wallet className='w-8 h-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors'>
                      Tipos Oficiales
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      4 fuentes base
                    </p>
                  </div>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300 mb-4 min-h-[60px]'>
                  Instala o actualiza las 4 formas de pago que utilizan los clientes: Cuota Inicial, Crédito Hipotecario, Mi Casa Ya y Subsidio de Caja. Si ya existen, actualiza su configuración.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-xs font-medium text-cyan-700 dark:text-cyan-300'>
                    🔒 IDs Fijos
                  </span>
                  <ArrowRight className='w-5 h-5 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform' />
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
            <Link href='/admin/entidades-financieras' className='block group'>
              <div className='rounded-xl border border-orange-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-orange-800 dark:bg-gray-800/80 hover:shadow-2xl transition-all h-full'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg'>
                    <Building2 className='w-8 h-8 text-white' />
                  </div>
                  <div className='flex-1 text-left'>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors'>
                      Entidades Financieras
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Bancos y cajas
                    </p>
                  </div>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300 mb-4 min-h-[60px]'>
                  Administra bancos, cajas de compensación y cooperativas que utilizan los clientes para Créditos Hipotecarios y Subsidios de Caja.
                </p>
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-xs font-medium text-orange-700 dark:text-orange-300'>
                    🏦 Entidades
                  </span>
                  <ArrowRight className='w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform' />
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
            <div className='w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
              <FileText className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-2'>
                ¿Cómo usar este módulo?
              </h3>
              <ol className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
                <li className='flex items-center gap-2'>
                  <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold'>
                    1
                  </span>
                  <span>
                    <strong>Tipos Oficiales:</strong> Instala las 4 formas de pago base del sistema (solo necesitas hacerlo una vez)
                  </span>
                </li>
                <li className='flex items-center gap-2'>
                  <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold'>
                    2
                  </span>
                  <span>
                    <strong>Entidades Financieras:</strong> Configura los bancos y cajas de compensación disponibles para créditos y subsidios
                  </span>
                </li>
                <li className='flex items-center gap-2'>
                  <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold'>
                    3
                  </span>
                  <span>
                    <strong>Requisitos:</strong> Define qué documentos necesitas que suban los clientes para cada forma de pago
                  </span>
                </li>
                <li className='flex items-center gap-2'>
                  <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold'>
                    4
                  </span>
                  <span>
                    <strong>Configuración:</strong> Personaliza opciones adicionales según tus necesidades (opcional)
                  </span>
                </li>
              </ol>
              <div className='mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'>
                <p className='text-sm text-blue-900 dark:text-blue-100'>
                  <strong>ℹ️ Nota:</strong> Si las fuentes ya existen, el sistema las actualizará automáticamente sin perder información.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
