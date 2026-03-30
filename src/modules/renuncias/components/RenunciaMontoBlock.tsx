/**
 * RenunciaMontoBlock — Sub-componente del bloque de monto
 * Extraído de RenunciaCard para cumplir límite de 150 líneas
 */

import { DollarSign } from 'lucide-react'

import { formatCOP } from '../utils/renuncias.utils'

import { renunciaCardStyles as s } from './RenunciaCard.styles'

interface RenunciaMontoBlockProps {
  esPendiente: boolean
  esCerrada: boolean
  montoADevolver: number
  metodoDevolucion?: string | null
  requiereDevolucion: boolean
  retencionMonto: number
  retencionMotivo?: string | null
}

export function RenunciaMontoBlock({
  esPendiente,
  esCerrada,
  montoADevolver,
  metodoDevolucion,
  requiereDevolucion,
  retencionMonto,
  retencionMotivo,
}: RenunciaMontoBlockProps) {
  return (
    <div
      className={
        esPendiente ? s.montoContainerPendiente : s.montoContainerCerrada
      }
    >
      <div className='flex items-center justify-between gap-2'>
        <div>
          <p
            className={
              esPendiente ? s.montoLabelPendiente : s.montoLabelCerrada
            }
          >
            <DollarSign className='-mt-0.5 inline h-3 w-3' />
            {esPendiente ? 'Monto a devolver' : 'Monto devuelto'}
          </p>
          <p
            className={
              esPendiente ? s.montoValorPendiente : s.montoValorCerrada
            }
          >
            {formatCOP(montoADevolver)}
          </p>
        </div>
        <div className='shrink-0 text-right'>
          {esCerrada && metodoDevolucion ? (
            <span className={s.metodoBadge}>{metodoDevolucion}</span>
          ) : null}
          {esPendiente && !requiereDevolucion ? (
            <span className={s.sinDevolucion}>Sin devolución requerida</span>
          ) : null}
        </div>
      </div>
      {retencionMonto > 0 ? (
        <p className={s.retencionLine}>
          Retención: {formatCOP(retencionMonto)}
          {retencionMotivo ? ` — ${retencionMotivo}` : ''}
        </p>
      ) : null}
    </div>
  )
}
