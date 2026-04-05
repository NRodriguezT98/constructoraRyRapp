'use client'

import { useState } from 'react'

import { Loader2, TrendingUp } from 'lucide-react'

import { getTodayDateString } from '@/lib/utils/date.utils'
import type { ParametrosCredito } from '@/modules/fuentes-pago/types'

interface ConfigurarPlanCreditoProps {
  montoAprobado?: number
  crearPlan: (params: ParametrosCredito) => Promise<boolean>
  procesando: boolean
  error: string | null
  onPlanCreado: () => void
}

export function ConfigurarPlanCredito({
  montoAprobado,
  crearPlan,
  procesando,
  error,
  onPlanCreado,
}: ConfigurarPlanCreditoProps) {
  const [formCapital, setFormCapital] = useState(
    montoAprobado?.toString() ?? ''
  )
  const [formTasa, setFormTasa] = useState('1')
  const [formNumCuotas, setFormNumCuotas] = useState('12')
  const [formFechaInicio, setFormFechaInicio] = useState(getTodayDateString())

  const handleCrearPlan = async () => {
    const capital = parseFloat(formCapital)
    const tasaMensual = parseFloat(formTasa)
    const numCuotas = parseInt(formNumCuotas, 10)
    if (
      isNaN(capital) ||
      capital <= 0 ||
      isNaN(tasaMensual) ||
      tasaMensual <= 0 ||
      isNaN(numCuotas) ||
      numCuotas < 1 ||
      !formFechaInicio
    )
      return

    const ok = await crearPlan({
      capital,
      tasaMensual,
      numCuotas,
      fechaInicio: new Date(formFechaInicio + 'T12:00:00'),
    })
    if (ok) onPlanCreado()
  }

  const formValido =
    !!formCapital &&
    parseFloat(formCapital) > 0 &&
    !!formTasa &&
    parseFloat(formTasa) > 0 &&
    !!formNumCuotas &&
    parseInt(formNumCuotas, 10) >= 1 &&
    !!formFechaInicio

  return (
    <div className='rounded-xl border-2 border-dashed border-indigo-200 p-6 dark:border-indigo-700/50'>
      <div className='mb-3 flex items-center gap-2'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40'>
          <TrendingUp className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
        </div>
        <h3 className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
          Configurar plan de cuotas
        </h3>
      </div>
      <p className='mb-4 text-xs text-gray-500 dark:text-gray-400'>
        No hay un plan de cuotas registrado para este crédito. Ingresa los
        parámetros para generar el calendario de pagos.
      </p>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div>
          <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
            Capital ($)
          </label>
          <input
            type='number'
            min='1'
            value={formCapital}
            onChange={e => setFormCapital(e.target.value)}
            placeholder='Ej: 15000000'
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
            Tasa mensual (%)
          </label>
          <input
            type='number'
            min='0.1'
            max='10'
            step='0.1'
            value={formTasa}
            onChange={e => setFormTasa(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
            N° cuotas
          </label>
          <input
            type='number'
            min='1'
            max='360'
            value={formNumCuotas}
            onChange={e => setFormNumCuotas(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
            Fecha inicio
          </label>
          <input
            type='date'
            value={formFechaInicio}
            onChange={e => setFormFechaInicio(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          />
        </div>
      </div>

      {error ? (
        <p className='mt-3 text-xs text-red-600 dark:text-red-400'>{error}</p>
      ) : null}

      <div className='mt-4 flex justify-end'>
        <button
          onClick={handleCrearPlan}
          disabled={procesando || !formValido}
          className='inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 dark:hover:bg-indigo-500'
        >
          {procesando ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Generando...
            </>
          ) : (
            <>
              <TrendingUp className='h-4 w-4' />
              Generar plan de cuotas
            </>
          )}
        </button>
      </div>
    </div>
  )
}
