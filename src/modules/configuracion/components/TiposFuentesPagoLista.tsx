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
  Plus,
  RefreshCw,
  Search,
  Shield,
  Wallet,
  X,
} from 'lucide-react'

import { useModal } from '@/shared/components/modals'
import { SectionLoadingSpinner } from '@/shared/components/ui'

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

const ICON_MAP: Record<
  TipoFuenteIcono,
  React.ComponentType<{ className?: string }>
> = {
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

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> =
  {
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
  const [tipoSeleccionado, setTipoSeleccionado] =
    useState<TipoFuentePago | null>(null)
  const { confirm } = useModal()

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

  const { mutate: eliminar, isPending: isDeleting } =
    useEliminarTipoFuentePago()
  const { mutate: reactivar, isPending: isReactivating } =
    useReactivarTipoFuentePago()

  // Handlers
  const handleNuevo = () => {
    setTipoSeleccionado(null)
    setModalAbierto(true)
  }

  const handleEditar = (tipo: TipoFuentePago) => {
    setTipoSeleccionado(tipo)
    setModalAbierto(true)
  }

  const handleEliminar = async (id: string) => {
    const confirmado = await confirm({
      title: 'Desactivar fuente de pago',
      message: '¿Estás seguro de desactivar esta fuente de pago?',
      variant: 'danger',
      confirmText: 'Desactivar',
      cancelText: 'Cancelar',
    })
    if (confirmado) {
      eliminar(id)
    }
  }

  const handleReactivar = (id: string) => {
    reactivar(id)
  }

  // Filtrado local adicional
  const tiposFiltrados = tiposFuentes.filter(tipo => {
    if (!busqueda) return true
    const termino = busqueda.toLowerCase()
    return (
      tipo.nombre.toLowerCase().includes(termino) ||
      tipo.codigo.toLowerCase().includes(termino) ||
      tipo.descripcion?.toLowerCase().includes(termino)
    )
  })

  return (
    <div className='space-y-6'>
      {/* Header con Acciones */}
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Tipos de Fuentes de Pago
          </h2>
          <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
            Administra las fuentes de pago disponibles en el sistema
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNuevo}
          className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700'
        >
          <Plus className='h-5 w-5' />
          Nueva Fuente
        </motion.button>
      </div>

      {/* Filtros */}
      <div className='flex flex-col items-stretch gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center'>
        {/* Búsqueda */}
        <div className='relative flex-1'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder='Buscar por nombre, código o descripción...'
            className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white'
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700'
            >
              <X className='h-4 w-4 text-gray-400' />
            </button>
          )}
        </div>

        {/* Mostrar Inactivos */}
        <label className='flex cursor-pointer items-center gap-2 rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-900'>
          <input
            type='checkbox'
            checked={mostrarInactivos}
            onChange={e => setMostrarInactivos(e.target.checked)}
            className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20'
          />
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Mostrar inactivos
          </span>
        </label>

        {/* Refresh */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refetch()}
          disabled={isFetching}
          className='rounded-lg bg-gray-100 p-2.5 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        >
          <RefreshCw
            className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`}
          />
        </motion.button>
      </div>

      {/* Estados de Carga/Error */}
      {isLoading && (
        <SectionLoadingSpinner
          label='Cargando fuentes de pago...'
          moduleName='abonos'
          icon={CreditCard}
          className='flex flex-col items-center justify-center gap-6 py-16'
        />
      )}

      {isError && (
        <div className='flex flex-col items-center justify-center py-16'>
          <div className='mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/30'>
            <AlertCircle className='h-12 w-12 text-red-600 dark:text-red-400' />
          </div>
          <p className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            Error al cargar datos
          </p>
          <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
            {error?.message || 'Ocurrió un error inesperado'}
          </p>
          <button
            onClick={() => refetch()}
            className='rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado Vacío */}
      {!isLoading && !isError && tiposFiltrados.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400'>
          <div className='mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800'>
            <Search className='h-12 w-12' />
          </div>
          <p className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            {busqueda
              ? 'No se encontraron resultados'
              : 'No hay fuentes de pago'}
          </p>
          <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
            {busqueda
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza creando tu primera fuente de pago'}
          </p>
          {!busqueda && (
            <button
              onClick={handleNuevo}
              className='rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
            >
              Nueva Fuente
            </button>
          )}
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !isError && tiposFiltrados.length > 0 && (
        <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50'>
                  <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Fuente
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Código
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Configuración
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Orden
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Estado
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                {tiposFiltrados.map(tipo => {
                  const Icon = ICON_MAP[tipo.icono] || Wallet // ✅ Fallback a Wallet si icono no existe
                  const colorConfig = COLOR_MAP[tipo.color] || COLOR_MAP.blue // ✅ Fallback a blue

                  return (
                    <motion.tr
                      key={tipo.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className='transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/30'
                    >
                      {/* Fuente */}
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`h-10 w-10 rounded-lg ${colorConfig.bg} ${colorConfig.border} flex flex-shrink-0 items-center justify-center border-2`}
                          >
                            <Icon className={`h-5 w-5 ${colorConfig.text}`} />
                          </div>
                          <div>
                            <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                              {tipo.nombre}
                            </p>
                            {tipo.descripcion && (
                              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                                {tipo.descripcion.length > 60
                                  ? `${tipo.descripcion.slice(0, 60)}...`
                                  : tipo.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Código */}
                      <td className='px-6 py-4'>
                        <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-900 dark:bg-gray-900/50 dark:text-white'>
                          {tipo.codigo}
                        </code>
                      </td>

                      {/* Configuración */}
                      <td className='px-6 py-4'>
                        <div className='flex flex-wrap gap-1.5'>
                          {tipo.requiere_entidad && (
                            <span className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                              <Building2 className='h-3 w-3' />
                              Entidad
                            </span>
                          )}
                          {tipo.permite_multiples_abonos && (
                            <span className='inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
                              <DollarSign className='h-3 w-3' />
                              Abonos
                            </span>
                          )}
                          {tipo.es_subsidio && (
                            <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                              <Shield className='h-3 w-3' />
                              Subsidio
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Orden */}
                      <td className='px-6 py-4 text-center'>
                        <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'>
                          {tipo.orden}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className='px-6 py-4 text-center'>
                        {tipo.activo ? (
                          <span className='inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300'>
                            <Check className='h-3.5 w-3.5' />
                            Activo
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300'>
                            <X className='h-3.5 w-3.5' />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-end gap-2'>
                          {/* Editar */}
                          <button
                            onClick={() => handleEditar(tipo)}
                            className='rounded-lg bg-blue-100 p-2 text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                            title='Editar'
                          >
                            <Edit3 className='h-4 w-4' />
                          </button>

                          {/* Eliminar/Reactivar */}
                          {tipo.activo ? (
                            <button
                              onClick={() => handleEliminar(tipo.id)}
                              disabled={isDeleting}
                              className='rounded-lg bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                              title='Desactivar'
                            >
                              <EyeOff className='h-4 w-4' />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivar(tipo.id)}
                              disabled={isReactivating}
                              className='rounded-lg bg-green-100 p-2 text-green-700 transition-colors hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                              title='Reactivar'
                            >
                              <Eye className='h-4 w-4' />
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
        <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {tiposFiltrados.length === 1
              ? '1 fuente de pago'
              : `${tiposFiltrados.length} fuentes de pago`}
          </p>
          {busqueda && (
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Filtrando por:{' '}
              <span className='font-medium'>&quot;{busqueda}&quot;</span>
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
