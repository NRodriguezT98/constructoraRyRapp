'use client'

import { useState } from 'react'

import { ArrowLeft, FileText, FolderCog, Upload } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { DebugLogger } from '@/lib/utils/debug-logger'
import { CategoriasManager } from '@/modules/documentos/components/categorias/categorias-manager'
import { DocumentoUpload, DocumentosLista } from '@/modules/viviendas/components/documentos'
import { moduleThemes } from '@/shared/config/module-themes'

interface DocumentosTabProps {
  viviendaId: string
}

/**
 * Tab de documentos de la vivienda
 * Sistema completo migrado desde Proyectos
 */
export function DocumentosTab({ viviendaId }: DocumentosTabProps) {
  console.log('📄 [DOCUMENTOS TAB] ========== INICIO ==========')
  console.log('📄 [DOCUMENTOS TAB] viviendaId recibido:', viviendaId)

  try {
    const { user } = useAuth()
    console.log('📄 [DOCUMENTOS TAB] Auth cargado, user:', user?.email || 'No autenticado')

    // Tema naranja/ámbar para viviendas
    const theme = moduleThemes.viviendas
    console.log('📄 [DOCUMENTOS TAB] Tema cargado ✓')

    // Estados locales para vistas (PATRÓN IGUAL A PROYECTOS)
    const [showUpload, setShowUpload] = useState(false)
    const [showCategorias, setShowCategorias] = useState(false)
    console.log('📄 [DOCUMENTOS TAB] Estados inicializados ✓')

  // Si está mostrando categorías (PATRÓN IGUAL A PROYECTOS)
  if (showCategorias && user) {
    console.log('📄 [DOCUMENTOS TAB] Renderizando vista CATEGORÍAS')
    return (
      <div className='space-y-4'>
        {/* Header con botón volver */}
        <div className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}>
          <div className='mb-4 flex items-center gap-2.5'>
            <button
              onClick={() => setShowCategorias(false)}
              className={`flex items-center gap-1.5 rounded-lg ${theme.classes.button.secondary} px-3 py-1.5 text-xs font-medium transition-colors`}
            >
              <ArrowLeft className='h-3.5 w-3.5' />
              <span>Volver a Documentos</span>
            </button>
          </div>

          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Gestionar Categorías
          </h2>
          <p className='mt-1.5 text-xs text-gray-500 dark:text-gray-400'>
            Organiza los documentos de la vivienda con categorías personalizadas
          </p>
        </div>

        {/* Gestor de categorías */}
        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800'>
          <CategoriasManager
            userId={user.id}
            onClose={() => setShowCategorias(false)}
            modulo="viviendas"
          />
        </div>
      </div>
    )
  }

  // Si está mostrando formulario de upload (PATRÓN IGUAL A PROYECTOS)
  if (showUpload && user) {
    console.log('📄 [DOCUMENTOS TAB] Renderizando vista UPLOAD')
    return (
      <div className='space-y-4'>
        <div className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}>
          <DocumentoUpload
            viviendaId={viviendaId}
            onSuccess={() => setShowUpload(false)}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      </div>
    )
  }

  console.log('📄 [DOCUMENTOS TAB] Renderizando vista PRINCIPAL (lista documentos)')
  return (
    <div className='space-y-4'>
      {/* Header con acciones */}
      <div className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className={`rounded-lg bg-gradient-to-br ${theme.classes.gradient.primary} p-2.5`}>
              <FileText className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2 className='text-base font-bold text-gray-900 dark:text-white'>
                Documentos de la Vivienda
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Gestiona certificados, planos, escrituras y documentación técnica
              </p>
            </div>
          </div>

          <div className='flex gap-1.5'>
            <button
              onClick={() => setShowCategorias(true)}
              className={`flex items-center gap-1.5 rounded-lg ${theme.classes.button.secondary} px-3 py-1.5 text-xs font-medium transition-colors`}
            >
              <FolderCog className='h-3.5 w-3.5' />
              <span>Categorías</span>
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className={`flex items-center gap-1.5 rounded-lg ${theme.classes.button.primary} px-3 py-1.5 text-xs font-medium`}
            >
              <Upload className='h-3.5 w-3.5' />
              <span>Subir Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de documentos - Sistema completo */}
      <DocumentosLista
        viviendaId={viviendaId}
        onUploadClick={() => setShowUpload(true)}
        moduleName="viviendas"
      />
    </div>
  )
}
