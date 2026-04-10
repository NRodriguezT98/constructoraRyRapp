'use client'

import { useState } from 'react'

import { AlertTriangle, Info, X } from 'lucide-react'

import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

import type { FuAlteNueva } from '../../hooks'
import { getFuenteColor } from '../../hooks'

import { formatMontoInput } from './helpers'

interface FilaNuevaProps {
  fuente: FuAlteNueva
  index: number
  onChange: (
    index: number,
    campo: keyof FuAlteNueva,
    valor: string | number
  ) => void
  onEliminar: (index: number) => void
  requiereEntidad: boolean
  entidades: string[]
  hasError?: boolean
  hasEntidadError?: boolean
}

export function FilaNueva({
  fuente,
  index,
  onChange,
  onEliminar,
  requiereEntidad,
  entidades,
  hasError = false,
  hasEntidadError = false,
}: FilaNuevaProps) {
  const color = getFuenteColor(fuente.tipo)
  const [inputValue, setInputValue] = useState(formatMontoInput(fuente.monto))
  const mostrarEntidad = requiereEntidad
  const esCredito = esCreditoConstructora(fuente.tipo)

  const handleChange = (raw: string) => {
    const soloDigitos = raw.replace(/[^0-9]/g, '')
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : 0
    setInputValue(soloDigitos ? numero.toLocaleString('es-CO') : '')
    onChange(index, 'monto', numero)
  }

  return (
    <div className='flex items-center gap-3 rounded-lg border border-emerald-200/80 bg-emerald-50/60 p-3 dark:border-emerald-800/40 dark:bg-emerald-900/10'>
      <div
        className={`w-1 flex-shrink-0 self-stretch rounded-full ${color.barra}`}
      />

      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-gray-900 dark:text-white'>
          {fuente.tipo}
        </p>
        {esCredito ? (
          <p className='mt-0.5 flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400'>
            <Info className='h-2.5 w-2.5 flex-shrink-0' />
            El plan de cuotas se configura después de guardar
          </p>
        ) : null}
        {mostrarEntidad &&
          (entidades.length > 0 ? (
            <>
              <select
                value={fuente.entidad}
                onChange={e => onChange(index, 'entidad', e.target.value)}
                className={`mt-1 w-full rounded-md border px-2 py-1 text-xs text-gray-700 focus:border-cyan-500 focus:outline-none dark:text-gray-300 ${
                  hasEntidadError
                    ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700/60'
                }`}
              >
                <option value=''>Seleccionar entidad... *</option>
                {entidades.map(e => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              {hasEntidadError ? (
                <p className='mt-0.5 flex items-center gap-1 text-[10px] text-red-500 dark:text-red-400'>
                  <AlertTriangle className='h-2.5 w-2.5 flex-shrink-0' />
                  Selecciona una entidad
                </p>
              ) : null}
            </>
          ) : (
            <input
              type='text'
              placeholder='Entidad (opcional)'
              value={fuente.entidad}
              onChange={e => onChange(index, 'entidad', e.target.value)}
              className='mt-1 w-full border-b border-gray-200 bg-transparent text-xs text-gray-600 placeholder:text-gray-300 focus:border-cyan-500 focus:outline-none dark:border-gray-600 dark:text-gray-400 dark:placeholder:text-gray-600'
            />
          ))}
      </div>

      <div className='flex flex-col items-end gap-0.5'>
        {esCredito ? (
          <span className='text-[10px] font-medium text-gray-500 dark:text-gray-400'>
            Capital a prestar
          </span>
        ) : null}
        <div className='flex items-center gap-1.5'>
          <span className='text-xs font-medium text-gray-400'>$</span>
          <input
            type='text'
            inputMode='numeric'
            value={inputValue}
            onChange={e => handleChange(e.target.value)}
            className={`w-36 rounded-lg border px-2.5 py-1.5 text-right text-sm font-semibold tabular-nums text-gray-900 focus:outline-none focus:ring-2 dark:bg-gray-700/60 dark:text-white ${
              hasError
                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:bg-red-900/20'
                : 'border-emerald-200 bg-white focus:border-cyan-500 focus:ring-cyan-500/20 dark:border-emerald-800/60'
            }`}
            placeholder='0'
          />
        </div>
        {hasError ? (
          <p className='flex items-center gap-1 text-[10px] text-red-500 dark:text-red-400'>
            <AlertTriangle className='h-2.5 w-2.5 flex-shrink-0' />
            El monto debe ser mayor a $0
          </p>
        ) : null}
      </div>

      <button
        type='button'
        onClick={() => onEliminar(index)}
        className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
      >
        <X className='h-3.5 w-3.5' />
      </button>
    </div>
  )
}
