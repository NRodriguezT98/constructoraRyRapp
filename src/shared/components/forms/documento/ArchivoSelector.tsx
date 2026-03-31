'use client'

import { RefObject } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, FileText, Upload, X } from 'lucide-react'

import {
  formatFileSize,
  getFileExtension,
} from '@/modules/documentos/types/documento.types'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

interface ArchivoSelectorProps {
  moduleName?: ModuleName
  archivoSeleccionado: File | null
  errorArchivo: string | null
  isDragging: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLimpiarArchivo: () => void
}

export function ArchivoSelector({
  moduleName = 'proyectos',
  archivoSeleccionado,
  errorArchivo,
  isDragging,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onLimpiarArchivo,
}: ArchivoSelectorProps) {
  const theme = moduleThemes[moduleName]

  if (archivoSeleccionado) {
    // Preview premium del archivo seleccionado
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={cn(
          'group relative overflow-hidden rounded-2xl border p-5 shadow-xl backdrop-blur-xl',
          theme.classes.bg.light,
          theme.classes.border.light
        )}
      >
        {/* Patrón de fondo decorativo */}
        <div
          className='absolute inset-0 opacity-[0.03] dark:opacity-[0.05]'
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            color: theme.colors.primary,
          }}
        />

        {/* Glow decorativo */}
        <div
          className={cn(
            'absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20',
            theme.classes.bg.light
          )}
        />

        <div className='relative z-10 flex items-center gap-4'>
          {/* Icono con glassmorphism */}
          <div className='relative flex-shrink-0'>
            {/* Glow del icono */}
            <div
              className={cn(
                'absolute inset-0 rounded-xl opacity-50 blur-lg',
                'bg-gradient-to-br',
                theme.classes.gradient.primary
              )}
            />

            {/* Icono */}
            <div
              className={cn(
                'relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/30 shadow-xl backdrop-blur-md',
                'bg-gradient-to-br',
                theme.classes.gradient.primary
              )}
            >
              <FileText size={24} className='text-white drop-shadow-lg' />
            </div>
          </div>

          {/* Info del archivo */}
          <div className='min-w-0 flex-1'>
            <h4 className='mb-1 truncate text-base font-bold text-gray-900 dark:text-white'>
              {archivoSeleccionado.name}
            </h4>
            <div className='flex items-center gap-3 text-xs'>
              <span
                className={cn(
                  'rounded-lg border border-white/20 px-2.5 py-1 font-semibold shadow-sm backdrop-blur-md',
                  theme.classes.bg.light,
                  theme.classes.text.primary
                )}
              >
                {formatFileSize(archivoSeleccionado.size)}
              </span>
              <span
                className={cn(
                  'rounded-lg border border-white/20 px-2.5 py-1 font-semibold uppercase shadow-sm backdrop-blur-md',
                  theme.classes.bg.light,
                  theme.classes.text.primary
                )}
              >
                {getFileExtension(archivoSeleccionado.name)}
              </span>
            </div>
          </div>

          {/* Botón eliminar */}
          <motion.button
            type='button'
            onClick={onLimpiarArchivo}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-100 shadow-lg transition-all hover:bg-red-200 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50'
          >
            <X size={18} className='text-red-600 dark:text-red-400' />
          </motion.button>
        </div>

        {/* Barra de progreso decorativa */}
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'absolute bottom-0 left-0 h-1 rounded-full',
            'bg-gradient-to-r',
            theme.classes.gradient.primary
          )}
        />
      </motion.div>
    )
  }

  // Zona de drag & drop con diseño premium
  return (
    <motion.div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl p-10 text-center transition-all duration-500',
        'border-2 border-dashed backdrop-blur-xl',
        'bg-white/80 dark:bg-gray-800/80',
        isDragging
          ? cn('border-opacity-100 shadow-2xl', theme.classes.border.light)
          : 'border-gray-300 shadow-lg hover:border-opacity-60 hover:shadow-xl dark:border-gray-600',
        errorArchivo &&
          'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20'
      )}
    >
      {/* Gradiente de fondo cuando está dragging */}
      {isDragging && (
        <div
          className={cn(
            'absolute inset-0 opacity-10 dark:opacity-20',
            'bg-gradient-to-br',
            theme.classes.gradient.primary
          )}
        />
      )}

      {/* Patrón de fondo decorativo */}
      <div
        className='absolute inset-0 opacity-[0.03] dark:opacity-[0.05]'
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
          color: theme.colors.primary,
        }}
      />

      {/* Glow effect al hacer hover */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10 dark:group-hover:opacity-20',
          isDragging && 'opacity-10 dark:opacity-20',
          'bg-gradient-to-br',
          theme.classes.gradient.primary
        )}
      />

      <input
        ref={fileInputRef}
        type='file'
        onChange={onFileInputChange}
        className='hidden'
        accept='.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.zip,.rar,.txt'
      />

      <motion.div
        animate={isDragging ? { scale: 1.08, y: -8 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className='relative z-10 space-y-4'
      >
        {/* Icono con efecto glassmorphism */}
        <motion.div
          animate={isDragging ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className='relative mx-auto h-20 w-20'
        >
          {/* Glow del icono */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl opacity-40 blur-xl transition-opacity group-hover:opacity-60',
              'bg-gradient-to-br',
              theme.classes.gradient.primary
            )}
          />

          {/* Icono */}
          <div
            className={cn(
              'relative flex h-20 w-20 items-center justify-center rounded-2xl',
              'shadow-2xl backdrop-blur-md',
              'transition-transform duration-300 group-hover:scale-110',
              'bg-gradient-to-br',
              theme.classes.gradient.primary
            )}
          >
            <Upload size={36} className='text-white drop-shadow-lg' />
          </div>
        </motion.div>

        {/* Texto */}
        <div className='space-y-2'>
          <h3 className={cn('text-lg font-bold', theme.classes.text.primary)}>
            {isDragging
              ? '¡Suelta el archivo aquí!'
              : 'Arrastra un archivo o haz clic'}
          </h3>
          <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
            PDF, imágenes, Office, CAD
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Tamaño máximo: 50 MB
          </p>
        </div>

        {/* Badge decorativo */}
        <div className='flex flex-wrap items-center justify-center gap-2'>
          {['PDF', 'IMG', 'DOC', 'CAD'].map(type => (
            <span
              key={type}
              className={cn(
                'rounded-full px-3 py-1 text-[10px] font-bold shadow-sm',
                theme.classes.bg.light,
                theme.classes.text.primary,
                'border',
                theme.classes.border.light
              )}
            >
              {type}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Error message */}
      {errorArchivo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative z-10 mt-4 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/20'
        >
          <AlertCircle size={16} className='text-red-600 dark:text-red-400' />
          <span className='text-sm font-medium text-red-600 dark:text-red-400'>
            {errorArchivo}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
