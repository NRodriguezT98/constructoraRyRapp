/**
 * CarpetaCard — Card de carpeta en la lista de documentos.
 * Muestra nombre, ícono, conteo de docs y acciones (renombrar, eliminar).
 */
'use client'

import { useState } from 'react'

import { Folder, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import type { ModuleName } from '@/shared/config/module-themes'
import type { CarpetaConConteo } from '@/shared/documentos/types/carpeta.types'

import { getCarpetaStyles } from './carpetas.styles'

interface CarpetaCardProps {
  carpeta: CarpetaConConteo
  moduleName?: ModuleName
  onOpen: (carpetaId: string) => void
  onRename: (carpeta: CarpetaConConteo) => void
  onDelete: (carpeta: CarpetaConConteo) => void
}

export function CarpetaCard({
  carpeta,
  moduleName = 'proyectos',
  onOpen,
  onRename,
  onDelete,
}: CarpetaCardProps) {
  const styles = getCarpetaStyles(moduleName)
  const [menuAbierto, setMenuAbierto] = useState(false)

  const totalItems = carpeta.cantidad_documentos + carpeta.cantidad_subcarpetas

  return (
    <div
      className={styles.card.container}
      onClick={() => onOpen(carpeta.id)}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter') onOpen(carpeta.id)
      }}
    >
      {/* Ícono de carpeta */}
      <div className='flex-shrink-0'>
        <Folder className={styles.card.icon} />
      </div>

      {/* Info */}
      <div className='min-w-0 flex-1'>
        <p className={styles.card.name}>{carpeta.nombre}</p>
        <p className={styles.card.count}>
          {totalItems === 0
            ? 'Vacía'
            : totalItems === 1
              ? '1 elemento'
              : `${totalItems} elementos`}
        </p>
      </div>

      {/* Acciones */}
      <div className={styles.card.actions}>
        <div className='relative'>
          <button
            type='button'
            className={styles.card.actionBtn}
            onClick={e => {
              e.stopPropagation()
              setMenuAbierto(!menuAbierto)
            }}
            aria-label='Acciones de carpeta'
          >
            <MoreHorizontal className='h-4 w-4' />
          </button>

          {menuAbierto ? (
            <>
              {/* Overlay para cerrar menú */}
              <div
                className='fixed inset-0 z-40'
                onClick={e => {
                  e.stopPropagation()
                  setMenuAbierto(false)
                }}
              />
              <div className='absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
                <button
                  type='button'
                  className='flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  onClick={e => {
                    e.stopPropagation()
                    setMenuAbierto(false)
                    onRename(carpeta)
                  }}
                >
                  <Pencil className='h-3.5 w-3.5' />
                  Renombrar
                </button>
                <button
                  type='button'
                  className='flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
                  onClick={e => {
                    e.stopPropagation()
                    setMenuAbierto(false)
                    onDelete(carpeta)
                  }}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                  Eliminar
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
