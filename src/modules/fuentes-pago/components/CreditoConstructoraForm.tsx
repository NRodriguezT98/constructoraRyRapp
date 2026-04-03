/**
 * CreditoConstructoraForm
 *
 * Formulario para configurar un crÃ©dito interno con la constructora.
 * Muestra tabla de amortizaciÃ³n en tiempo real con interÃ©s simple.
 *
 * Design: self-managed local state. Calls onActualizar when the calculation is valid.
 *
 * IntegraciÃ³n en configurar-fuentes-pago.tsx:
 *   <CreditoConstructoraForm
 *     parametrosIniciales={fuente.parametrosCredito}
 *     onActualizar={(campo, valor) => actualizarFuente(index, campo, valor)}
 *   />
 *
 * âš ï¸ INVARIANTE CRÃTICO:
 *   fuente.monto_aprobado      = calculo.montoTotal   (total con intereses)
 *   fuente.capital_para_cierre = params.capital       (solo capital, para cierre financiero)
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Info,
  Percent,
  TrendingUp,
} from 'lucide-react'

import { formatDateCompact, getTodayDateString } from '@/lib/utils/date.utils'
import type {
  ParametrosCredito,
  ResumenCredito,
} from '@/modules/fuentes-pago/types'
import { calcularTablaAmortizacion } from '@/modules/fuentes-pago/utils/calculos-credito'

interface CreditoConstructoraFormProps {
  parametrosIniciales?: ParametrosCredito | null
  onActualizar: (
    campo: 'monto_aprobado' | 'capital_para_cierre' | 'parametrosCredito',
    valor: unknown
  ) => void
}

// Cuotas predefinidas para selector rápido
const OPCIONES_CUOTAS = [6, 12, 18, 24, 36, 48, 60]

// Formatea número como moneda colombiana
function formatearMoneda(n: number): string {
  return n > 0 ? n.toLocaleString('es-CO') : ''
}

export function CreditoConstructoraForm({
  parametrosIniciales,
  onActualizar,
}: CreditoConstructoraFormProps) {
  // ── Estado local ──────────────────────────────────────────────────────────
  const [capitalStr, setCapitalStr] = useState<string>(
    parametrosIniciales?.capital
      ? formatearMoneda(parametrosIniciales.capital)
      : ''
  )
  const [tasa, setTasa] = useState<string>(
    parametrosIniciales?.tasaMensual
      ? String(parametrosIniciales.tasaMensual)
      : ''
  )
  const [tasaMora, setTasaMora] = useState<string>(
    parametrosIniciales?.tasaMoraDiaria
      ? String(parametrosIniciales.tasaMoraDiaria * 100)
      : '0.1'
  )
  const [cuotas, setCuotas] = useState<number>(
    parametrosIniciales?.numCuotas ?? 12
  )
  const [fechaStr, setFechaStr] = useState<string>(
    parametrosIniciales?.fechaInicio
      ? parametrosIniciales.fechaInicio instanceof Date
        ? parametrosIniciales.fechaInicio.toISOString().split('T')[0]
        : String(parametrosIniciales.fechaInicio)
      : getTodayDateString()
  )
  const [mostrarTabla, setMostrarTabla] = useState(false)

  // ── Derivados ─────────────────────────────────────────────────────────────
  const capital = useMemo(() => {
    const clean = capitalStr.replace(/\./g, '').replace(/,/g, '')
    return Number(clean) || 0
  }, [capitalStr])

  const tasaNum = useMemo(() => parseFloat(tasa) || 0, [tasa])

  const calculo = useMemo<ResumenCredito | null>(() => {
    if (capital <= 0) return null
    if (tasaNum <= 0 || tasaNum > 10) return null
    if (cuotas < 1 || cuotas > 360) return null
    if (!fechaStr) return null
    try {
      const fecha = new Date(fechaStr + 'T12:00:00')
      if (isNaN(fecha.getTime())) return null
      return calcularTablaAmortizacion({
        capital,
        tasaMensual: tasaNum,
        numCuotas: cuotas,
        fechaInicio: fecha,
      })
    } catch {
      return null
    }
  }, [capital, tasaNum, cuotas, fechaStr])

  // ── Sincronización automática con el formulario padre ────────────────────
  const onActualizarRef = useCallback(onActualizar, [onActualizar])
  useEffect(() => {
    if (!calculo) return
    const tasaMoraNum = Math.max(
      0,
      Math.min(0.05, parseFloat(tasaMora) / 100 || 0.001)
    )
    const params: ParametrosCredito = {
      capital,
      tasaMensual: tasaNum,
      numCuotas: cuotas,
      fechaInicio: new Date(fechaStr + 'T12:00:00'),
      tasaMoraDiaria: tasaMoraNum,
    }
    onActualizarRef('monto_aprobado', calculo.montoTotal)
    onActualizarRef('capital_para_cierre', capital)
    onActualizarRef('parametrosCredito', params)
  }, [calculo, tasaMora, capital, cuotas, fechaStr, onActualizarRef, tasaNum])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, '')
    const num = Number(clean)
    setCapitalStr(num > 0 ? num.toLocaleString('es-CO') : '')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className='space-y-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-800/50 dark:bg-indigo-900/10'>
      <p className='flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300'>
        <TrendingUp className='h-4 w-4' />
        Parámetros del Crédito con la Constructora
      </p>

      {/* ── Inputs ────────────────────────────────────────────────────────── */}
      <div className='space-y-3'>
        {/* Monto a financiar — fila completa */}
        <div>
          <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
            <DollarSign className='h-3.5 w-3.5 text-indigo-500' />
            Monto a financiar
            <span className='ml-1 text-[10px] font-normal text-gray-400'>
              (crédito que necesita el cliente)
            </span>
            <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500'>
              $
            </span>
            <input
              type='text'
              inputMode='numeric'
              value={capitalStr}
              onChange={handleCapitalChange}
              placeholder='0'
              className='w-full rounded-lg border-2 border-gray-200 bg-white py-2 pl-6 pr-3 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            />
          </div>
        </div>

        {/* Tasa mensual + Mora diaria */}
        <div className='grid grid-cols-2 gap-3'>
          {/* Tasa mensual */}
          <div>
            <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
              <Percent className='h-3.5 w-3.5 text-indigo-500' />
              Tasa mensual (%) <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              step='0.01'
              min='0.01'
              max='10'
              value={tasa}
              onChange={e => setTasa(e.target.value)}
              placeholder='1.5'
              className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            />
          </div>

          {/* Tasa de mora diaria */}
          <div>
            <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
              <AlertCircle className='h-3.5 w-3.5 text-orange-500' />
              Mora diaria (%){' '}
              <span className='text-[10px] font-normal text-gray-400'>
                def: 0.1%
              </span>
            </label>
            <input
              type='number'
              step='0.01'
              min='0'
              max='5'
              value={tasaMora}
              onChange={e => setTasaMora(e.target.value)}
              placeholder='0.1'
              className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            />
          </div>
        </div>

        {/* Fecha inicio + N° de cuotas */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {/* Fecha inicio */}
          <div>
            <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
              <Calendar className='h-3.5 w-3.5 text-indigo-500' />
              Fecha de inicio <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              value={fechaStr}
              onChange={e => setFechaStr(e.target.value)}
              className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            />
          </div>

          {/* Número cuotas */}
          <div>
            <label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300'>
              <TrendingUp className='h-3.5 w-3.5 text-indigo-500' />
              N° de cuotas <span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-wrap gap-1.5'>
              {OPCIONES_CUOTAS.map(n => (
                <button
                  key={n}
                  type='button'
                  onClick={() => setCuotas(n)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    cuotas === n
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {n}m
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Vista previa de amortización ───────────────────────────────────── */}
      {calculo ? (
        <div className='space-y-3'>
          {/* Resumen 3 tarjetas */}
          <div className='grid grid-cols-3 gap-2 text-center text-xs'>
            <div className='rounded-lg bg-white p-2 dark:bg-gray-800'>
              <p className='text-gray-500 dark:text-gray-400'>A financiar</p>
              <p className='font-bold text-gray-900 dark:text-white'>
                ${calculo.capital.toLocaleString('es-CO')}
              </p>
            </div>
            <div className='rounded-lg bg-white p-2 dark:bg-gray-800'>
              <p className='text-gray-500 dark:text-gray-400'>Intereses</p>
              <p className='font-bold text-orange-600 dark:text-orange-400'>
                ${calculo.interesTotal.toLocaleString('es-CO')}
              </p>
            </div>
            <div className='rounded-lg bg-white p-2 dark:bg-gray-800'>
              <p className='text-gray-500 dark:text-gray-400'>Total</p>
              <p className='font-bold text-indigo-700 dark:text-indigo-300'>
                ${calculo.montoTotal.toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          {/* Cuota mensual banner */}
          <div className='rounded-lg bg-indigo-600 px-4 py-2 text-center text-white'>
            <p className='text-xs opacity-80'>Cuota mensual estimada</p>
            <p className='text-lg font-bold'>
              ${calculo.valorCuotaMensual.toLocaleString('es-CO')}
            </p>
          </div>

          {/* Advertencia cierre financiero */}
          <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-900/10'>
            <Info className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
            <p className='text-xs text-amber-800 dark:text-amber-200'>
              <strong>Cierre financiero</strong>: se usa el capital ($
              {calculo.capital.toLocaleString('es-CO')}) — los intereses no se
              registran como deuda del cliente.
            </p>
          </div>

          {/* Tabla de amortización colapsable */}
          <button
            type='button'
            onClick={() => setMostrarTabla(v => !v)}
            className='flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400'
          >
            <span>
              Ver tabla de amortización ({calculo.cuotas.length} cuotas)
            </span>
            {mostrarTabla ? (
              <ChevronUp className='h-3.5 w-3.5' />
            ) : (
              <ChevronDown className='h-3.5 w-3.5' />
            )}
          </button>

          {mostrarTabla && (
            <div className='max-h-52 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700'>
              <table className='w-full text-xs'>
                <thead className='sticky top-0 bg-gray-50 dark:bg-gray-800'>
                  <tr>
                    <th className='px-3 py-2 text-left text-gray-600 dark:text-gray-400'>
                      N°
                    </th>
                    <th className='px-3 py-2 text-left text-gray-600 dark:text-gray-400'>
                      Vencimiento
                    </th>
                    <th className='px-3 py-2 text-right text-gray-600 dark:text-gray-400'>
                      Cuota
                    </th>
                    <th className='px-3 py-2 text-right text-gray-600 dark:text-gray-400'>
                      Capital
                    </th>
                    <th className='px-3 py-2 text-right text-gray-600 dark:text-gray-400'>
                      Interés
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {calculo.cuotas.map(c => (
                    <tr key={c.numero}>
                      <td className='px-3 py-1.5 text-gray-700 dark:text-gray-300'>
                        {c.numero}
                      </td>
                      <td className='px-3 py-1.5 text-gray-600 dark:text-gray-400'>
                        {formatDateCompact(c.fechaVencimiento.toISOString())}
                      </td>
                      <td className='px-3 py-1.5 text-right font-medium text-gray-900 dark:text-white'>
                        ${c.valorCuota.toLocaleString('es-CO')}
                      </td>
                      <td className='px-3 py-1.5 text-right text-blue-700 dark:text-blue-400'>
                        ${c.capitalPorCuota.toLocaleString('es-CO')}
                      </td>
                      <td className='px-3 py-1.5 text-right text-orange-600 dark:text-orange-400'>
                        ${c.interesPorCuota.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className='flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 p-3 text-xs text-indigo-500 dark:border-indigo-700 dark:text-indigo-400'>
          <AlertCircle className='h-4 w-4 flex-shrink-0' />
          Ingresa capital, tasa mensual y número de cuotas para ver la
          amortización
        </div>
      )}
    </div>
  )
}
