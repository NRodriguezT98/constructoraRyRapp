'use client'

import { Building2, CreditCard, Wallet } from 'lucide-react'

import type { FuentePagoConAbonos } from '../../types'

interface ModalHeaderProps {
  fuente: FuentePagoConAbonos
  esDesembolso: boolean
  montoAprobado: number
  saldoPendiente: number
  formatCurrency: (value: number) => string
}

export function ModalHeader({
  fuente,
  esDesembolso,
  montoAprobado,
  saldoPendiente,
  formatCurrency,
}: ModalHeaderProps) {
  return (
    <div className='relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-4'>
      <div className='relative z-10 flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
            <Wallet className='h-5 w-5 text-white' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='text-base font-bold text-white'>
                {esDesembolso ? 'Registrar Desembolso' : 'Registrar Abono'}
              </h2>
              {esDesembolso ? (
                <span className='rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white'>
                  Único
                </span>
              ) : null}
            </div>
            <p className='mt-0.5 text-xs text-white/80'>{fuente.tipo}</p>
          </div>
        </div>

        <div className='flex flex-col items-end gap-1'>
          {fuente.entidad ? (
            <div className='flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1'>
              <Building2 className='h-3 w-3 text-white/70' />
              <span className='text-xs font-medium text-white/90'>
                {fuente.entidad}
              </span>
            </div>
          ) : null}
          <div className='flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1'>
            <CreditCard className='h-3 w-3 text-white/70' />
            <span className='text-xs text-white/90'>
              Aprobado:{' '}
              <span className='font-semibold'>
                {formatCurrency(montoAprobado)}
              </span>
            </span>
          </div>
          <p className='text-xs text-white/70'>
            Pendiente:{' '}
            <span className='font-medium text-white'>
              {formatCurrency(saldoPendiente)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
