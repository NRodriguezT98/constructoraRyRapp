/**
 * 📄 COMPONENTE: DOCUMENTO ITEM
 *
 * Renderiza un documento individual con opciones de descarga,
 * subida y eliminación según el estado del paso.
 */

'use client'

import { Download, FileText, Loader2, Trash2, Upload } from 'lucide-react'
import type { DocumentoRequerido } from '../types'
import { timelineProcesoStyles as styles } from './timeline-proceso.styles'

interface DocumentoItemProps {
  documento: DocumentoRequerido
  urlSubido?: string
  isEnProceso: boolean
  isCompletado: boolean
  deshabilitado: boolean
  subiendoDoc: string | null
  onAdjuntar: (file: File) => void
  onEliminar: () => void
}

export function DocumentoItem({
  documento,
  urlSubido,
  isEnProceso,
  isCompletado,
  deshabilitado,
  subiendoDoc,
  onAdjuntar,
  onEliminar
}: DocumentoItemProps) {
  const estaSubiendo = subiendoDoc === documento.id
  const mostrarAcciones = isEnProceso || isCompletado

  return (
    <div className={styles.expanded.documento.container}>
      <div className={styles.expanded.documento.left}>
        <FileText className={styles.expanded.documento.icon} />
        <div className={styles.expanded.documento.content}>
          <div className={styles.expanded.documento.nombre}>
            {documento.nombre}
            {documento.obligatorio && (
              <span className={styles.expanded.documento.obligatorioMark}>*</span>
            )}
          </div>
          {documento.descripcion && (
            <div className={styles.expanded.documento.descripcion}>
              {documento.descripcion}
            </div>
          )}
        </div>
      </div>

      <div className={styles.expanded.documento.actions}>
        {urlSubido ? (
          <>
            {/* Botón Descargar */}
            <a
              href={urlSubido}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.expanded.documento.downloadButton}
              title="Descargar documento"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Botón Eliminar (solo si está en proceso) */}
            {isEnProceso && (
              <button
                onClick={onEliminar}
                disabled={deshabilitado}
                className={styles.expanded.documento.deleteButton}
                title="Eliminar documento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          mostrarAcciones && (
            <div className="relative">
              <input
                type="file"
                id={`upload-${documento.id}`}
                className={styles.expanded.documento.uploadInput}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    onAdjuntar(file)
                    e.target.value = ''
                  }
                }}
                disabled={estaSubiendo || !isEnProceso}
              />
              <label
                htmlFor={`upload-${documento.id}`}
                className={
                  estaSubiendo
                    ? `${styles.expanded.documento.uploadLabel.base} ${styles.expanded.documento.uploadLabel.uploading}`
                    : !isEnProceso
                      ? `${styles.expanded.documento.uploadLabel.base} ${styles.expanded.documento.uploadLabel.disabled}`
                      : `${styles.expanded.documento.uploadLabel.base} ${styles.expanded.documento.uploadLabel.active}`
                }
                title={isEnProceso ? 'Adjuntar documento' : 'Inicia el paso para adjuntar'}
              >
                {estaSubiendo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </label>
            </div>
          )
        )}
      </div>
    </div>
  )
}
