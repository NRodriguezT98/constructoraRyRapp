/**
 * GrupoEventosFecha - Agrupación de eventos por fecha
 * Timeline vertical con eventos del mismo día
 */

'use client'

import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { historialStyles } from '../historial-tab.styles'

import { EventoCard } from './EventoCard'

interface GrupoEventosFechaProps {
  fecha: string
  fechaFormateada: string
  total: number
  eventos: EventoHistorialHumanizado[]
  onEditarNota?: (notaId: string) => void
  onEliminarNota?: (notaId: string) => void
  notasEditables?: Set<string> // ✅ Permisos pre-calculados
}

export function GrupoEventosFecha({
  fecha,
  fechaFormateada,
  total,
  eventos,
  onEditarNota,
  onEliminarNota,
  notasEditables,
}: GrupoEventosFechaProps) {
  return (
    <motion.div
      key={fecha}
      initial={historialStyles.animations.fadeIn.initial}
      animate={historialStyles.animations.fadeIn.animate}
      exit={historialStyles.animations.fadeIn.exit}
      transition={{ duration: 0.2 }}
      className={historialStyles.timeline.grupoContainer}
    >
      {/* Header de fecha */}
      <div className={historialStyles.timeline.fechaHeader}>
        <Calendar className={historialStyles.timeline.fechaIcon} />
        <h4 className={historialStyles.timeline.fechaTitulo}>
          {fechaFormateada}
        </h4>
        <span className={historialStyles.timeline.fechaContador}>
          {total} {total === 1 ? 'evento' : 'eventos'}
        </span>
      </div>

      {/* Eventos del día */}
      <div className={historialStyles.timeline.eventosContainer}>
        {/* Línea vertical del timeline */}
        <div className={historialStyles.timeline.lineaVertical} />

        {eventos.map((evento, index) => (
          <EventoCard
            key={evento.id}
            evento={evento}
            isLast={index === eventos.length - 1}
            onEditarNota={onEditarNota}
            onEliminarNota={onEliminarNota}
            notasEditables={notasEditables}
          />
        ))}
      </div>
    </motion.div>
  )
}
