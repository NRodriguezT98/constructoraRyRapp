/**
 * FiltrosYBusqueda - Header con búsqueda y filtros avanzados
 * Componente de filtrado completo del historial
 */

'use client'

import { Calendar, FileText, Plus, Search, User, X } from 'lucide-react'

import { historialStyles } from '../historial-tab.styles'

interface FiltrosYBusquedaProps {
  clienteNombre: string
  estadisticasFiltrados: number
  estadisticasTotal: number
  busqueda: string
  onBusquedaChange: (valor: string) => void
  tieneAplicados: boolean
  onLimpiarFiltros: () => void
  // Nuevos filtros
  tipoEvento: string
  onTipoEventoChange: (tipo: string) => void
  modulo: string
  onModuloChange: (modulo: string) => void
  usuario: string
  onUsuarioChange: (usuario: string) => void
  usuariosDisponibles: Array<{ id: string; email: string }>
  // Botón agregar nota
  onAgregarNota?: () => void
}

export function FiltrosYBusqueda({
  clienteNombre,
  estadisticasFiltrados,
  estadisticasTotal,
  busqueda,
  onBusquedaChange,
  tieneAplicados,
  onLimpiarFiltros,
  tipoEvento,
  onTipoEventoChange,
  modulo,
  onModuloChange,
  usuario,
  onUsuarioChange,
  usuariosDisponibles,
  onAgregarNota,
}: FiltrosYBusquedaProps) {
  return (
    <div className={historialStyles.header.container}>
      {/* Header con estadísticas */}
      <div className={historialStyles.header.wrapper}>
        <div className={historialStyles.header.titleContainer}>
          <h3 className={historialStyles.header.title}>
            Historial de {clienteNombre}
          </h3>
          <p className={historialStyles.header.stats}>
            {estadisticasFiltrados} de {estadisticasTotal} eventos
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {tieneAplicados ? (
            <button
              onClick={onLimpiarFiltros}
              className={historialStyles.header.clearButton}
            >
              <X className='h-4 w-4' />
              Limpiar filtros
            </button>
          ) : null}

          {onAgregarNota && (
            <button
              onClick={onAgregarNota}
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-indigo-700'
            >
              <Plus className='h-4 w-4' strokeWidth={2.5} />
              Agregar Nota
            </button>
          )}
        </div>
      </div>

      {/* Grid de filtros avanzados */}
      <div className='mb-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4'>
        {/* Búsqueda */}
        <div className={historialStyles.search.container}>
          <Search className={historialStyles.search.icon} />
          <input
            type='text'
            placeholder='Buscar...'
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            className={historialStyles.search.input}
          />
          {busqueda ? (
            <button
              onClick={() => onBusquedaChange('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200'
              aria-label='Limpiar búsqueda'
            >
              <X className='h-4 w-4' />
            </button>
          ) : null}
        </div>

        {/* Filtro tipo de evento */}
        <div className='relative'>
          <FileText className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <select
            value={tipoEvento}
            onChange={e => onTipoEventoChange(e.target.value)}
            className='w-full rounded-lg border-2 border-gray-200 bg-white py-2 pl-10 pr-3 text-sm transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-900'
          >
            <option value=''>Todos los tipos</option>
            <option value='CREATE'>Creación</option>
            <option value='UPDATE'>Actualización</option>
            <option value='DELETE'>Eliminación</option>
          </select>
        </div>

        {/* Filtro módulo */}
        <div className='relative'>
          <Calendar className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <select
            value={modulo}
            onChange={e => onModuloChange(e.target.value)}
            className='w-full rounded-lg border-2 border-gray-200 bg-white py-2 pl-10 pr-3 text-sm transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-900'
          >
            <option value=''>Todos los módulos</option>
            <option value='clientes'>Clientes</option>
            <option value='negociaciones'>Negociaciones</option>
            <option value='abonos_historial'>Abonos</option>
            <option value='renuncias'>Renuncias</option>
            <option value='intereses'>Intereses</option>
            <option value='documentos_cliente'>Documentos</option>
          </select>
        </div>

        {/* Filtro usuario */}
        <div className='relative'>
          <User className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <select
            value={usuario}
            onChange={e => onUsuarioChange(e.target.value)}
            className='w-full rounded-lg border-2 border-gray-200 bg-white py-2 pl-10 pr-3 text-sm transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-900'
          >
            <option value=''>Todos los usuarios</option>
            {usuariosDisponibles.map(user => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
