'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Receipt } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { AbonoHistorial } from '@/modules/abonos/types'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'

interface TimelineAbonosProps {
  abonos: AbonoHistorial[]
  loading: boolean
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

export function TimelineAbonos({ abonos, loading }: TimelineAbonosProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/[0.06] animate-pulse flex-shrink-0" />
            <div className="flex-1 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.06] p-4 animate-pulse">
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10 mb-2" />
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!abonos || abonos.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] shadow-sm dark:shadow-none p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
          <Receipt className="w-6 h-6 text-gray-300 dark:text-white/20" />
        </div>
        <p className="text-sm font-medium text-gray-400 dark:text-white/40">No hay abonos registrados</p>
        <p className="text-xs text-gray-300 dark:text-white/20 mt-1">Los abonos aparecerán aquí una vez registrados</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Línea vertical de timeline */}
      <div
        className="absolute left-[19px] top-5 bottom-5 w-px"
        style={{ background: 'linear-gradient(to bottom, rgba(16,185,129,0.5), rgba(255,255,255,0.08), transparent)' }}
      />

      <div className="space-y-3">
        {abonos.map((abono, i) => (
          <motion.div
            key={abono.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3"
          >
            {/* Nodo */}
            <div className="relative flex-shrink-0 z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 ring-2 ring-white dark:ring-gray-950">
                <Receipt className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Card */}
            <div className="flex-1 min-w-0 rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.06] shadow-sm dark:shadow-none backdrop-blur px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                {/* Left: recibo + fuente + fecha */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {abono.numero_recibo && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-semibold">
                        {formatearNumeroRecibo(abono.numero_recibo)}
                      </span>
                    )}
                    {(abono as any).fuente_tipo && (
                      <span className="text-xs font-semibold text-gray-700 dark:text-white/80 truncate">
                        {(abono as any).fuente_tipo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 dark:text-white/35">
                    <span>{formatDateCompact(abono.fecha_abono)}</span>
                    <span>·</span>
                    <span>{abono.metodo_pago}</span>
                    {abono.notas && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <em className="text-gray-300 dark:text-white/25 not-italic">"{abono.notas}"</em>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: monto */}
                <span className="flex-shrink-0 text-base font-extrabold text-emerald-600 dark:text-emerald-300 whitespace-nowrap">
                  {formatCurrency(abono.monto)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
