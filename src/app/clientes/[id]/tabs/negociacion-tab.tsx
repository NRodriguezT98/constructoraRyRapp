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
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  FileX,
  Home,
  Info,
  ListChecks,
  Lock,
  Percent,
  RefreshCw,
  Shield,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { ModalEditarAbono } from '@/modules/abonos/components/modal-editar-abono'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'
import type { Cliente } from '@/modules/clientes/types'
import { CuotasCreditoTab } from '@/modules/fuentes-pago/components/CuotasCreditoTab'
import { RegistrarRenunciaModal } from '@/modules/renuncias/components/modals/RegistrarRenunciaModal'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import { formatCurrency } from '@/shared/utils/format'

import {
  AbonosRecientes,
  FuenteMiniCard,
  RebalancearModal,
} from './negociacion/components'
import { useNegociacionTab } from './negociacion/hooks'

interface NegociacionTabProps {
  cliente: Cliente
  onIrADocumentos?: () => void
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='space-y-4 rounded-xl border border-gray-200/50 bg-gradient-to-br from-white/90 via-indigo-50/90 to-violet-50/90 p-5 text-center shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-indigo-950/50'
    >
      {/* Icón con gradiente */}
      <div className='flex justify-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className='flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 shadow-2xl shadow-indigo-500/30'
        >
          <Home className='h-8 w-8 text-white' />
        </motion.div>
      </div>

      {/* Título y descripción */}
      <h3 className='bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-gray-100 dark:to-indigo-100'>
        Sin Vivienda Asignada
      </h3>
      <p className='mx-auto max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
        Cuando este cliente tenga una vivienda asignada, aquí podrás gestionar
        su plan de pagos, fuentes de financiación y seguimiento de abonos.
      </p>

      {/* Checklist de beneficios */}
      <div className='rounded-xl border border-gray-200/80 bg-white/60 p-3 text-left shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/40'>
        <div className='mb-2.5 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300'>
          <ListChecks className='h-4 w-4' />
          ¿Qué desbloquea una vivienda asignada?
        </div>
        <div className='space-y-2'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
              <DollarSign className='h-3 w-3 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Plan de pagos y fuentes de financiación
              </p>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Cuota inicial, crédito hipotecario, Mi Casa Ya y más
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
              <TrendingUp className='h-3 w-3 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Seguimiento de abonos en tiempo real
              </p>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Historial de pagos, saldo pendiente y porcentaje pagado
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
              <Wallet className='h-3 w-3 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Control financiero completo
              </p>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Barra de avance, descuentos aplicados y gastos notariales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className='rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 p-3 backdrop-blur-sm dark:border-indigo-800/50 dark:from-indigo-950/30 dark:via-violet-950/30 dark:to-purple-950/30'>
        <div className='flex items-start gap-3 text-left'>
          <Lock className='mt-1 h-6 w-6 flex-shrink-0 animate-pulse text-indigo-600 dark:text-indigo-400' />
          <div className='flex-1'>
            <h4 className='mb-1 text-sm font-bold text-indigo-900 dark:text-indigo-100'>
              ¿Cómo comenzar?
            </h4>
            <p className='text-xs leading-relaxed text-indigo-700 dark:text-indigo-300'>
              Usa el botón <strong>&ldquo;Asignar Vivienda&rdquo;</strong> en la
              parte superior de este perfil para vincular una vivienda
              disponible a este cliente e iniciar la negociación.
            </p>
          </div>
        </div>
      </div>

      {/* Footer informativo */}
      <div className='flex items-start gap-3 border-t border-gray-200 pt-3 text-left dark:border-gray-700'>
        <Info className='mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400' />
        <p className='text-xs leading-relaxed text-gray-600 dark:text-gray-400'>
          La negociación es el núcleo del proceso de venta. Registra todos los
          movimientos financieros del cliente desde la asignación hasta la
          escrituración.
        </p>
      </div>
    </motion.div>
  )
}

