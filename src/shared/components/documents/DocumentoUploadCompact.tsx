/**
 * DocumentoUploadCompact
 *
 * ✅ Componente genérico para uploads rápidos en formularios
 * ✅ Versión compacta y minimalista del DocumentoUpload completo
 * ✅ Reutilizable en cualquier flujo que necesite subir documentos
 *
 * Casos de uso:
 * - Adjuntos en formularios (como fuentes de pago)
 * - Uploads inline en cards
 * - Documentos sin necesidad de form completo
 */

'use client'

import { useCallback, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'
import { DocumentosBaseService } from '@/shared/documentos/services/documentos-base.service'
import type { TipoEntidad } from '@/shared/documentos/types'

// ============================================
// TYPES
// ============================================

interface Validacion {
  campo: string
  valor: unknown
  mensaje: string
}

interface DocumentoUploadCompactProps {
  // Configuración básica
  entidadId: string
  tipoEntidad: TipoEntidad
  categoriaId: string
  titulo: string

  // Callbacks
  onUploadSuccess: (url: string) => void
  onUploadError?: (error: string) => void

  // Metadata opcional
  metadata?: Record<string, unknown>
  descripcion?: string

  // Validaciones previas al upload
  validaciones?: Validacion[]

  // UI
  disabled?: boolean
  existingUrl?: string
  onRemove?: () => void

  // Límites de archivo
  maxSizeMB?: number
  allowedTypes?: string[]
}

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]

// ============================================
// COMPONENT
// ============================================

export function DocumentoUploadCompact({
  entidadId,
  tipoEntidad,
  categoriaId,
  titulo,
  onUploadSuccess,
  onUploadError,
  metadata,
  descripcion,
  validaciones = [],
  disabled = false,
  existingUrl,
  onRemove,
  maxSizeMB = 10,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
}: DocumentoUploadCompactProps) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(0)

  // ============================================
  // VALIDACIONES
  // ============================================

  /**
   * Validar que todas las condiciones previas se cumplan
   */
  const validacionesOk = validaciones.every(v => !!v.valor)
  const mensajeValidacion = validaciones.find(v => !v.valor)?.mensaje

  /**
   * Validar archivo individual
   */
  const validarArchivo = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      const maxSize = maxSizeMB * 1024 * 1024

      if (file.size > maxSize) {
        return {
          valid: false,
          error: `El archivo no puede superar ${maxSizeMB} MB`,
        }
      }

      if (!allowedTypes.includes(file.type)) {
        const tiposPermitidos = allowedTypes
          .map(t => t.split('/')[1].toUpperCase())
          .join(', ')
        return {
          valid: false,
          error: `Solo se permiten archivos: ${tiposPermitidos}`,
        }
      }

      return { valid: true }
    },
    [maxSizeMB, allowedTypes]
  )

  // ============================================
  // UPLOAD MUTATION
  // ============================================

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Validar usuario
      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }

      // Validar archivo
      const validacion = validarArchivo(file)
      if (!validacion.valid) {
        throw new Error(validacion.error)
      }

      // Validar condiciones previas
      if (!validacionesOk) {
        throw new Error(mensajeValidacion || 'Faltan datos requeridos')
      }

      // Simular progreso inicial
      setProgress(30)

      // Subir documento
      const documento = await DocumentosBaseService.subirDocumento(
        {
          entidad_id: entidadId,
          tipoEntidad,
          categoria_id: categoriaId,
          titulo,
          descripcion,
          archivo: file,
          metadata,
        },
        user.id
      )

      setProgress(100)

      return documento.url_storage
    },
    onSuccess: url => {
      onUploadSuccess(url)
      setTimeout(() => setProgress(0), 500)
    },
    onError: (error: Error) => {
      logger.error('❌ [DocumentoUploadCompact] Error:', error)
      onUploadError?.(error.message)
      setProgress(0)
    },
  })

  // ============================================
  // HANDLERS
  // ============================================

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validar archivo
      const validacion = validarArchivo(file)
      if (!validacion.valid) {
        toast.info(`❌ ${validacion.error}`)
        e.target.value = ''
        return
      }

      // Validar condiciones previas
      if (!validacionesOk) {
        toast.info(`❌ ${mensajeValidacion}`)
        e.target.value = ''
        return
      }

      // Upload inmediato
      uploadMutation.mutate(file)
      e.target.value = '' // Reset para permitir re-selección del mismo archivo
    },
    [validarArchivo, validacionesOk, mensajeValidacion, uploadMutation]
  )

  const handleRemove = useCallback(() => {
    onRemove?.()
    uploadMutation.reset()
  }, [onRemove, uploadMutation])

  // ============================================
  // RENDER
  // ============================================

  const isDisabled = disabled || !validacionesOk

  return (
    <div className='space-y-2'>
      {/* Mensaje de validación */}
      {!validacionesOk && mensajeValidacion && (
        <div className='flex items-start gap-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'>
          <AlertCircle className='mt-0.5 h-3 w-3 flex-shrink-0' />
          <span>{mensajeValidacion}</span>
        </div>
      )}

      {/* Area de upload */}
      <div>
        {existingUrl ? (
          // Documento ya subido
          <div className='flex items-center justify-between rounded-lg border border-green-300 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
              <span className='text-sm font-medium text-green-900 dark:text-green-100'>
                Documento cargado âœ“
              </span>
            </div>
            {onRemove && (
              <button
                type='button'
                onClick={handleRemove}
                className='rounded p-1 transition-colors hover:bg-green-100 dark:hover:bg-green-900/30'
                title='Eliminar documento'
              >
                <X className='h-4 w-4 text-green-700 dark:text-green-300' />
              </button>
            )}
          </div>
        ) : uploadMutation.isPending ? (
          // Uploading con progress bar
          <div className='space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20'>
            <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
              Subiendo... {progress}%
            </p>
            <div className='h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900'>
              <div
                className='h-2 rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-400'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          // Botón de upload
          <label
            className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 transition-all ${
              isDisabled
                ? 'cursor-not-allowed border-gray-300 bg-gray-50 opacity-50 dark:border-gray-700 dark:bg-gray-900'
                : 'cursor-pointer border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-800'
            } `}
          >
            <Upload
              className={`h-4 w-4 ${isDisabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}
            />
            <span
              className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Click para subir (PDF, JPG, PNG - Máx {maxSizeMB} MB)
            </span>
            <input
              type='file'
              className='hidden'
              accept={allowedTypes.join(',')}
              onChange={handleFileSelect}
              disabled={isDisabled}
            />
          </label>
        )}
      </div>

      {/* Error message */}
      {uploadMutation.error && (
        <p className='flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
          <AlertCircle className='h-3 w-3' />
          {uploadMutation.error.message}
        </p>
      )}
    </div>
  )
}
