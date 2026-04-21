'use client'

import { Check, Search } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'

import type { FiltrosAbonos } from '../../hooks/useAbonosList'

import { abonosListaStyles as s } from './abonos-lista.styles'

interface AbonosListFiltrosProps {
  filtros: FiltrosAbonos
  fuentesUnicas: string[]
  mesesDisponibles: { value: string; label: string }[]
  totalFiltrado: number
  montoTotalFiltrado: number
  actualizarFiltros: (f: Partial<FiltrosAbonos>) => void
  limpiarFiltros: () => void
  toggleMostrarActivos: () => void
  toggleMostrarAnulados: () => void
  toggleMostrarRenunciados: () => void
}

interface PillProps {
  activo: boolean
  label: string
  claseActiva: string
  onClick: () => void
}

function FilterPill({ activo, label, claseActiva, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
        activo ? claseActiva : s.filtros.pillOff
      }`}
    >
      {activo ? (
        <Check className='h-3 w-3' />
      ) : (
        <span className='inline-block h-3 w-3 rounded-sm border border-gray-300 dark:border-gray-600' />
      )}
      {label}
    </button>
  )
}

export function AbonosListFiltros({
  filtros,
  fuentesUnicas,
  mesesDisponibles,
  totalFiltrado,
  montoTotalFiltrado,
  actualizarFiltros,
  limpiarFiltros,
  toggleMostrarActivos,
  toggleMostrarAnulados,
  toggleMostrarRenunciados,
}: AbonosListFiltrosProps) {
  const hayFiltrosActivos =
    filtros.busqueda || filtros.fuente !== 'todas' || filtros.mes !== 'todos'

  return (
    <div className={s.filtros.container}>
      {/* Fila 1: inputs ────────────────────────────────────────────────── */}
      <div className='flex items-center gap-2'>
        <div className={s.filtros.searchWrapper}>
          <label htmlFor='busqueda-abonos' className='sr-only'>
            Buscar abono
          </label>
          <Search className={s.filtros.searchIcon} />
          <input
            id='busqueda-abonos'
            type='text'
            value={filtros.busqueda}
            onChange={e => actualizarFiltros({ busqueda: e.target.value })}
            placeholder='Nombre, CC, RYR-15, A17, Las Américas...'
            className={s.filtros.searchInput}
          />
        </div>

        <label htmlFor='filtro-fuente' className='sr-only'>
          Fuente de pago
        </label>
        <select
          id='filtro-fuente'
          value={filtros.fuente}
          onChange={e => actualizarFiltros({ fuente: e.target.value })}
          className={`${s.filtros.select} min-w-[180px]`}
        >
          <option value='todas'>Todas las fuentes</option>
          {fuentesUnicas.map(f => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <label htmlFor='filtro-mes' className='sr-only'>
          Mes
        </label>
        <select
          id='filtro-mes'
          value={filtros.mes}
          onChange={e => actualizarFiltros({ mes: e.target.value })}
          className={`${s.filtros.select} min-w-[160px]`}
        >
          <option value='todos'>Todos los meses</option>
          {mesesDisponibles.map(m => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Fila 2: resumen + pills ──────────────────────────────────────── */}
      <div className='mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700'>
        {/* Conteo + monto total filtrado */}
        <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
          <span className='font-semibold text-gray-800 dark:text-gray-200'>
            {totalFiltrado}
          </span>{' '}
          {totalFiltrado === 1 ? 'resultado' : 'resultados'}
          {totalFiltrado > 0 ? (
            <>
              {' '}
              ·{' '}
              <span className='font-semibold text-violet-700 dark:text-violet-400'>
                {formatCurrency(montoTotalFiltrado)}
              </span>
            </>
          ) : null}
        </p>

        {/* Pills + limpiar */}
        <div className='flex items-center gap-1.5'>
          <span className='mr-1 text-xs text-gray-400 dark:text-gray-500'>
            Mostrar:
          </span>
          <FilterPill
            activo={filtros.mostrarActivos}
            label='Activos'
            claseActiva={s.filtros.pillActivo}
            onClick={toggleMostrarActivos}
          />
          <FilterPill
            activo={filtros.mostrarAnulados}
            label='Anulados'
            claseActiva={s.filtros.pillAnulado}
            onClick={toggleMostrarAnulados}
          />
          <FilterPill
            activo={filtros.mostrarRenunciados}
            label='Renunciados'
            claseActiva={s.filtros.pillRenunciado}
            onClick={toggleMostrarRenunciados}
          />
          {hayFiltrosActivos ? (
            <>
              <span className='mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700' />
              <button onClick={limpiarFiltros} className={s.filtros.limpiarBtn}>
                Limpiar filtros
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
