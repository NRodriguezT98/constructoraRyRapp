'use client'

/**
 * ============================================
 * CHECKBOX DOCUMENTO IDENTIDAD
 * ============================================
 *
 * Componente reutilizable para marcar documento como identidad oficial.
 *
 * RESPONSABILIDAD: UI + estado local del checkbox, sin lógica de negocio
 */

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Shield } from 'lucide-react'

interface CheckboxDocumentoIdentidadProps {
  /** Estado del checkbox */
  checked: boolean

  /** Callback cuando cambia el estado */
  onChange: (checked: boolean) => void

  /** Deshabilitar checkbox */
  disabled?: boolean
}

export function CheckboxDocumentoIdentidad({
  checked,
  onChange,
  disabled = false
}: CheckboxDocumentoIdentidadProps) {
  return (
    <div className="relative">
      {/* Background animado cuando está marcado */}
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl"
          />
        )}
      </AnimatePresence>

      {/* Contenedor principal */}
      <div className="relative p-4 rounded-xl border-2 border-dashed border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">

          {/* Checkbox */}
          <div className="flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              id="es_documento_identidad"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-6 h-6 rounded border-amber-400 text-amber-600 focus:ring-amber-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Label y descripción */}
          <label
            htmlFor="es_documento_identidad"
            className={`flex-1 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {/* Título */}
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-base font-bold text-amber-900 dark:text-amber-100">
                ¿Este es el documento de identidad oficial del cliente?
              </span>
            </div>

            {/* Descripción */}
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Marca esta casilla si estás subiendo la cédula, pasaporte o documento de identidad.{' '}
              <span className="font-semibold">
                Este documento es obligatorio para asignar viviendas.
              </span>
            </p>

            {/* Confirmación visual cuando está marcado */}
            <AnimatePresence>
              {checked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pt-2 border-t border-amber-300 dark:border-amber-700"
                >
                  <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="font-medium">
                      Perfecto! Este documento será marcado como documento de identidad oficial.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </label>
        </div>
      </div>
    </div>
  )
}
