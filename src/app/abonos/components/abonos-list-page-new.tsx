'use client'

import { useCallback, useState } from 'react'

import { motion } from 'framer-motion'
import {
  Calendar,
  CreditCard,
  DollarSign,
  Receipt,
  Search,
  TrendingUp,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { AbonoDetalleModal } from '@/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal'
import type { AbonoParaDetalle } from '@/modules/abonos/components/abono-detalle-modal/useAbonoDetalle'
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
  const [abonoSeleccionado, setAbonoSeleccionado] =
    useState<AbonoParaDetalle | null>(null)
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false)

  const handleAbonoClick = useCallback((abono: AbonoParaDetalle) => {
    setAbonoSeleccionado(abono)
    setModalDetalleOpen(true)
  }, [])

  const handleCerrarDetalle = useCallback(() => {
    setModalDetalleOpen(false)
    setAbonoSeleccionado(null)
  }, [])

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
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900'>
        <div className='mx-auto max-w-7xl space-y-4 px-4 py-6'>
          <div className='h-28 animate-pulse rounded-2xl bg-emerald-200 dark:bg-emerald-900/30' />
          <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800'
              />
            ))}
          </div>
          <div className='h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800' />
          <div className='h-80 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800' />
        </div>
      </div>
    )
  }

  // ─── ERROR ─────────────────────────────────────────
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950'>
        <div className='space-y-2 text-center'>
          <Receipt className='mx-auto h-10 w-10 text-red-400' />
          <p className='text-sm text-gray-600 dark:text-gray-400'>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900'>
        <div className='mx-auto max-w-7xl space-y-4 px-4 py-6'>
          {/* ─── HEADER ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-6 shadow-2xl shadow-emerald-500/20 dark:from-emerald-800 dark:via-emerald-900 dark:to-teal-900'
          >
            <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
            <div className='relative z-10'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                    <CreditCard className='h-6 w-6 text-white' />
                  </div>
                  <div className='space-y-0.5'>
                    <h1 className='text-2xl font-bold text-white'>Abonos</h1>
                    <p className='text-xs text-emerald-100 dark:text-emerald-200'>
                      Registro global de recibos · RyR Constructora
                    </p>
                  </div>
                </div>
                {canCreate && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push('/abonos/registrar')}
                    className='rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/30'
                  >
                    + Registrar
                  </motion.button>
                )}
              </div>
              <div className='mt-3 flex items-center justify-between border-t border-white/20 pt-3'>
                <p className='text-sm font-semibold text-white'>
                  Total sistema:{' '}
                  <span className='text-base font-bold'>
                    {formatCurrency(estadisticas.montoTotal)}
                  </span>
                </p>
                <span className='inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md'>
                  <Receipt className='h-3.5 w-3.5' />
                  {estadisticas.totalAbonos} recibos
                </span>
              </div>
            </div>
          </motion.div>

          {/* ─── MÉTRICAS ──────────────────────────────── */}
          <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
            {[
              {
                label: 'Total Recaudado',
                value: formatCurrency(estadisticas.montoTotal),
                Icon: DollarSign,
              },
              {
                label: 'Total Recibos',
                value: estadisticas.totalAbonos.toString(),
                Icon: Receipt,
              },
              {
                label: 'Promedio por Recibo',
                value:
                  estadisticas.totalAbonos > 0
                    ? formatCurrency(
                        estadisticas.montoTotal / estadisticas.totalAbonos
                      )
                    : '$0',
                Icon: TrendingUp,
              },
              {
                label: 'Abonado este Mes',
                value: formatCurrency(estadisticas.montoEsteMes),
                Icon: Calendar,
              },
            ].map(({ label, value, Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className='group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                <div className='relative z-10 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'>
                    <Icon className='h-5 w-5 text-white' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-xl font-bold text-transparent'>
                      {value}
                    </p>
                    <p className='mt-0.5 text-xs font-medium text-gray-600 dark:text-gray-400'>
                      {label}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── FILTROS STICKY ────────────────────────── */}
          <div className='sticky top-4 z-40 rounded-xl border border-gray-200/50 bg-white/90 p-3 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90'>
            <div className='flex items-center gap-2'>
              {/* Búsqueda */}
              <div className='relative flex-1'>
                <label htmlFor='busqueda-abonos' className='sr-only'>
                  Buscar abono
                </label>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
                <input
                  id='busqueda-abonos'
                  type='text'
                  value={filtros.busqueda}
                  onChange={e =>
                    actualizarFiltros({ busqueda: e.target.value })
                  }
                  placeholder='Buscar por cliente, CC o RYR-...'
                  className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900/50'
                />
              </div>
              {/* Fuente */}
              <label htmlFor='filtro-fuente' className='sr-only'>
                Fuente de pago
              </label>
              <select
                id='filtro-fuente'
                value={filtros.fuente}
                onChange={e => actualizarFiltros({ fuente: e.target.value })}
                className='min-w-[180px] rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900/50'
              >
                <option value='todas'>Todas las fuentes</option>
                {fuentesUnicas.map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              {/* Mes */}
              <label htmlFor='filtro-mes' className='sr-only'>
                Mes
              </label>
              <select
                id='filtro-mes'
                value={filtros.mes}
                onChange={e => actualizarFiltros({ mes: e.target.value })}
                className='min-w-[160px] rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900/50'
              >
                <option value='todos'>Todos los meses</option>
                {mesesDisponibles.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='mt-2 flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700'>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                {abonos.length} resultados
              </p>
            </div>
          </div>

          {/* ─── TABLA ─────────────────────────────────── */}
          {abonos.length === 0 ? (
            <div className='space-y-3 rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900'>
              <Receipt className='mx-auto h-10 w-10 text-gray-300 dark:text-gray-600' />
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                No hay abonos registrados
              </p>
              {canCreate && (
                <button
                  onClick={() => router.push('/abonos/registrar')}
                  className='text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400'
                >
                  Registrar primer abono →
                </button>
              )}
            </div>
          ) : (
            <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60'>
                    {[
                      '# Recibo',
                      'Fecha',
                      'Cliente',
                      'Vivienda / Proyecto',
                      'Fuente de Pago',
                      'Método',
                      'Monto',
                    ].map(col => (
                      <th
                        key={col}
                        className='px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {abonos.map(abono => (
                    <tr
                      key={abono.id}
                      onClick={() => handleAbonoClick(abono)}
                      className='cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-emerald-50/50 dark:border-gray-800 dark:hover:bg-emerald-950/20'
                    >
                      {/* # Recibo */}
                      <td className='px-3 py-2.5'>
                        <span className='inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                          {formatearNumeroRecibo(abono.numero_recibo)}
                        </span>
                      </td>
                      {/* Fecha */}
                      <td className='whitespace-nowrap px-3 py-2.5 text-gray-600 dark:text-gray-400'>
                        {formatDateCompact(abono.fecha_abono)}
                      </td>
                      {/* Cliente */}
                      <td className='px-3 py-2.5'>
                        <p className='font-semibold leading-tight text-gray-900 dark:text-gray-100'>
                          {formatNombreCompleto(
                            `${abono.cliente.nombres} ${abono.cliente.apellidos}`
                          )}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          CC {abono.cliente.numero_documento}
                        </p>
                      </td>
                      {/* Vivienda / Proyecto */}
                      <td className='px-3 py-2.5 text-gray-600 dark:text-gray-300'>
                        {abono.vivienda.manzana.identificador
                          ? `Mz.${abono.vivienda.manzana.identificador} Casa No. ${abono.vivienda.numero}`
                          : `N°${abono.vivienda.numero}`}
                        {abono.proyecto.nombre && (
                          <span className='text-gray-400 dark:text-gray-500'>
                            {' '}
                            · {abono.proyecto.nombre}
                          </span>
                        )}
                      </td>
                      {/* Fuente */}
                      <td className='px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400'>
                        {abono.fuente_pago.tipo}
                      </td>
                      {/* Método */}
                      <td className='px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400'>
                        {abono.metodo_pago}
                      </td>
                      {/* Monto */}
                      <td className='whitespace-nowrap px-3 py-2.5 text-right font-bold tabular-nums text-emerald-700 dark:text-emerald-400'>
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
      <AbonoDetalleModal
        abono={abonoSeleccionado}
        isOpen={modalDetalleOpen}
        onClose={handleCerrarDetalle}
        onAnulado={() => {
          handleCerrarDetalle()
          window.location.reload()
        }}
      />
    </>
  )
}