function NegociacionCerradaRenuncia({
  fechaRenuncia,
}: {
  fechaRenuncia?: string | null
}) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='space-y-4 rounded-xl border border-gray-200/50 bg-gradient-to-br from-white/90 via-red-50/90 to-rose-50/90 p-5 text-center shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-red-950/50'
    >
      {/* Icono con gradiente */}
      <div className='flex justify-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className='flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 shadow-2xl shadow-red-500/30'
        >
          <FileX className='h-8 w-8 text-white' />
        </motion.div>
      </div>

      {/* Título y descripción */}
      <h3 className='bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-gray-100 dark:to-red-100'>
        Negociación Cerrada por Renuncia
      </h3>
      <p className='mx-auto max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
        Este cliente renunció a su negociación. La vivienda fue liberada y las
        fuentes de pago desactivadas. Los detalles completos están disponibles
        en el módulo de Renuncias.
      </p>

      {/* Fecha de renuncia */}
      {fechaRenuncia ? (
        <div className='inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-100 px-3 py-1.5 dark:border-red-800/50 dark:bg-red-900/30'>
          <Clock className='h-3.5 w-3.5 text-red-500 dark:text-red-400' />
          <span className='text-xs font-semibold text-red-700 dark:text-red-300'>
            Renunció el {formatDateCompact(fechaRenuncia)}
          </span>
        </div>
      ) : null}

      {/* Info card */}
      <div className='rounded-xl border border-gray-200/80 bg-white/60 p-3 text-left shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/40'>
        <div className='mb-2.5 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300'>
          <Shield className='h-4 w-4' />
          Acciones realizadas automáticamente
        </div>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
              <FileX className='h-3 w-3 text-red-600 dark:text-red-400' />
            </div>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Negociación cerrada permanentemente
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
              <Home className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
            </div>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Vivienda liberada y disponible
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/50'>
              <Wallet className='h-3 w-3 text-gray-600 dark:text-gray-400' />
            </div>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Fuentes de pago inactivadas
            </p>
          </div>
        </div>
      </div>

      {/* CTA — Ir a módulo de Renuncias */}
      <div className='rounded-xl border border-red-200/50 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 p-3 backdrop-blur-sm dark:border-red-800/50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-pink-950/30'>
        <div className='flex items-start gap-4 text-left'>
          <Info className='mt-1 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400' />
          <div className='flex-1'>
            <h4 className='mb-1 text-sm font-bold text-red-900 dark:text-red-100'>
              Consulta los detalles completos
            </h4>
            <p className='text-xs leading-relaxed text-red-700 dark:text-red-300'>
              En el módulo de Renuncias encontrarás el motivo, snapshots de
              datos, estado de devolución y toda la información histórica de
              esta renuncia.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/renuncias')}
          className='mt-3 inline-flex w-full transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-[1.02] hover:from-red-600 hover:via-rose-700 hover:to-pink-700 hover:shadow-2xl hover:shadow-red-500/40 active:scale-[0.98]'
        >
          <ExternalLink className='h-4 w-4' />
          Ver en módulo de Renuncias
        </button>
      </div>
    </motion.div>
  )
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
  if (negociacion.estado === 'Cerrada por Renuncia')
    return (
      <NegociacionCerradaRenuncia
        fechaRenuncia={(negociacion as any).fecha_renuncia_efectiva}
      />
    )

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
                : negociacion.estado === 'Cerrada por Renuncia'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
          {isAdmin &&
          (negociacion.estado === 'Activa' ||
            negociacion.estado === 'Suspendida') ? (
            <button
              onClick={() => setModalRenunciaOpen(true)}
              className='inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition-all hover:border-red-300 hover:bg-red-100 hover:shadow-sm dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
              title='Registrar Renuncia'
            >
              <FileX className='h-3.5 w-3.5' />
              Renuncia
            </button>
          ) : null}
        </div>

        {/* Badges row (solo descuento si aplica) */}
        {descuento > 0 ? (
          <div className='flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-1.5 dark:border-gray-700/40'>
            <span className='rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'>
              -{formatCurrency(descuento)}
              {pctDescuento > 0 ? ` (${pctDescuento}%)` : ''} dto.
            </span>
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
                    : diferencia > 0
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                }`}
              >
                {estaBalanceado ? (
                  <>
                    <CheckCircle2 className='h-3 w-3' />{' '}
                    {formatCurrency(valorVivienda)} cubierto
                  </>
                ) : diferencia > 0 ? (
                  <>
                    <AlertTriangle className='h-3 w-3' /> Faltan{' '}
                    {formatCurrency(diferencia)}
                  </>
                ) : (
                  <>
                    <AlertTriangle className='h-3 w-3' /> Sobran{' '}
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
