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
    DollarSign,
    Home,
    Lock,
    RefreshCw,
    SlidersHorizontal,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import type { Cliente } from '@/modules/clientes/types'
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
          Cuando el cliente tenga una vivienda asignada, aquí verás el cierre financiero y el
          seguimiento de pagos.
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
  } = useNegociacionTab({ cliente })

  if (isLoading) return <Skeleton />
  if (!negociacion) return <SinNegociacion />

  const proyecto = (negociacion as any).proyecto?.nombre ?? '—'
  const vivienda = (negociacion as any).vivienda
  const manzana = vivienda?.manzanas?.nombre
  const numero = vivienda?.numero

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
                  {manzana ? `Mza. ${manzana}` : ''}{manzana && numero ? ' · ' : ''}
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

          {/* Valor vivienda */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            Valor:{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
              {formatCurrency(valorVivienda)}
            </span>
          </p>
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

      {/* ─── 2. CIERRE FINANCIERO ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="rounded-xl bg-white dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/50 overflow-hidden"
      >
        {/* Header sección */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Cierre Financiero
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
              Ajustar cierre
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
                ? 'No hay fuentes configuradas. Usa "Ajustar cierre" para agregarlas.'
                : 'No hay fuentes de pago configuradas.'}
            </div>
          ) : (
            <>
              {/* Barra visual proporcional */}
              <BarraFinanciera fuentesPago={fuentesPago} valorVivienda={valorVivienda} />

              {/* Banner documentos pendientes */}
              {totalDocsPendientes > 0 && (
                <div className="space-y-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        {totalDocsPendientes} documento{totalDocsPendientes !== 1 ? 's' : ''} pendiente{totalDocsPendientes !== 1 ? 's' : ''}
                        {totalDocsObligatoriosPendientes > 0 && (
                          <span className="ml-1 text-red-600 dark:text-red-400">
                            · {totalDocsObligatoriosPendientes} obligatorio{totalDocsObligatoriosPendientes !== 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                        Sube los documentos desde la pestaña <strong>Documentos</strong>
                      </p>
                    </div>
                  </div>

                  {/* Leyenda obligatorio / opcional */}
                  <div className="flex items-center gap-3 pt-1 border-t border-amber-200/60 dark:border-amber-800/30">
                    <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 flex-shrink-0" />
                      Obligatorio
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                      Opcional
                    </span>
                  </div>

                  {/* Docs compartidos del cliente (Boleta de Registro, etc.) */}
                  {pendientesCompartidos.length > 0 && (
                    <div className="pt-1 border-t border-amber-200/60 dark:border-amber-800/30">
                      <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                        Requisitos generales del proceso
                      </p>
                      {pendientesCompartidos.map((doc, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] py-0.5">
                          {doc.obligatorio ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 flex-shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                          )}
                          <span className={doc.obligatorio ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
                            {doc.nombre}
                          </span>
                          <span className={`text-[10px] flex-shrink-0 ${doc.obligatorio ? 'text-red-400 dark:text-red-500' : 'text-gray-300 dark:text-gray-600'}`}>
                            {doc.obligatorio ? 'obligatorio' : 'opcional'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cards por fuente */}
              <div className="space-y-2">
                {fuentesPago.map((fuente) => (
                  <FuenteCardPlan
                    key={fuente.id}
                    fuente={fuente}
                    valorVivienda={valorVivienda}
                    docsPendientes={pendientesPorFuente[fuente.id]}
                    colorToken={tiposFuentes.find((t) => t.nombre === fuente.tipo)?.color}
                  />
                ))}
              </div>

              {/* Indicador de balance */}
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
                    Ajustar cierre
                  </button>{' '}
                  para corregir el balance.
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* ─── 3. ABONOS RECIENTES ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
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

      {/* ─── MODAL ADMIN: Ajustar cierre financiero ─────────── */}
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
