'use client'

/**
 * NegociacionTab — Vista compacta de negociación
 *
 * 3 bloques:
 * 1. Header unificado (vivienda + KPIs financieros)
 * 2. Plan de Pagos (grid de fuentes + barra visual)
 * 3. Abonos recientes
 */

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  Lock,
  Percent,
  RefreshCw,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { ModalEditarAbono } from '@/modules/abonos/components/modal-editar-abono'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import type { Cliente } from '@/modules/clientes/types'
import { CuotasCreditoTab } from '@/modules/fuentes-pago/components/CuotasCreditoTab'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import { formatCurrency } from '@/shared/utils/format'

import {
  AbonosRecientes,
  BarraFinanciera,
  FuenteMiniCard,
  RebalancearModal,
} from './negociacion/components'
import { useNegociacionTab } from './negociacion/hooks'

interface NegociacionTabProps {
  cliente: Cliente
}

function Skeleton() {
  return (
    <div className='animate-pulse space-y-3'>
      <div className='h-32 rounded-xl bg-gray-100 dark:bg-gray-700/40' />
      <div className='h-48 rounded-xl bg-gray-100 dark:bg-gray-700/40' />
      <div className='h-20 rounded-xl bg-gray-100 dark:bg-gray-700/40' />
    </div>
  )
}

function SinNegociacion() {
  return (
    <div className='flex flex-col items-center justify-center space-y-3 py-16 text-center'>
      <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700/50'>
        <Home className='h-7 w-7 text-gray-400 dark:text-gray-500' />
      </div>
      <h3 className='text-base font-semibold text-gray-900 dark:text-white'>
        Sin vivienda asignada
      </h3>
      <p className='max-w-xs text-sm text-gray-500 dark:text-gray-400'>
        Cuando el cliente tenga una vivienda asignada, aquí verás el plan de
        pagos y el seguimiento de abonos.
      </p>
    </div>
  )
}

