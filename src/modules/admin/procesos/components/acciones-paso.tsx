/**
 * 🎬 COMPONENTE: ACCIONES PASO
 *
 * Renderiza los botones de acción según el estado del paso:
 * - Pendiente: Botón "Iniciar Paso"
 * - En Proceso: Botones "Completar" y "Descartar Cambios"
 */

'use client'

import { AlertCircle, CheckCircle2, Play, Trash2 } from 'lucide-react'
import { timelineProcesoStyles as styles } from './timeline-proceso.styles'

interface AccionesPasoProps {
  isPendiente: boolean
  isEnProceso: boolean
  puedeIniciar: boolean
  puedeCompletar: boolean
  deshabilitado: boolean
  onIniciar: () => void
  onCompletar: () => void
  onDescartar: () => void
}

export function AccionesPaso({
  isPendiente,
  isEnProceso,
  puedeIniciar,
  puedeCompletar,
  deshabilitado,
  onIniciar,
  onCompletar,
  onDescartar
}: AccionesPasoProps) {
  return (
    <div className={styles.expanded.acciones.container}>
      {/* Botón Iniciar Paso (solo si está Pendiente y puede iniciarse) */}
      {isPendiente && puedeIniciar && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onIniciar()
          }}
          disabled={deshabilitado}
          className={styles.expanded.acciones.buttonIniciar}
        >
          <Play className="w-4 h-4" />
          Iniciar Paso
        </button>
      )}

      {/* Botones en proceso (Completar y Descartar) */}
      {isEnProceso && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCompletar()
            }}
            disabled={deshabilitado || !puedeCompletar}
            className={styles.expanded.acciones.buttonCompletar}
          >
            <CheckCircle2 className="w-4 h-4" />
            Completar Paso
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDescartar()
            }}
            disabled={deshabilitado}
            className={styles.expanded.acciones.buttonDescartar}
          >
            <Trash2 className="w-4 h-4" />
            Descartar Cambios
          </button>
        </>
      )}

      {/* Mensaje de ayuda */}
      {isEnProceso && !puedeCompletar && (
        <div className={styles.expanded.acciones.helpText}>
          <AlertCircle className="w-3.5 h-3.5" />
          Completa los documentos obligatorios para continuar
        </div>
      )}
    </div>
  )
}
