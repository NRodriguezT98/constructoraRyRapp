'use client'

/**
 * 🎨 MODAL DE MARCAR ESTADO DE VERSIÓN - PRESENTACIONAL
 *
 * Componente PURO sin lógica de negocio
 * Toda la lógica está en: useMarcarEstadoVersion hook
 */

import { useMarcarEstadoVersion } from '@/modules/documentos/hooks/useMarcarEstadoVersion'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'

// ============================================================================
// TYPES
// ============================================================================

export type AccionEstado = 'erronea' | 'obsoleta' | 'restaurar'

export interface MarcarEstadoVersionModalProps {
  isOpen: boolean
  documentoId: string
  proyectoId: string
  documentoPadreId?: string // ✅ ID del documento padre para invalidar query
  accion: AccionEstado
  versionActual?: number
  versionesDisponibles?: Array<{ id: string; version: number; titulo: string }>
  onClose: () => void
  onSuccess?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MarcarEstadoVersionModal({
  isOpen,
  documentoId,
  proyectoId,
  documentoPadreId,
  accion,
  versionActual,
  versionesDisponibles = [],
  onClose,
  onSuccess,
}: MarcarEstadoVersionModalProps) {
  // ✅ HOOK CON TODA LA LÓGICA
  const {
    motivo,
    setMotivo,
    versionCorrectaId,
    setVersionCorrectaId,
    motivoPersonalizado,
    config,
    isPending,
    isValid,
    handleSubmit,
    handleClose,
    handleSelectMotivo,
    handleActivarMotivoPersonalizado,
    handleVolverMotivosPredef,
  } = useMarcarEstadoVersion({
    documentoId,
    proyectoId,
    documentoPadreId, // ✅ Pasar ID del documento padre
    accion,
    onSuccess,
    onClose,
  })

  const Icon = config.icon

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <div
        key="modal-estado-version"
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${config.gradient} px-6 py-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{config.titulo}</h3>
                {versionActual && (
                  <p className="text-xs text-white/90">Versión {versionActual}</p>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Descripción */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {config.descripcion}
            </p>

            {/* Motivo (solo para errónea y obsoleta) */}
            {accion !== 'restaurar' && (
              <div>
                <label
                  htmlFor="motivo"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Motivo *
                </label>

                {/* Motivos predefinidos */}
                {config.motivosPredef.length > 0 && !motivoPersonalizado && (
                  <div className="space-y-2 mb-3">
                    {config.motivosPredef.map((motivoPredef) => (
                      <button
                        key={motivoPredef}
                        onClick={() => handleSelectMotivo(motivoPredef)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition-all text-sm ${
                          motivo === motivoPredef
                            ? `border-${config.color}-500 bg-${config.color}-50 dark:bg-${config.color}-950/30`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {motivoPredef}
                      </button>
                    ))}
                    <button
                      onClick={handleActivarMotivoPersonalizado}
                      className="w-full text-left px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm text-gray-600 dark:text-gray-400"
                    >
                      ✍️ Escribir motivo personalizado...
                    </button>
                  </div>
                )}

                {/* Campo de texto (si eligió personalizado o no hay predefinidos) */}
                {(motivoPersonalizado || config.motivosPredef.length === 0) && (
                  <div>
                    <textarea
                      id="motivo"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Describe el motivo..."
                      rows={3}
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-600"
                      autoFocus
                    />
                    {motivoPersonalizado && (
                      <button
                        onClick={handleVolverMotivosPredef}
                        className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        ← Volver a motivos predefinidos
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Versión correcta (solo para errónea) */}
            {accion === 'erronea' && versionesDisponibles.length > 0 && (
              <div>
                <label
                  htmlFor="version-correcta"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Versión correcta (opcional)
                </label>
                <select
                  id="version-correcta"
                  value={versionCorrectaId}
                  onChange={(e) => setVersionCorrectaId(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white dark:focus:border-blue-600"
                >
                  <option value="">-- Ninguna --</option>
                  {versionesDisponibles
                    .filter(v => v.id !== documentoId) // No mostrar la versión actual
                    .map((version) => (
                      <option key={version.id} value={version.id}>
                        Versión {version.version} - {version.titulo}
                      </option>
                    ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Selecciona la versión que corrige este error
                </p>
              </div>
            )}

            {/* Alert de confirmación para restaurar */}
            {accion === 'restaurar' && (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">
                      ¿Confirmar restauración?
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      La versión volverá a estado "Válida" y se eliminarán las
                      marcas de error u obsolescencia
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !isValid}
                className={`flex-1 rounded-lg bg-gradient-to-r ${config.gradient} px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
