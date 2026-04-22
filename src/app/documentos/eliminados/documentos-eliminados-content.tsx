'use client'

/**
 * 🗑️ CONTENIDO: Documentos Eliminados (Client Component)
 *
 * Separado del page.tsx para permitir server-side permission guard.
 */

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, RefreshCw, Trash2 } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { DocumentosEliminadosLista } from '@/shared/documentos/components/eliminados'

export default function DocumentosEliminadosContent() {
  const router = useRouter()

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-red-50 py-6 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800'>
      <div className='mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8'>
        {/* 🎨 HEADER PREMIUM - Gradiente rojo/gris, compacto */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-gray-600 p-6 shadow-2xl shadow-red-500/20 dark:from-red-700 dark:via-rose-700 dark:to-gray-800'
        >
          {/* Pattern overlay */}
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />

          <div className='relative z-10'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                  <Trash2 className='h-6 w-6 text-white' />
                </div>
                <div className='space-y-0.5'>
                  <h1 className='text-2xl font-bold text-white'>
                    Papelera de Documentos
                  </h1>
                  <p className='text-xs text-red-100 dark:text-red-200'>
                    Administración • Documentos Eliminados
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() =>
                    window.history.length > 1
                      ? router.back()
                      : router.push('/documentos/eliminados')
                  }
                  className='inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Volver
                </button>

                <button
                  onClick={() => router.refresh()}
                  className='inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30'
                >
                  <RefreshCw className='h-4 w-4' />
                  Refrescar
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ⚠️ ADVERTENCIA - Banner informativo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20'
        >
          <div className='flex gap-3'>
            <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500' />
            <div className='flex-1'>
              <h4 className='text-sm font-semibold text-amber-900 dark:text-amber-100'>
                Documentos en Papelera (Soft Delete)
              </h4>
              <p className='mt-1 text-xs text-amber-700 dark:text-amber-300'>
                • <strong>Restaurar:</strong> Devuelve el documento a la lista
                activa (incluye todas las versiones históricas)
                <br />• <strong>Eliminar Definitivo:</strong> Borra
                permanentemente el documento, todas sus versiones y archivos (NO
                reversible)
              </p>
            </div>
          </div>
        </motion.div>

        {/* 📋 LISTA DE DOCUMENTOS ELIMINADOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DocumentosEliminadosLista />
        </motion.div>
      </div>
    </div>
  )
}
