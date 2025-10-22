/**
 * Componente: TimelineStep
 *
 * Step individual para el timeline del proceso de negociación
 * Muestra estado visual (completado/activo/pendiente)
 */

import { CheckCircle2, Clock } from 'lucide-react'
import * as styles from '../../styles/detalle.styles'

interface TimelineStepProps {
  label: string
  descripcion: string
  fecha?: string
  isActive: boolean
  isCompleted: boolean
  isLast?: boolean
}

export function TimelineStep({
  label,
  descripcion,
  fecha,
  isActive,
  isCompleted,
  isLast = false,
}: TimelineStepProps) {
  return (
    <div className={styles.timelineClasses.step}>
      {/* Icono + Línea */}
      <div className={styles.timelineClasses.iconContainer}>
        <div
          className={`${styles.timelineClasses.icon} ${
            isCompleted
              ? styles.timelineClasses.iconCompleted
              : isActive
                ? styles.timelineClasses.iconActive
                : styles.timelineClasses.iconPending
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className={styles.timelineClasses.iconInside} />
          ) : isActive ? (
            <Clock className={styles.timelineClasses.iconInside} />
          ) : (
            <div className={styles.timelineClasses.iconDot} />
          )}
        </div>
        {!isLast && <div className={styles.timelineClasses.line} />}
      </div>

      {/* Contenido */}
      <div className={styles.timelineClasses.content}>
        <p
          className={
            isActive ? styles.timelineClasses.labelActive : styles.timelineClasses.label
          }
        >
          {label}
        </p>
        <p className={styles.timelineClasses.description}>{descripcion}</p>
        {fecha && (
          <p className={styles.timelineClasses.date}>
            {new Date(fecha).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  )
}
