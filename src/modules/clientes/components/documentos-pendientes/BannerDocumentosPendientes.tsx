'use client'

/**
 * ============================================
 * BANNER: Documentos Pendientes (Cliente)
 * ============================================
 *
 * Muestra alerta con documentos que faltan por subir
 * vinculados a fuentes de pago sin carta de aprobación
 *
 * ✅ COMPONENTE PRESENTACIONAL
 * - Lógica en useBannerDocumentosPendientes hook
 * - Detección automática al subir documento
 * - Vinculación inteligente por metadata
 *
 * @version 1.0.0 - 2025-11-29
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Building2, CheckCircle2, ChevronDown, ChevronUp, FileText, Gift, Home, Upload } from 'lucide-react'
import { useState } from 'react'

import { useBannerDocumentosPendientes } from './useBannerDocumentosPendientes'

// ============================================
// TYPES
// ============================================

interface BannerDocumentosPendientesProps {
  clienteId: string
  onSubirDocumento?: (pendienteId: string, tipoDocumento: string, metadata: Record<string, any>) => void
}

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene el ícono apropiado según el tipo de fuente de pago
 */
const getIconoPorTipo = (tipoFuente?: string) => {
  if (!tipoFuente) return FileText

  switch (tipoFuente) {
    case 'Crédito Hipotecario':
      return Building2
    case 'Subsidio Caja Compensación':
      return Gift
    case 'Subsidio Mi Casa Ya':
      return Home
    default:
      return FileText
  }
}

// ============================================
// COMPONENTE
// ============================================

export function BannerDocumentosPendientes({
  clienteId,
  onSubirDocumento,
}: BannerDocumentosPendientesProps) {
  const { documentosPendientes, loading, refetch } = useBannerDocumentosPendientes(clienteId)
  const [expandido, setExpandido] = useState(true)

  if (loading || documentosPendientes.length === 0) {
    return null
  }

  const totalPendientes = documentosPendientes.length
  const hayAlta = documentosPendientes.some(d => d.prioridad === 'Alta')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="mb-4 overflow-hidden rounded-xl border-2 border-orange-200 dark:border-orange-800
                   bg-gradient-to-br from-orange-50 via-orange-50/80 to-amber-50
                   dark:from-orange-950/30 dark:via-orange-900/20 dark:to-amber-950/30
                   shadow-lg shadow-orange-500/10 dark:shadow-orange-500/5"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-100/50 to-amber-100/50 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: hayAlta ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: hayAlta ? Infinity : 0, duration: 2 }}
              className={`rounded-xl p-2.5 shadow-lg ${
                hayAlta
                  ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30'
                  : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30'
              }`}
            >
              <AlertCircle className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Documentos Pendientes
                </h3>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/30 animate-pulse">
                  {totalPendientes}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {hayAlta ? '⚠️ Requiere atención inmediata' : 'Completa la documentación de las fuentes de pago'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpandido(!expandido)}
            className="rounded-lg p-2 text-gray-500 hover:bg-white/70 dark:hover:bg-gray-800/70
                       transition-all hover:scale-110"
          >
            {expandido ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Lista de pendientes */}
        <AnimatePresence>
          {expandido && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-orange-200 dark:border-orange-800"
            >
              <div className="space-y-0 p-4">
                {documentosPendientes.map((doc, index) => {
                  const IconoDoc = getIconoPorTipo(doc.metadata.tipo_fuente)
                  const esAlta = doc.prioridad === 'Alta'

                  return (
                    <div key={doc.id}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 4, scale: 1.01 }}
                        className={`group flex items-start gap-3 rounded-lg p-3 backdrop-blur-sm
                                   transition-all duration-300 cursor-pointer
                                   bg-white/80 dark:bg-gray-800/80
                                   hover:bg-white dark:hover:bg-gray-800
                                   hover:shadow-lg
                                   border-l-2 hover:border-l-4
                                   ${esAlta
                                     ? 'border-red-500 hover:border-red-500 hover:shadow-red-500/20'
                                     : 'border-orange-500 hover:border-orange-500 hover:shadow-orange-500/20'
                                   }`}
                      >
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          className={`rounded-lg p-2 shadow-md transition-all ${
                            esAlta
                              ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30'
                              : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30'
                          }`}
                        >
                          <IconoDoc className="h-4 w-4 text-white" />
                        </motion.div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {doc.tipo_documento} {doc.metadata.tipo_fuente ? `- ${doc.metadata.tipo_fuente}` : ''}
                          </p>
                          {doc.metadata.entidad && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
                              {doc.metadata.entidad}
                            </p>
                          )}
                          {doc.fecha_limite && (
                            <motion.p
                              animate={{ opacity: [1, 0.6, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Vence: {new Date(doc.fecha_limite).toLocaleDateString('es-CO')}
                            </motion.p>
                          )}
                        </div>

                        {/* Action */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onSubirDocumento?.(doc.id, doc.tipo_documento, {
                            ...doc.metadata,
                            fuente_pago_id: doc.fuente_pago_id
                          })}
                          className="flex items-center gap-1.5 rounded-lg
                                     bg-gradient-to-r from-orange-500 to-orange-600
                                     hover:from-orange-600 hover:to-orange-700
                                     dark:from-orange-500 dark:to-orange-600
                                     dark:hover:from-orange-600 dark:hover:to-orange-700
                                     px-3 py-1.5 text-xs font-medium text-white
                                     transition-all duration-300
                                     shadow-lg shadow-orange-500/30
                                     hover:shadow-xl hover:shadow-orange-500/50"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Subir
                        </motion.button>
                      </motion.div>

                      {/* Separador con gradiente */}
                      {index < documentosPendientes.length - 1 && (
                        <div className="h-px my-2 bg-gradient-to-r from-transparent via-orange-300/30 dark:via-orange-700/30 to-transparent" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Info adicional */}
              <div className="border-t border-orange-200 dark:border-orange-800 p-3
                             bg-gradient-to-r from-orange-50/80 to-amber-50/80
                             dark:from-orange-950/40 dark:to-amber-950/40">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Los documentos se vincularán automáticamente al subirlos en la categoría "Cartas de Aprobación"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
