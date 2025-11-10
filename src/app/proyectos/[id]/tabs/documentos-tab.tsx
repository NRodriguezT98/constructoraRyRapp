'use client'

import { useState } from 'react'

import { ArrowLeft, FileText, FolderCog, Upload } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { CategoriasManager } from '@/modules/documentos/components/categorias/categorias-manager'
import { DocumentosLista } from '@/modules/documentos/components/lista/documentos-lista'
import { DocumentoUpload } from '@/modules/documentos/components/upload/documento-upload'
import type { Proyecto } from '@/modules/proyectos/types'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

interface DocumentosTabProps {
  proyecto: Proyecto
  /** Tema del módulo padre (proyectos, clientes, viviendas) */
  moduleName?: ModuleName
}

export function DocumentosTab({ proyecto, moduleName = 'proyectos' }: DocumentosTabProps) {
  const { user } = useAuth()

  // Obtener tema dinámico basado en el módulo
  const theme = moduleThemes[moduleName]

  // Estados locales para vistas (PATRÓN IGUAL A CLIENTES)
  const [showUpload, setShowUpload] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)

  // Si está mostrando categorías (PATRÓN IGUAL A CLIENTES)
  if (showCategorias && user) {
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
            Organiza los documentos del proyecto con categorías personalizadas
          </p>
        </div>

        {/* Gestor de categorías */}
        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800'>
          <CategoriasManager
            userId={user.id}
            onClose={() => setShowCategorias(false)}
            modulo="proyectos"
          />
        </div>
      </div>
    )
  }

  // Si está mostrando formulario de upload (PATRÓN IGUAL A CLIENTES)
  if (showUpload && user) {
    return (
      <div className='space-y-4'>
        <div className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}>
          <DocumentoUpload
            proyectoId={proyecto.id}
            onSuccess={() => setShowUpload(false)}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      </div>
    )
  }

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
                Documentos del Proyecto
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Gestiona planos, contratos y documentación técnica
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

      {/* Lista de documentos - USA REACT QUERY */}
      <DocumentosLista
        proyectoId={proyecto.id}
        onUploadClick={() => setShowUpload(true)}
        moduleName={moduleName}
      />
    </div>
  )
}
