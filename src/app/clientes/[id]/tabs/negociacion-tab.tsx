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
  FileX,
  Home,
  Lock,
  Percent,
  RefreshCw,
  Shield,
  SlidersHorizontal,
  Tag,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { ModalEditarAbono } from '@/modules/abonos/components/modal-editar-abono'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import type { Cliente } from '@/modules/clientes/types'
import { CuotasCreditoTab } from '@/modules/fuentes-pago/components/CuotasCreditoTab'
import { RegistrarRenunciaModal } from '@/modules/renuncias/components/modals/RegistrarRenunciaModal'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import { formatCurrency } from '@/shared/utils/format'

import {
  AbonosRecientes,
  DescuentoModal,
  FuenteMiniCard,
  NegociacionCerradaRenuncia,
  NegociacionSkeleton,
  RebalancearModal,
  SinNegociacion,
} from './negociacion/components'
import { LABELS_TIPO_DESCUENTO, useNegociacionTab } from './negociacion/hooks'

interface NegociacionTabProps {
  cliente: Cliente
  onIrADocumentos?: () => void
}

export function NegociacionTab({
  cliente,
  onIrADocumentos,
}: NegociacionTabProps) {
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

  // ── Estado para modal de renuncia ───────────────────────────────────────
  const [modalRenunciaOpen, setModalRenunciaOpen] = useState(false)

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
    tiposConfigConEntidad,
    requisitosMap,
    entidadesPorTipoEntidad,
    isLoading,
    isLoadingAbonos,
    isRebalanceando,
    isAdmin,
    modalRebalancearOpen,
    openRebalancear,
    closeRebalancear,
    handleGuardarRebalanceo,
    modalDescuentoOpen,
    openDescuento,
    closeDescuento,
    isAplicandoDescuento,
    handleAplicarDescuento,
    pendientesPorFuente,
    totalDocsPendientes,
    totalDocsObligatoriosPendientes,
    refetchFuentes,
    refetchAbonos,
  } = useNegociacionTab({ cliente })

  if (isLoading) return <NegociacionSkeleton />
  if (!negociacion) return <SinNegociacion />

  if (negociacion.estado === 'Cerrada por Renuncia')
    return (
      <NegociacionCerradaRenuncia
        fechaRenuncia={negociacion.fecha_renuncia_efectiva}
      />
    )

  const proyecto = negociacion.proyecto?.nombre ?? '—'
  const vivienda = negociacion.vivienda
  const manzana = vivienda?.manzanas?.nombre
  const numero = vivienda?.numero
  const valorEscritura = negociacion.valor_escritura_publica ?? 0
  const notasNeg = negociacion.notas ?? ''
  const saldo = negociacion.saldo_pendiente ?? valorVivienda - totalAbonado
  const pctPagado =
    negociacion.porcentaje_pagado ??
    (valorVivienda > 0 ? (totalAbonado / valorVivienda) * 100 : 0)
  const descuento = negociacion.descuento_aplicado ?? 0
  const pctDescuento = negociacion.porcentaje_descuento ?? 0

  // Fuente con cuotas expandidas (para renderizar CuotasCreditoTab fuera del grid)
  const creditoExpandido = fuentesPago.find(
    f => esCreditoConstructora(f.tipo) && cuotasExpandidas[f.id]
  )

  const abonosParaUI = abonos as Array<{
    id: string
    negociacion_id?: string
    fuente_pago_id?: string
    monto: number
    fecha_abono: string
    metodo_pago?: string | null
    numero_referencia?: string | null
    notas?: string | null
    comprobante_url?: string | null
  }>

  return (
    <div className='space-y-3'>
      {/* ─── BLOQUE 1: HEADER UNIFICADO + KPIs ───── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className='overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/50 dark:bg-gray-800/50'
      >
        {/* Row 1: Identificación de vivienda */}
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
                : negociacion.estado === 'Cerrada por Renuncia'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            {negociacion.estado}
          </span>
        </div>

        {/* Row 2: Acciones */}
        <div className='flex items-center justify-end gap-2 border-b border-gray-100 px-4 py-2 dark:border-gray-700/40'>
          <button
            onClick={() => router.push(`/abonos?negociacion=${negociacion.id}`)}
            className='inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 transition-all hover:border-cyan-300 hover:bg-cyan-100 hover:shadow-sm dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/40'
          >
            <ArrowUpRight className='h-3.5 w-3.5' />
            Ir a Abonos
          </button>
          {isAdmin &&
          (negociacion.estado === 'Activa' ||
            negociacion.estado === 'Suspendida') ? (
            <button
              onClick={() => setModalRenunciaOpen(true)}
              className='inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition-all hover:border-red-300 hover:bg-red-100 hover:shadow-sm dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
            >
              <FileX className='h-3.5 w-3.5' />
              Registrar Renuncia
            </button>
          ) : null}
        </div>

        {/* KPIs row — 5 cols cuando hay descuento, 4 cols si no */}
        <div
          className={`grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700/40 ${descuento > 0 ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}
        >
          {/* KPI 1: Valor Total a Pagar */}
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
              <div className='mt-1'>
                <span className='inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:border-indigo-800/40 dark:bg-indigo-950/30 dark:text-indigo-400'>
                  <FileText className='h-2.5 w-2.5' />
                  Escritura: {formatCurrency(valorEscritura)}
                </span>
              </div>
            ) : null}
          </div>

          {/* KPI 2 (condicional): Descuento aplicado */}
          {descuento > 0 ? (
            <div className='border-l border-gray-100 px-4 py-2.5 dark:border-gray-700/40'>
              <div className='mb-0.5 flex items-center gap-1'>
                <Percent className='h-3 w-3 text-violet-500' />
                <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                  Descuento
                </span>
              </div>
              <p className='text-sm font-bold tabular-nums text-violet-600 dark:text-violet-400'>
                -{formatCurrency(descuento)}
              </p>
              {pctDescuento > 0 ? (
                <p className='mt-0.5 text-[11px] font-medium text-violet-500 dark:text-violet-500'>
                  {pctDescuento}% del valor
                </p>
              ) : null}
            </div>
          ) : null}
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

      {/* ─── BANNER: Detalle del descuento aplicado ─── */}
      {descuento > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.035 }}
          className='overflow-hidden rounded-xl border border-violet-200/60 bg-violet-50/60 dark:border-violet-800/40 dark:bg-violet-950/20'
        >
          <div className='flex items-start gap-0'>
            <div className='w-1 self-stretch bg-violet-400 dark:bg-violet-600' />
            <div className='flex flex-1 flex-wrap items-start gap-x-6 gap-y-1.5 px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Tag className='h-3.5 w-3.5 flex-shrink-0 text-violet-500 dark:text-violet-400' />
                <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                  Tipo
                </span>
                <span className='inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'>
                  {negociacion.tipo_descuento
                    ? (LABELS_TIPO_DESCUENTO[
                        negociacion.tipo_descuento as keyof typeof LABELS_TIPO_DESCUENTO
                      ] ?? negociacion.tipo_descuento)
                    : 'Sin clasificar'}
                </span>
              </div>
              {negociacion.motivo_descuento ? (
                <div className='flex min-w-0 flex-1 items-center gap-2'>
                  <FileText className='h-3.5 w-3.5 flex-shrink-0 text-violet-400 dark:text-violet-500' />
                  <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                    Motivo
                  </span>
                  <p className='text-[11px] text-gray-700 dark:text-gray-300'>
                    {negociacion.motivo_descuento}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}

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
            {/* Balance badge inline (solo si balanceado) */}
            {fuentesPago.length > 0 && estaBalanceado ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
                <CheckCircle2 className='h-3 w-3' />
                Cubierto
              </span>
            ) : null}
          </div>
          {isAdmin ? (
            <div className='flex items-center gap-2'>
              {negociacion.estado === 'Activa' ? (
                <button
                  onClick={openDescuento}
                  className='inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-800/40 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/30'
                >
                  <Percent className='h-3.5 w-3.5' />
                  {descuento > 0 ? 'Modificar Descuento' : 'Aplicar Descuento'}
                </button>
              ) : null}
              <button
                onClick={openRebalancear}
                className='inline-flex items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-[11px] font-semibold text-cyan-800 shadow-sm transition-colors hover:bg-cyan-100 hover:shadow dark:border-cyan-700/50 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/40'
              >
                <SlidersHorizontal className='h-3.5 w-3.5' />
                Ajustar Cierre Financiero
              </button>
            </div>
          ) : (
            <span className='inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500'>
              <Lock className='h-3 w-3' />
              Solo lectura
            </span>
          )}
        </div>

        <div className='space-y-3 p-3'>
          {/* ⚠️ ALERTA URGENTE: Descuadre financiero */}
          {fuentesPago.length > 0 && !estaBalanceado ? (
            <div className='relative overflow-hidden rounded-lg border border-red-300 bg-gradient-to-r from-red-50 via-red-50 to-orange-50 dark:border-red-800/60 dark:from-red-950/40 dark:via-red-950/30 dark:to-orange-950/20'>
              <div className='absolute left-0 top-0 h-full w-1 bg-red-500' />
              <div className='flex items-center gap-3 px-4 py-2.5'>
                <div className='relative flex-shrink-0'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40'>
                    <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-400' />
                  </div>
                  <span className='absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-red-50 bg-red-500 dark:border-red-950'>
                    <span className='absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75' />
                  </span>
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-bold text-red-800 dark:text-red-300'>
                    Descuadre en Cierre Financiero — Atención Requerida
                  </p>
                  <p className='mt-0.5 text-[10px] text-red-700 dark:text-red-400'>
                    {diferencia > 0
                      ? `Faltan ${formatCurrency(diferencia)} para cubrir el valor total.`
                      : `Sobran ${formatCurrency(Math.abs(diferencia))} en las fuentes de pago.`}{' '}
                    Los registros de abonos permanecerán bloqueados hasta
                    resolver el descuadre.
                  </p>
                </div>
                {isAdmin ? (
                  <button
                    onClick={openRebalancear}
                    className='flex-shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                  >
                    Corregir ahora
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {fuentesPago.length === 0 ? (
            <p className='py-4 text-center text-xs text-gray-400 dark:text-gray-500'>
              {isAdmin
                ? 'Sin fuentes configuradas. Usa "Redistribuir" para agregarlas.'
                : 'Sin fuentes de pago configuradas.'}
            </p>
          ) : (
            <>
              {/* Docs pendientes banner (compacto + clickeable) */}
              {totalDocsPendientes > 0 ? (
                <button
                  type='button'
                  onClick={onIrADocumentos}
                  className='flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-left transition-colors hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-950/30 dark:hover:bg-amber-950/50'
                >
                  <AlertTriangle className='h-3 w-3 flex-shrink-0 text-amber-500' />
                  <p className='flex-1 text-[10px] text-amber-800 dark:text-amber-300'>
                    <span className='font-semibold'>{totalDocsPendientes}</span>{' '}
                    doc{totalDocsPendientes !== 1 ? 's' : ''} pendiente
                    {totalDocsPendientes !== 1 ? 's' : ''}
                    {totalDocsObligatoriosPendientes > 0 ? (
                      <span className='ml-1 font-semibold text-red-600 dark:text-red-400'>
                        ({totalDocsObligatoriosPendientes} oblig.)
                      </span>
                    ) : null}
                    <span className='ml-1 text-amber-600 underline dark:text-amber-400'>
                      Ir a <strong>Documentos</strong>
                    </span>
                  </p>
                  <ArrowUpRight className='h-3 w-3 flex-shrink-0 text-amber-500' />
                </button>
              ) : null}

              {/* Título de sección */}
              <p className='text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Distribución por Fuente
              </p>

              {/* Grid de fuentes — se adapta al número de fuentes */}
              <div
                className={`grid gap-2 ${
                  fuentesPago.length === 1
                    ? 'grid-cols-1'
                    : fuentesPago.length === 2
                      ? 'grid-cols-2'
                      : fuentesPago.length === 3
                        ? 'grid-cols-3'
                        : 'grid-cols-2'
                }`}
              >
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
        {/* Banner de bloqueo si hay descuadre */}
        {fuentesPago.length > 0 && !estaBalanceado ? (
          <div className='flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 dark:border-red-900/40 dark:bg-red-950/30'>
            <Shield className='h-3.5 w-3.5 flex-shrink-0 text-red-500' />
            <p className='text-[10px] font-medium text-red-700 dark:text-red-400'>
              Registro de abonos bloqueado hasta corregir el descuadre
              financiero
            </p>
          </div>
        ) : null}
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
              setAbonoEditando({
                ...abono,
                fuente_tipo: fuente?.tipo ?? '',
              })
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
          tiposConfig={tiposConfigConEntidad}
          requisitosMap={requisitosMap}
          entidadesPorTipoEntidad={entidadesPorTipoEntidad}
          onGuardar={handleGuardarRebalanceo}
          isGuardando={isRebalanceando}
        />
      ) : null}

      {/* Modal Admin: Aplicar/Modificar Descuento */}
      {isAdmin ? (
        <DescuentoModal
          isOpen={modalDescuentoOpen}
          onClose={closeDescuento}
          onGuardar={handleAplicarDescuento}
          isGuardando={isAplicandoDescuento}
          valorNegociado={negociacion.valor_negociado}
          descuentoActual={descuento}
          tipoDescuentoActual={negociacion.tipo_descuento}
          motivoDescuentoActual={negociacion.motivo_descuento}
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

      {/* Modal Admin: Registrar Renuncia */}
      {isAdmin && modalRenunciaOpen ? (
        <RegistrarRenunciaModal
          negociacionId={negociacion.id}
          onClose={() => setModalRenunciaOpen(false)}
          onExitosa={() => {
            setModalRenunciaOpen(false)
            router.push('/renuncias')
          }}
        />
      ) : null}
    </div>
  )
}
