'use client'

/**
 * ============================================
 * BANNER DOCUMENTO REQUERIDO
 * ============================================
 *
 * Componente presentacional que muestra advertencia
 * cuando el cliente no tiene documento de identidad.
 *
 * RESPONSABILIDAD: Solo UI, recibe props, no tiene lógica
 */

import { motion } from 'framer-motion'
import { AlertTriangle, Upload } from 'lucide-react'

interface BannerDocumentoRequeridoProps {
  /** Callback cuando se hace click en el botón */
  onSubirDocumento: () => void

  /** Texto personalizado (opcional) */
  mensaje?: string
}

export function BannerDocumentoRequerido({
  onSubirDocumento,
  mensaje = 'Para asignar viviendas a este cliente, debes subir primero su cédula o documento de identidad oficial.'
}: BannerDocumentoRequeridoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xl border-2 border-amber-300 dark:border-amber-600"
    >
      <div className="flex items-start gap-4">
        {/* Icono animado */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">
            ⚠️ Documento de Identidad Requerido
          </h3>
          <p className="text-sm text-amber-50 mb-3">
            {mensaje}
          </p>

          {/* Botón de acción */}
          <button
            onClick={onSubirDocumento}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-amber-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            Subir Documento de Identidad Ahora
          </button>
        </div>
      </div>
    </motion.div>
  )
}
