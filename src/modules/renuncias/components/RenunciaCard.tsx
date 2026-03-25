'use client'

import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, Clock, DollarSign, Eye, FileText, Home, MapPin, Phone, Receipt } from 'lucide-react'
import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'

import type { RenunciaConInfo } from '../types'
import { formatCOP } from '../utils/renuncias.utils'

interface RenunciaCardProps {
  renuncia: RenunciaConInfo
  onProcesarDevolucion?: (renuncia: RenunciaConInfo) => void
}

export function RenunciaCard({ renuncia, onProcesarDevolucion }: RenunciaCardProps) {
  const esPendiente = renuncia.estado === 'Pendiente Devolución'
  const esCerrada = renuncia.estado === 'Cerrada'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group relative overflow-hidden rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/60 shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Barra de color superior según estado */}
      <div className={`h-1 w-full ${esPendiente
        ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400'
        : 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400'
      }`} />

      <div className="p-4 pt-3">
        {/* ── Fila 1: Consecutivo + Badge estado ── */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-2 py-0.5 rounded-full tracking-wide">
            <FileText className="w-2.5 h-2.5" />
            {renuncia.consecutivo}
          </span>
          {esPendiente ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-[10px] font-semibold">
              <Clock className="w-2.5 h-2.5" />
              Pendiente devolución
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Cerrada
            </span>
          )}
        </div>

        {/* ── Fila 2: Cliente ── */}
        <div className="mb-2.5">
          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{renuncia.cliente.nombre}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {renuncia.cliente.tipo_documento} {renuncia.cliente.documento}
            </span>
            {renuncia.cliente.telefono ? (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Phone className="w-3 h-3" />
                {renuncia.cliente.telefono}
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Fila 3: Ubicación + Fechas ── */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Home className="w-3 h-3 text-gray-400" />
            Manzana {renuncia.vivienda.manzana} · Casa {renuncia.vivienda.numero}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <MapPin className="w-3 h-3 text-gray-400" />
            {renuncia.proyecto.nombre}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Calendar className="w-3 h-3 text-gray-400" />
            {formatDateCompact(renuncia.fecha_renuncia)}
          </span>
          {esCerrada && renuncia.fecha_cierre ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              Cerrada {formatDateCompact(renuncia.fecha_cierre)}
            </span>
          ) : null}
        </div>

        {/* ── Bloque monto (inteligente según estado) ── */}
        <div className={`rounded-lg px-3 py-2 mb-2.5 ${esPendiente
          ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40'
          : 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${esPendiente ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                <DollarSign className="w-3 h-3 inline -mt-0.5" />
                {esPendiente ? 'Monto a devolver' : 'Monto devuelto'}
              </p>
              <p className={`text-base font-bold ${esPendiente ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                {formatCOP(renuncia.monto_a_devolver)}
              </p>
            </div>
            <div className="text-right shrink-0">
              {esCerrada && renuncia.metodo_devolucion ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md font-medium">
                  {renuncia.metodo_devolucion}
                </span>
              ) : null}
              {esPendiente && !renuncia.requiere_devolucion ? (
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Sin devolución requerida</span>
              ) : null}
            </div>
          </div>
          {renuncia.retencion_monto > 0 ? (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 border-t border-amber-200 dark:border-amber-800/30 pt-1">
              Retención: {formatCOP(renuncia.retencion_monto)}
              {renuncia.retencion_motivo ? ` — ${renuncia.retencion_motivo}` : ''}
            </p>
          ) : null}
        </div>

        {/* ── Motivo ── */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
          <span className="font-medium text-gray-600 dark:text-gray-300">Motivo:</span> {renuncia.motivo}
        </p>

        {/* ── Acciones ── */}
        <div className="flex items-center gap-2 pt-2.5 border-t border-gray-100 dark:border-gray-700">
          <Link
            href={`/renuncias/${encodeURIComponent(renuncia.consecutivo)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver Expediente
          </Link>
          {esPendiente && onProcesarDevolucion ? (
            <button
              type="button"
              onClick={() => onProcesarDevolucion(renuncia)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
            >
              <Receipt className="w-3.5 h-3.5" />
              Procesar Devolución
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
