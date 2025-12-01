/**
 * Tab de Historial de Cliente
 * Timeline visual de todos los eventos relacionados con el cliente
 */

'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Clock, Eye, Filter, Search, User, X } from 'lucide-react'

import { formatDateTimeForDisplay } from '@/lib/utils/date.utils'
import { useHistorialCliente } from '@/modules/clientes/hooks/useHistorialCliente'
import { EmptyState } from '@/shared/components/layout/EmptyState'
import { LoadingState } from '@/shared/components/layout/LoadingState'

import type { ColorEvento, EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { DetalleEventoModal } from './components/DetalleEventoModal'

interface HistorialTabProps {
  clienteId: string
  clienteNombre: string
}

export function HistorialTab({ clienteId, clienteNombre }: HistorialTabProps) {
  const {
    eventosAgrupados,
    estadisticas,
    isLoading,
    error,
    busqueda,
    setBusqueda,
    filtros,
    limpiarFiltros,
    tieneAplicados,
  } = useHistorialCliente({ clienteId })

  // ========== LOADING ==========
  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Cargando historial del cliente..." />
      </div>
    )
  }

  // ========== ERROR ==========
  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<X className="w-12 h-12 text-red-500" />}
          title="Error al cargar historial"
          description="Ocurrió un error al cargar el historial del cliente"
        />
      </div>
    )
  }

  // ========== SIN EVENTOS ==========
  if (estadisticas.total === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Clock className="w-12 h-12 text-gray-400" />}
          title="Sin historial"
          description="Este cliente aún no tiene eventos registrados"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 py-4">
      {/* ========== HEADER CON ESTADÍSTICAS ========== */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Historial de {clienteNombre}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {estadisticas.filtrados} de {estadisticas.total} eventos
            </p>
          </div>

          {tieneAplicados ? (
            <button
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          ) : null}
        </div>

        {/* ========== BARRA DE BÚSQUEDA ========== */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en el historial..."
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ========== TIMELINE DE EVENTOS ========== */}
      {estadisticas.filtrados === 0 ? (
        <div className="px-4 py-8">
          <EmptyState
            icon={<Filter className="w-12 h-12 text-gray-400" />}
            title="Sin resultados"
            description="No se encontraron eventos con los filtros aplicados"
          />
        </div>
      ) : (
        <div className="space-y-6 px-4">
          <AnimatePresence mode="wait">
            {eventosAgrupados.map((grupo) => (
              <motion.div
                key={grupo.fecha}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* ========== FECHA DEL GRUPO ========== */}
                <div className="sticky top-0 z-10 flex items-center gap-3 py-2 px-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 rounded-lg mb-3">
                  <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {grupo.fechaFormateada}
                  </h4>
                  <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400">
                    {grupo.total} {grupo.total === 1 ? 'evento' : 'eventos'}
                  </span>
                </div>

                {/* ========== EVENTOS DEL DÍA ========== */}
                <div className="relative pl-8 space-y-3">
                  {/* Línea vertical del timeline */}
                  <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-200 via-cyan-300 to-transparent dark:from-cyan-800 dark:via-cyan-700" />

                  {grupo.eventos.map((evento, index) => (
                    <EventoCard
                      key={evento.id}
                      evento={evento}
                      isLast={index === grupo.eventos.length - 1}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

/**
 * Botón para abrir modal de detalles
 */
interface DetallesButtonProps {
  evento: EventoHistorialHumanizado
  coloresIcono: ReturnType<typeof obtenerColoresIcono>
}

function DetallesButton({ evento, coloresIcono }: DetallesButtonProps) {
  const [mostrarModal, setMostrarModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setMostrarModal(true)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 ${coloresIcono.border} bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group`}
      >
        <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Ver detalles completos ({evento.detalles?.length || 0} campos)
        </span>
      </button>

      <DetalleEventoModal
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        titulo="Detalles del Evento"
        subtitulo={evento.titulo}
        detalles={evento.detalles || []}
      />
    </>
  )
}

/**
 * Card individual de evento en el timeline
 */
interface EventoCardProps {
  evento: EventoHistorialHumanizado
  isLast?: boolean
}

function EventoCard({ evento, isLast }: EventoCardProps) {
  const Icono = evento.icono
  const coloresIcono = obtenerColoresIcono(evento.color)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Punto del timeline */}
      <div
        className={`absolute -left-[26px] top-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${coloresIcono.bg}`}
      >
        <Icono className={`w-4 h-4 ${coloresIcono.icon}`} />
      </div>

      {/* Card del evento */}
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
        className={`group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border ${coloresIcono.border} p-4 shadow-md hover:shadow-xl transition-all duration-300`}
      >
        {/* Barra de color lateral */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${coloresIcono.barraLateral}`}
        />

        {/* Contenido */}
        <div className="pl-2">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {evento.titulo}
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {evento.descripcion}
              </p>
            </div>

            <div className="flex flex-col items-end gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-semibold">Fecha y hora de la acción:</span>
              </div>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {formatDateTimeForDisplay(evento.fecha)}
              </span>
            </div>
          </div>

          {/* Usuario */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <User className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            <div className="flex-1">
              <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Acción realizada por:
              </p>
              <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                {evento.usuario.nombres || evento.usuario.email}{evento.usuario.rol ? (
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold"> ({evento.usuario.rol})</span>
                ) : null}
              </p>
            </div>
          </div>

          {/* Botón para ver detalles en modal */}
          {evento.detalles && evento.detalles.length > 0 ? (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <DetallesButton
                evento={evento}
                coloresIcono={coloresIcono}
              />
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * Obtener colores según tipo de evento
 */
function obtenerColoresIcono(color: ColorEvento) {
  const colores = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-950',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      barraLateral: 'bg-blue-500',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-950',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      barraLateral: 'bg-green-500',
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-950',
      icon: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      barraLateral: 'bg-yellow-500',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-950',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      barraLateral: 'bg-red-500',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-950',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      barraLateral: 'bg-purple-500',
    },
    cyan: {
      bg: 'bg-cyan-100 dark:bg-cyan-950',
      icon: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-200 dark:border-cyan-800',
      barraLateral: 'bg-cyan-500',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-950',
      icon: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      barraLateral: 'bg-orange-500',
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      icon: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      barraLateral: 'bg-gray-500',
    },
  }

  return colores[color] || colores.gray
}

/**
 * Formatear valor según tipo
 */
function formatearValor(valor: any, tipo?: string): string {
  if (valor === null || valor === undefined) return '—'

  switch (tipo) {
    case 'numero':
      return typeof valor === 'number'
        ? `$${valor.toLocaleString('es-CO')}`
        : String(valor)
    case 'fecha':
      return formatDateTimeForDisplay(String(valor))
    case 'booleano':
      return valor ? 'Sí' : 'No'
    default:
      return String(valor)
  }
}
