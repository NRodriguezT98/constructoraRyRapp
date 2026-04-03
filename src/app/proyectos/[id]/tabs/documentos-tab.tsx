'use client'

import { useState } from 'react'

import { ArrowLeft, FileText, FolderCog, Upload } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import type { Proyecto } from '@/modules/proyectos/types'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { CategoriasManager } from '@/shared/documentos/components/categorias/categorias-manager'
import { DocumentosLista } from '@/shared/documentos/components/lista/documentos-lista'
import { DocumentoUpload } from '@/shared/documentos/components/upload/documento-upload'

interface DocumentosTabProps {
  proyecto: Proyecto
  /** Tema del módulo padre (proyectos, clientes, viviendas) */
  moduleName?: ModuleName
}

export function DocumentosTab({
  proyecto,
  moduleName = 'proyectos',
}: DocumentosTabProps) {
  const { user } = useAuth()

  // Obtener tema dinámico basado en el módulo
  const theme = moduleThemes[moduleName]

  // Estados locales para vistas
  const [showUpload, setShowUpload] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)

  // Si está mostrando categorías
  if (showCategorias && user) {
    return (
      <div className='space-y-4'>
        <div
          className={`rounded-lg border ${theme.classes.border.light} bg-white p-4 shadow-sm dark:bg-gray-800`}
        >
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

        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800'>
          <CategoriasManager
            userId={user.id}
            onClose={() => setShowCategorias(false)}
            modulo='proyectos'
          />
        </div>
      </div>
    )
  }

  // Si está mostrando formulario de upload
  if (showUpload && user) {
    return (
      <div className='space-y-3'>
        {/* Header premium upload con gradiente del módulo */}
        <div
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${theme.classes.gradient.triple} p-4 shadow-xl ${theme.classes.shadow}`}
        >
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
          <div className='relative z-10'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
                  <Upload className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h2 className='text-lg font-bold text-white'>
                    Subir Documento
                  </h2>
                  <p className='text-xs text-white/70'>
                    Completa la información y selecciona el archivo a subir
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpload(false)}
                className='flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/30'
              >
                <ArrowLeft className='h-3.5 w-3.5' />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border ${theme.classes.border.light} bg-white p-3 shadow-sm dark:bg-gray-800`}
        >
          <DocumentoUpload
            entidadId={proyecto.id}
            tipoEntidad='proyecto'
            onSuccess={() => setShowUpload(false)}
            onCancel={() => setShowUpload(false)}
            moduleName={moduleName}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header premium con glassmorphism */}
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br backdrop-blur-xl ${theme.classes.bg.light} dark:${theme.classes.bg.dark} border ${theme.classes.border.light} p-4 shadow-2xl ${theme.classes.shadow}`}
      >
        <div className='bg-grid-white/10 pointer-events-none absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />

        <div className='relative z-10 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`rounded-xl bg-gradient-to-br ${theme.classes.gradient.primary} p-2.5 shadow-lg ${theme.classes.shadow}`}
            >
              <FileText className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2
                className={`bg-gradient-to-br text-base font-bold ${theme.classes.gradient.triple} bg-clip-text text-transparent`}
              >
                Documentos del Proyecto
              </h2>
              <p
                className={`text-xs ${theme.classes.text.secondary} font-medium`}
              >
                Gestiona planos, contratos y documentación técnica
              </p>
            </div>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={() => setShowCategorias(true)}
              className={`group flex items-center gap-1.5 rounded-lg border bg-white/60 backdrop-blur-sm hover:bg-white/80 dark:bg-gray-800/60 dark:hover:bg-gray-800/80 ${theme.classes.border.light} px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
            >
              <FolderCog
                className={`h-3.5 w-3.5 ${theme.classes.text.primary} transition-transform group-hover:rotate-12`}
              />
              <span className='text-gray-700 dark:text-gray-300'>
                Categorías
              </span>
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className={`group flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${theme.classes.gradient.primary} text-white shadow-lg ${theme.classes.shadow} px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]`}
            >
              <Upload className='h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5' />
              <span>Subir Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      <DocumentosLista
        entidadId={proyecto.id}
        tipoEntidad='proyecto'
        onUploadClick={() => setShowUpload(true)}
        moduleName={moduleName}
      />
    </div>
  )
}
