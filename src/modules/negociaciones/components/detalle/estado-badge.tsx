/**
 * Componente: EstadoBadge
 *
 * Badge reutilizable para mostrar el estado de una negociación
 * Estados válidos: 'Activa', 'Suspendida', 'Completada', 'Cerrada por Renuncia'
 *
 * ⚠️ Estados verificados en: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 */

import { Award, CheckCircle2, Clock, XCircle } from 'lucide-react'
import * as styles from '../../styles/detalle.styles'

interface EstadoBadgeProps {
  estado: string
  className?: string
}

// Configuración de iconos y estilos por estado
const ESTADO_CONFIG: Record<string, { icon: any; classes: string }> = {
  'Activa': {
    icon: CheckCircle2,
    classes: styles.badgeClasses.activa,
  },
  'Suspendida': {
    icon: Clock,
    classes: styles.badgeClasses.suspendida,
  },
  'Completada': {
    icon: Award,
    classes: styles.badgeClasses.completada,
  },
  'Cerrada por Renuncia': {
    icon: XCircle,
    classes: styles.badgeClasses.renuncia,
  },
}

export function EstadoBadge({ estado, className = '' }: EstadoBadgeProps) {
  const config = ESTADO_CONFIG[estado] || ESTADO_CONFIG['Activa']
  const Icon = config.icon

  return (
    <span className={`${styles.badgeClasses.base} ${config.classes} ${className}`}>
      <Icon className="h-4 w-4" />
      {estado}
    </span>
  )
}
