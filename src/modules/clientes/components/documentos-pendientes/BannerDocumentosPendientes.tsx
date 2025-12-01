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
import { AlertCircle, CheckCircle2, FileText, Upload, X } from 'lucide-react'
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4 overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:border-orange-800 dark:from-orange-950/30 dark:to-amber-950/30 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${hayAlta ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
              <AlertCircle className={`h-5 w-5 ${hayAlta ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Documentos Pendientes ({totalPendientes})
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {hayAlta ? 'Requiere atención inmediata' : 'Completa la documentación de las fuentes de pago'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpandido(!expandido)}
            className="rounded-lg p-2 text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            {expandido ? (
              <X className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
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
              className="border-t border-orange-200 dark:border-orange-800"
            >
              <div className="space-y-2 p-4">
                {documentosPendientes.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 rounded-lg bg-white/60 dark:bg-gray-800/60 p-3 backdrop-blur-sm border border-orange-100 dark:border-orange-900"
                  >
                    {/* Icon */}
                    <div className={`rounded-lg p-2 ${
                      doc.prioridad === 'Alta'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      <FileText className={`h-4 w-4 ${
                        doc.prioridad === 'Alta'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {doc.tipo_documento}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Requerido para: <span className="font-medium">{doc.metadata.tipo_fuente}</span>
                        {doc.metadata.entidad && ` - ${doc.metadata.entidad}`}
                      </p>
                      {doc.fecha_limite && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Fecha límite: {new Date(doc.fecha_limite).toLocaleDateString('es-CO')}
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => onSubirDocumento?.(doc.id, doc.tipo_documento, {
                        ...doc.metadata,
                        fuente_pago_id: doc.fuente_pago_id // ✅ Pasar ID de fuente
                      })}
                      className="flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors shadow-sm"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Subir
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Info adicional */}
              <div className="border-t border-orange-200 dark:border-orange-800 p-3 bg-orange-50/50 dark:bg-orange-950/20">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
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
