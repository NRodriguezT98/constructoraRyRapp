'use client'

import { AlertTriangle, Lock, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  const [inputValue, setInputValue] = useState(formatMontoInput(ajuste.montoEditable))
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
          ? 'opacity-40 bg-gray-50 dark:bg-gray-800/30 border-2 border-dashed border-gray-300 dark:border-gray-600'
          : 'bg-white dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/50'
      }`}
    >
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${color.barra}`} />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold text-gray-900 dark:text-white ${ajuste.paraEliminar ? 'line-through' : ''}`}
        >
          {ajuste.tipo}
        </p>

        {ajuste.paraEliminar ? (
          ajuste.entidad ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">{ajuste.entidad}</p>
          ) : null
        ) : mostrarEntidad ? (
          entidades.length > 0 ? (
            <select
              value={ajuste.entidadEditable}
              onChange={(e) => onCambioEntidad(ajuste.id, e.target.value)}
              disabled={!restricciones.puedeEditarEntidad}
              className={`mt-1 w-full text-xs bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:border-cyan-500 text-gray-700 dark:text-gray-300 ${!restricciones.puedeEditarEntidad ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <option value="">Seleccionar entidad...</option>
              {entidades.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Entidad"
              value={ajuste.entidadEditable}
              onChange={(e) => onCambioEntidad(ajuste.id, e.target.value)}
              disabled={!restricciones.puedeEditarEntidad}
              className={`mt-1 w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none focus:border-cyan-500 text-gray-600 dark:text-gray-400 placeholder:text-gray-300 ${!restricciones.puedeEditarEntidad ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          )
        ) : null}

        {/* Advertencias y razones de bloqueo */}
        {!ajuste.paraEliminar && restricciones.razonBloqueoEntidad && mostrarEntidad ? (
          <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 flex-shrink-0" />
            {restricciones.razonBloqueoEntidad}
          </p>
        ) : null}
      </div>

      {!ajuste.paraEliminar && (
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => handleChange(e.target.value)}
              disabled={!restricciones.puedeEditarMonto}
              className={`w-36 text-right text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 tabular-nums ${!restricciones.puedeEditarMonto ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="0"
            />
          </div>
          {restricciones.razonBloqueoMonto ? (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 max-w-[220px] text-right">
              <Lock className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{restricciones.razonBloqueoMonto}</span>
            </p>
          ) : null}
          {restricciones.advertencias.length > 0 ? (
            <div className="flex flex-col items-end">
              {restricciones.advertencias.map((adv) => (
                <p key={adv} className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
                  {adv}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <button
        type="button"
        onClick={() => restricciones.puedeEliminar || ajuste.paraEliminar ? onToggleEliminar(ajuste.id) : undefined}
        title={
          ajuste.paraEliminar
            ? 'Restaurar fuente'
            : restricciones.razonBloqueoEliminar ?? 'Quitar fuente'
        }
        disabled={!restricciones.puedeEliminar && !ajuste.paraEliminar}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${
          !restricciones.puedeEliminar && !ajuste.paraEliminar
            ? 'bg-gray-100 dark:bg-gray-800/30 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : ajuste.paraEliminar
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
        }`}
      >
        {ajuste.paraEliminar ? (
          <Plus className="w-3.5 h-3.5" />
        ) : (
          <Minus className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  )
}
