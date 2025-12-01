/**
 * ⚠️ Modal: Conflicto de Vivienda (Número Duplicado)
 *
 * Características:
 * - Comparación lado a lado (datos existentes vs nuevos)
 * - Opción 1: Editar vivienda inactiva (reutilizar)
 * - Opción 2: Cancelar y usar otro número
 * - Muestra detalles de inactivación
 * - Resalta diferencias en datos
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Calendar, Edit3, X, XCircle } from 'lucide-react'

// ============================================================
// TIPOS
// ============================================================

interface ConflictoViviendaModalProps {
  isOpen: boolean
  viviendaInactiva: {
    id: string
    numero: string
    matricula_inmobiliaria: string | null
    direccion: string | null
    estado: string
    fecha_inactivacion: string | null
    motivo_inactivacion: string | null
  }
  nuevosDatos: {
    numero: string
    matricula_inmobiliaria?: string
    direccion?: string
    area_lote?: number
    area_construida?: number
    valor_base?: number
  }
  onRedirigirAEdicion: (viviendaId: string) => void
  onCancelar: () => void
}

// ============================================================
// COMPONENTE
// ============================================================

export function ConflictoViviendaModal({
  isOpen,
  viviendaInactiva,
  nuevosDatos,
  onRedirigirAEdicion,
  onCancelar,
}: ConflictoViviendaModalProps) {
  if (!isOpen) return null

  const fechaInactivacion = viviendaInactiva.fecha_inactivacion
    ? new Date(viviendaInactiva.fecha_inactivacion).toLocaleDateString('es-CO')
    : 'Fecha desconocida'

  // Detectar diferencias
  const matriculaDiferente =
    viviendaInactiva.matricula_inmobiliaria !== nuevosDatos.matricula_inmobiliaria
  const direccionDiferente = viviendaInactiva.direccion !== nuevosDatos.direccion

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-6 py-4 bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    ⚠️ Vivienda #{nuevosDatos.numero} ya existe (Inactiva)
                  </h2>
                  <p className="text-yellow-100 text-sm">Decide cómo proceder</p>
                </div>
              </div>
              <button
                onClick={onCancelar}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Alerta principal */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border-2 border-yellow-300 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                    Ya existe una Vivienda #{viviendaInactiva.numero} en estado Inactiva
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    Puedes editar la vivienda inactiva con los nuevos datos o cancelar y usar otro
                    número.
                  </p>

                  <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Inactivada el: {fechaInactivacion}</span>
                  </div>

                  {viviendaInactiva.motivo_inactivacion && (
                    <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        <span className="font-semibold">Motivo: </span>
                        {viviendaInactiva.motivo_inactivacion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comparación de datos */}
            <div className="grid grid-cols-2 gap-4">
              {/* Columna izquierda: Datos existentes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Vivienda Existente (Inactiva)
                  </h3>
                </div>

                <div className="space-y-2 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Número:
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {viviendaInactiva.numero}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Matrícula:
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        matriculaDiferente
                          ? 'text-red-600 dark:text-red-400 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {viviendaInactiva.matricula_inmobiliaria || 'Sin matrícula'}
                      {matriculaDiferente && ' ❌'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Dirección:
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        direccionDiferente
                          ? 'text-red-600 dark:text-red-400 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {viviendaInactiva.direccion || 'Sin dirección'}
                      {direccionDiferente && ' ❌'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-red-300 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-300 font-semibold">
                      Estado: {viviendaInactiva.estado}
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna derecha: Nuevos datos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Nuevos Datos (correctos)
                  </h3>
                </div>

                <div className="space-y-2 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Número:
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {nuevosDatos.numero}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Matrícula:
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        matriculaDiferente
                          ? 'text-green-700 dark:text-green-300 font-bold'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {nuevosDatos.matricula_inmobiliaria || 'Sin matrícula'}
                      {matriculaDiferente && ' ✅'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Dirección:
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        direccionDiferente
                          ? 'text-green-700 dark:text-green-300 font-bold'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {nuevosDatos.direccion || 'Sin dirección'}
                      {direccionDiferente && ' ✅'}
                    </p>
                  </div>

                  {(nuevosDatos.area_lote || nuevosDatos.valor_base) && (
                    <div className="pt-2 border-t border-green-300 dark:border-green-800 space-y-1">
                      {nuevosDatos.area_lote && (
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Área lote: {nuevosDatos.area_lote} m²
                        </p>
                      )}
                      {nuevosDatos.valor_base && (
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Valor: ${nuevosDatos.valor_base.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Diferencias detectadas */}
            {(matriculaDiferente || direccionDiferente) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  📊 Diferencias detectadas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {matriculaDiferente && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md text-xs text-blue-700 dark:text-blue-300">
                      Matrícula diferente
                    </span>
                  )}
                  {direccionDiferente && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md text-xs text-blue-700 dark:text-blue-300">
                      Dirección diferente
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
            <button
              onClick={onCancelar}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancelar y usar otro número
            </button>

            <button
              onClick={() => onRedirigirAEdicion(viviendaInactiva.id)}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg shadow-lg transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Editar Vivienda Inactiva
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
