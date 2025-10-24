'use client'

import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client-browser'
import { EtiquetasInput } from '@/modules/documentos/components/shared/etiquetas-input'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Calendar,
    FileCheck,
    FileText,
    Loader2,
    Star,
    Upload,
    X,
} from 'lucide-react'
import { DragEvent, useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDocumentosClienteStore } from '../store/documentos-cliente.store'

type UploadFormData = {
  titulo: string
  descripcion?: string
  categoria_id?: string
  etiquetas: string[]
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante: boolean
  metadata: Record<string, any>
}

interface DocumentoUploadClienteProps {
  clienteId: string
  esCedula?: boolean // Flag para indicar si se está subiendo la cédula
  numeroDocumento?: string // Número de documento para el nombre del archivo
  nombreCliente?: string // Nombre completo del cliente para archivo descriptivo
  onSuccess?: () => void
  onCancel?: () => void
}

export function DocumentoUploadCliente({
  clienteId,
  esCedula = false,
  numeroDocumento,
  nombreCliente,
  onSuccess,
  onCancel,
}: DocumentoUploadClienteProps) {
  const { user } = useAuth()
  const { categorias, subiendoDocumento, subirDocumento } = useDocumentosClienteStore()

  // Estados
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [esImportante, setEsImportante] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // React Hook Form
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UploadFormData>({
    defaultValues: {
      titulo: '',
      descripcion: '',
      categoria_id: '',
      etiquetas: [],
      es_importante: false,
      metadata: {},
    },
  })

  // Validación de archivo
  const validarArchivo = useCallback((file: File): boolean => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]

    if (!allowedTypes.includes(file.type)) {
      setErrorArchivo('Tipo de archivo no permitido')
      return false
    }

    if (file.size > maxSize) {
      setErrorArchivo('El archivo excede el tamaño máximo de 10MB')
      return false
    }

    setErrorArchivo('')
    return true
  }, [])

  // Handlers de Drag & Drop
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && validarArchivo(file)) {
        setArchivoSeleccionado(file)
        // Auto-generar título desde nombre del archivo
        const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
        setValue('titulo', nombreSinExtension)
      }
    },
    [validarArchivo, setValue]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && validarArchivo(file)) {
        setArchivoSeleccionado(file)
        const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
        setValue('titulo', nombreSinExtension)
      }
    },
    [validarArchivo, setValue]
  )

  const handleClickSelectFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const limpiarArchivo = useCallback(() => {
    setArchivoSeleccionado(null)
    setErrorArchivo('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Submit
  const handleSubmit = handleFormSubmit(async (data) => {
    if (!archivoSeleccionado) {
      toast.error('Selecciona un archivo')
      return
    }

    if (!user) {
      toast.error('No hay usuario autenticado')
      return
    }

    try {
      // Si es cédula, subir directamente al perfil del cliente
      if (esCedula) {
        // Importar dinámicamente solo el servicio de clientes
        const { clientesService } = await import('@/modules/clientes/services/clientes.service')

        // Verificar autenticación usando la instancia global
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔐 Sesión actual:', session?.user?.id)
        console.log('🔐 User ID del contexto:', user.id)

        if (!session?.user) {
          toast.error('No hay sesión activa. Por favor, inicia sesión nuevamente.')
          return
        }

        // Validar que sea PDF o imagen
        if (!archivoSeleccionado.type.match(/^(application\/pdf|image\/(jpeg|jpg|png|webp))$/)) {
          toast.error('La cédula debe ser un PDF o imagen (JPG, PNG, WEBP)')
          return
        }

        // Subir a storage - Path simplificado de 2 niveles
        const extension = archivoSeleccionado.name.split('.').pop()

        // Generar nombre descriptivo usando nombre del cliente
        // Formato: Cedula_Laura_Duque_11522266.pdf
        let nombreArchivo = `cedula-${numeroDocumento || clienteId}.${extension}`
        if (nombreCliente) {
          // Limpiar nombre: remover acentos, reemplazar espacios por guión bajo
          const nombreLimpio = nombreCliente
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remover acentos
            .replace(/\s+/g, '_') // Espacios -> guión bajo
            .replace(/[^a-zA-Z0-9_]/g, '') // Solo alfanuméricos y guión bajo

          nombreArchivo = `Cedula_${nombreLimpio}_${numeroDocumento}.${extension}`
        }

        // Cambiado a path simple: userId/nombreArchivo
        const storagePath = `${session.user.id}/${nombreArchivo}`

        console.log('📁 Path de subida:', storagePath)
        console.log('📁 Debe empezar con:', `${session.user.id}/`)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documentos-clientes')
          .upload(storagePath, archivoSeleccionado, {
            cacheControl: '3600',
            upsert: true // Permitir sobrescribir si ya existe
          })

        if (uploadError) {
          console.error('Error al subir cédula:', uploadError)
          console.error('Storage path:', storagePath)
          console.error('User ID:', user.id)
          console.error('Detalles del error:', uploadError)
          toast.error(`Error al subir la cédula: ${uploadError.message}`)
          return
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('documentos-clientes')
          .getPublicUrl(storagePath)

        // Actualizar cliente con la URL de la cédula
        await clientesService.actualizarCliente(clienteId, {
          documento_identidad_url: publicUrl
        })

        toast.success('Cédula subida exitosamente')
        reset()
        limpiarArchivo()
        onSuccess?.()
        return
      }

      // Si es documento regular, usar el flujo normal
      await subirDocumento(
        {
          archivo: archivoSeleccionado,
          cliente_id: clienteId,
          categoria_id: data.categoria_id || undefined,
          titulo: data.titulo,
          descripcion: data.descripcion,
          etiquetas: etiquetas,
          fecha_documento: data.fecha_documento,
          fecha_vencimiento: data.fecha_vencimiento,
          es_importante: esImportante,
          metadata: data.metadata,
        },
        user.id
      )

      toast.success('Documento subido exitosamente')
      reset()
      limpiarArchivo()
      setEtiquetas([])
      setEsImportante(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error al subir documento:', error)
      toast.error('Error al subir el documento')
    }
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Zona de subida de archivo */}
      {!archivoSeleccionado ? (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickSelectFile}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300 overflow-hidden group
            ${
              isDragging
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
            }
            ${errorArchivo ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            onChange={handleFileInputChange}
          />

          <motion.div
            className="space-y-4"
            animate={{ scale: isDragging ? 1.05 : 1 }}
          >
            <div className={`w-20 h-20 mx-auto ${esCedula ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'} rounded-2xl flex items-center justify-center`}>
              {esCedula ? (
                <FileText size={40} className="text-white" />
              ) : (
                <Upload size={40} className="text-white" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {esCedula
                  ? (isDragging ? '¡Suelta la cédula aquí!' : 'Subir Cédula de Ciudadanía')
                  : (isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra un archivo o haz clic')
                }
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {esCedula ? 'PDF o imagen (JPG, PNG, WEBP)' : 'PDF, imágenes, Word, Excel'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Tamaño máximo: 10 MB
              </p>
              {esCedula && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                  ⚠️ La cédula es requerida para crear negociaciones
                </p>
              )}
            </div>
          </motion.div>

          {errorArchivo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-400"
            >
              <AlertCircle size={16} />
              <span className="text-sm">{errorArchivo}</span>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <FileText size={32} className="text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {archivoSeleccionado.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">
                      {getFileExtension(archivoSeleccionado.name)}
                    </span>
                    <span>{formatFileSize(archivoSeleccionado.size)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={limpiarArchivo}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Formulario de metadatos */}
      <AnimatePresence>
        {archivoSeleccionado && !esCedula && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Título del Documento *
              </label>
              <input
                {...register('titulo', { required: 'El título es requerido' })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ej: Carta Laboral, Extracto Bancario"
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                {...register('categoria_id')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Sin categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icono} {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                {...register('descripcion')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Información adicional sobre el documento"
              />
            </div>

            {/* Etiquetas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Etiquetas
              </label>
              <EtiquetasInput value={etiquetas} onChange={setEtiquetas} />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Fecha del Documento
                </label>
                <input
                  {...register('fecha_documento')}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Fecha de Vencimiento
                </label>
                <input
                  {...register('fecha_vencimiento')}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Marcar como importante */}
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <input
                type="checkbox"
                id="es_importante"
                checked={esImportante}
                onChange={(e) => setEsImportante(e.target.checked)}
                className="w-4 h-4 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
              />
              <label
                htmlFor="es_importante"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <Star size={16} className="text-yellow-600" />
                Marcar como documento importante
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={subiendoDocumento}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={!archivoSeleccionado || subiendoDocumento}
          className={`px-6 py-2.5 ${esCedula ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'} text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
        >
          {subiendoDocumento ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {esCedula ? 'Subiendo cédula...' : 'Subiendo...'}
            </>
          ) : (
            <>
              <FileCheck size={18} />
              {esCedula ? 'Subir cédula' : 'Subir documento'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
