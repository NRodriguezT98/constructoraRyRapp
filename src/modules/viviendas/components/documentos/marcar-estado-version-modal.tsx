/**
 * @file marcar-estado-version-modal.tsx
 * @description Modal para marcar versiones como erróneas u obsoletas
 * @module viviendas/components/documentos
 */

'use client'

import { Button } from '@/components/ui/button'
import { MOTIVOS_VERSION_ERRONEA, MOTIVOS_VERSION_OBSOLETA } from '@/types/documento.types'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    AlertTriangle,
    Archive,
    CheckCircle,
    Clock,
    FileWarning,
    RefreshCw,
    X,
} from 'lucide-react'
import { useState } from 'react'
import { useEstadosVersion } from '../../hooks/useEstadosVersion'
import type { DocumentoVivienda } from '../../services/documentos-vivienda.service'

interface MarcarEstadoVersionModalProps {
  documento: DocumentoVivienda
  viviendaId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type TipoEstado = 'erronea' | 'obsoleta' | 'restaurar'

export function MarcarEstadoVersionModal({
  documento,
  viviendaId,
  isOpen,
  onClose,
  onSuccess,
}: MarcarEstadoVersionModalProps) {
  const [tipoEstado, setTipoEstado] = useState<TipoEstado>('erronea')
  const [motivoSeleccionado, setMotivoSeleccionado] = useState('')
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('')
  const [versionCorrectaId, setVersionCorrectaId] = useState('')

  const { marcarComoErronea, marcarComoObsoleta, restaurarEstado, isMarking } =
    useEstadosVersion(viviendaId)

  const handleSubmit = async () => {
    try {
      const motivoFinal =
        motivoSeleccionado === 'OTRO' ? motivoPersonalizado : motivoSeleccionado

      if (!motivoFinal.trim() && tipoEstado !== 'restaurar') {
        return
      }

      if (tipoEstado === 'erronea') {
        await marcarComoErronea.mutateAsync({
          documentoId: documento.id,
          motivo: motivoFinal,
          versionCorrectaId: versionCorrectaId || undefined,
        })
      } else if (tipoEstado === 'obsoleta') {
        await marcarComoObsoleta.mutateAsync({
          documentoId: documento.id,
          motivo: motivoFinal,
        })
      } else if (tipoEstado === 'restaurar') {
        await restaurarEstado.mutateAsync(documento.id)
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
    }
  }

  const motivos =
    tipoEstado === 'erronea' ? MOTIVOS_VERSION_ERRONEA : MOTIVOS_VERSION_OBSOLETA

  const estadoActual = documento.estado_version || 'valida'

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
          <div className="relative bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-yellow-800 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
              disabled={isMarking}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <FileWarning className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Cambiar Estado de Versión
                </h2>
                <p className="text-amber-100 dark:text-amber-200 text-sm mt-1">
                  {documento.titulo} - Versión {documento.version}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
            {/* Estado Actual */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Estado actual:
                </p>
                <div className="flex items-center gap-2">
                  {estadoActual === 'valida' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">Válida</span>
                    </>
                  )}
                  {estadoActual === 'erronea' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-red-600">Errónea</span>
                    </>
                  )}
                  {estadoActual === 'obsoleta' && (
                    <>
                      <Archive className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-600">Obsoleta</span>
                    </>
                  )}
                </div>
                {documento.motivo_estado && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {documento.motivo_estado}
                  </p>
                )}
              </div>
            </div>

            {/* Selector de Acción */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Seleccionar acción:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoEstado('erronea')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoEstado === 'erronea'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                  }`}
                >
                  <AlertCircle
                    className={`w-6 h-6 mx-auto mb-2 ${
                      tipoEstado === 'erronea' ? 'text-red-600' : 'text-gray-400'
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      tipoEstado === 'erronea'
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Marcar como Errónea
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoEstado('obsoleta')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoEstado === 'obsoleta'
                      ? 'border-gray-500 bg-gray-50 dark:bg-gray-800/50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Archive
                    className={`w-6 h-6 mx-auto mb-2 ${
                      tipoEstado === 'obsoleta' ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      tipoEstado === 'obsoleta'
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Marcar como Obsoleta
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoEstado('restaurar')}
                  disabled={estadoActual === 'valida'}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoEstado === 'restaurar'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <RefreshCw
                    className={`w-6 h-6 mx-auto mb-2 ${
                      tipoEstado === 'restaurar' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      tipoEstado === 'restaurar'
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Restaurar a Válida
                  </p>
                </button>
              </div>
            </div>

            {/* Formulario según tipo */}
            {tipoEstado !== 'restaurar' && (
              <>
                {/* Motivos Predefinidos */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Motivo:
                  </label>

                  <div className="space-y-2">
                    {Object.entries(motivos).map(([key, value]) => (
                      <label
                        key={key}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all"
                      >
                        <input
                          type="radio"
                          name="motivo"
                          value={value}
                          checked={motivoSeleccionado === value}
                          onChange={e => setMotivoSeleccionado(e.target.value)}
                          className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                          {value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Motivo Personalizado */}
                {motivoSeleccionado === 'Otro motivo (especificar en descripción)' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Especificar motivo:
                    </label>
                    <textarea
                      value={motivoPersonalizado}
                      onChange={e => setMotivoPersonalizado(e.target.value)}
                      placeholder="Describe el motivo específico..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                      rows={3}
                    />
                  </div>
                )}

                {/* Versión Correcta (solo para erróneas) */}
                {tipoEstado === 'erronea' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      ID de versión correcta (opcional):
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        Si existe una versión correcta que reemplaza a esta errónea, ingresa su
                        ID para vincularlas
                      </p>
                    </div>
                    <input
                      type="text"
                      value={versionCorrectaId}
                      onChange={e => setVersionCorrectaId(e.target.value)}
                      placeholder="UUID de la versión correcta"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                )}
              </>
            )}

            {/* Mensaje de Restauración */}
            {tipoEstado === 'restaurar' && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Restaurar versión a estado válido
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      Se eliminará el marcado de error u obsolescencia y la versión volverá a
                      considerarse válida.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isMarking}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isMarking ||
                (tipoEstado !== 'restaurar' && !motivoSeleccionado) ||
                (motivoSeleccionado === 'Otro motivo (especificar en descripción)' &&
                  !motivoPersonalizado.trim())
              }
              className="px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              {isMarking ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
