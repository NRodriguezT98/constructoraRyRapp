/**
 * ============================================
 * COMPONENTE: Selector de Tipo de Fuente
 * ============================================
 * Selector compacto horizontal con botones tipo pill.
 * Componente PRESENTACIONAL puro.
 * ✅ DINÁMICO: Usa tipos desde BD (no hardcoded)
 * ✅ Pestaña "Compartidos" siempre primera
 */

'use client'

import { motion } from 'framer-motion'
import { Share2 } from 'lucide-react'

import { requisitosConfigStyles as styles } from '../styles/requisitos-config.styles'

export const COMPARTIDOS_TAB = '__COMPARTIDOS__'

interface TipoFuente {
  value: string
  label: string
  cantidad?: number
}

interface RequisitosTipoSelectorProps {
  tipoSeleccionado: string
  onCambiarTipo: (tipo: string) => void
  conteos?: Record<string, number>
  conteoCompartidos?: number
  tiposFuente: TipoFuente[] // ✅ Dinámico desde BD
}

export function RequisitosTipoSelector({
  tipoSeleccionado,
  onCambiarTipo,
  conteos = {},
  conteoCompartidos = 0,
  tiposFuente,
}: RequisitosTipoSelectorProps) {
  const isCompartidosActive = tipoSeleccionado === COMPARTIDOS_TAB

  return (
    <div className={styles.selector.container}>
      <label className={styles.selector.label}>Tipo de Fuente de Pago:</label>

      <div className={styles.selector.grid}>
        {/* ── Pestaña especial: Requisitos Compartidos (siempre primera) ── */}
        <motion.button
          onClick={() => onCambiarTipo(COMPARTIDOS_TAB)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className={`${styles.selector.button} inline-flex items-center gap-1.5 ${
            isCompartidosActive
              ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
              : styles.selector.buttonInactive
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartidos</span>
          {conteoCompartidos > 0 && (
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isCompartidosActive
                  ? 'bg-white/30 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {conteoCompartidos}
            </span>
          )}
        </motion.button>

        {/* ── Divisor visual ── */}
        <div className="w-px h-7 bg-gray-300 dark:bg-gray-600 self-center" />

        {/* ── Pestañas de fuentes específicas ── */}
        {tiposFuente.map(({ value, label }, index) => {
          const isActive = tipoSeleccionado === value
          const count = conteos[value] || 0

          return (
            <motion.button
              key={value}
              onClick={() => onCambiarTipo(value)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (index + 1) * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`${styles.selector.button} ${
                isActive ? styles.selector.buttonActive : styles.selector.buttonInactive
              }`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/30 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
