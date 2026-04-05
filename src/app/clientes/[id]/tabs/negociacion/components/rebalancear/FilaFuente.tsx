'use client'

import { useEffect, useState } from 'react'

import { AlertTriangle, Lock, Minus, Plus } from 'lucide-react'

import type { RestriccionesFuente } from '@/shared/utils/reglas-cierre-financiero'

import type { AjusteLocal } from '../../hooks'
import { getFuenteColor } from '../../hooks'

import { getEntidadesParaTipo } from './entidades'
import { formatMontoInput } from './helpers'

interface FilaFuenteProps {
  ajuste: AjusteLocal
  restricciones: RestriccionesFuente
  onChange: (id: string, monto: number) => void
  onCambioEntidad: (id: string, entidad: string) => void
  onToggleEliminar: (id: string) => void
  requiereEntidad: boolean
}

export function FilaFuente({
  ajuste,
  restricciones,
  onChange,
  onCambioEntidad,
  onToggleEliminar,
  requiereEntidad,
}: FilaFuenteProps) {
  const color = getFuenteColor(ajuste.tipo)
  const [inputValue, setInputValue] = useState(
    formatMontoInput(ajuste.montoEditable)
  )
  const entidades = getEntidadesParaTipo(ajuste.tipo)
  const mostrarEntidad = requiereEntidad

  useEffect(() => {
    setInputValue(formatMontoInput(ajuste.montoEditable))
  }, [ajuste.montoEditable])

  const handleChange = (raw: string) => {
    const soloDigitos = raw.replace(/[^0-9]/g, '')
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : 0
    setInputValue(soloDigitos ? numero.toLocaleString('es-CO') : '')
    onChange(ajuste.id, numero)
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
        ajuste.paraEliminar
          ? 'border-2 border-dashed border-gray-300 bg-gray-50 opacity-40 dark:border-gray-600 dark:bg-gray-800/30'
          : 'border border-gray-200/80 bg-white dark:border-gray-700/50 dark:bg-gray-800/60'
      }`}
    >
      <div
        className={`w-1 flex-shrink-0 self-stretch rounded-full ${color.barra}`}
      />

      <div className='min-w-0 flex-1'>
        <p
          className={`text-sm font-semibold text-gray-900 dark:text-white ${ajuste.paraEliminar ? 'line-through' : ''}`}
        >
          {ajuste.tipo}
        </p>

        {ajuste.paraEliminar ? (
          ajuste.entidad ? (
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              {ajuste.entidad}
            </p>
          ) : null
        ) : mostrarEntidad ? (
          entidades.length > 0 ? (
            <select
              value={ajuste.entidadEditable}
              onChange={e => onCambioEntidad(ajuste.id, e.target.value)}
              disabled={!restricciones.puedeEditarEntidad}
              className={`mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 focus:border-cyan-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-300 ${!restricciones.puedeEditarEntidad ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <option value=''>Seleccionar entidad...</option>
              {entidades.map(e => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          ) : (
            <input
              type='text'
              placeholder='Entidad'
              value={ajuste.entidadEditable}
              onChange={e => onCambioEntidad(ajuste.id, e.target.value)}
              disabled={!restricciones.puedeEditarEntidad}
              className={`mt-1 w-full border-b border-gray-200 bg-transparent text-xs text-gray-600 placeholder:text-gray-300 focus:border-cyan-500 focus:outline-none dark:border-gray-600 dark:text-gray-400 ${!restricciones.puedeEditarEntidad ? 'cursor-not-allowed opacity-60' : ''}`}
            />
          )
        ) : null}

        {/* Advertencias y razones de bloqueo */}
        {!ajuste.paraEliminar &&
        restricciones.razonBloqueoEntidad &&
        mostrarEntidad ? (
          <p className='mt-0.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400'>
            <Lock className='h-2.5 w-2.5 flex-shrink-0' />
            {restricciones.razonBloqueoEntidad}
          </p>
        ) : null}
      </div>

      {!ajuste.paraEliminar && (
        <div className='flex flex-col items-end gap-0.5'>
          <div className='flex items-center gap-1.5'>
            <span className='text-xs font-medium text-gray-400'>$</span>
            <input
              type='text'
              inputMode='numeric'
              value={inputValue}
              onChange={e => handleChange(e.target.value)}
              disabled={!restricciones.puedeEditarMonto}
              className={`w-36 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-right text-sm font-semibold tabular-nums text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-600 dark:bg-gray-700/60 dark:text-white ${!restricciones.puedeEditarMonto ? 'cursor-not-allowed opacity-60' : ''}`}
              placeholder='0'
            />
          </div>
          {restricciones.razonBloqueoMonto ? (
            <p className='flex max-w-[220px] items-center gap-1 text-right text-[10px] text-amber-600 dark:text-amber-400'>
              <Lock className='h-2.5 w-2.5 flex-shrink-0' />
              <span className='truncate'>
                {restricciones.razonBloqueoMonto}
              </span>
            </p>
          ) : null}
          {restricciones.advertencias.length > 0 ? (
            <div className='flex flex-col items-end'>
              {restricciones.advertencias.map(adv => (
                <p
                  key={adv}
                  className='flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400'
                >
                  <AlertTriangle className='h-2.5 w-2.5 flex-shrink-0' />
                  {adv}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <button
        type='button'
        onClick={() =>
          restricciones.puedeEliminar || ajuste.paraEliminar
            ? onToggleEliminar(ajuste.id)
            : undefined
        }
        title={
          ajuste.paraEliminar
            ? 'Restaurar fuente'
            : (restricciones.razonBloqueoEliminar ?? 'Quitar fuente')
        }
        disabled={!restricciones.puedeEliminar && !ajuste.paraEliminar}
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
          !restricciones.puedeEliminar && !ajuste.paraEliminar
            ? 'cursor-not-allowed bg-gray-100 text-gray-300 dark:bg-gray-800/30 dark:text-gray-600'
            : ajuste.paraEliminar
              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
        }`}
      >
        {ajuste.paraEliminar ? (
          <Plus className='h-3.5 w-3.5' />
        ) : (
          <Minus className='h-3.5 w-3.5' />
        )}
      </button>
    </div>
  )
}
