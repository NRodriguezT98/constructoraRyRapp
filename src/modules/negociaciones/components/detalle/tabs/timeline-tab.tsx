/**
 * Tab: Timeline
 *
 * Timeline rediseñado del proceso de negociación
 * Estados: Activa → [Suspendida] → Completada/Renuncia
 *
 * ⚠️ SIN "Cierre Financiero" - Ya no existe en el flujo
 */

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import * as styles from '../../../styles/detalle.styles'
import { TimelineStep } from '../timeline-step'

interface TimelineTabProps {
  negociacion: any
}

export function TimelineTab({ negociacion }: TimelineTabProps) {
  const estado = negociacion.estado

  // Construir timeline basado en el estado actual
  const steps: any[] = []

  // PASO 1: Activa (siempre presente)
  steps.push({
    label: 'Negociación Activa',
    descripcion: 'Negociación creada y activa',
    fecha: negociacion.fecha_creacion,
    isActive: estado === 'Activa',
    isCompleted: ['Suspendida', 'Completada', 'Cerrada por Renuncia'].includes(estado),
  })

  // PASO 2: Suspendida (opcional)
  if (estado === 'Suspendida' || (negociacion.notas && negociacion.notas.includes('[SUSPENDIDA]'))) {
    steps.push({
      label: 'Suspendida',
      descripcion: 'Negociación temporalmente suspendida',
      fecha: negociacion.fecha_actualizacion,
      isActive: estado === 'Suspendida',
      isCompleted: ['Completada', 'Cerrada por Renuncia'].includes(estado),
    })
  }

  // PASO 3: Estado Final
  if (estado === 'Completada') {
    steps.push({
      label: 'Completada',
      descripcion: 'Pago completo - Proceso finalizado exitosamente',
      fecha: negociacion.fecha_actualizacion,
      isActive: true,
      isCompleted: true,
    })
  } else if (estado === 'Cerrada por Renuncia') {
    steps.push({
      label: 'Cerrada por Renuncia',
      descripcion: 'Cliente renunció a la negociación',
      fecha: negociacion.fecha_actualizacion,
      isActive: true,
      isCompleted: true,
    })
  } else {
    // Estado pendiente
    steps.push({
      label: 'Finalización',
      descripcion: 'Pendiente de completar o cerrar',
      fecha: undefined,
      isActive: false,
      isCompleted: false,
    })
  }

  return (
    <motion.div {...styles.animations.fadeInUp}>
      <div className={styles.cardClasses.container}>
        <h3 className={styles.cardClasses.subtitle}>
          <Clock className="h-5 w-5 text-purple-600" />
          Proceso de la Negociación
        </h3>

        <div className={styles.timelineClasses.container}>
          {steps.map((step, idx) => (
            <TimelineStep
              key={idx}
              {...step}
              isLast={idx === steps.length - 1}
            />
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
            📊 Estadísticas
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Creada:</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(negociacion.fecha_creacion).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Última actualización:</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(negociacion.fecha_actualizacion).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
