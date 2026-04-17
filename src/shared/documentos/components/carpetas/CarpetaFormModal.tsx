/**
 * CarpetaFormModal — Modal para crear o renombrar carpetas.
 */
'use client'

import { useEffect, useState } from 'react'

import { Folder, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { ModuleName } from '@/shared/config/module-themes'
import type { CarpetaDocumentoRow } from '@/shared/documentos/types/carpeta.types'

interface CarpetaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (nombre: string, descripcion?: string) => void
  moduleName?: ModuleName
  /** Si se pasa, es modo edición */
  carpeta?: CarpetaDocumentoRow | null
  cargando?: boolean
}

export function CarpetaFormModal({
  isOpen,
  onClose,
  onSubmit,
  moduleName: _moduleName = 'proyectos',
  carpeta,
  cargando = false,
}: CarpetaFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const esEdicion = !!carpeta

  useEffect(() => {
    if (carpeta) {
      setNombre(carpeta.nombre)
      setDescripcion(carpeta.descripcion || '')
    } else {
      setNombre('')
      setDescripcion('')
    }
  }, [carpeta, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nombreTrimmed = nombre.trim()
    if (!nombreTrimmed) return
    onSubmit(nombreTrimmed, descripcion.trim() || undefined)
  }

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-0 shadow-2xl dark:border-gray-700 dark:bg-gray-800'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <Folder className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              {esEdicion ? 'Renombrar carpeta' : 'Nueva carpeta'}
            </h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4 px-5 py-4'>
          <div>
            <label
              htmlFor='carpeta-nombre'
              className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Nombre de la carpeta
            </label>
            <input
              id='carpeta-nombre'
              type='text'
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder='Ej: Fotos vivienda, Licencias, Contratos...'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500'
              maxLength={100}
              autoFocus
              required
            />
          </div>

          <div>
            <label
              htmlFor='carpeta-descripcion'
              className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'
            >
              Descripción <span className='text-gray-400'>(opcional)</span>
            </label>
            <input
              id='carpeta-descripcion'
              type='text'
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder='Breve descripción del contenido...'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500'
              maxLength={200}
            />
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={!nombre.trim() || cargando}
              className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {cargando
                ? 'Guardando...'
                : esEdicion
                  ? 'Guardar'
                  : 'Crear carpeta'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