export function NegociacionTab({ cliente }: NegociacionTabProps) {
  const router = useRouter()
  const [cuotasExpandidas, setCuotasExpandidas] = useState<
    Record<string, boolean>
  >({})
  const toggleCuotas = (id: string) =>
    setCuotasExpandidas(p => ({ ...p, [id]: !p[id] }))

  // ── Estado para edición de abonos ────────────────────────────────────────
  const [abonoEditando, setAbonoEditando] = useState<AbonoParaEditar | null>(
    null
  )

  const {
    negociacion,
    valorVivienda,
    fuentesPago,
    abonos,
    totalAbonado,
    diferencia,
    estaBalanceado,
    tiposDisponibles,
    tiposFuentes,
    requisitosMap,
    isLoading,
    isLoadingAbonos,
    isRebalanceando,
    isAdmin,
    modalRebalancearOpen,
    openRebalancear,
    closeRebalancear,
    handleGuardarRebalanceo,
    pendientesPorFuente,
    totalDocsPendientes,
    totalDocsObligatoriosPendientes,
    refetchFuentes,
    refetchAbonos,
  } = useNegociacionTab({ cliente })

  if (isLoading) return <Skeleton />
  if (!negociacion) return <SinNegociacion />

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const negAny = negociacion as any
  const proyecto = negAny.proyecto?.nombre ?? '—'
  const vivienda = negAny.vivienda
  const manzana = vivienda?.manzanas?.nombre
  const numero = vivienda?.numero
  const valorEscritura = negAny.valor_escritura_publica ?? 0
  const notasNeg = negAny.notas ?? ''
  const saldo = negAny.saldo_pendiente ?? valorVivienda - totalAbonado
  const pctPagado =
    negAny.porcentaje_pagado ??
    (valorVivienda > 0 ? (totalAbonado / valorVivienda) * 100 : 0)
  const descuento = negAny.descuento_aplicado ?? 0
  const pctDescuento = negAny.porcentaje_descuento ?? 0
  const valorBaseLista = vivienda?.valor_base ?? 0
  const valorNegociado = negAny.valor_negociado ?? 0
  const hayDivergencia =
    valorBaseLista > 0 &&
    valorNegociado > 0 &&
    Math.abs(valorBaseLista - valorNegociado) >= 1

  // Fuente con cuotas expandidas (para renderizar CuotasCreditoTab fuera del grid)
  const creditoExpandido = fuentesPago.find(
    f => esCreditoConstructora(f.tipo) && cuotasExpandidas[f.id]
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const abonosParaUI = abonos as any

  return (
    <div className='space-y-3'>
      {/* ─── BLOQUE 1: HEADER UNIFICADO + KPIs ───── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className='overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/50 dark:bg-gray-800/50'
      >
        {/* Vivienda row */}
        <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/40'>
          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30'>
            <Home className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-bold leading-tight text-gray-900 dark:text-white'>
              {proyecto}
            </p>
            {manzana || numero ? (
              <p className='text-[11px] text-gray-500 dark:text-gray-400'>
                {manzana ? `Manzana ${manzana}` : ''}
                {manzana && numero ? ' · ' : ''}
                {numero ? `Casa ${numero}` : ''}
              </p>
            ) : null}
          </div>
          <span
            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              negociacion.estado === 'Activa'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            {negociacion.estado}
          </span>
          <button
            onClick={() => router.push(`/abonos?negociacion=${negociacion.id}`)}
            className='flex-shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-cyan-600 dark:hover:bg-gray-700/50 dark:hover:text-cyan-400'
            title='Ir a abonos'
          >
            <ArrowUpRight className='h-4 w-4' />
          </button>
        </div>

        {/* Badges row (solo divergencia y descuento si aplican) */}
        {hayDivergencia || descuento > 0 ? (
          <div className='flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-1.5 dark:border-gray-700/40'>
            {descuento > 0 ? (
              <span className='rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'>
                -{formatCurrency(descuento)}
                {pctDescuento > 0 ? ` (${pctDescuento}%)` : ''} dto.
              </span>
            ) : null}
            {hayDivergencia ? (
              <span className='inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'>
                <AlertTriangle className='h-2.5 w-2.5' />
                Lista: {formatCurrency(valorBaseLista)} · Negociado:{' '}
                {formatCurrency(valorNegociado)}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* 4 KPIs row */}
        <div className='grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700/40 sm:grid-cols-4'>
          <div className='px-4 py-2.5'>
            <div className='mb-0.5 flex items-center gap-1'>
              <DollarSign className='h-3 w-3 text-cyan-500' />
              <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Valor Total a Pagar
              </span>
            </div>
            <p className='text-sm font-bold tabular-nums text-gray-900 dark:text-white'>
              {formatCurrency(valorVivienda)}
            </p>
            {valorEscritura > 0 ? (
              <div className='mt-1 flex items-center gap-1.5'>
                <span className='inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:border-indigo-800/40 dark:bg-indigo-950/30 dark:text-indigo-400'>
                  <FileText className='h-2.5 w-2.5' />
                  Valor en Escritura:{' '}
                  <span className='font-bold tabular-nums'>
                    {formatCurrency(valorEscritura)}
                  </span>
                </span>
              </div>
            ) : null}
          </div>
          <div className='px-4 py-2.5'>
            <div className='mb-0.5 flex items-center gap-1'>
              <Wallet className='h-3 w-3 text-emerald-500' />
              <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Abonado
              </span>
            </div>
            <p className='text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
              {formatCurrency(totalAbonado)}
            </p>
          </div>
          <div className='px-4 py-2.5'>
            <div className='mb-0.5 flex items-center gap-1'>
              <TrendingUp className='h-3 w-3 text-amber-500' />
              <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Saldo
              </span>
            </div>
            <p
              className={`text-sm font-bold tabular-nums ${saldo <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}
            >
              {formatCurrency(Math.max(saldo, 0))}
            </p>
          </div>
          <div className='px-4 py-2.5'>
            <div className='mb-0.5 flex items-center gap-1'>
              <Percent className='h-3 w-3 text-blue-500' />
              <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Avance
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-sm font-bold tabular-nums text-gray-900 dark:text-white'>
                {Math.min(pctPagado, 100).toFixed(1)}%
              </p>
              <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500'
                  style={{ width: `${Math.min(pctPagado, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── BLOQUE 2: PLAN DE PAGOS ───── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.04 }}
        className='overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/50 dark:bg-gray-800/50'
      >
        {/* Header: título + balance inline + botón */}
        <div className='flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/40'>
          <div className='flex items-center gap-2'>
            <DollarSign className='h-4 w-4 text-gray-400' />
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
              Plan de Pagos
            </h3>
            <span className='text-[10px] text-gray-400'>
              ({fuentesPago.length})
            </span>
            {/* Balance badge inline */}
            {fuentesPago.length > 0 ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  estaBalanceado
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {estaBalanceado ? (
                  <>
                    <CheckCircle2 className='h-3 w-3' />{' '}
                    {formatCurrency(valorVivienda)} cubierto
                  </>
                ) : (
                  <>
                    <AlertTriangle className='h-3 w-3' /> Faltan{' '}
                    {formatCurrency(Math.abs(diferencia))}
                  </>
                )}
              </span>
            ) : null}
          </div>
          {isAdmin ? (
            <button
              onClick={openRebalancear}
              className='inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-[11px] font-medium text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-800/40 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/30'
            >
              <SlidersHorizontal className='h-3.5 w-3.5' />
              Redistribuir
            </button>
          ) : (
            <span className='inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500'>
              <Lock className='h-3 w-3' />
              Solo lectura
            </span>
          )}
        </div>

        <div className='space-y-3 p-3'>
          {fuentesPago.length === 0 ? (
            <p className='py-4 text-center text-xs text-gray-400 dark:text-gray-500'>
              {isAdmin
                ? 'Sin fuentes configuradas. Usa "Redistribuir" para agregarlas.'
                : 'Sin fuentes de pago configuradas.'}
            </p>
          ) : (
            <>
              {/* Barra visual proporcional */}
              <BarraFinanciera
                fuentesPago={fuentesPago}
                valorVivienda={valorVivienda}
                tiposFuentes={tiposFuentes}
              />

              {/* Docs pendientes banner (compacto) */}
              {totalDocsPendientes > 0 ? (
                <div className='flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 dark:border-amber-800/40 dark:bg-amber-950/30'>
                  <AlertTriangle className='h-3 w-3 flex-shrink-0 text-amber-500' />
                  <p className='text-[10px] text-amber-800 dark:text-amber-300'>
                    <span className='font-semibold'>{totalDocsPendientes}</span>{' '}
                    doc{totalDocsPendientes !== 1 ? 's' : ''} pendiente
                    {totalDocsPendientes !== 1 ? 's' : ''}
                    {totalDocsObligatoriosPendientes > 0 ? (
                      <span className='ml-1 font-semibold text-red-600 dark:text-red-400'>
                        ({totalDocsObligatoriosPendientes} oblig.)
                      </span>
                    ) : null}
                    <span className='text-amber-600 dark:text-amber-400'>
                      {' '}
                      — Ir a <strong>Documentos</strong>
                    </span>
                  </p>
                </div>
              ) : null}

              {/* Grid de fuentes */}
              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                {fuentesPago.map(fuente => (
                  <FuenteMiniCard
                    key={fuente.id}
                    fuente={fuente}
                    valorVivienda={valorVivienda}
                    docsPendientes={pendientesPorFuente[fuente.id]}
                    colorToken={
                      tiposFuentes.find(t => t.nombre === fuente.tipo)?.color
                    }
                    cuotasExpandidas={cuotasExpandidas[fuente.id]}
                    onToggleCuotas={
                      esCreditoConstructora(fuente.tipo)
                        ? () => toggleCuotas(fuente.id)
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* Cuotas de crédito constructora (full-width below grid) */}
              {creditoExpandido ? (
                <div className='rounded-xl border border-indigo-200/60 bg-indigo-50/30 p-3 dark:border-indigo-800/40 dark:bg-indigo-950/10'>
                  <CuotasCreditoTab
                    fuentePagoId={creditoExpandido.id}
                    negociacionId={negociacion.id}
                    montoFuente={creditoExpandido.monto_aprobado}
                    onPagoCuotaRegistrado={() => refetchFuentes()}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </motion.div>

      {/* ─── NOTAS ───── */}
      {notasNeg ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          className='flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/60 px-4 py-2.5 dark:border-amber-800/30 dark:bg-amber-950/20'
        >
          <FileText className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500' />
          <div className='min-w-0 flex-1'>
            <p className='mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300'>
              Notas
            </p>
            <p className='whitespace-pre-wrap text-xs text-amber-800 dark:text-amber-200'>
              {notasNeg}
            </p>
          </div>
        </motion.div>
      ) : null}

      {/* ─── BLOQUE 3: ABONOS RECIENTES ───── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08 }}
        className='overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/50 dark:bg-gray-800/50'
      >
        <div className='flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/40'>
          <div className='flex items-center gap-2'>
            <CreditCard className='h-4 w-4 text-gray-400' />
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
              Abonos recibidos
            </h3>
          </div>
          {isLoadingAbonos ? (
            <RefreshCw className='h-3 w-3 animate-spin text-gray-300 dark:text-gray-600' />
          ) : null}
        </div>
        <div className='p-3'>
          <AbonosRecientes
            abonos={abonosParaUI}
            totalAbonado={totalAbonado}
            negociacionId={negociacion.id}
            isLoading={isLoadingAbonos}
            isAdmin={isAdmin}
            onEditar={abono => {
              const fuente = fuentesPago.find(
                f => f.id === abono.fuente_pago_id
              )
              setAbonoEditando({ ...abono, fuente_tipo: fuente?.tipo ?? '' })
            }}
          />
        </div>
      </motion.div>

      {/* Modal Admin: Redistribuir montos */}
      {isAdmin ? (
        <RebalancearModal
          isOpen={modalRebalancearOpen}
          onClose={closeRebalancear}
          fuentesPago={fuentesPago}
          valorVivienda={valorVivienda}
          tiposDisponibles={tiposDisponibles}
          tiposConfig={tiposFuentes}
          requisitosMap={requisitosMap}
          onGuardar={handleGuardarRebalanceo}
          isGuardando={isRebalanceando}
        />
      ) : null}

      {/* Modal Admin: Editar abono */}
      {isAdmin && abonoEditando ? (
        <ModalEditarAbono
          isOpen={!!abonoEditando}
          abono={abonoEditando}
          onClose={() => setAbonoEditando(null)}
          onSuccess={() => {
            setAbonoEditando(null)
            refetchAbonos()
            refetchFuentes()
          }}
        />
      ) : null}
    </div>
  )
}
