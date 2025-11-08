'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { FileText, Settings, Upload, X } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { CategoriasManager } from '@/modules/documentos/components/categorias/categorias-manager'
import { DocumentoUploadVivienda, DocumentosListaVivienda } from '@/modules/viviendas/components/documentos'


interface DocumentosTabProps {
  viviendaId: string
}

/**
 * Tab de documentos de la vivienda
 * Permite subir, ver y descargar documentos
 */
export function DocumentosTab({ viviendaId }: DocumentosTabProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [uploadCertificadoTradicion, setUploadCertificadoTradicion] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)

  // Obtener usuario autenticado
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id })
      }
    })
  }, [])

  // Si está mostrando formulario de upload
  if (showUpload || uploadCertificadoTradicion) {
    return (
      <DocumentoUploadVivienda
        viviendaId={viviendaId}
        onSuccess={() => {
          setShowUpload(false)
          setUploadCertificadoTradicion(false)
        }}
        onCancel={() => {
          setShowUpload(false)
          setUploadCertificadoTradicion(false)
        }}
        categoriaPreseleccionada={
          uploadCertificadoTradicion ? 'Certificado de Tradición' : undefined
        }
        bloquearCategoria={uploadCertificadoTradicion}
      />
    )
  }

  // Si está mostrando gestión de categorías
  if (showCategorias && user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="border-l-4 border-orange-600 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Gestión de Categorías
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Personaliza las categorías de documentos
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCategorias(false)}
              className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Volver
            </button>
          </div>
        </div>

        {/* Categorías Manager */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <CategoriasManager
            userId={user.id}
            onClose={() => setShowCategorias(false)}
            modulo="viviendas"
          />
        </div>
      </motion.div>
    )
  }

  // Vista principal: Lista de documentos
  return (
    <motion.div
      key="documentos"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header con acciones */}
      <div className="border-l-4 border-orange-600 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between">
          {/* Información del tab */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Documentos de la Vivienda
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Certificados, planos y más
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            {/* Gestionar Categorías - Botón Secundario */}
            <motion.button
              onClick={() => setShowCategorias(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="h-4 w-4" />
              <span>Gestionar Categorías</span>
            </motion.button>

            {/* CTA Principal */}
            <motion.button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="h-4 w-4" />
              <span>Subir Documento</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      <DocumentosListaVivienda
        viviendaId={viviendaId}
        onSubirDocumento={() => setUploadCertificadoTradicion(true)}
      />
    </motion.div>
  )
}
