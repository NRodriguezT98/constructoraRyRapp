/**
 * Componente: Lista de Tipos de Fuentes de Pago
 *
 * Tabla profesional con acciones CRUD, filtros y estado de carga.
 *
 * Características:
 * - Tabla responsive con estados visuales
 * - Filtros en tiempo real
 * - Acciones inline (editar, eliminar, reactivar)
 * - Estados de loading/empty/error
 * - Drag and drop para reordenar (futuro)
 *
 * Responsabilidad: UI PRESENTACIONAL (lógica en hook)
 */

'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    BadgeDollarSign,
    Banknote,
    Building2,
    Check,
    CreditCard,
    DollarSign,
    Edit3,
    Eye,
    EyeOff,
    HandCoins,
    Home,
    Landmark,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Shield,
    Wallet,
    X
} from 'lucide-react'

import {
    useEliminarTipoFuentePago,
    useReactivarTipoFuentePago,
    useTiposFuentesPago,
} from '../hooks'
import type { TipoFuenteIcono, TipoFuentePago } from '../types'

import { TipoFuentePagoFormModal } from './TipoFuentePagoFormModal'

// =====================================================
// ICON MAP
// =====================================================

const ICON_MAP: Record<TipoFuenteIcono, React.ComponentType<{ className?: string }>> = {
  Wallet,
  Building2,
  Home,
  Shield,
  CreditCard,
  Landmark,
  BadgeDollarSign,
  DollarSign,
  Banknote,
  HandCoins,
}

// =====================================================
// COLOR MAP
// =====================================================

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-700',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-300 dark:border-pink-700',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-700',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
}

// =====================================================
// COMPONENT
// =====================================================

export function TiposFuentesPagoLista() {
  // Estado local
  const [busqueda, setBusqueda] = useState('')
  const [mostrarInactivos, setMostrarInactivos] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoFuentePago | null>(null)

  // React Query
  const {
    data: tiposFuentes = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTiposFuentesPago(
    {
      activo: mostrarInactivos ? undefined : true,
      search: busqueda || undefined,
    },
    'orden',
    'asc'
  )

  const { mutate: eliminar, isPending: isDeleting } = useEliminarTipoFuentePago()
  const { mutate: reactivar, isPending: isReactivating } = useReactivarTipoFuentePago()

  // Handlers
  const handleNuevo = () => {
    setTipoSeleccionado(null)
    setModalAbierto(true)
  }

  const handleEditar = (tipo: TipoFuentePago) => {
    setTipoSeleccionado(tipo)
    setModalAbierto(true)
  }

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de desactivar esta fuente de pago?')) {
      eliminar(id)
    }
  }

  const handleReactivar = (id: string) => {
    reactivar(id)
  }

  // Filtrado local adicional
  const tiposFiltrados = tiposFuentes.filter((tipo) => {
    if (!busqueda) return true
    const termino = busqueda.toLowerCase()
    return (
      tipo.nombre.toLowerCase().includes(termino) ||
      tipo.codigo.toLowerCase().includes(termino) ||
      tipo.descripcion?.toLowerCase().includes(termino)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header con Acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tipos de Fuentes de Pago
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Administra las fuentes de pago disponibles en el sistema
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNuevo}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          Nueva Fuente
        </motion.button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o descripción..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Mostrar Inactivos */}
        <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
          <input
            type="checkbox"
            checked={mostrarInactivos}
            onChange={(e) => setMostrarInactivos(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mostrar inactivos
          </span>
        </label>

        {/* Refresh */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Estados de Carga/Error */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
          <p className="text-sm font-medium">Cargando fuentes de pago...</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar datos
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error?.message || 'Ocurrió un error inesperado'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado Vacío */}
      {!isLoading && !isError && tiposFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className="w-12 h-12" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {busqueda ? 'No se encontraron resultados' : 'No hay fuentes de pago'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {busqueda
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza creando tu primera fuente de pago'}
          </p>
          {!busqueda && (
            <button
              onClick={handleNuevo}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              Nueva Fuente
            </button>
          )}
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !isError && tiposFiltrados.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Fuente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Configuración
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tiposFiltrados.map((tipo) => {
                  const Icon = ICON_MAP[tipo.icono] || Wallet // ✅ Fallback a Wallet si icono no existe
                  const colorConfig = COLOR_MAP[tipo.color] || COLOR_MAP.blue // ✅ Fallback a blue

                  return (
                    <motion.tr
                      key={tipo.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      {/* Fuente */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${colorConfig.bg} ${colorConfig.border} border-2 flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className={`w-5 h-5 ${colorConfig.text}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {tipo.nombre}
                            </p>
                            {tipo.descripcion && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {tipo.descripcion.length > 60
                                  ? `${tipo.descripcion.slice(0, 60)}...`
                                  : tipo.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Código */}
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-900/50 text-xs font-mono text-gray-900 dark:text-white">
                          {tipo.codigo}
                        </code>
                      </td>

                      {/* Configuración */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {tipo.requiere_entidad && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">
                              <Building2 className="w-3 h-3" />
                              Entidad
                            </span>
                          )}
                          {tipo.permite_multiples_abonos && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs font-medium text-purple-700 dark:text-purple-300">
                              <DollarSign className="w-3 h-3" />
                              Abonos
                            </span>
                          )}
                          {tipo.es_subsidio && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-medium text-green-700 dark:text-green-300">
                              <Shield className="w-3 h-3" />
                              Subsidio
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Orden */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900/50 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {tipo.orden}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        {tipo.activo ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-xs font-medium text-green-700 dark:text-green-300">
                            <Check className="w-3.5 h-3.5" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
                            <X className="w-3.5 h-3.5" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Editar */}
                          <button
                            onClick={() => handleEditar(tipo)}
                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Eliminar/Reactivar */}
                          {tipo.activo ? (
                            <button
                              onClick={() => handleEliminar(tipo.id)}
                              disabled={isDeleting}
                              className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                              title="Desactivar"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivar(tipo.id)}
                              disabled={isReactivating}
                              className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                              title="Reactivar"
                            >
                              <Eye className="w-4 h-4" />
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
      )}

      {/* Resumen */}
      {!isLoading && !isError && tiposFiltrados.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tiposFiltrados.length === 1
              ? '1 fuente de pago'
              : `${tiposFiltrados.length} fuentes de pago`}
          </p>
          {busqueda && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Filtrando por: <span className="font-medium">&quot;{busqueda}&quot;</span>
            </p>
          )}
        </div>
      )}

      {/* Modal de Formulario */}
      <TipoFuentePagoFormModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false)
          setTipoSeleccionado(null)
        }}
        tipoFuente={tipoSeleccionado}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
