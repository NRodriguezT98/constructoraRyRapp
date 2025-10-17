'use client'

import { Activity } from 'lucide-react'
import * as styles from '../cliente-detalle.styles'

interface ActividadTabProps {
  clienteId: string
}

export function ActividadTab({ clienteId }: ActividadTabProps) {
  return (
    <div className={styles.emptyStateClasses.container}>
      <Activity className={styles.emptyStateClasses.icon} />
      <h3 className={styles.emptyStateClasses.title}>Timeline de Actividad</h3>
      <p className={styles.emptyStateClasses.description}>
        Aquí se mostrará el historial completo de actividades del cliente.
      </p>
      <p className='text-xs text-gray-500'>Próximamente en esta versión</p>
    </div>
  )
}
