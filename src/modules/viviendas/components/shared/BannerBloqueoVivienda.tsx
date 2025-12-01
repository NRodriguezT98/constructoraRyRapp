/**
 * 🔒 Banner: Bloqueo de Edición de Vivienda
 *
 * Características:
 * - Muestra estado de bloqueo de la vivienda
 * - Lista campos editables/restringidos/bloqueados
 * - Información de negociación bloqueante
 * - Diseño compacto y claro
 * - Responsivo con collapse opcional
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Lock, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { EstadoBloqueoVivienda } from '../../services/viviendas-validacion.service'

// ============================================================
// TIPOS
// ============================================================

interface BannerBloqueoViviendaProps {
  estadoBloqueo: EstadoBloqueoVivienda
  className?: string
}

// ============================================================
// COMPONENTE
// ============================================================

export function BannerBloqueoVivienda({ estadoBloqueo, className = '' }: BannerBloqueoViviendaProps) {
  const [expandido, setExpandido] = useState(true)

  // Si no está bloqueada y no tiene restricciones, no mostrar nada
  if (!estadoBloqueo.bloqueadaCompletamente && estadoBloqueo.camposRestringidos.length === 0) {
    return null
  }

  const labelsCampos: Record<string, string> = {
    matricula_inmobiliaria: 'Matrícula Inmobiliaria',
    direccion: 'Dirección',
    area_lote: 'Área de Lote',
    area_construida: 'Área Construida',
    valor_base: 'Valor Base',
    descripcion: 'Descripción',
    numero: 'Número',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-xl border-2 ${
        estadoBloqueo.bloqueadaCompletamente
          ? 'bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-800'
          : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400 dark:border-yellow-700'
      } ${className}`}
    >
      {/* Header (siempre visible) */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {estadoBloqueo.bloqueadaCompletamente ? (
            <Lock className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          )}
          <div className="text-left">
            <h3
              className={`text-sm font-bold ${
                estadoBloqueo.bloqueadaCompletamente
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-yellow-900 dark:text-yellow-100'
              }`}
            >
              {estadoBloqueo.bloqueadaCompletamente
                ? '🔒 Vivienda Bloqueada - Datos Legales Congelados'
                : '⚠️ Vivienda con Restricciones de Edición'}
            </h3>
            <p
              className={`text-xs ${
                estadoBloqueo.bloqueadaCompletamente
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}
            >
              {estadoBloqueo.razonBloqueo}
            </p>
          </div>
        </div>
        {expandido ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Contenido expandible */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={`px-4 pb-4 space-y-3 border-t ${
                estadoBloqueo.bloqueadaCompletamente
                  ? 'border-red-300 dark:border-red-800'
                  : 'border-yellow-300 dark:border-yellow-800'
              }`}
            >
              {/* Información de negociación */}
              {estadoBloqueo.negociacionBloqueante && (
                <div
                  className={`p-3 rounded-lg ${
                    estadoBloqueo.bloqueadaCompletamente
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold ${
                      estadoBloqueo.bloqueadaCompletamente
                        ? 'text-red-900 dark:text-red-100'
                        : 'text-yellow-900 dark:text-yellow-100'
                    } mb-1`}
                  >
                    Negociación activa:
                  </p>
                  <p
                    className={`text-xs ${
                      estadoBloqueo.bloqueadaCompletamente
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    Cliente: {estadoBloqueo.negociacionBloqueante.cliente_nombre}
                  </p>
                  <p
                    className={`text-xs ${
                      estadoBloqueo.bloqueadaCompletamente
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    Estado: {estadoBloqueo.negociacionBloqueante.estado}
                  </p>
                  {estadoBloqueo.negociacionBloqueante.fecha_firma_minuta && (
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        estadoBloqueo.bloqueadaCompletamente
                          ? 'text-red-900 dark:text-red-100'
                          : 'text-yellow-900 dark:text-yellow-100'
                      }`}
                    >
                      📝 Minuta firmada:{' '}
                      {new Date(
                        estadoBloqueo.negociacionBloqueante.fecha_firma_minuta
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Campos bloqueados */}
              {estadoBloqueo.camposBloqueados.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <p className="text-xs font-semibold text-red-900 dark:text-red-100">
                      Campos BLOQUEADOS (no editables):
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {estadoBloqueo.camposBloqueados.map((campo) => (
                      <div
                        key={campo}
                        className="px-2 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-md text-xs text-red-900 dark:text-red-100 flex items-center gap-1.5"
                      >
                        <XCircle className="w-3 h-3 flex-shrink-0" />
                        {labelsCampos[campo] || campo}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Campos restringidos */}
              {estadoBloqueo.camposRestringidos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">
                      Campos RESTRINGIDOS (requieren Admin + motivo):
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {estadoBloqueo.camposRestringidos.map((campo) => (
                      <div
                        key={campo}
                        className="px-2 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-md text-xs text-yellow-900 dark:text-yellow-100 flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        {labelsCampos[campo] || campo}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Campos editables */}
              {estadoBloqueo.camposEditables.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs font-semibold text-green-900 dark:text-green-100">
                      Campos EDITABLES:
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {estadoBloqueo.camposEditables.map((campo) => (
                      <div
                        key={campo}
                        className="px-2 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-md text-xs text-green-900 dark:text-green-100 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                        {labelsCampos[campo] || campo}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
