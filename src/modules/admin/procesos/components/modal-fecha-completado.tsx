'use client'

/**
 * 📅 MODAL DE FECHA DE COMPLETADO
 *
 * Modal para que el usuario especifique la fecha real de completado del paso.
 * Aparece al presionar "Completar Paso".
 */

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateForDisplay, formatDateForInput, getTodayDateString } from '@/lib/utils/date.utils'

import { modalFechaStyles as styles } from './modal-fecha-completado.styles'

interface ModalFechaCompletadoProps {
  isOpen: boolean
  pasoNombre: string
  fechaInicio?: string // Fecha cuando se inició el paso
  fechaNegociacion?: string // Fecha de inicio de la negociación
  ordenPaso?: number // Orden del paso (para saber si es el paso 1)
  fechaCompletadoDependencia?: string // Fecha de completado del paso del que depende
  nombrePasoDependencia?: string // Nombre del paso del que depende
  onConfirm: (fechaString: string) => void // ✅ Cambiar a string para evitar conversión Date
  onCancel: () => void
}

export function ModalFechaCompletado({
  isOpen,
  pasoNombre,
  fechaInicio,
  fechaNegociacion,
  ordenPaso,
  fechaCompletadoDependencia,
  nombrePasoDependencia,
  onConfirm,
  onCancel
}: ModalFechaCompletadoProps) {
  // Fecha por defecto: hoy
  // ⚠️ CRÍTICO: Usar getTodayDateString() en lugar de toISOString().split('T')[0]
  // para evitar problemas de zona horaria (UTC vs local)
  const fechaPorDefecto = getTodayDateString()

  // Fecha mínima CRÍTICA:
  // - Paso 1: fecha_negociacion (inicio de la negociación)
  // - Otros pasos: fecha_completado del paso del que depende (para mantener cronología)
  const calcularFechaMinima = () => {
    // Paso 1: Usar fecha de negociación
    if (ordenPaso === 1 && fechaNegociacion) {
      return formatDateForInput(fechaNegociacion)
    }

    // Otros pasos: Usar fecha de completado del paso del que depende
    if (fechaCompletadoDependencia) {
      return formatDateForInput(fechaCompletadoDependencia)
    }

    // Fallback (no debería llegar aquí en uso normal)
    // ⚠️ Usar getTodayDateString() y restar 30 días manualmente
    const hoy = new Date()
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
    const year = hace30Dias.getFullYear()
    const month = String(hace30Dias.getMonth() + 1).padStart(2, '0')
    const day = String(hace30Dias.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fechaMinima = calcularFechaMinima()

  const [fecha, setFecha] = useState(fechaPorDefecto)
  const [error, setError] = useState<string | null>(null)

  const handleConfirmar = () => {
    // Validar que la fecha no sea futura
    if (fecha > fechaPorDefecto) {
      setError('La fecha no puede ser futura')
      return
    }

    // Validar que no sea anterior a fecha mínima permitida
    if (fecha < fechaMinima) {
      if (ordenPaso === 1) {
        setError('La fecha no puede ser anterior al inicio de la negociación')
      } else if (nombrePasoDependencia) {
        setError(`La fecha debe ser posterior o igual a "${nombrePasoDependencia}"`)
      } else {
        setError('La fecha no puede ser anterior al inicio del paso')
      }
      return
    }

    // ✅ Pasar el STRING directamente (no crear Date object)
    onConfirm(fecha)
  }

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFecha(e.target.value)
    setError(null) // Limpiar error al cambiar fecha
  }

  // No renderizar en el servidor
  if (typeof window === 'undefined') return null

  const modalContent = (
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
                  {ordenPaso === 1 && fechaNegociacion ? (
                    <>
                      <p className={styles.body.info.item}>
                        📌 Inicio de negociación: {formatDateForDisplay(fechaNegociacion)}
                      </p>
                      <p className={styles.body.info.item}>
                        📅 Fecha mínima: {formatDateForDisplay(fechaMinima)}
                      </p>
                    </>
                  ) : fechaCompletadoDependencia && nombrePasoDependencia ? (
                    <>
                      <p className={styles.body.info.item}>
                        ⛓️ Depende de: <strong>{nombrePasoDependencia}</strong>
                      </p>
                      <p className={styles.body.info.item}>
                        ✅ Completado: {formatDateForDisplay(fechaCompletadoDependencia)}
                      </p>
                      <p className={styles.body.info.item}>
                        📅 Fecha mínima permitida: {formatDateForDisplay(fechaMinima)}
                      </p>
                    </>
                  ) : null}
                  <p className={styles.body.info.item}>
                    📅 Fecha máxima: Hoy ({formatDateForDisplay(fechaPorDefecto)})
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

  // Renderizar en portal directamente en el body
  return createPortal(modalContent, document.body)
}
