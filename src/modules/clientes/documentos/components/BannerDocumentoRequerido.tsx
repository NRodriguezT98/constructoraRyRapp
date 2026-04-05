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

  /**
   * 'bloqueante' (default): Cliente Interesado sin cédula — banner rojo, bloquea asignación de vivienda
   * 'advertencia': Cliente Activo con vivienda asignada pero sin cédula — banner ámbar suave, expediente incompleto
   */
  variant?: 'bloqueante' | 'advertencia'
}

export function BannerDocumentoRequerido({
  variant = 'bloqueante',
}: BannerDocumentoRequeridoProps) {
  if (variant === 'advertencia') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className='rounded-xl border border-amber-300 bg-amber-50 p-3.5 shadow-sm dark:border-amber-700/60 dark:bg-amber-900/20'
      >
        <div className='flex items-start gap-3'>
          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-800/50'>
            <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
          </div>
          <div className='flex-1'>
            <h4 className='mb-0.5 text-sm font-semibold text-amber-900 dark:text-amber-200'>
              Documento de identidad pendiente
            </h4>
            <p className='text-xs leading-relaxed text-amber-800 dark:text-amber-300'>
              El expediente de este cliente está incompleto. Sube la cédula o
              pasaporte usando el botón{' '}
              <strong>&quot;Subir Cédula/Pasaporte&quot;</strong> en la esquina
              superior para mantener el registro actualizado.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='rounded-xl border-2 border-orange-500 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-4 text-white shadow-xl dark:border-orange-700'
    >
      <div className='flex items-start gap-3'>
        {/* Icono animado con glassmorphism */}
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
          <AlertTriangle className='h-5 w-5 animate-pulse text-white' />
        </div>

        {/* Contenido */}
        <div className='flex-1'>
          <h3 className='mb-1.5 text-base font-bold'>
            📋 Documento de Identidad Requerido
          </h3>
          <p className='mb-3 text-sm leading-relaxed text-white/95'>
            Para poder asignar una vivienda a este cliente, primero debes subir
            su cédula o documento de identidad.
          </p>

          {/* Pasos ordenados */}
          <div className='space-y-2'>
            {/* Paso 1 */}
            <div className='flex items-start gap-2'>
              <span className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-orange-600'>
                1
              </span>
              <div className='flex flex-1 items-center gap-2'>
                <ArrowUpRight className='h-3.5 w-3.5 flex-shrink-0 text-white' />
                <p className='text-xs font-medium text-white'>
                  Presiona el botón naranja{' '}
                  <span className='rounded bg-white px-1.5 py-0.5 font-bold text-orange-600'>
                    📄 Subir Cédula/Pasaporte
                  </span>{' '}
                  en la esquina superior
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className='flex items-start gap-2'>
              <span className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-orange-600'>
                2
              </span>
              <p className='flex-1 text-xs font-medium text-white'>
                Selecciona el archivo escaneado, completa el formulario y
                presiona <strong>&quot;Subir documento&quot;</strong>
              </p>
            </div>

            {/* Paso 3 */}
            <div className='flex items-start gap-2'>
              <span className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white'>
                ✓
              </span>
              <p className='flex-1 text-xs font-medium text-white'>
                ¡Listo! El botón <strong>&quot;Asignar Vivienda&quot;</strong>{' '}
                del header se habilitará automáticamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
