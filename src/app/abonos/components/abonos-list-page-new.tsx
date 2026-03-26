'use client'

import { useCallback, useState } from 'react'

import { motion } from 'framer-motion'
import {
    Ban,
    Calendar,
    Check,
    CreditCard,
    DollarSign,
    Pencil,
    Receipt,
    Search,
    TrendingUp,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { AbonoDetalleModal } from '@/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal'
import type { AbonoParaDetalle } from '@/modules/abonos/components/abono-detalle-modal/useAbonoDetalle'
import { ModalAnularAbono } from '@/modules/abonos/components/modal-anular-abono'
import { ModalEditarAbono } from '@/modules/abonos/components/modal-editar-abono'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { EmptyState } from '@/shared/components/ui/EmptyState'

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
  isAdmin = false,
}: AbonosListPageProps = {}) {
  const router = useRouter()
  const [abonoSeleccionado, setAbonoSeleccionado] =
    useState<AbonoParaDetalle | null>(null)
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false)
  const [abonoEditando, setAbonoEditando] = useState<AbonoParaEditar | null>(
    null
  )
  const [abonoAnulando, setAbonoAnulando] = useState<AbonoParaDetalle | null>(
    null
  )

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
    toggleMostrarActivos,
    toggleMostrarAnulados,
    toggleMostrarRenunciados,
    isLoading,
    error,
    refetch,
  } = useAbonosList()

  // ─── LOADING ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900'>
        <div className='mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8'>
          <div className='h-28 animate-pulse rounded-2xl bg-blue-200 dark:bg-blue-900/30' />
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
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900'>
        <div className='mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8'>
          {/* ─── HEADER ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-2xl shadow-blue-500/20 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800'
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
                    <p className='text-xs text-blue-100 dark:text-blue-200'>
                      Registro global de recibos · RyR Constructora
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md'>
                    <Receipt className='h-3.5 w-3.5' />
                    {estadisticas.totalAbonos}{' '}
                    {estadisticas.totalAbonos === 1 ? 'Recibo' : 'Recibos'}
                  </span>
                  {canCreate && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/abonos/registrar')}
                      className='inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30'
                    >
                      <DollarSign className='h-4 w-4' />
                      Registrar
                    </motion.button>
                  )}
                </div>
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
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                <div className='relative z-10 flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'>
                    <Icon className='h-5 w-5 text-white' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-xl font-bold text-transparent'>
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
          <div className='sticky top-4 z-40 rounded-xl border border-gray-200/50 bg-white/90 p-4 shadow-2xl shadow-blue-500/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90'>
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
                  className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50'
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
                className='min-w-[180px] rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50'
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
                className='min-w-[160px] rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50'
              >
                <option value='todos'>Todos los meses</option>
                {mesesDisponibles.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700'>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                {abonos.length} resultados
              </p>
              <div className='flex items-center gap-1.5'>
                {/* Pill checklist: categorías de abonos */}
                <span className='mr-1 text-xs text-gray-400 dark:text-gray-500'>Mostrar:</span>
                <button
                  onClick={toggleMostrarActivos}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    filtros.mostrarActivos
                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-700'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {filtros.mostrarActivos ? <Check className='h-3 w-3' /> : <span className='inline-block h-3 w-3 rounded-sm border border-gray-300 dark:border-gray-600' />}
                  Activos
                </button>
                <button
                  onClick={toggleMostrarAnulados}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    filtros.mostrarAnulados
                      ? 'bg-red-100 text-red-700 ring-1 ring-red-300 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-700'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {filtros.mostrarAnulados ? <Check className='h-3 w-3' /> : <span className='inline-block h-3 w-3 rounded-sm border border-gray-300 dark:border-gray-600' />}
                  Anulados
                </button>
                <button
                  onClick={toggleMostrarRenunciados}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    filtros.mostrarRenunciados
                      ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-700'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {filtros.mostrarRenunciados ? <Check className='h-3 w-3' /> : <span className='inline-block h-3 w-3 rounded-sm border border-gray-300 dark:border-gray-600' />}
                  Renunciados
                </button>
                <span className='mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700' />
                {(filtros.busqueda ||
                  filtros.fuente !== 'todas' ||
                  filtros.mes !== 'todos') && (
                  <button
                    onClick={() =>
                      actualizarFiltros({
                        busqueda: '',
                        fuente: 'todas',
                        mes: 'todos',
                      })
                    }
                    className='text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── TABLA ─────────────────────────────────── */}
          {abonos.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title='No hay abonos registrados'
              description='Registra el primer abono para comenzar a llevar el control de pagos'
              action={
                canCreate
                  ? {
                      label: 'Registrar Primer Abono',
                      onClick: () => router.push('/abonos/registrar'),
                      icon: CreditCard,
                    }
                  : undefined
              }
              moduleName='abonos'
            />
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
                      ...(isAdmin ? [''] : []),
                    ].map((col, i) => (
                      <th
                        key={`${col}-${i}`}
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
                      className={`cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 dark:border-gray-800 ${
                        abono.estado === 'Anulado'
                          ? 'bg-red-50/40 opacity-60 dark:bg-red-950/10'
                          : abono.negociacion.estado === 'Cerrada por Renuncia'
                            ? 'bg-amber-50/40 dark:bg-amber-950/10 hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
                            : 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                      }`}
                    >
                      {/* # Recibo */}
                      <td className='px-3 py-2.5'>
                        <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
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
                      <td className='px-3 py-2.5'>
                        <p className='font-medium leading-tight text-gray-900 dark:text-gray-100'>
                          {abono.vivienda.manzana.identificador
                            ? `Mz.${abono.vivienda.manzana.identificador} Casa No. ${abono.vivienda.numero}`
                            : `N°${abono.vivienda.numero}`}
                        </p>
                        {abono.proyecto.nombre ? (
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            {abono.proyecto.nombre}
                          </p>
                        ) : null}
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
                      <td className='whitespace-nowrap px-3 py-2.5 tabular-nums'>
                        {abono.estado === 'Anulado' ? (
                          <>
                            <span className='mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400'>
                              Anulado
                            </span>
                            <span className='font-bold text-gray-400 line-through dark:text-gray-600'>
                              {formatCurrency(abono.monto)}
                            </span>
                          </>
                        ) : abono.negociacion.estado === 'Cerrada por Renuncia' ? (
                          <>
                            <span className='mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400'>
                              Renunciada
                            </span>
                            <span className='font-bold text-gray-500 dark:text-gray-400'>
                              {formatCurrency(abono.monto)}
                            </span>
                          </>
                        ) : (
                          <span className='font-bold text-blue-700 dark:text-blue-400'>
                            {formatCurrency(abono.monto)}
                          </span>
                        )}
                      </td>
                      {/* Editar / Anular (solo admin) */}
                      {isAdmin ? (
                        <td className='px-3 py-2.5'>
                          <div className='inline-flex items-center gap-1'>
                            {/* Editar: solo si abono activo */}
                            {abono.estado !== 'Anulado' ? (
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  const rawAbono = abono as any
                                  setAbonoEditando({
                                    id: abono.id,
                                    negociacion_id: rawAbono.negociacion_id,
                                    fuente_pago_id: rawAbono.fuente_pago_id,
                                    fuente_tipo: abono.fuente_pago.tipo,
                                    monto: abono.monto,
                                    fecha_abono: abono.fecha_abono,
                                    metodo_pago: rawAbono.metodo_pago ?? null,
                                    numero_referencia: rawAbono.numero_referencia ?? null,
                                    notas: rawAbono.notas ?? null,
                                    comprobante_url: rawAbono.comprobante_url ?? null,
                                  })
                                }}
                                className='inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700/50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
                                title='Editar abono'
                              >
                                <Pencil className='h-3.5 w-3.5' />
                              </button>
                            ) : null}
                            {/* Anular: solo si activo y negociación activa */}
                            {abono.estado !== 'Anulado' &&
                            abono.negociacion.estado === 'Activa' ? (
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  setAbonoAnulando(abono)
                                }}
                                className='inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-gray-700/50 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                                title='Anular abono'
                              >
                                <Ban className='h-3.5 w-3.5' />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
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
          refetch()
        }}
      />
      {isAdmin && abonoEditando ? (
        <ModalEditarAbono
          isOpen={!!abonoEditando}
          abono={abonoEditando}
          onClose={() => setAbonoEditando(null)}
          onSuccess={() => {
            setAbonoEditando(null)
            refetch()
          }}
        />
      ) : null}
      {isAdmin && abonoAnulando ? (
        <ModalAnularAbono
          abono={{
            id: abonoAnulando.id,
            numero_recibo: abonoAnulando.numero_recibo,
            monto: abonoAnulando.monto,
            fecha_abono: abonoAnulando.fecha_abono,
            cliente_nombre: `${abonoAnulando.cliente.nombres} ${abonoAnulando.cliente.apellidos}`.trim(),
            vivienda_info: abonoAnulando.vivienda.manzana.identificador
              ? `Mz.${abonoAnulando.vivienda.manzana.identificador} Casa No. ${abonoAnulando.vivienda.numero}`
              : `N°${abonoAnulando.vivienda.numero}`,
            proyecto_nombre: abonoAnulando.proyecto.nombre,
            fuente_tipo: abonoAnulando.fuente_pago.tipo,
          }}
          onAnulacionExitosa={() => {
            setAbonoAnulando(null)
            refetch()
          }}
          onClose={() => setAbonoAnulando(null)}
        />
      ) : null}
    </>
  )
}
