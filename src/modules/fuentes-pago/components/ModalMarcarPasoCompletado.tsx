/**
 * ============================================
 * COMPONENTE: ModalMarcarPasoCompletado
 * ============================================
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Modal para marcar un paso de validación como completado.
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - Componente: SOLO UI
 * - Hook: useModalMarcarPaso (lógica del modal)
 * - Mutation: useMarcarPasoCompletadoMutation (persistencia)
 *
 * Features:
 * - Formulario adaptativo según nivel de validación
 * - Upload de documento para pasos obligatorios
 * - Validación en tiempo real
 * - Toast de feedback
 *
 * @version 1.0.0 - 2025-12-11
 */

'use client'

import { useState } from 'react'

import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'

import { NivelValidacion } from '../types'

// ============================================
// TYPES
// ============================================

/** Información mínima de un paso/documento pendiente para mostrar en el modal */
interface PasoInfo {
  nivel_validacion: string
  titulo?: string
  descripcion?: string
  [key: string]: unknown
}

interface ModalMarcarPasoCompletadoProps {
  isOpen: boolean
  paso: PasoInfo | null
  onClose: () => void
  onConfirmar: (datos: {
    fecha_completado: string
    documento_id?: string
    observaciones?: string
  }) => Promise<void>
}

// ============================================
// COMPONENTE
// ============================================

export function ModalMarcarPasoCompletado({
  isOpen,
  paso,
  onClose,
  onConfirmar,
}: ModalMarcarPasoCompletadoProps) {
  // ==========================================
  // Estado local
  // ==========================================

  const [fecha, setFecha] = useState(getTodayDateString())
  const [observaciones, setObservaciones] = useState('')
  const [documentoId, setDocumentoId] = useState<string | null>(null)
  const [tieneDocumento, setTieneDocumento] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ==========================================
  // Handlers
  // ==========================================

  const handleConfirmar = async () => {
    if (!paso) return

    // Validar documento obligatorio
    if (paso.nivel_validacion === NivelValidacion.DOCUMENTO_OBLIGATORIO && !documentoId) {
      toast.error('Debes subir el documento antes de marcar como completado')
      return
    }

    setIsSubmitting(true)

    try {
      await onConfirmar({
        fecha_completado: fecha,
        documento_id: documentoId || undefined,
        observaciones: observaciones || undefined,
      })

      toast.success('Paso marcado como completado')
      handleClose()
    } catch (error) {
      logger.error('Error marcando paso:', error)
      toast.error('Error al marcar paso como completado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFecha(getTodayDateString())
    setObservaciones('')
    setDocumentoId(null)
    setTieneDocumento(false)
    onClose()
  }

  const handleDocumentoSubido = (docId: string) => {
    setDocumentoId(docId)
    toast.success('Documento subido correctamente')
  }

  // ==========================================
  // Render: No mostrar si no está abierto
  // ==========================================

  if (!isOpen || !paso) return null

  const esObligatorio = paso.nivel_validacion === NivelValidacion.DOCUMENTO_OBLIGATORIO
  const esOpcional = paso.nivel_validacion === NivelValidacion.DOCUMENTO_OPCIONAL
  const esSoloConfirmacion = paso.nivel_validacion === NivelValidacion.SOLO_CONFIRMACION

  // ==========================================
  // Render: Modal
  // ==========================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Marcar Paso como Completado
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Info del paso */}
          <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-cyan-900 dark:text-cyan-100">
                  {paso.titulo}
                </h3>
                <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                  {paso.descripcion}
                </p>
              </div>
            </div>

            {/* Badge de nivel de validación */}
            <div className="mt-3">
              {esObligatorio && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700">
                  <AlertCircle className="w-3 h-3" />
                  Documento OBLIGATORIO
                </span>
              )}
              {esOpcional && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                  <AlertCircle className="w-3 h-3" />
                  Documento opcional
                </span>
              )}
              {esSoloConfirmacion && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700">
                  <CheckCircle className="w-3 h-3" />
                  Solo confirmación
                </span>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                max={getTodayDateString()}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
                required
              />
            </div>

            {/* Documento - OBLIGATORIO */}
            {esObligatorio && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Documento <span className="text-red-500">*</span>
                </label>

                {!documentoId ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Arrastra el archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ⚠️ Debes subir el documento antes de marcar como completado
                    </p>
                    {/* TODO: Integrar DocumentoUploadCompact */}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="mt-3 text-sm"
                      onChange={(e) => {
                        // Simulación - integrar con DocumentoUploadCompact
                        if (e.target.files?.[0]) {
                          // Aquí iría la lógica de upload real
                          setTimeout(() => {
                            setDocumentoId('doc-id-simulado')
                            handleDocumentoSubido('doc-id-simulado')
                          }, 1000)
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="flex-1 text-sm text-green-900 dark:text-green-100 font-medium">
                      Documento adjunto
                    </span>
                    <button
                      onClick={() => setDocumentoId(null)}
                      className="p-1 hover:bg-green-200 dark:hover:bg-green-900/50 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-green-700 dark:text-green-300" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Documento - OPCIONAL */}
            {esOpcional && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Documento (Opcional)
                </label>

                {/* Checkbox: Tengo documento */}
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="tiene-doc"
                    checked={tieneDocumento}
                    onChange={(e) => setTieneDocumento(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="tiene-doc"
                    className="text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    Tengo el documento
                  </label>
                </div>

                {/* Upload si marcó que tiene */}
                {tieneDocumento && !documentoId && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="text-sm"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setTimeout(() => {
                            setDocumentoId('doc-id-opcional')
                            handleDocumentoSubido('doc-id-opcional')
                          }, 1000)
                        }
                      }}
                    />
                  </div>
                )}

                {documentoId && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="flex-1 text-sm text-green-900 dark:text-green-100 font-medium">
                      Documento adjunto
                    </span>
                    <button
                      onClick={() => {
                        setDocumentoId(null)
                        setTieneDocumento(false)
                      }}
                      className="p-1 hover:bg-green-200 dark:hover:bg-green-900/50 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-green-700 dark:text-green-300" />
                    </button>
                  </div>
                )}

                {/* Mensaje si no tiene documento */}
                {!tieneDocumento && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    ℹ️ Puedes marcar como completado sin documento. Si lo obtienes después, puedes agregarlo editando este paso.
                  </p>
                )}
              </div>
            )}

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Observaciones {!esObligatorio && '(Opcional)'}
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                placeholder={
                  esOpcional && !tieneDocumento
                    ? 'Ej: El banco no compartió el avalúo, pero confirmó valor de $115.000.000'
                    : 'Detalles adicionales sobre este paso...'
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={isSubmitting || (esObligatorio && !documentoId)}
            className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              documentoId || !esObligatorio
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              '✓ Marcar como Completado'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
