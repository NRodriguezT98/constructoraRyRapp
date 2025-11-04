/**
 * 🎬 COMPONENTE: ACCIONES PASO
 *
 * Renderiza los botones de acción según el estado del paso:
 * - Pendiente/En Proceso: Botón "Omitir Paso" (si permite omitir)
 * - En Proceso: Botones "Completar" y "Descartar Cambios"
 * - Completado (solo Admin): Botones "Corregir Fecha" y "Corregir Documento"
 *
 * NOTA: El botón "Iniciar Paso" fue eliminado porque ahora los pasos
 * se inician automáticamente al adjuntar el primer documento.
 */

'use client'

import { AlertCircle, Calendar, CheckCircle2, FileEdit, Trash2, X } from 'lucide-react'
import { timelineProcesoStyles as styles } from './timeline-proceso.styles'

interface AccionesPasoProps {
  isPendiente: boolean
  isEnProceso: boolean
  isCompletado?: boolean
  puedeCompletar: boolean
  permiteOmitir: boolean
  deshabilitado: boolean
  esAdministrador?: boolean
  onCompletar: () => void
  onDescartar: () => void
  onOmitir: () => void
  onCorregirFecha?: () => void
  onCorregirDocumento?: () => void
}

export function AccionesPaso({
  isPendiente,
  isEnProceso,
  isCompletado = false,
  puedeCompletar,
  permiteOmitir,
  deshabilitado,
  esAdministrador = false,
  onCompletar,
  onDescartar,
  onOmitir,
  onCorregirFecha,
  onCorregirDocumento
}: AccionesPasoProps) {
  return (
    <div className={styles.expanded.acciones.container}>
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

      {/* Botones de Corrección (solo Admin en pasos COMPLETADOS) */}
      {isCompletado && esAdministrador && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCorregirFecha?.()
            }}
            disabled={deshabilitado}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg transition-colors border border-amber-500/20"
          >
            <Calendar className="w-4 h-4" />
            Corregir Fecha
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onCorregirDocumento?.()
            }}
            disabled={deshabilitado}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg transition-colors border border-blue-500/20"
          >
            <FileEdit className="w-4 h-4" />
            Corregir Documento
          </button>
        </>
      )}

      {/* Botón Omitir (solo si permite omitir y está Pendiente o En Proceso) */}
      {permiteOmitir && (isPendiente || isEnProceso) && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOmitir()
          }}
          disabled={deshabilitado}
          className={styles.expanded.acciones.buttonOmitir}
        >
          <X className="w-4 h-4" />
          Omitir Paso
        </button>
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
