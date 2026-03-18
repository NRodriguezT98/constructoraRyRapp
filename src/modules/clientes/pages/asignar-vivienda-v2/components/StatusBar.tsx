'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

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
          <div className={s.statusBar.valueWrapper}>
            <span className={s.statusBar.valueLabel}>Paso 1 de 3</span>
            <span className={s.statusBar.valueAmount}>Vivienda y Valores</span>
          </div>
        ) : (
          <div className={s.statusBar.valueWrapper}>
            <span className={s.statusBar.valueLabel}>Cubierto</span>
            <span className={s.statusBar.valueAmount}>
              {formatCurrency(totalCubierto)}
              {valorTotal > 0 && (
                <span className='text-muted-foreground font-normal text-sm ml-1'>
                  / {formatCurrency(valorTotal)}
                </span>
              )}
            </span>
          </div>
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
            {cargando ? (
              <span className={s.spinner} />
            ) : (
              <>
                Continuar
                <ArrowRight className='h-4 w-4' />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
