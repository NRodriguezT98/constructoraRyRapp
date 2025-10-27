'use client'

/**
 * 📅 MODAL DE FECHA DE COMPLETADO
 *
 * Modal para que el usuario especifique la fecha real de completado del paso.
 * Aparece al presionar "Completar Paso".
 */

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, X } from 'lucide-react'
import { useState } from 'react'
import { modalFechaStyles as styles } from './modal-fecha-completado.styles'

interface ModalFechaCompletadoProps {
  isOpen: boolean
  pasoNombre: string
  fechaInicio?: string // Fecha cuando se inició el paso
  onConfirm: (fecha: Date) => void
  onCancel: () => void
}

export function ModalFechaCompletado({
  isOpen,
  pasoNombre,
  fechaInicio,
  onConfirm,
  onCancel
}: ModalFechaCompletadoProps) {
  // Fecha por defecto: hoy
  const hoy = new Date()
  const fechaPorDefecto = hoy.toISOString().split('T')[0] // YYYY-MM-DD

  // Fecha mínima: fecha de inicio del paso (si existe) o hace 30 días
  const fechaMinima = fechaInicio
    ? new Date(fechaInicio).toISOString().split('T')[0]
    : new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [fecha, setFecha] = useState(fechaPorDefecto)
  const [error, setError] = useState<string | null>(null)

  const handleConfirmar = () => {
    // Validar que la fecha no sea futura
    const fechaSeleccionada = new Date(fecha)
    const ahora = new Date()

    if (fechaSeleccionada > ahora) {
      setError('La fecha no puede ser futura')
      return
    }

    // Validar que no sea anterior a fecha de inicio
    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio)
      if (fechaSeleccionada < fechaInicioDate) {
        setError('La fecha no puede ser anterior al inicio del paso')
        return
      }
    }

    onConfirm(fechaSeleccionada)
  }

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFecha(e.target.value)
    setError(null) // Limpiar error al cambiar fecha
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.overlay}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={styles.container}
          >
            {/* Header */}
            <div className={styles.header.container}>
              <div className={styles.header.topRow}>
                <div className={styles.header.left}>
                  <div className={styles.header.iconCircle}>
                    <Calendar className={styles.header.icon} />
                  </div>
                  <div className={styles.header.content}>
                    <h3 className={styles.header.title}>
                      Completar Paso
                    </h3>
                    <p className={styles.header.subtitle}>
                      {pasoNombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className={styles.header.closeButton}
                >
                  <X className={styles.header.closeIcon} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className={styles.body.container}>
              <div>
                <label className={styles.body.label}>
                  ¿Cuándo se completó este paso?
                </label>
                <p className={styles.body.description}>
                  Si completaste el paso hoy, deja la fecha actual. Si fue otro día, selecciona la fecha correcta.
                </p>

                <input
                  type="date"
                  value={fecha}
                  onChange={handleFechaChange}
                  min={fechaMinima}
                  max={fechaPorDefecto}
                  className={styles.body.input}
                />

                {/* Información adicional */}
                <div className={styles.body.info.container}>
                  {fechaInicio && (
                    <p className={styles.body.info.item}>
                      📌 Paso iniciado: {new Date(fechaInicio).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  <p className={styles.body.info.item}>
                    📅 Fecha mínima permitida: {new Date(fechaMinima).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.body.error}
                  >
                    ⚠️ {error}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer.container}>
              <button
                onClick={onCancel}
                className={styles.footer.buttonCancel}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                className={styles.footer.buttonConfirm}
              >
                Confirmar Completado
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
