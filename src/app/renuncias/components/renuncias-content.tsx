'use client'

import { motion } from 'framer-motion'
import { FileX } from 'lucide-react'

/**
 * Permisos del usuario (pasados desde Server Component)
 */
interface RenunciasContentProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

/**
 * ✅ PROTEGIDO POR MIDDLEWARE
 * - Recibe permisos como props desde Server Component
 * - No necesita validar autenticación (ya validada)
 * - Solo maneja UI (módulo en construcción)
 */
export default function RenunciasContent({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView = true,
  isAdmin = false,
}: RenunciasContentProps = {}) {
  console.log('📋 [RENUNCIAS CONTENT] Client Component montado con permisos:', {
    canCreate,
    canEdit,
    canDelete,
    canView,
    isAdmin,
  })

  return (
    <div className='min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 p-4 dark:from-gray-900 dark:via-red-900/20 dark:to-rose-900/30'>
      <div className='container mx-auto px-4 py-4'>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <div className='mb-4 inline-flex rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 p-3 shadow-lg'>
            <FileX className='h-10 w-10 text-white' />
          </div>
          <h1 className='mb-3 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-3xl font-bold text-transparent'>
            Gestión de Renuncias
          </h1>
          <p className='mx-auto mb-6 max-w-2xl text-base text-gray-600 dark:text-gray-300'>
            Administra las renuncias y cancelaciones de contratos
          </p>
          <div className='rounded-xl border border-red-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-red-800 dark:bg-gray-800/80'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              📋 Módulo en construcción...
            </p>
            {canCreate && (
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                ✅ Tienes permiso para crear renuncias
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
