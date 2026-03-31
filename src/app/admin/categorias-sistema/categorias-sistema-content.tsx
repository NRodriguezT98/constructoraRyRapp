'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Database } from 'lucide-react'

import Link from 'next/link'

import { CategoriasSistemaCard } from '@/modules/admin/components/CategoriasSistemaCard'

export default function CategoriasSistemaContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/30 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header con navegación */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver a Administración</span>
          </Link>

          <div className="text-center">
            <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-3 shadow-lg">
              <Database className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
              Categorías de Sistema
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-base text-gray-600 dark:text-gray-300">
              Gestión de categorías críticas para documentos de Proyectos, Clientes y Viviendas
            </p>
          </div>
        </motion.div>

        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CategoriasSistemaCard />
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            ℹ️ ¿Qué hace esta herramienta?
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span>Verifica que existan las <strong>19 categorías críticas</strong> del sistema (6 Clientes + 5 Proyectos + 8 Viviendas)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span>Crea automáticamente las categorías faltantes por módulo con sus <strong>UUIDs correctos</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span>Actualiza nombres y descripciones si cambiaron en la base de datos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span><strong>No elimina</strong> documentos ni datos existentes (operación 100% segura)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400">•</span>
              <span>Las categorías están <strong>protegidas por triggers</strong> contra eliminación accidental</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
