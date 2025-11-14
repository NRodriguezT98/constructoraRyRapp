'use client'

import { motion } from 'framer-motion'
import { AlertCircle, FileText, Upload, X } from 'lucide-react'
import { RefObject } from 'react'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'
import { formatFileSize, getFileExtension } from '@/types/documento.types'

interface ArchivoSelectorProps {
  moduleName?: ModuleName
  archivoSeleccionado: File | null
  errorArchivo: string | null
  isDragging: boolean
  fileInputRef: RefObject<HTMLInputElement>
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
          'relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl border shadow-xl group',
          theme.classes.bg.light,
          theme.classes.border.light
        )}
      >
        {/* Patrón de fondo decorativo */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            color: theme.colors.primary,
          }}
        />

        {/* Glow decorativo */}
        <div
          className={cn(
            'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity',
            theme.classes.bg.light
          )}
        />

        <div className="relative z-10 flex items-center gap-4">
          {/* Icono con glassmorphism */}
          <div className="relative flex-shrink-0">
            {/* Glow del icono */}
            <div
              className={cn(
                'absolute inset-0 rounded-xl blur-lg opacity-50',
                'bg-gradient-to-br',
                theme.classes.gradient.primary
              )}
            />

            {/* Icono */}
            <div
              className={cn(
                'relative w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl',
                'bg-gradient-to-br',
                theme.classes.gradient.primary
              )}
            >
              <FileText size={24} className="text-white drop-shadow-lg" />
            </div>
          </div>

          {/* Info del archivo */}
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-gray-900 dark:text-white truncate mb-1">
              {archivoSeleccionado.name}
            </h4>
            <div className="flex items-center gap-3 text-xs">
              <span
                className={cn(
                  'px-2.5 py-1 rounded-lg font-semibold backdrop-blur-md border border-white/20 shadow-sm',
                  theme.classes.bg.light,
                  theme.classes.text.primary
                )}
              >
                {formatFileSize(archivoSeleccionado.size)}
              </span>
              <span
                className={cn(
                  'px-2.5 py-1 rounded-lg font-semibold uppercase backdrop-blur-md border border-white/20 shadow-sm',
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
            type="button"
            onClick={onLimpiarArchivo}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 transition-all shadow-lg"
          >
            <X size={18} className="text-red-600 dark:text-red-400" />
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
        'group relative overflow-hidden rounded-2xl p-10 text-center cursor-pointer transition-all duration-500',
        'backdrop-blur-xl border-2 border-dashed',
        'bg-white/80 dark:bg-gray-800/80',
        isDragging
          ? cn('border-opacity-100 shadow-2xl', theme.classes.border.light)
          : 'border-gray-300 dark:border-gray-600 hover:border-opacity-60 shadow-lg hover:shadow-xl',
        errorArchivo && 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
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
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
          color: theme.colors.primary,
        }}
      />

      {/* Glow effect al hacer hover */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500',
          isDragging && 'opacity-10 dark:opacity-20',
          'bg-gradient-to-br',
          theme.classes.gradient.primary
        )}
      />

      <input
        ref={fileInputRef}
        type="file"
        onChange={onFileInputChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.zip,.rar,.txt"
      />

      <motion.div
        animate={isDragging ? { scale: 1.08, y: -8 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative z-10 space-y-4"
      >
        {/* Icono con efecto glassmorphism */}
        <motion.div
          animate={isDragging ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="relative mx-auto w-20 h-20"
        >
          {/* Glow del icono */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity',
              'bg-gradient-to-br',
              theme.classes.gradient.primary
            )}
          />

          {/* Icono */}
          <div
            className={cn(
              'relative w-20 h-20 rounded-2xl flex items-center justify-center',
              'backdrop-blur-md shadow-2xl',
              'group-hover:scale-110 transition-transform duration-300',
              'bg-gradient-to-br',
              theme.classes.gradient.primary
            )}
          >
            <Upload size={36} className="text-white drop-shadow-lg" />
          </div>
        </motion.div>

        {/* Texto */}
        <div className="space-y-2">
          <h3
            className={cn(
              'text-lg font-bold',
              theme.classes.text.primary
            )}
          >
            {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra un archivo o haz clic'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            PDF, imágenes, Office, CAD
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tamaño máximo: 50 MB
          </p>
        </div>

        {/* Badge decorativo */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['PDF', 'IMG', 'DOC', 'CAD'].map((type) => (
            <span
              key={type}
              className={cn(
                'px-3 py-1 text-[10px] font-bold rounded-full shadow-sm',
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
          className="relative z-10 mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">{errorArchivo}</span>
        </motion.div>
      )}
    </motion.div>
  )
}
