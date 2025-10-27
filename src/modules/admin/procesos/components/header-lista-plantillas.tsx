/**
 * 📋 HEADER - LISTA DE PLANTILLAS
 *
 * Header hero con gradiente para la lista de plantillas.
 * Diseño premium con glassmorphism.
 */

'use client'

import { Settings } from 'lucide-react'
import { procesosStyles as styles } from '../styles/procesos.styles'

export function HeaderListaPlantillas() {
  return (
    <div className={styles.header.container}>
      <div className={styles.header.pattern} />

      <div className={styles.header.topRow}>
        <div className={styles.header.iconCircle}>
          <Settings className={styles.header.icon} />
        </div>

        <div className={styles.header.badge}>
          Administración
        </div>
      </div>

      <h1 className={styles.header.title}>
        Gestión de Procesos
      </h1>

      <p className={styles.header.subtitle}>
        Configura las etapas que los clientes deben completar desde la separación
        hasta la entrega de la vivienda. Define condiciones según fuentes de pago
        y documentos requeridos.
      </p>
    </div>
  )
}
