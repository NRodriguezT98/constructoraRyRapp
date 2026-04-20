/**
 * ReestructurarCreditoModal
 *
 * Modal para reestructurar un crédito existente.
 * Calcula el capital pendiente automáticamente y muestra
 * la nueva cuota mensual estimada en tiempo real.
 */

'use client'

import { useMemo, useState } from 'react'

import { ArrowRightLeft, RefreshCw, X } from 'lucide-react'

import { getTodayDateString } from '@/lib/utils/date.utils'
import type {
  CreditoConstructora,
  ParametrosReestructuracion,
} from '@/modules/fuentes-pago/types'
import { calcularTablaAmortizacion } from '@/modules/fuentes-pago/utils/calculos-credito'

const MOTIVOS_REESTRUCTURACION = [
  'Dificultad económica del cliente',
  'Extensión del plazo acordada',
  'Cambio de condiciones pactadas',
  'Acuerdo de refinanciación',
  'Corrección de términos iniciales',
  'Otro',
] as const

interface ReestructurarCreditoModalProps {
  fuentePagoId: string
  creditoActual: CreditoConstructora
  capitalPendiente: number
  cuotasPendientes: number
  procesando: boolean
  onConfirmar: (params: ParametrosReestructuracion) => Promise<void>
  onCerrar: () => void
}

export function ReestructurarCreditoModal({
  fuentePagoId,
  creditoActual,
  capitalPendiente,
  cuotasPendientes,
  procesando,
  onConfirmar,
  onCerrar,
}: ReestructurarCreditoModalProps) {
  const [nuevaTasa, setNuevaTasa] = useState(String(creditoActual.tasa_mensual))
  const [nuevasCuotas, setNuevasCuotas] = useState(String(cuotasPendientes))
  const [fechaStr, setFechaStr] = useState(getTodayDateString())
  const [motivo, setMotivo] = useState<string>(MOTIVOS_REESTRUCTURACION[0])
  const [notas, setNotas] = useState('')

  const preview = useMemo(() => {
    const t = parseFloat(nuevaTasa)
    const c = parseInt(nuevasCuotas, 10)
    if (
      !capitalPendiente ||
      !t ||
      !c ||
      isNaN(t) ||
      isNaN(c) ||
      c <= 0 ||
      t <= 0
    )
      return null
    try {
      return calcularTablaAmortizacion({
        capital: capitalPendiente,
        tasaMensual: t,
        numCuotas: c,
        fechaInicio: new Date(fechaStr + 'T12:00:00'),
      })
    } catch {
      return null
    }
  }, [capitalPendiente, nuevaTasa, nuevasCuotas, fechaStr])

  const cuotaMensual = preview?.valorCuotaMensual ?? 0

  const handleConfirmar = async () => {
    const t = parseFloat(nuevaTasa)
    const c = parseInt(nuevasCuotas, 10)
    if (!t || !c || !fechaStr) return
    await onConfirmar({
      fuentePagoId,
      creditoId: creditoActual.id,
      capitalPendiente,
      nuevaTasaMensual: t,
      nuevasNumCuotas: c,
      nuevaFechaInicio: new Date(fechaStr + 'T12:00:00'),
      motivo,
      notas: notas.trim() || undefined,
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
        onClick={onCerrar}
        aria-hidden='true'
      />

      {/* Modal */}
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-reestructurar-title'
        className='fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg sm:inset-0 sm:flex sm:items-center sm:justify-center'
      >
        <div className='w-full rounded-t-2xl bg-white shadow-2xl dark:bg-gray-900 sm:rounded-2xl'>
          {/* Header */}
          <div className='flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4'>
            <div className='flex items-center gap-2 text-white'>
              <ArrowRightLeft className='h-5 w-5' />
              <h2
                id='modal-reestructurar-title'
                className='text-base font-bold'
              >
                Reestructurar Crédito
              </h2>
            </div>
            <button
              onClick={onCerrar}
              disabled={procesando}
              aria-label='Cerrar'
              className='rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-50'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='space-y-4 p-5'>
            {/* Info crédito actual */}
            <div className='rounded-xl bg-gray-50 p-4 dark:bg-gray-800'>
              <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Crédito actual
              </p>
              <div className='grid grid-cols-3 gap-3 text-sm'>
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Capital original
                  </p>
                  <p className='font-medium text-gray-900 dark:text-white'>
                    ${creditoActual.capital.toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Tasa mensual
                  </p>
                  <p className='font-medium text-gray-900 dark:text-white'>
                    {creditoActual.tasa_mensual}%
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Cuotas pend.
                  </p>
                  <p className='font-medium text-indigo-600 dark:text-indigo-400'>
                    {cuotasPendientes} de {creditoActual.num_cuotas}
                  </p>
                </div>
              </div>
              <div className='mt-2 border-t border-gray-200 pt-2 dark:border-gray-700'>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Capital pendiente estimado:{' '}
                  <strong className='text-gray-900 dark:text-white'>
                    ${capitalPendiente.toLocaleString('es-CO')}
                  </strong>
                </p>
              </div>
            </div>

            {/* Nuevos parámetros */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Nueva tasa mensual (%)
                </label>
                <input
                  type='number'
                  step='0.01'
                  min='0'
                  value={nuevaTasa}
                  onChange={e => setNuevaTasa(e.target.value)}
                  className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                />
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Nuevas cuotas
                </label>
                <input
                  type='number'
                  min='1'
                  step='1'
                  value={nuevasCuotas}
                  onChange={e => setNuevasCuotas(e.target.value)}
                  className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                />
              </div>
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Nueva fecha de inicio
              </label>
              <input
                type='date'
                value={fechaStr}
                onChange={e => setFechaStr(e.target.value)}
                className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              />
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Motivo de reestructuración
              </label>
              <select
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              >
                {MOTIVOS_REESTRUCTURACION.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Notas adicionales (opcional)
              </label>
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={2}
                placeholder='Ej: Acuerdo firmado el 15 de enero'
                className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              />
            </div>

            {/* Preview nueva cuota */}
            {preview ? (
              <div className='rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-900/10'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Nueva cuota mensual:
                  </span>
                  <span className='text-xl font-bold text-indigo-700 dark:text-indigo-300'>
                    ${cuotaMensual.toLocaleString('es-CO')}
                  </span>
                </div>
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  Capital pendiente: ${capitalPendiente.toLocaleString('es-CO')}{' '}
                  · {nuevasCuotas} cuotas · {nuevaTasa}% mensual
                </p>
              </div>
            ) : (
              <div className='rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-center dark:border-gray-700'>
                <RefreshCw className='mx-auto h-5 w-5 text-gray-400' />
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  Completa los parámetros para ver la nueva cuota
                </p>
              </div>
            )}

            {/* Botones */}
            <div className='flex gap-3'>
              <button
                onClick={onCerrar}
                disabled={procesando}
                className='flex-1 rounded-xl border-2 border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={procesando || !preview}
                className='flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50'
              >
                {procesando ? 'Aplicando...' : 'Reestructurar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
