'use client'

import { motion } from 'framer-motion'
import { Calendar, CreditCard, DollarSign, Receipt, Search, TrendingUp } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'

import { useAbonosList } from '../hooks/useAbonosList'

interface AbonosListPageProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export function AbonosListPage({
  canCreate = false,
}: AbonosListPageProps = {}) {
  const router = useRouter()
  const {
    abonos,
    estadisticas,
    fuentesUnicas,
    mesesDisponibles,
    filtros,
    actualizarFiltros,
    isLoading,
    error,
  } = useAbonosList()

  // ─── LOADING ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          <div className="h-28 rounded-2xl bg-emerald-200 dark:bg-emerald-900/30 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
          </div>
          <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-80 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    )
  }

  // ─── ERROR ─────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="text-center space-y-2">
          <Receipt className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

        {/* ─── HEADER ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 dark:from-emerald-800 dark:via-emerald-900 dark:to-teal-900 p-6 shadow-2xl shadow-emerald-500/20"
        >
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-2xl font-bold text-white">Abonos</h1>
                  <p className="text-emerald-100 dark:text-emerald-200 text-xs">Registro global de recibos · RyR Constructora</p>
                </div>
              </div>
              {canCreate && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/abonos/registrar')}
                  className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all"
                >
                  + Registrar
                </motion.button>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
              <p className="text-white font-semibold text-sm">
                Total sistema: <span className="text-base font-bold">{formatCurrency(estadisticas.montoTotal)}</span>
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium">
                <Receipt className="w-3.5 h-3.5" />
                {estadisticas.totalAbonos} recibos
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─── MÉTRICAS ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Recaudado', value: formatCurrency(estadisticas.montoTotal), Icon: DollarSign },
            { label: 'Total Recibos', value: estadisticas.totalAbonos.toString(), Icon: Receipt },
            { label: 'Promedio por Recibo', value: estadisticas.totalAbonos > 0 ? formatCurrency(estadisticas.montoTotal / estadisticas.totalAbonos) : '$0', Icon: TrendingUp },
            { label: 'Abonado este Mes', value: formatCurrency(estadisticas.montoEsteMes), Icon: Calendar },
          ].map(({ label, value, Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-transparent truncate">{value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">{label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── FILTROS STICKY ────────────────────────── */}
        <div className="sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-emerald-500/10">
          <div className="flex items-center gap-2">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <label htmlFor="busqueda-abonos" className="sr-only">Buscar abono</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                id="busqueda-abonos"
                type="text"
                value={filtros.busqueda}
                onChange={(e) => actualizarFiltros({ busqueda: e.target.value })}
                placeholder="Buscar por cliente, CC o RYR-..."
                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm placeholder:text-gray-400"
              />
            </div>
            {/* Fuente */}
            <label htmlFor="filtro-fuente" className="sr-only">Fuente de pago</label>
            <select
              id="filtro-fuente"
              value={filtros.fuente}
              onChange={(e) => actualizarFiltros({ fuente: e.target.value })}
              className="min-w-[180px] py-2 px-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            >
              <option value="todas">Todas las fuentes</option>
              {fuentesUnicas.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            {/* Mes */}
            <label htmlFor="filtro-mes" className="sr-only">Mes</label>
            <select
              id="filtro-mes"
              value={filtros.mes}
              onChange={(e) => actualizarFiltros({ mes: e.target.value })}
              className="min-w-[160px] py-2 px-3 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            >
              <option value="todos">Todos los meses</option>
              {mesesDisponibles.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{abonos.length} resultados</p>
          </div>
        </div>

        {/* ─── TABLA ─────────────────────────────────── */}
        {abonos.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center space-y-3">
            <Receipt className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No hay abonos registrados</p>
            {canCreate && (
              <button
                onClick={() => router.push('/abonos/registrar')}
                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Registrar primer abono →
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                  {['# Recibo', 'Fecha', 'Cliente', 'Vivienda / Proyecto', 'Fuente de Pago', 'Método', 'Monto'].map((col) => (
                    <th
                      key={col}
                      className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2.5"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {abonos.map((abono) => (
                  <tr
                    key={abono.id}
                    onClick={() => router.push(`/abonos/${abono.cliente.id}`)}
                    className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors last:border-b-0"
                  >
                    {/* # Recibo */}
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
                        {formatearNumeroRecibo(abono.numero_recibo)}
                      </span>
                    </td>
                    {/* Fecha */}
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDateCompact(abono.fecha_abono)}
                    </td>
                    {/* Cliente */}
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                        {formatNombreCompleto(`${abono.cliente.nombres} ${abono.cliente.apellidos}`)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">CC {abono.cliente.numero_documento}</p>
                    </td>
                    {/* Vivienda / Proyecto */}
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                      {abono.vivienda.manzana.identificador
                        ? `Mz.${abono.vivienda.manzana.identificador} Casa No. ${abono.vivienda.numero}`
                        : `N°${abono.vivienda.numero}`}
                      {abono.proyecto.nombre && (
                        <span className="text-gray-400 dark:text-gray-500"> · {abono.proyecto.nombre}</span>
                      )}
                    </td>
                    {/* Fuente */}
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{abono.fuente_pago.tipo}</td>
                    {/* Método */}
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{abono.metodo_pago}</td>
                    {/* Monto */}
                    <td className="px-3 py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                      {formatCurrency(abono.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
