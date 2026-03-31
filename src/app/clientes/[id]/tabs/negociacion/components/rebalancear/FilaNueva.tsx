'use client'

import { useState } from 'react'

import { Info, X } from 'lucide-react'

import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

import type { FuAlteNueva } from '../../hooks'
import { getFuenteColor } from '../../hooks'

import { getEntidadesParaTipo } from './entidades'
import { formatMontoInput } from './helpers'

interface FilaNuevaProps {
  fuente: FuAlteNueva
  index: number
  onChange: (index: number, campo: keyof FuAlteNueva, valor: string | number) => void
  onEliminar: (index: number) => void
  requiereEntidad: boolean
}

export function FilaNueva({
  fuente,
  index,
  onChange,
  onEliminar,
  requiereEntidad,
}: FilaNuevaProps) {
  const color = getFuenteColor(fuente.tipo)
  const [inputValue, setInputValue] = useState(formatMontoInput(fuente.monto))
  const entidades = getEntidadesParaTipo(fuente.tipo)
  const mostrarEntidad = requiereEntidad
  const esCredito = esCreditoConstructora(fuente.tipo)

  const handleChange = (raw: string) => {
    const soloDigitos = raw.replace(/[^0-9]/g, '')
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : 0
    setInputValue(soloDigitos ? numero.toLocaleString('es-CO') : '')
    onChange(index, 'monto', numero)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg p-3 bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/80 dark:border-emerald-800/40">
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${color.barra}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{fuente.tipo}</p>
        {esCredito ? (
          <p className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
            <Info className="w-2.5 h-2.5 flex-shrink-0" />
            El plan de cuotas se configura después de guardar
          </p>
        ) : null}
        {mostrarEntidad && (
          entidades.length > 0 ? (
            <select
              value={fuente.entidad}
              onChange={(e) => onChange(index, 'entidad', e.target.value)}
              className="mt-1 w-full text-xs bg-white dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:border-cyan-500 text-gray-700 dark:text-gray-300"
            >
              <option value="">Seleccionar entidad...</option>
              {entidades.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Entidad (opcional)"
              value={fuente.entidad}
              onChange={(e) => onChange(index, 'entidad', e.target.value)}
              className="mt-1 w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none focus:border-cyan-500 text-gray-600 dark:text-gray-400 placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          )
        )}
      </div>

      <div className="flex flex-col items-end gap-0.5">
        {esCredito ? (
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Capital a prestar</span>
        ) : null}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-36 text-right text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 tabular-nums"
          placeholder="0"
        />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEliminar(index)}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
