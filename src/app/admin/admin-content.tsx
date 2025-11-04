'use client'

/**
 * ============================================
 * COMPONENTE: Contenido del Panel de Administración
 * ============================================
 */

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

interface AdminContentProps {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  isAdmin: boolean
}

export default function AdminContent({
  canView,
  canCreate,
  canEdit,
  canDelete,
  isAdmin,
}: AdminContentProps) {
  console.log('⚙️ [ADMIN CONTENT] Props recibidos:', {
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
  })

  // Solo admins pueden ver esta página
  if (!canView || !isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a este módulo
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 p-4 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/30'>
      <div className='container mx-auto px-4 py-4'>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <div className='mb-4 inline-flex rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-3 shadow-lg'>
            <Shield className='h-10 w-10 text-white' />
          </div>
          <h1 className='mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent'>
            Panel de Administración
          </h1>
          <p className='mx-auto mb-6 max-w-2xl text-base text-gray-600 dark:text-gray-300'>
            Control total del sistema y configuraciones avanzadas
          </p>
          <div className='rounded-xl border border-purple-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-purple-800 dark:bg-gray-800/80'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              ⚙️ Módulo en construcción...
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
