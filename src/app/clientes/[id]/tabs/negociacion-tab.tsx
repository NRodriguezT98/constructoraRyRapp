'use client'

/**
 * NegociacionTab — Tab unificado de negociación
 *
 * Reemplaza los tabs anteriores "Vivienda Asignada" y "Fuentes de Pago"
 * en un único panel coherente con tres secciones:
 *
 * 1. Header de vivienda asignada
 * 2. Plan Financiero (balance equation + fuentes editables por Admin)
 * 3. Abonos recientes
 */

import { motion } from 'framer-motion'
import {
    ArrowUpRight,
    Building2,
    ChevronDown,
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

import { AlertTriangle } from 'lucide-react'

import {
    AbonosRecientes,
    BarraFinanciera,
    FuenteCardPlan,
    IndicadorBalance,
    RebalancearModal,
} from './negociacion/components'
import { useNegociacionTab } from './negociacion/hooks'

interface NegociacionTabProps {
  cliente: Cliente
}

// ============================================
// LOADING SKELETON
// ============================================

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 rounded-xl bg-gray-100 dark:bg-gray-700/40" />
      <div className="h-8 rounded-lg bg-gray-100 dark:bg-gray-700/40 w-3/4" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-700/40" />
        ))}
      </div>
    </div>
  )
}

// ============================================
// EMPTY STATE (sin negociación)
// ============================================

