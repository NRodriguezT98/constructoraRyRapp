'use client'

/**
 * ============================================
 * BANNER DOCUMENTO REQUERIDO (PREMIUM)
 * ============================================
 *
 * Banner moderno que informa sobre el requisito
 * y guía al usuario hacia el botón del header.
 *
 * DISEÑO: Gradiente vibrante + glassmorphism + indicador visual
 */

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowUpRight } from 'lucide-react'

interface BannerDocumentoRequeridoProps {
  /** Ya no se usa, mantenido por compatibilidad */
  onSubirDocumento?: () => void

  /** Texto personalizado (opcional) */
  mensaje?: string
}

export function BannerDocumentoRequerido({
  mensaje = 'Para poder asignar una vivienda a este cliente, primero debes subir su cédula o documento de identidad.'
}: BannerDocumentoRequeridoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white shadow-xl border-2 border-orange-500 dark:border-orange-700"
    >
      <div className="flex items-start gap-3">
        {/* Icono animado con glassmorphism */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <h3 className="text-base font-bold mb-1.5">
            📋 Documento de Identidad Requerido
          </h3>
          <p className="text-sm text-white/95 leading-relaxed mb-3">
            {mensaje}
          </p>

          {/* Pasos ordenados */}
          <div className="space-y-2">
            {/* Paso 1 */}
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white text-orange-600 text-[10px] font-bold flex items-center justify-center">1</span>
              <div className="flex-1 flex items-center gap-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <p className="text-xs text-white font-medium">
                  Presiona el botón naranja <span className="px-1.5 py-0.5 rounded bg-white text-orange-600 font-bold">📄 Subir Cédula/Pasaporte</span> en la esquina superior
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white text-orange-600 text-[10px] font-bold flex items-center justify-center">2</span>
              <p className="text-xs text-white font-medium flex-1">
                Selecciona el archivo escaneado, completa el formulario y presiona <strong>"Subir documento"</strong>
              </p>
            </div>

            {/* Paso 3 */}
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">✓</span>
              <p className="text-xs text-white font-medium flex-1">
                ¡Listo! El botón <strong>"Asignar Vivienda"</strong> del header se habilitará automáticamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
