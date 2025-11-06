'use client'

import { useAuth } from '@/contexts/auth-context'
import { CategoriasManager } from '@/modules/documentos/components/categorias/categorias-manager'
import { DocumentosLista } from '@/modules/documentos/components/lista/documentos-lista'
import { DocumentoUpload } from '@/modules/documentos/components/upload/documento-upload'
import type { Proyecto } from '@/modules/proyectos/types'
import { ArrowLeft, FileText, FolderCog, Upload } from 'lucide-react'
import { useState } from 'react'

interface DocumentosTabProps {
  proyecto: Proyecto
}

export function DocumentosTab({ proyecto }: DocumentosTabProps) {
  const { user } = useAuth()

  // Estados locales para vistas (PATRÓN IGUAL A CLIENTES)
  const [showUpload, setShowUpload] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)

  // Si está mostrando categorías (PATRÓN IGUAL A CLIENTES)
  if (showCategorias && user) {
    return (
      <div className='space-y-4'>
        {/* Header con botón volver */}
        <div className='rounded-lg border border-blue-200 bg-white p-4 shadow-sm dark:border-blue-800 dark:bg-gray-800'>
          <div className='mb-4 flex items-center gap-2.5'>
            <button
              onClick={() => setShowCategorias(false)}
              className='flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-gray-600'
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
        <div className='rounded-lg border border-blue-200 bg-white p-4 shadow-sm dark:border-blue-800 dark:bg-gray-800'>
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
      <div className='rounded-lg border border-blue-200 bg-white p-4 shadow-sm dark:border-blue-800 dark:bg-gray-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5'>
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
              className='flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-gray-600'
            >
              <FolderCog className='h-3.5 w-3.5' />
              <span>Categorías</span>
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className='flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
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
      />
    </div>
  )
}
