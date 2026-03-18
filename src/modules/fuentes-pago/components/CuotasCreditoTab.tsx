/**
 * CuotasCreditoTab
 *
 * Pestaña de cuotas para un crédito con la constructora.
 * Muestra el plan de amortización vigente con acciones de mora y reestructuración.
 *
 * Uso:
 *   <CuotasCreditoTab fuentePagoId={fuente.id} />
 */

'use client'

import {
    AlertTriangle,
    ArrowRightLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Loader2,
    RefreshCw,
    TrendingUp,
    XCircle,
} from 'lucide-react'
import { useState } from 'react'


import { formatDateCompact, getTodayDateString } from '@/lib/utils/date.utils'
import { useCreditoConstructora } from '@/modules/fuentes-pago/hooks/useCreditoConstructora'
import type { CuotaVigente } from '@/modules/fuentes-pago/types'

import { AplicarMoraModal } from './AplicarMoraModal'
import { ReestructurarCreditoModal } from './ReestructurarCreditoModal'

interface CuotasCreditoTabProps {
  fuentePagoId: string
  /** Pre-fills the capital field in the "Configurar plan" form (for historical sources without a plan). */
  montoFuente?: number
  /** Callback to register an abono + mark cuota Pagada. Receives (cuotaId, totalMonto, moraIncluida). */
  onPagarCuota?: (cuotaId: string, monto: number, mora: number) => Promise<void>
}

// Colores por estado
const ESTADO_CONFIG = {
  Pendiente: {
    label: 'Pendiente',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: Clock,
  },
  Pagada: {
    label: 'Pagada',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    icon: CheckCircle2,
  },
  Reestructurada: {
    label: 'Reestructurada',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    icon: RefreshCw,
  },
  Vencida: {
    label: 'Vencida',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    icon: XCircle,
  },
} as const

type EstadoKey = keyof typeof ESTADO_CONFIG

