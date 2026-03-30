import { motion } from 'framer-motion'
import { Building2, Filter, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { abonosListStyles } from './abonos-list.styles'

const s = abonosListStyles.filtros

/**
 * 🎯 TIPOS
 */
interface FiltrosAbonosProps {
  filtros: {
    busqueda: string
    estado: 'todos' | 'activos' | 'anulados'
    vivienda?: string
    proyecto?: string
  }
  proyectos: Array<{ id: string; nombre: string }>
  onFiltrosChange: (filtros: Partial<FiltrosAbonosProps['filtros']>) => void
  onLimpiar: () => void
  totalResultados: number
  totalAbonos: number
}

/**
 * 🎨 COMPONENTE: FiltrosAbonos (Modernizado)
 *
 * Sistema de filtrado premium con glassmorphism
 * Diseño floating sticky con backdrop blur
 */
export function FiltrosAbonos({
  filtros,
  proyectos,
  onFiltrosChange,
  onLimpiar,
  totalResultados,
  totalAbonos,
}: FiltrosAbonosProps) {
  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange({ busqueda: e.target.value })
  }

  const handleEstadoChange = (estado: 'todos' | 'activos' | 'anulados') => {
    onFiltrosChange({ estado })
  }

  const handleProyectoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({
      proyecto: e.target.value === 'todos' ? undefined : e.target.value,
    })
  }

  const limpiarBusqueda = () => {
    onFiltrosChange({ busqueda: '' })
  }

  const hayFiltrosActivos =
    filtros.busqueda.trim() !== '' ||
    filtros.estado !== 'activos' ||
    filtros.vivienda !== undefined ||
    filtros.proyecto !== undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={s.container}
    >
      {/* 🎯 HEADER */}
      <div className={s.header}>
        <Filter className={s.headerIcon} />
        <h3 className={s.headerTitle}>Filtros Inteligentes</h3>
      </div>

      {/* 🔍 GRID DE FILTROS */}
      <div className={s.grid}>
        {/* Búsqueda */}
        <div className={s.inputGroup}>
          <label className={s.label}>Búsqueda</label>
          <div className={s.inputWrapper}>
            <Search className={s.searchIcon} />
            <Input
              type='text'
              value={filtros.busqueda}
              onChange={handleBusquedaChange}
              placeholder='Cliente, referencia, vivienda...'
              className={s.input}
            />
            {filtros.busqueda && (
              <button
                onClick={limpiarBusqueda}
                className={s.clearButton}
                aria-label='Limpiar búsqueda'
              >
                <X className={s.clearIcon} />
              </button>
            )}
          </div>
        </div>

        {/* Estado */}
        <div className={s.radioGroup}>
          <label className={s.label}>Estado</label>
          <div className={s.radioOptions}>
            <button
              onClick={() => handleEstadoChange('todos')}
              className={`${s.radioButton} ${
                filtros.estado === 'todos' ? s.radioActive : s.radioInactive
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => handleEstadoChange('activos')}
              className={`${s.radioButton} ${
                filtros.estado === 'activos' ? s.radioActive : s.radioInactive
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => handleEstadoChange('anulados')}
              className={`${s.radioButton} ${
                filtros.estado === 'anulados' ? s.radioActive : s.radioInactive
              }`}
            >
              Anulados
            </button>
          </div>
        </div>

        {/* Proyecto - Select funcional */}
        <div className={s.inputGroup}>
          <label className={s.label}>Proyecto</label>
          <div className='relative'>
            <Building2 className='absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <select
              value={filtros.proyecto || 'todos'}
              onChange={handleProyectoChange}
              className={`${s.input} cursor-pointer appearance-none bg-white pl-10 dark:bg-gray-800`}
            >
              <option value='todos'>Todos los proyectos</option>
              {proyectos.map(proyecto => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2'>
              <svg
                className='h-4 w-4 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 FOOTER CON RESULTADOS */}
      <div className={s.footer}>
        <div className={s.resultados}>
          <span className='font-bold text-violet-600 dark:text-violet-400'>
            {totalResultados}
          </span>
          <span className='mx-1 text-gray-500 dark:text-gray-400'>de</span>
          <span className='font-semibold'>{totalAbonos}</span>
          <span className='ml-1 text-gray-500 dark:text-gray-400'>abonos</span>
        </div>

        {hayFiltrosActivos && (
          <Button
            onClick={onLimpiar}
            variant='ghost'
            size='sm'
            className={s.limpiarButton}
          >
            <X className='mr-1 h-3 w-3' />
            Limpiar Filtros
          </Button>
        )}
      </div>
    </motion.div>
  )
}
