/**
 * 🔄 Modal: Reactivar Vivienda
 *
 * Características:
 * - Validación automática (proyecto activo, número duplicado)
 * - Campo de motivo obligatorio (mínimo 30 caracteres)
 * - Muestra conflictos si existen
 * - Solo Admin puede ejecutar
 * - Confirmación con checkbox
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, RefreshCw, X, XCircle } from 'lucide-react'
import { useReactivarViviendaModal } from '../../hooks/useReactivarViviendaModal'

// ============================================================
// TIPOS
// ============================================================

interface ReactivarViviendaModalProps {
  isOpen: boolean
  viviendaId: string
  viviendaNumero: string
  onClose: () => void
  onSuccess: () => void
}

// ============================================================
// COMPONENTE
// ============================================================

export function ReactivarViviendaModal({
  isOpen,
  viviendaId,
  viviendaNumero,
  onClose,
  onSuccess,
}: ReactivarViviendaModalProps) {
  // ✅ TODA la lógica delegada al hook personalizado
  const {
    motivo,
    confirmado,
    validacion,
    validando,
    procesando,
    error,
    motivoValido,
    caracteresRestantes,
    puedeReactivar,
    setMotivo,
    setConfirmado,
    handleReactivar,
  } = useReactivarViviendaModal({ isOpen, viviendaId, onSuccess, onClose })

  const MOTIVO_MINIMO = 30

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-6 py-4 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Reactivar Vivienda</h2>
                  <p className="text-green-100 text-sm">Vivienda #{viviendaNumero}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Estado de validación */}
            {validando && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  🔍 Validando vivienda...
                </p>
              </div>
            )}

            {/* Resultado validación - NO puede reactivar */}
            {validacion && !validacion.puedeReactivar && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border-2 border-red-300 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-900 dark:text-red-100 mb-2">
                      ⛔ No se puede reactivar esta vivienda
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-3">{validacion.razon}</p>

                    {validacion.conflictos && (
                      <div className="space-y-2 mt-3 pt-3 border-t border-red-300 dark:border-red-800">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                          Conflictos detectados:
                        </p>

                        {validacion.conflictos.proyectoInactivo && (
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <p className="text-sm text-red-900 dark:text-red-100">
                              🏗️ El proyecto asociado está inactivo o no está en proceso
                            </p>
                          </div>
                        )}

                        {validacion.conflictos.viviendaDuplicada && (
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <p className="text-sm text-red-900 dark:text-red-100">
                              🏠 Ya existe una vivienda activa con el número {viviendaNumero}
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                              Estado: {validacion.conflictos.viviendaDuplicada.estado}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Resultado validación - SÍ puede reactivar */}
            {validacion && validacion.puedeReactivar && (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-green-900 dark:text-green-100 mb-1">
                        ✅ Vivienda puede ser reactivada
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        No hay conflictos de número duplicado y el proyecto está activo
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campo de motivo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Motivo de reactivación <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Explica por qué se reactiva esta vivienda (mínimo 30 caracteres)..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {motivoValido ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          ✓ Motivo válido
                        </span>
                      ) : (
                        <span>
                          Faltan{' '}
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {caracteresRestantes}
                          </span>{' '}
                          caracteres
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {motivo.length} / {MOTIVO_MINIMO}
                    </p>
                  </div>
                </div>

                {/* Checkbox confirmación */}
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmado}
                      onChange={(e) => setConfirmado(e.target.checked)}
                      className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-sm text-green-900 dark:text-green-100">
                      Confirmo que deseo reactivar la Vivienda #{viviendaNumero}. Su estado
                      cambiará a "Disponible" y volverá a estar visible en el listado principal.
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-900 dark:text-red-100">❌ {error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={procesando}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            {validacion?.puedeReactivar && (
              <button
                onClick={handleReactivar}
                disabled={!puedeReactivar}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {procesando ? 'Reactivando...' : 'Reactivar Vivienda'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