function SinNegociacion({ onAsignar }: { onAsignar?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
        <Home className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Sin vivienda asignada
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Cuando el cliente tenga una vivienda asignada, aquí verás el plan de pagos y el
          seguimiento de abonos.
        </p>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function NegociacionTab({ cliente }: NegociacionTabProps) {
  const router = useRouter()
  const [cuotasExpandidas, setCuotasExpandidas] = useState<Record<string, boolean>>({})

  const toggleCuotas = (fuenteId: string) => {
    setCuotasExpandidas(prev => ({ ...prev, [fuenteId]: !prev[fuenteId] }))
  }

  const {
    negociacion,
    valorVivienda,
    fuentesPago,
    abonos,
    totalAbonado,
    totalFuentes,
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
    pendientesCompartidos,
    totalDocsPendientes,
    totalDocsObligatoriosPendientes,
    refetchFuentes,
  } = useNegociacionTab({ cliente })

  if (isLoading) return <Skeleton />
  if (!negociacion) return <SinNegociacion />

  const proyecto = (negociacion as any).proyecto?.nombre ?? '—'
  const vivienda = (negociacion as any).vivienda
  const manzana = vivienda?.manzanas?.nombre
  const numero = vivienda?.numero
  const valorEscrituraPublica = (negociacion as any).valor_escritura_publica ?? 0
  const notasNegociacion = (negociacion as any).notas ?? ''

  // Datos financieros del resumen
  const valorNegociado = (negociacion as any).valor_negociado ?? 0
  const descuentoAplicado = (negociacion as any).descuento_aplicado ?? 0
  const tipoDescuento = (negociacion as any).tipo_descuento ?? ''
  const porcentajeDescuento = (negociacion as any).porcentaje_descuento ?? 0
  const saldoPendiente = (negociacion as any).saldo_pendiente ?? (valorVivienda - totalAbonado)
  const porcentajePagado = (negociacion as any).porcentaje_pagado ?? (valorVivienda > 0 ? (totalAbonado / valorVivienda) * 100 : 0)

  return (
    <div className="space-y-4">
      {/* ─── 1. HEADER: Vivienda asignada ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-100 dark:border-cyan-900/30"
      >
        <div className="w-10 h-10 rounded-xl bg-cyan-600/10 dark:bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
          <Home className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {proyecto}
              </p>
              {(manzana || numero) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {manzana ? `Manzana ${manzana}` : ''}{manzana && numero ? ' · ' : ''}
                  {numero ? `Casa ${numero}` : ''}
                </p>
              )}
            </div>

            {/* Estado badge */}
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                negociacion.estado === 'Activa'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              }`}
            >
              {negociacion.estado}
            </span>
          </div>

          {/* Valor vivienda + escritura */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Valor:{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                {formatCurrency(valorVivienda)}
              </span>
            </p>
            {valorEscrituraPublica > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Escritura:{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                  {formatCurrency(valorEscrituraPublica)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Link a módulo de abonos */}
        <button
          onClick={() => router.push(`/abonos?negociacion=${negociacion.id}`)}
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-gray-700/50 transition-colors"
          title="Ir a abonos"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* ─── 2. RESUMEN EJECUTIVO FINANCIERO ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.03 }}
        className="rounded-xl bg-white dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/50 overflow-hidden"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-700/50">
          {/* Valor total */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-cyan-500" />
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">
                Valor total
              </p>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
              {formatCurrency(valorVivienda)}
            </p>
            {descuentoAplicado > 0 && (
              <p className="text-[10px] text-amber-500 font-medium mt-0.5">
                -{formatCurrency(descuentoAplicado)} dto.{porcentajeDescuento > 0 ? ` (${porcentajeDescuento}%)` : ''}
              </p>
            )}
          </div>

          {/* Total abonado */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">
                Abonado
              </p>
            </div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(totalAbonado)}
            </p>
          </div>

          {/* Saldo pendiente */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">
                Saldo
              </p>
            </div>
            <p className={`text-sm font-bold tabular-nums ${saldoPendiente <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
              {formatCurrency(Math.max(saldoPendiente, 0))}
            </p>
          </div>

          {/* Porcentaje pagado */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Percent className="w-3.5 h-3.5 text-blue-500" />
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">
                Avance
              </p>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
              {Math.min(porcentajePagado, 100).toFixed(1)}%
            </p>
            {/* Mini progress bar */}
            <div className="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── 3. PLAN DE PAGOS ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.06 }}
        className="rounded-xl bg-white dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/50 overflow-hidden"
      >
        {/* Header sección */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Plan de Pagos
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({fuentesPago.length} fuente{fuentesPago.length !== 1 ? 's' : ''})
            </span>
          </div>

          {/* Admin → botón rebalancear */}
          {isAdmin && (
            <button
              onClick={openRebalancear}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors border border-cyan-200 dark:border-cyan-800/40"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Redistribuir montos
            </button>
          )}

          {/* No-Admin → badge informativo */}
          {!isAdmin && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Lock className="w-3 h-3" />
              Solo lectura
            </span>
          )}
        </div>

        <div className="p-4 space-y-4">
          {fuentesPago.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
              {isAdmin
                ? 'No hay fuentes configuradas. Usa "Redistribuir montos" para agregarlas.'
                : 'No hay fuentes de pago configuradas.'}
            </div>
          ) : (
            <>
              {/* Barra visual proporcional */}
              <BarraFinanciera fuentesPago={fuentesPago} valorVivienda={valorVivienda} />

              {/* Indicador de balance (arriba de las fuentes para visibilidad) */}
              <IndicadorBalance
                valorVivienda={valorVivienda}
                totalFuentes={totalFuentes}
                diferencia={diferencia}
                estaBalanceado={estaBalanceado}
              />

              {/* Admin: advertencia si desequilibrado */}
              {isAdmin && !estaBalanceado && (
                <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                  Usa{' '}
                  <button onClick={openRebalancear} className="underline font-semibold">
                    Redistribuir montos
                  </button>{' '}
                  para corregir el balance.
                </p>
              )}

              {/* Banner documentos pendientes (compacto) */}
              {totalDocsPendientes > 0 && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 flex-1">
                    <span className="font-semibold">{totalDocsPendientes}</span> documento{totalDocsPendientes !== 1 ? 's' : ''} pendiente{totalDocsPendientes !== 1 ? 's' : ''}
                    {totalDocsObligatoriosPendientes > 0 && (
                      <span className="ml-1 text-red-600 dark:text-red-400 font-semibold">
                        ({totalDocsObligatoriosPendientes} obligatorio{totalDocsObligatoriosPendientes !== 1 ? 's' : ''})
                      </span>
                    )}
                    <span className="text-amber-600 dark:text-amber-400"> — Ir a pestaña </span>
                    <strong>Documentos</strong>
                  </p>
                </div>
              )}

              {/* Cards por fuente (con cuotas integradas para créditos) */}
              <div className="space-y-2">
                {fuentesPago.map((fuente) => {
                  const esCredito = esCreditoConstructora(fuente.tipo)
                  const expandido = cuotasExpandidas[fuente.id] ?? false

                  return (
                    <div key={fuente.id}>
                      <FuenteCardPlan
                        fuente={fuente}
                        valorVivienda={valorVivienda}
                        docsPendientes={pendientesPorFuente[fuente.id]}
                        colorToken={tiposFuentes.find((t) => t.nombre === fuente.tipo)?.color}
                      />

                      {/* Plan de cuotas integrado para créditos con la constructora */}
                      {esCredito ? (
                        <div className="mt-1 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleCuotas(fuente.id)}
                            className="flex items-center justify-between w-full gap-2 px-4 py-2.5 bg-indigo-50/60 dark:bg-indigo-950/20 border-b border-indigo-200/40 dark:border-indigo-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                              <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                Plan de cuotas
                              </h4>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-indigo-400 dark:text-indigo-500 transition-transform duration-200 ${
                                expandido ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {expandido ? (
                            <div className="p-3">
                              <CuotasCreditoTab
                                fuentePagoId={fuente.id}
                                negociacionId={negociacion!.id}
                                montoFuente={fuente.monto_aprobado}
                                onPagoCuotaRegistrado={() => { refetchFuentes() }}
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* ─── 4. NOTAS DE LA NEGOCIACIÓN ──────────────────────── */}
      {notasNegociacion ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30"
        >
          <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-0.5">Notas</p>
            <p className="text-xs text-amber-800 dark:text-amber-200 whitespace-pre-wrap">{notasNegociacion}</p>
          </div>
        </motion.div>
      ) : null}

      {/* ─── 5. ABONOS RECIENTES ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.12 }}
        className="rounded-xl bg-white dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/50 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Abonos recibidos
            </h3>
          </div>
          {isLoadingAbonos && (
            <RefreshCw className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 animate-spin" />
          )}
        </div>

        <div className="p-4">
          <AbonosRecientes
            abonos={abonos as any}
            totalAbonado={totalAbonado}
            negociacionId={negociacion.id}
            isLoading={isLoadingAbonos}
          />
        </div>
      </motion.div>

      {/* ─── MODAL ADMIN: Redistribuir montos ─────────────── */}
      {isAdmin && (
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
      )}
    </div>
  )
}
