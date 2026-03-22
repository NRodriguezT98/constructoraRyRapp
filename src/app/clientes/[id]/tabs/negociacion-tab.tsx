'use client'

/**
 * NegociacionTab — Vista compacta de negociación
 *
 * 3 bloques:
 * 1. Header unificado (vivienda + KPIs financieros)
 * 2. Plan de Pagos (grid de fuentes + barra visual)
 * 3. Abonos recientes
 */

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
import { useState } from 'react'

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
    <div className="space-y-3 animate-pulse">
      <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-700/40" />
      <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-700/40" />
      <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-700/40" />
    </div>
  )
}

function SinNegociacion() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
        <Home className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Sin vivienda asignada</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Cuando el cliente tenga una vivienda asignada, aquí verás el plan de pagos y el seguimiento de abonos.
      </p>
    </div>
  )
}

export function NegociacionTab({ cliente }: NegociacionTabProps) {
  const router = useRouter()
  const [cuotasExpandidas, setCuotasExpandidas] = useState<Record<string, boolean>>({})
  const toggleCuotas = (id: string) => setCuotasExpandidas((p) => ({ ...p, [id]: !p[id] }))

  const {
    negociacion, valorVivienda, fuentesPago, abonos, totalAbonado,
    totalFuentes, diferencia, estaBalanceado, tiposDisponibles, tiposFuentes,
    requisitosMap, isLoading, isLoadingAbonos, isRebalanceando, isAdmin,
    modalRebalancearOpen, openRebalancear, closeRebalancear, handleGuardarRebalanceo,
    pendientesPorFuente, totalDocsPendientes, totalDocsObligatoriosPendientes, refetchFuentes,
  } = useNegociacionTab({ cliente })

  if (isLoading) return <Skeleton />
  if (!negociacion) return <SinNegociacion />

  const proyecto = (negociacion as any).proyecto?.nombre ?? '—'
  const vivienda = (negociacion as any).vivienda
  const manzana = vivienda?.manzanas?.nombre
  const numero = vivienda?.numero
  const valorEscritura = (negociacion as any).valor_escritura_publica ?? 0
  const notasNeg = (negociacion as any).notas ?? ''
  const saldo = (negociacion as any).saldo_pendiente ?? (valorVivienda - totalAbonado)
  const pctPagado = (negociacion as any).porcentaje_pagado ?? (valorVivienda > 0 ? (totalAbonado / valorVivienda) * 100 : 0)
  const descuento = (negociacion as any).descuento_aplicado ?? 0
  const pctDescuento = (negociacion as any).porcentaje_descuento ?? 0
  const valorBaseLista = vivienda?.valor_base ?? 0
  const valorNegociado = (negociacion as any).valor_negociado ?? 0
  const hayDivergencia = valorBaseLista > 0 && valorNegociado > 0 && Math.abs(valorBaseLista - valorNegociado) >= 1

  // Fuente con cuotas expandidas (para renderizar CuotasCreditoTab fuera del grid)
  const creditoExpandido = fuentesPago.find((f) => esCreditoConstructora(f.tipo) && cuotasExpandidas[f.id])

  return (
    <div className="space-y-3">
      {/* ─── BLOQUE 1: HEADER UNIFICADO + KPIs ───── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/50 overflow-hidden"
      >
        {/* Vivienda row */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/40">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
            <Home className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{proyecto}</p>
            {(manzana || numero) ? (
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {manzana ? `Manzana ${manzana}` : ''}{manzana && numero ? ' · ' : ''}{numero ? `Casa ${numero}` : ''}
              </p>
            ) : null}
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
            negociacion.estado === 'Activa'
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
          }`}>
            {negociacion.estado}
          </span>
          <button
            onClick={() => router.push(`/abonos?negociacion=${negociacion.id}`)}
            className="p-1 rounded-md text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors flex-shrink-0"
            title="Ir a abonos"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Badges row (solo divergencia y descuento si aplican) */}
        {(hayDivergencia || descuento > 0) ? (
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-gray-100 dark:border-gray-700/40 flex-wrap">
            {descuento > 0 ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium">
                -{formatCurrency(descuento)}{pctDescuento > 0 ? ` (${pctDescuento}%)` : ''} dto.
              </span>
            ) : null}
            {hayDivergencia ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-2.5 h-2.5" />
                Lista: {formatCurrency(valorBaseLista)} · Negociado: {formatCurrency(valorNegociado)}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* 4 KPIs row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-700/40">
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <DollarSign className="w-3 h-3 text-cyan-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Valor Total a Pagar</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(valorVivienda)}</p>
            {valorEscritura > 0 ? (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
                  <FileText className="w-2.5 h-2.5" />
                  Valor en Escritura: <span className="font-bold tabular-nums">{formatCurrency(valorEscritura)}</span>
                </span>
              </div>
            ) : null}
          </div>
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Wallet className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Abonado</span>
            </div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(totalAbonado)}</p>
          </div>
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Saldo</span>
            </div>
            <p className={`text-sm font-bold tabular-nums ${saldo <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
              {formatCurrency(Math.max(saldo, 0))}
            </p>
          </div>
          <div className="px-4 py-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Percent className="w-3 h-3 text-blue-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Avance</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{Math.min(pctPagado, 100).toFixed(1)}%</p>
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
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
        className="rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/50 overflow-hidden"
      >
        {/* Header: título + balance inline + botón */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/40">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Plan de Pagos</h3>
            <span className="text-[10px] text-gray-400">({fuentesPago.length})</span>
            {/* Balance badge inline */}
            {fuentesPago.length > 0 ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                estaBalanceado
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}>
                {estaBalanceado
                  ? <><CheckCircle2 className="w-3 h-3" /> {formatCurrency(valorVivienda)} cubierto</>
                  : <><AlertTriangle className="w-3 h-3" /> Faltan {formatCurrency(Math.abs(diferencia))}</>
                }
              </span>
            ) : null}
          </div>
          {isAdmin ? (
            <button
              onClick={openRebalancear}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors border border-cyan-200 dark:border-cyan-800/40"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Redistribuir
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
              <Lock className="w-3 h-3" />
              Solo lectura
            </span>
          )}
        </div>

        <div className="p-3 space-y-3">
          {fuentesPago.length === 0 ? (
            <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
              {isAdmin ? 'Sin fuentes configuradas. Usa "Redistribuir" para agregarlas.' : 'Sin fuentes de pago configuradas.'}
            </p>
          ) : (
            <>
              {/* Barra visual proporcional */}
              <BarraFinanciera fuentesPago={fuentesPago} valorVivienda={valorVivienda} tiposFuentes={tiposFuentes} />

              {/* Docs pendientes banner (compacto) */}
              {totalDocsPendientes > 0 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                  <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <p className="text-[10px] text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">{totalDocsPendientes}</span> doc{totalDocsPendientes !== 1 ? 's' : ''} pendiente{totalDocsPendientes !== 1 ? 's' : ''}
                    {totalDocsObligatoriosPendientes > 0 ? (
                      <span className="ml-1 text-red-600 dark:text-red-400 font-semibold">({totalDocsObligatoriosPendientes} oblig.)</span>
                    ) : null}
                    <span className="text-amber-600 dark:text-amber-400"> — Ir a <strong>Documentos</strong></span>
                  </p>
                </div>
              ) : null}

              {/* Grid de fuentes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {fuentesPago.map((fuente) => (
                  <FuenteMiniCard
                    key={fuente.id}
                    fuente={fuente}
                    valorVivienda={valorVivienda}
                    docsPendientes={pendientesPorFuente[fuente.id]}
                    colorToken={tiposFuentes.find((t) => t.nombre === fuente.tipo)?.color}
                    cuotasExpandidas={cuotasExpandidas[fuente.id]}
                    onToggleCuotas={esCreditoConstructora(fuente.tipo) ? () => toggleCuotas(fuente.id) : undefined}
                  />
                ))}
              </div>

              {/* Cuotas de crédito constructora (full-width below grid) */}
              {creditoExpandido ? (
                <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/30 dark:bg-indigo-950/10 p-3">
                  <CuotasCreditoTab
                    fuentePagoId={creditoExpandido.id}
                    negociacionId={negociacion!.id}
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
          className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30"
        >
          <FileText className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-0.5">Notas</p>
            <p className="text-xs text-amber-800 dark:text-amber-200 whitespace-pre-wrap">{notasNeg}</p>
          </div>
        </motion.div>
      ) : null}

      {/* ─── BLOQUE 3: ABONOS RECIENTES ───── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08 }}
        className="rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/50 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/40">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Abonos recibidos</h3>
          </div>
          {isLoadingAbonos ? <RefreshCw className="w-3 h-3 text-gray-300 dark:text-gray-600 animate-spin" /> : null}
        </div>
        <div className="p-3">
          <AbonosRecientes
            abonos={abonos as any}
            totalAbonado={totalAbonado}
            negociacionId={negociacion.id}
            isLoading={isLoadingAbonos}
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
    </div>
  )
}
