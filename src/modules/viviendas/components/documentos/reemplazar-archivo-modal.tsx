/**
 * @file reemplazar-archivo-modal.tsx
 * @description Modal para reemplazo seguro de archivos (Admin Only, 48h)
 * @module viviendas/components/documentos
 */

'use client'

import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Info,
    Shield,
    Upload,
    X
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useReemplazarArchivo } from '../../hooks/useReemplazarArchivo'
import type { DocumentoVivienda } from '../../services/documentos-vivienda.service'

interface ReemplazarArchivoModalProps {
  documento: DocumentoVivienda
  viviendaId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ReemplazarArchivoModal({
  documento,
  viviendaId,
  isOpen,
  onClose,
  onSuccess,
}: ReemplazarArchivoModalProps) {
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null)
  const [motivo, setMotivo] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { reemplazarArchivo, isReplacing, puedeReemplazar, horasRestantes } =
    useReemplazarArchivo(viviendaId)

  const puede = puedeReemplazar(documento.fecha_creacion)
  const horas = horasRestantes(documento.fecha_creacion)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNuevoArchivo(file)
    }
  }

  const handleSubmit = async () => {
    if (!nuevoArchivo || !motivo.trim()) return

    try {
      await reemplazarArchivo.mutateAsync({
        documentoId: documento.id,
        nuevoArchivo,
        motivo: motivo.trim(),
      })

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error al reemplazar archivo:', error)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
              disabled={isReplacing}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Reemplazo Seguro de Archivo
                </h2>
                <p className="text-indigo-100 dark:text-indigo-200 text-sm mt-1">
                  Solo Admin • Ventana de 48 horas • Backup automático
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
            {/* Advertencia de Tiempo */}
            <div
              className={`p-4 rounded-xl border ${
                puede
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {puede ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      puede
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    {puede
                      ? `Ventana de reemplazo disponible: ${horas} horas restantes`
                      : 'Ventana de reemplazo cerrada (>48 horas)'}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      puede
                        ? 'text-green-600 dark:text-green-500'
                        : 'text-red-600 dark:text-red-500'
                    }`}
                  >
                    {puede
                      ? 'Puedes reemplazar el archivo de forma segura. Se creará un backup automático.'
                      : 'El documento fue creado hace más de 48 horas. El reemplazo está bloqueado por seguridad.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información del Documento Actual */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Documento actual:
              </label>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nombre:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {documento.nombre_archivo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tamaño:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatBytes(documento.tamano_bytes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tipo:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {documento.tipo_mime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Creado:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(documento.fecha_creacion).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector de Nuevo Archivo */}
            {puede && (
              <>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nuevo archivo:
                  </label>

                  <input
                    ref={inputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {nuevoArchivo ? nuevoArchivo.name : 'Seleccionar archivo'}
                    </p>
                    {nuevoArchivo && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatBytes(nuevoArchivo.size)} • {nuevoArchivo.type}
                      </p>
                    )}
                  </button>
                </div>

                {/* Motivo del Reemplazo */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Motivo del reemplazo: <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    placeholder="Explica por qué es necesario reemplazar el archivo..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    rows={4}
                  />
                </div>

                {/* Información de Seguridad */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Proceso seguro de reemplazo:
                      </p>
                      <ul className="text-xs text-blue-600 dark:text-blue-500 space-y-1 list-disc list-inside">
                        <li>Se creará un backup automático del archivo original</li>
                        <li>El backup se almacenará en carpeta protegida</li>
                        <li>El archivo actual será reemplazado por el nuevo</li>
                        <li>Se registrará la auditoría completa en metadata</li>
                        <li>El cambio será irreversible después de confirmar</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={onClose} variant="outline" disabled={isReplacing} className="px-6">
              Cancelar
            </Button>
            {puede && (
              <Button
                onClick={handleSubmit}
                disabled={isReplacing || !nuevoArchivo || !motivo.trim()}
                className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isReplacing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Reemplazando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Reemplazar Archivo
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