export function CuotasCreditoTab({ fuentePagoId, montoFuente, onPagarCuota }: CuotasCreditoTabProps) {
  const { credito, cuotas, resumen, cargando, procesando, error, recargar, aplicarMora, reestructurar, crearPlan, getMoraSugerida } =
    useCreditoConstructora({ fuentePagoId })

  const [cuotaParaMora, setCuotaParaMora] = useState<CuotaVigente | null>(null)
  const [mostrarReestructurar, setMostrarReestructurar] = useState(false)
  const [cuotaParaPago, setCuotaParaPago] = useState<CuotaVigente | null>(null)
  const [procesandoPago, setProcesandoPago] = useState(false)

  // Form state for creating a plan when none exists (historical sources)
  const [formCapital, setFormCapital] = useState(montoFuente?.toString() ?? '')
  const [formTasa, setFormTasa] = useState('1')
  const [formNumCuotas, setFormNumCuotas] = useState('12')
  const [formFechaInicio, setFormFechaInicio] = useState(getTodayDateString())

  const handleCrearPlan = async () => {
    const capital = parseFloat(formCapital)
    const tasaMensual = parseFloat(formTasa)
    const numCuotas = parseInt(formNumCuotas, 10)
    if (isNaN(capital) || capital <= 0 || isNaN(tasaMensual) || tasaMensual <= 0 || isNaN(numCuotas) || numCuotas < 1 || !formFechaInicio) return
    await crearPlan({
      capital,
      tasaMensual,
      numCuotas,
      fechaInicio: new Date(formFechaInicio + 'T12:00:00'),
    })
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Cargando cuotas...</span>
      </div>
    )
  }

  if (!credito || cuotas.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-indigo-200 p-6 dark:border-indigo-700/50">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Configurar plan de cuotas</h3>
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          No hay un plan de cuotas registrado para este crédito. Ingresa los parámetros para generar el calendario de pagos.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Capital ($)</label>
            <input
              type="number"
              min="1"
              value={formCapital}
              onChange={(e) => setFormCapital(e.target.value)}
              placeholder="Ej: 15000000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Tasa mensual (%)</label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={formTasa}
              onChange={(e) => setFormTasa(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">N° cuotas</label>
            <input
              type="number"
              min="1"
              max="360"
              value={formNumCuotas}
              onChange={(e) => setFormNumCuotas(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Fecha inicio</label>
            <input
              type="date"
              value={formFechaInicio}
              onChange={(e) => setFormFechaInicio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        {error ? (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCrearPlan}
            disabled={procesando || !formCapital || !formTasa || !formNumCuotas || !formFechaInicio}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 dark:hover:bg-indigo-500"
          >
            {procesando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Generar plan de cuotas
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Resumen stats */}
      {resumen && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total cuotas"
            value={resumen.total}
            color="indigo"
          />
          <StatCard
            label="Pendientes"
            value={resumen.pendientes}
            color="yellow"
          />
          <StatCard
            label="Pagadas"
            value={resumen.pagadas}
            color="green"
          />
          <StatCard
            label="Vencidas"
            value={resumen.vencidas}
            color="red"
          />
        </div>
      )}

      {/* Info crédito */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-indigo-50 px-4 py-2 text-xs dark:bg-indigo-900/10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-indigo-700 dark:text-indigo-300">Capital:</strong>{' '}
            ${credito.capital.toLocaleString('es-CO')}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-indigo-700 dark:text-indigo-300">Tasa:</strong>{' '}
            {credito.tasa_mensual}% mensual
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-indigo-700 dark:text-indigo-300">Mora diaria:</strong>{' '}
            {credito.tasa_mora_diaria * 100}%
          </span>
          {resumen && (
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-indigo-700 dark:text-indigo-300">Mora acumulada:</strong>{' '}
              ${resumen.moraAcumulada.toLocaleString('es-CO')}
            </span>
          )}
        </div>
        <button
          onClick={() => setMostrarReestructurar(true)}
          disabled={procesando}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-200 disabled:opacity-50 dark:bg-indigo-800/40 dark:text-indigo-300 dark:hover:bg-indigo-800/60"
        >
          <ArrowRightLeft className="h-3 w-3" />
          Reestructurar
        </button>
      </div>

      {/* Tabla de cuotas */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">N°</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Vencimiento</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Cuota</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Mora</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {cuotas.map((cuota) => {
              const estadoKey = (cuota.estado_efectivo as EstadoKey) ?? cuota.estado
              const cfg = ESTADO_CONFIG[estadoKey] ?? ESTADO_CONFIG.Pendiente
              const EstadoIcon = cfg.icon
              const puedeAplicarMora = cuota.estado_efectivo === 'Vencida' && cuota.mora_aplicada === 0
              const puedePagar = cuota.estado !== 'Pagada' && cuota.estado !== 'Reestructurada' && !cuota.fecha_pago && !!onPagarCuota

              return (
                <tr
                  key={cuota.id}
                  className={`bg-white dark:bg-gray-900 ${cuota.esta_vencida ? 'bg-red-50/50 dark:bg-red-900/5' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{cuota.numero_cuota}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                      {formatDateCompact(cuota.fecha_vencimiento)}
                    </div>
                    {cuota.dias_mora > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {cuota.dias_mora} día(s) vencida
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                    ${cuota.valor_cuota.toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {cuota.mora_aplicada > 0 ? (
                      <span className="font-medium text-red-600 dark:text-red-400">
                        +${cuota.mora_aplicada.toLocaleString('es-CO')}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    ${cuota.total_a_cobrar.toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <EstadoIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {puedeAplicarMora ? (
                        <button
                          onClick={() => setCuotaParaMora(cuota)}
                          disabled={procesando || procesandoPago}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          <DollarSign className="h-3 w-3" />
                          Mora
                        </button>
                      ) : null}
                      {puedePagar ? (
                        <button
                          onClick={() => setCuotaParaPago(cuota)}
                          disabled={procesando || procesandoPago}
                          className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                        >
                          <CreditCard className="h-3 w-3" />
                          Pagar
                        </button>
                      ) : null}
                      {cuota.fecha_pago ? (
                        <span className="text-xs text-gray-400">
                          {formatDateCompact(cuota.fecha_pago)}
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Alerta cuotas vencidas sin mora */}
      {cuotas.some((c) => c.estado_efectivo === 'Vencida' && c.mora_aplicada === 0) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-900/10">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-200">
            Hay cuotas vencidas sin mora aplicada. Haz clic en "Mora" para registrar el cargo por mora.
          </p>
        </div>
      )}

      {/* Confirmación de pago de cuota */}
      {cuotaParaPago && onPagarCuota ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800/50 dark:bg-green-900/10">
          <p className="mb-3 text-sm font-semibold text-green-900 dark:text-green-100">
            Confirmar pago — Cuota N° {cuotaParaPago.numero_cuota}
          </p>
          <div className="mb-4 space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Valor cuota:</span>
              <span className="font-medium">${cuotaParaPago.valor_cuota.toLocaleString('es-CO')}</span>
            </div>
            {cuotaParaPago.mora_aplicada > 0 ? (
              <div className="flex justify-between">
                <span>Mora aplicada:</span>
                <span className="font-medium text-red-600 dark:text-red-400">+${cuotaParaPago.mora_aplicada.toLocaleString('es-CO')}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-green-200 pt-1 dark:border-green-700">
              <span className="font-semibold">Total a pagar:</span>
              <span className="font-bold text-green-700 dark:text-green-300">${cuotaParaPago.total_a_cobrar.toLocaleString('es-CO')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCuotaParaPago(null)}
              disabled={procesandoPago}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                setProcesandoPago(true)
                try {
                  await onPagarCuota(cuotaParaPago.id, cuotaParaPago.total_a_cobrar, cuotaParaPago.mora_aplicada)
                  setCuotaParaPago(null)
                  await recargar()
                } finally {
                  setProcesandoPago(false)
                }
              }}
              disabled={procesandoPago}
              className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {procesandoPago ? 'Registrando...' : 'Confirmar Pago'}
            </button>
          </div>
        </div>
      ) : null}

      {/* Modal de aplicar mora */}
      {cuotaParaMora ? (
        <AplicarMoraModal
          cuota={cuotaParaMora}
          moraSugerida={getMoraSugerida(cuotaParaMora.id)}
          procesando={procesando}
          onConfirmar={async (mora, notas) => {
            const ok = await aplicarMora(cuotaParaMora.id, mora, notas)
            if (ok) {
              setCuotaParaMora(null)
              await recargar()
            }
          }}
          onCerrar={() => setCuotaParaMora(null)}
        />
      ) : null}

      {/* Modal de reestructuración */}
      {mostrarReestructurar && credito ? (
        <ReestructurarCreditoModal
          fuentePagoId={fuentePagoId}
          creditoActual={credito}
          cuotasPendientes={resumen?.pendientes ?? 0}
          procesando={procesando}
          onConfirmar={async (params) => {
            const ok = await reestructurar(params)
            if (ok) {
              setMostrarReestructurar(false)
              await recargar()
            }
          }}
          onCerrar={() => setMostrarReestructurar(false)}
        />
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: tarjeta de estadística
// ---------------------------------------------------------------------------
interface StatCardProps {
  label: string
  value: number
  color: 'indigo' | 'yellow' | 'green' | 'red'
}

const STAT_COLORS = {
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
} as const

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={`rounded-xl p-3 text-center ${STAT_COLORS[color]}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  )
}
