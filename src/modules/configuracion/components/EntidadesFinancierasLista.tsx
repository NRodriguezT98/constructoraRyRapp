/**
 * Component: EntidadesFinancierasLista
 *
 * Tabla profesional para administrar entidades financieras.
 * Con filtros, búsqueda, acciones inline y estados de UI.
 */

'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    Building2,
    CircleDollarSign,
    Edit2,
    Filter,
    Landmark,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Trash2,
} from 'lucide-react'

import {
    useEliminarEntidadFinanciera,
    useEntidadesFinancieras,
    useReactivarEntidadFinanciera,
} from '../hooks/useEntidadesFinancieras'
import type {
    EntidadColor,
    EntidadFinanciera,
    TipoEntidadFinanciera,
} from '../types/entidades-financieras.types'
import { TIPO_ENTIDAD_VALUES } from '../types/entidades-financieras.types'

import { EntidadFinancieraFormModal } from './EntidadFinancieraFormModal'

// =====================================================
// ICON MAP
// =====================================================

const tipoIcons: Record<TipoEntidadFinanciera, any> = {
  Banco: Landmark,
  'Caja de Compensación': Building2,
  Cooperativa: CircleDollarSign,
  Otro: Building2,
}

// =====================================================
// COLOR MAP
// =====================================================

const colorClasses: Record<EntidadColor, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  green: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  red: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  gray: { bg: 'bg-gray-50 dark:bg-gray-950/30', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-950/30', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800' },
  lime: { bg: 'bg-lime-50 dark:bg-lime-950/30', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-200 dark:border-lime-800' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
}

// =====================================================
// COMPONENT
// =====================================================

export function EntidadesFinancierasLista() {
  // State
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<TipoEntidadFinanciera | 'Todos'>('Todos')
  const [estadoFilter, setEstadoFilter] = useState<'Todos' | 'Activas' | 'Inactivas'>('Todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [entidadEdit, setEntidadEdit] = useState<EntidadFinanciera | null>(null)

  // Queries & Mutations
  const { data: entidades, isLoading, isError, error, refetch } = useEntidadesFinancieras()
  const eliminarMutation = useEliminarEntidadFinanciera()
  const reactivarMutation = useReactivarEntidadFinanciera()

  // Filtrar entidades
  const entidadesFiltradas = entidades?.filter((entidad) => {
    const matchSearch =
      entidad.nombre.toLowerCase().includes(search.toLowerCase()) ||
      entidad.codigo.toLowerCase().includes(search.toLowerCase()) ||
      entidad.nit?.toLowerCase().includes(search.toLowerCase())

    const matchTipo = tipoFilter === 'Todos' || entidad.tipo === tipoFilter

    const matchEstado =
      estadoFilter === 'Todos' ||
      (estadoFilter === 'Activas' && entidad.activo) ||
      (estadoFilter === 'Inactivas' && !entidad.activo)

    return matchSearch && matchTipo && matchEstado
  })

  // Handlers
  const handleNuevo = () => {
    setEntidadEdit(null)
    setIsModalOpen(true)
  }

  const handleEdit = (entidad: EntidadFinanciera) => {
    setEntidadEdit(entidad)
    setIsModalOpen(true)
  }

  const handleEliminar = async (entidad: EntidadFinanciera) => {
    if (!confirm(`¿Desactivar "${entidad.nombre}"?`)) return
    await eliminarMutation.mutateAsync(entidad.id)
  }

  const handleReactivar = async (entidad: EntidadFinanciera) => {
    await reactivarMutation.mutateAsync(entidad.id)
  }

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (isError) {
    return (
      <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Error al cargar entidades
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <div className="space-y-4">
      {/* Header con búsqueda y filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, código o NIT..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* Filtro Tipo */}
          <div className="relative flex items-center gap-2 w-full lg:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as any)}
              className="flex-1 lg:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm min-w-[200px]"
            >
              <option value="Todos">Todos los tipos</option>
              {TIPO_ENTIDAD_VALUES.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm w-full lg:w-auto"
          >
            <option value="Todos">Todos</option>
            <option value="Activas">Activas</option>
            <option value="Inactivas">Inactivas</option>
          </select>

          {/* Botón Nuevo */}
          <button
            onClick={handleNuevo}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-lg w-full lg:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Nueva Entidad
          </button>
        </div>

        {/* Contador */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {entidadesFiltradas?.length || 0} entidad(es) encontrada(s)
          </p>
        </div>
      </div>

      {/* Tabla */}
      {entidadesFiltradas && entidadesFiltradas.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Entidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entidadesFiltradas.map((entidad) => {
                  const Icon = tipoIcons[entidad.tipo]
                  const colors = colorClasses[entidad.color as EntidadColor] || colorClasses.gray

                  return (
                    <motion.tr
                      key={entidad.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      {/* Entidad */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {entidad.nombre}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {entidad.codigo}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {entidad.tipo}
                        </span>
                      </td>

                      {/* Contacto */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs">
                          {entidad.telefono ? (
                            <p className="text-gray-600 dark:text-gray-400">{entidad.telefono}</p>
                          ) : null}
                          {entidad.email_contacto ? (
                            <p className="text-gray-600 dark:text-gray-400 truncate max-w-xs">
                              {entidad.email_contacto}
                            </p>
                          ) : null}
                          {!entidad.telefono && !entidad.email_contacto ? (
                            <p className="text-gray-400 dark:text-gray-500 italic">Sin contacto</p>
                          ) : null}
                        </div>
                      </td>

                      {/* Orden */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300">
                          {entidad.orden}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        {entidad.activo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/30 text-xs font-medium text-green-700 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Inactiva
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(entidad)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {entidad.activo ? (
                            <button
                              onClick={() => handleEliminar(entidad)}
                              disabled={eliminarMutation.isPending}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Desactivar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivar(entidad)}
                              disabled={reactivarMutation.isPending}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Reactivar"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Empty State
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No hay entidades
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {search || tipoFilter !== 'Todos' || estadoFilter !== 'Todos'
                ? 'No se encontraron entidades con los filtros seleccionados'
                : 'Comienza creando tu primera entidad financiera'}
            </p>
            {!search && tipoFilter === 'Todos' && estadoFilter === 'Todos' ? (
              <button
                onClick={handleNuevo}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Nueva Entidad
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal */}
      <EntidadFinancieraFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEntidadEdit(null)
        }}
        entidad={entidadEdit}
      />
    </div>
  )
}
