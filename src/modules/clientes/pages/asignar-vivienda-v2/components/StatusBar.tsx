'use client'

import { motion } from 'framer-motion'

import { formatCurrency } from '@/lib/utils/format.utils'

import { styles as s } from '../styles'

interface StatusBarProps {
  paso: 1 | 2 | 3
  valorTotal: number
  totalCubierto: number // solo relevante en paso 2
  onContinuar: () => void
  onCancelar: () => void
  cargando?: boolean
}

export function StatusBar({
  paso,
  valorTotal,
  totalCubierto,
  onContinuar,
  onCancelar,
  cargando,
}: StatusBarProps) {
  if (paso === 3) return null

  const pct =
    valorTotal > 0 ? Math.min(100, (totalCubierto / valorTotal) * 100) : 0

  return (
    <div className={s.statusBar.wrapper}>
      {/* Barra de progreso — solo en paso 2 */}
      {paso === 2 && (
        <div className={s.statusBar.progressTrack}>
          <motion.div
            className={s.statusBar.progressFill}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className={s.statusBar.inner}>
        {paso === 1 ? (
          <span className={s.statusBar.text}>
            Selecciona el proyecto y la vivienda
          </span>
        ) : (
          <span className={s.statusBar.text}>
            {formatCurrency(totalCubierto)} cubierto de{' '}
            {formatCurrency(valorTotal)}
          </span>
        )}

        <div className='flex items-center gap-3'>
          <button
            onClick={onCancelar}
            className={s.statusBar.cancelBtn}
            type='button'
          >
            Cancelar
          </button>
          <button
            onClick={onContinuar}
            disabled={cargando}
            className={s.statusBar.continueBtn}
            type='button'
          >
            {cargando ? <span className={s.spinner} /> : <>Continuar →</>}
          </button>
        </div>
      </div>
    </div>
  )
}
