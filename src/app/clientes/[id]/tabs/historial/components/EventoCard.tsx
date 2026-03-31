/**
 * EventoCard - Componente Individual de Evento (DISEÑO COMPACTO)
 * Card de timeline con toda la información del evento
 */

'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Clock, Edit, Eye, Plus, Trash2, User } from 'lucide-react'

import { formatDateTimeForDisplay } from '@/lib/utils/date.utils'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { DetalleEventoModal } from '../../components/DetalleEventoModal'
import { coloresEvento, historialStyles } from '../historial-tab.styles'

interface EventoCardProps {
  evento: EventoHistorialHumanizado
  isLast?: boolean
  onEditarNota?: (notaId: string) => void
  onEliminarNota?: (notaId: string) => void
  notasEditables?: Set<string> // ✅ Permisos pre-calculados desde el padre
}

// Iconos por tipo de evento
const ICONOS_TIPO = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
}

export function EventoCard({ evento, isLast: _isLast, onEditarNota, onEliminarNota, notasEditables }: EventoCardProps) {
  const Icono = evento.icono
  const colores = coloresEvento[evento.color] || coloresEvento.gray

  // Detectar si es nota manual
  const esNota = evento.metadata?.esNota === true
  const notaId = evento.metadata?.notaId as string | undefined

  // Icono de tipo de acción
  const IconoTipo = esNota ? evento.icono : (ICONOS_TIPO[evento.accion as keyof typeof ICONOS_TIPO] || evento.icono)

  // ✅ Verificar permisos desde Set pre-calculado (instantáneo)
  const puedeEditar = notaId ? notasEditables?.has(notaId) ?? false : false

  return (
    <motion.div
      initial={historialStyles.animations.slideIn.initial}
      animate={historialStyles.animations.slideIn.animate}
      transition={{ duration: 0.3 }}
      className={historialStyles.eventoCard.wrapper}
    >
      {/* Punto del timeline con icono de tipo */}
      <div className={`${historialStyles.eventoCard.punto} ${colores.bg}`}>
        <IconoTipo className={`${historialStyles.eventoCard.puntoIcon} ${colores.icon}`} strokeWidth={2.5} />
      </div>

      {/* Card del evento (diseño compacto) */}
      <motion.div
        whileHover={{ ...historialStyles.animations.hoverSlide.whileHover, scale: 1.01 }}
        transition={historialStyles.animations.hoverSlide.transition}
        className={`${historialStyles.eventoCard.card} ${colores.border}`}
      >
        {/* Barra de color lateral más prominente */}
        <div className={`${historialStyles.eventoCard.barraLateral} ${colores.barraLateral}`} />

        {/* Contenido */}
        <div className="px-4 py-3 space-y-2">
          {/* Header: Título + Badge tipo */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold text-gray-900 dark:text-white">{evento.titulo}</h5>
            </div>
            {/* Badge de tipo */}
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${colores.bg} ${colores.icon}`}>
              <IconoTipo className="w-3 h-3" strokeWidth={2.5} />
              {esNota
                ? (evento.metadata?.esImportante ? 'Nota Importante' : 'Nota Manual')
                : (evento.accion === 'CREATE' ? 'Creación' : evento.accion === 'UPDATE' ? 'Actualización' : 'Eliminación')
              }
            </span>
          </div>

          {/* Contenido de la nota (más prominente para notas) */}
          {esNota ? (
            <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {evento.descripcion}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{evento.descripcion}</p>
          )}

          {/* Usuario + Fecha */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {/* Usuario con label */}
            <div className="flex items-start gap-2">
              <User className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Acción realizada por:</p>
                <p className="text-xs text-gray-900 dark:text-white font-medium truncate">
                  {evento.usuario.nombres || evento.usuario.email}
                  {evento.usuario.rol ? (
                    <span className="text-gray-500 dark:text-gray-400 font-normal"> ({evento.usuario.rol})</span>
                  ) : null}
                </p>
              </div>
            </div>
            {/* Fecha */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatDateTimeForDisplay(evento.fecha)}
              </span>
            </div>
          </div>

          {/* Acciones de nota (editar/eliminar) - COMPACTO */}
          {esNota && puedeEditar && notaId ? (() => {
            return (
              <div className="pt-2 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEditarNota?.(notaId)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-medium text-[11px] transition-all"
                >
                  <Edit className="w-3 h-3" strokeWidth={2.5} />
                  Editar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEliminarNota?.(notaId)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-medium text-[11px] transition-all"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={2.5} />
                  Eliminar
                </motion.button>
              </div>
            )
          })() : null}

          {/* Botón detalles solo para eventos normales */}
          {!esNota && evento.detalles && evento.detalles.length > 0 ? (
            <div className="pt-2">
              <DetallesButton evento={evento} colores={colores} />
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * DetallesButton - Botón para abrir modal de detalles
 */
interface DetallesButtonProps {
  evento: EventoHistorialHumanizado
  colores: (typeof coloresEvento)[keyof typeof coloresEvento]
}

function DetallesButton({ evento, colores }: DetallesButtonProps) {
  const [mostrarModal, setMostrarModal] = useState(false)

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setMostrarModal(true)}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${colores.border} border-2 ${colores.bg} ${colores.icon} font-semibold text-xs transition-all hover:shadow-md`}
      >
        <Eye className="w-4 h-4" strokeWidth={2.5} />
        Ver detalles ({evento.detalles?.length || 0})
      </motion.button>

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
