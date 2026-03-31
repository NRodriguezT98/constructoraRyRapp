'use client'

import { useRef } from 'react'

import { AlertCircle, File, Upload, X } from 'lucide-react'

interface CampoComprobanteProps {
  archivo: File | null
  error?: string
  onChange: (file: File | null) => void
}

const TIPOS_ACEPTADOS = 'image/*,application/pdf'
const TAMANIO_MAXIMO_MB = 10

export function CampoComprobante({
  archivo,
  error,
  onChange,
}: CampoComprobanteProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    onChange(file)
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <input
        ref={inputRef}
        type='file'
        accept={TIPOS_ACEPTADOS}
        onChange={handleFileChange}
        className='hidden'
        id='comprobante-input'
      />

      {archivo ? (
        <div className='flex items-center gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-700 dark:bg-emerald-900/20'>
          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50'>
            <File className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-xs font-semibold text-emerald-700 dark:text-emerald-300'>
              {archivo.name}
            </p>
            <p className='text-xs text-emerald-600/70 dark:text-emerald-400/70'>
              {formatFileSize(archivo.size)}
            </p>
          </div>
          <button
            type='button'
            onClick={handleRemove}
            className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-200/50 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-800/50 dark:text-emerald-300 dark:hover:bg-emerald-800'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </div>
      ) : (
        <label
          htmlFor='comprobante-input'
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
            error
              ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800'>
            <Upload className='h-5 w-5 text-gray-500 dark:text-gray-400' />
          </div>
          <div className='text-center'>
            <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              <span className='text-emerald-600 dark:text-emerald-400'>
                Seleccionar archivo
              </span>{' '}
              o arrastrar aquí
            </p>
            <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
              Imágenes o PDF — máx. {TAMANIO_MAXIMO_MB} MB
            </p>
          </div>
        </label>
      )}

      {error ? (
        <p className='mt-1 flex items-center gap-1 text-xs text-red-500'>
          <AlertCircle className='h-3 w-3 flex-shrink-0' />
          {error}
        </p>
      ) : null}
    </div>
  )
}
