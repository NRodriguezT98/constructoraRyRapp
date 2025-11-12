'use client'

/**
 * 🗑️ PÁGINA: Documentos Eliminados (Papelera)
 *
 * Vista de documentos eliminados (soft delete) - Solo Administradores
 * - Header premium con gradiente rojo/gris
 * - Validación de rol Admin
 * - Lista de documentos con acciones Restaurar/Eliminar Definitivo
 */

import { useEffect } from 'react'

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, RefreshCw, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/auth-context'
import { DocumentosEliminadosLista } from '@/modules/documentos/components/eliminados'
import { LoadingState } from '@/shared/components/layout/LoadingState'

export default function DocumentosEliminadosPage() {
  const router = useRouter()
  const { perfil, loading } = useAuth()

  // ✅ Validación de rol Admin
  useEffect(() => {
    if (!loading && perfil?.rol !== 'Administrador') {
      router.push('/') // Redirigir si no es admin
    }
  }, [perfil, loading, router])

  // Loading mientras verifica permisos
  if (loading) {
    return <LoadingState message="Verificando permisos..." />
  }

  // Si no es admin (antes de redirigir)
  if (perfil?.rol !== 'Administrador') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Solo administradores pueden acceder a la papelera de documentos
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* 🎨 HEADER PREMIUM - Gradiente rojo/gris, compacto */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-gray-600 dark:from-red-700 dark:via-rose-700 dark:to-gray-800 p-6 shadow-2xl shadow-red-500/20"
        >
          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-2xl font-bold text-white">Papelera de Documentos</h1>
                  <p className="text-red-100 dark:text-red-200 text-xs">
                    Administración • Documentos Eliminados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
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
          className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-4"
        >
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                Documentos en Papelera (Soft Delete)
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                • <strong>Restaurar:</strong> Devuelve el documento a la lista activa (incluye todas las versiones históricas)
                <br />• <strong>Eliminar Definitivo:</strong> Borra permanentemente el documento, todas sus versiones y archivos (NO reversible)
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
