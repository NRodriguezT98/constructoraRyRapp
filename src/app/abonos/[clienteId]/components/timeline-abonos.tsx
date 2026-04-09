'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Hash,
  MessageSquare,
  Receipt,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { AbonoHistorial } from '@/modules/abonos/types'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'

interface TimelineAbonosProps {
  abonos: AbonoHistorial[]
  loading: boolean
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

export function TimelineAbonos({ abonos, loading }: TimelineAbonosProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map(i => (
          <div key={i} className='flex items-start gap-3'>
            <div className='h-10 w-10 flex-shrink-0 animate-pulse rounded-xl bg-gray-200 dark:bg-white/[0.06]' />
            <div className='flex-1 animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.06]'>
              <div className='mb-2 h-3 w-24 rounded bg-gray-200 dark:bg-white/10' />
              <div className='h-4 w-32 rounded bg-gray-200 dark:bg-white/10' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!abonos || abonos.length === 0) {
    return (
      <div className='rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none'>
        <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5'>
          <Receipt className='h-6 w-6 text-gray-300 dark:text-white/20' />
        </div>
        <p className='text-sm font-medium text-gray-400 dark:text-white/40'>
          No hay abonos activos registrados
        </p>
        <p className='mt-1 text-xs text-gray-300 dark:text-white/20'>
          Los abonos aparecerán aquí una vez registrados
        </p>
      </div>
    )
  }

  return (
    <div className='relative'>
      {/* Línea vertical de timeline */}
      <div
        className='absolute bottom-5 left-[19px] top-5 w-px'
        style={{
          background:
            'linear-gradient(to bottom, rgba(16,185,129,0.5), rgba(255,255,255,0.08), transparent)',
        }}
      />

      <div className='space-y-3'>
        {abonos.map((abono, i) => {
          const isExpanded = expandedId === abono.id
          const hasDetails =
            abono.numero_referencia ||
            abono.comprobante_url ||
            abono.notas ||
            abono.usuario_registro

          return (
            <motion.div
              key={abono.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className='flex items-start gap-3'
            >
              {/* Nodo */}
              <div className='relative z-10 flex-shrink-0'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-900/40 ring-2 ring-white dark:ring-gray-950'>
                  <Receipt className='h-4 w-4 text-white' />
                </div>
              </div>

              {/* Card */}
              <div
                className={`dark:border-white/8 min-w-0 flex-1 overflow-hidden rounded-2xl border bg-white shadow-sm backdrop-blur transition-colors dark:bg-white/[0.06] dark:shadow-none ${
                  isExpanded
                    ? 'border-emerald-200 dark:border-emerald-500/30'
                    : 'border-gray-200'
                } ${hasDetails ? 'cursor-pointer' : ''}`}
                onClick={() =>
                  hasDetails && setExpandedId(isExpanded ? null : abono.id)
                }
              >
                {/* Fila principal */}
                <div className='flex items-start justify-between gap-2 px-4 py-3'>
                  {/* Left: recibo + fuente + fecha */}
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      {abono.numero_recibo && (
                        <span className='inline-flex items-center rounded-md border border-emerald-300 bg-emerald-100 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300'>
                          {formatearNumeroRecibo(abono.numero_recibo)}
                        </span>
                      )}
                      {abono.fuente_tipo && (
                        <span className='truncate text-xs font-semibold text-gray-700 dark:text-white/80'>
                          {abono.fuente_tipo}
                        </span>
                      )}
                    </div>
                    <div className='mt-1 flex items-center gap-2 text-[11px] text-gray-400 dark:text-white/35'>
                      <span>{formatDateCompact(abono.fecha_abono)}</span>
                      <span>·</span>
                      <span>{abono.metodo_pago}</span>
                      {abono.numero_referencia && (
                        <>
                          <span>·</span>
                          <span className='flex items-center gap-1'>
                            <Hash className='h-2.5 w-2.5' />
                            {abono.numero_referencia}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: monto + chevron */}
                  <div className='flex flex-shrink-0 items-center gap-2'>
                    <span className='whitespace-nowrap text-base font-extrabold text-emerald-600 dark:text-emerald-300'>
                      {formatCurrency(abono.monto)}
                    </span>
                    {hasDetails && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className='h-4 w-4 text-gray-400 dark:text-white/30' />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Panel expandible */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key='detail'
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className='space-y-2 border-t border-gray-100 px-4 py-3 dark:border-white/[0.06]'>
                        {/* Notas */}
                        {abono.notas && (
                          <div className='flex items-start gap-2'>
                            <MessageSquare className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-white/30' />
                            <p className='text-xs italic text-gray-500 dark:text-white/40'>
                              &quot;{abono.notas}&quot;
                            </p>
                          </div>
                        )}

                        {/* Registrado por */}
                        {abono.usuario_registro && (
                          <p className='text-[11px] text-gray-400 dark:text-white/25'>
                            Registrado por:{' '}
                            <span className='font-medium text-gray-500 dark:text-white/40'>
                              {abono.usuario_registro}
                            </span>
                          </p>
                        )}

                        {/* Comprobante */}
                        {abono.comprobante_url ? (
                          <a
                            href={`/api/abonos/comprobante?path=${encodeURIComponent(abono.comprobante_url)}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={e => e.stopPropagation()}
                            className='inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20'
                          >
                            <FileText className='h-3.5 w-3.5' />
                            Ver comprobante
                            <ExternalLink className='h-3 w-3 opacity-60' />
                          </a>
                        ) : (
                          <p className='text-[11px] text-gray-300 dark:text-white/20'>
                            Sin comprobante adjunto
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
