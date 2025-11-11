'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
  Shield,
  Upload,
  X
} from 'lucide-react'

import { useReemplazarArchivoForm } from '../../hooks'
import type { DocumentoProyecto } from '../../types'
import { reemplazarArchivoModalStyles as styles } from './DocumentoReemplazarArchivoModal.styles'

interface DocumentoReemplazarArchivoModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  onClose: () => void
  onReemplazado?: () => void | Promise<void>
}

export function DocumentoReemplazarArchivoModal({
  isOpen,
  documento,
  onClose,
  onReemplazado
}: DocumentoReemplazarArchivoModalProps) {
  const {
    nuevoArchivo,
    justificacion,
    password,
    dragActive,
    reemplazando,
    progreso,
    isSubmitDisabled,
    setJustificacion,
    setPassword,
    handleDrag,
    handleDrop,
    handleFileChange,
    removeFile,
    handleSubmit,
    handleClose
  } = useReemplazarArchivoForm({
    onSuccess: onReemplazado,
    onClose
  })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="modal-reemplazar-archivo" className={styles.backdrop}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className={styles.backdropOverlay}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modal}
          >
            {/* Header con advertencia */}
            <div className={styles.header.container}>
              <div className={styles.header.content}>
                <div className={styles.header.leftSection}>
                  <div className={styles.header.icon}>
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className={styles.header.title}>
                      Reemplazar Archivo
                      <span className={styles.header.badge}>Admin</span>
                    </h2>
                    <p className={styles.header.subtitle}>
                      Validación de seguridad requerida
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={reemplazando}
                  className={styles.header.closeButton}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Advertencia */}
            <div className={styles.warning.container}>
              <div className={styles.warning.content}>
                <AlertTriangle size={16} className={styles.warning.icon} />
                <div className="flex-1">
                  <h3 className={styles.warning.title}>⚠️ Advertencia Importante</h3>
                  <ul className={styles.warning.list}>
                    <li>• Archivo actual será <strong>eliminado permanentemente</strong></li>
                    <li>• <strong>No se creará nueva versión</strong> (sin versionado)</li>
                    <li>• Acción <strong>registrada en auditoría</strong></li>
                    <li>• Solo para corrección de errores administrativos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form
              onSubmit={(e) =>
                handleSubmit(e, {
                  id: documento.id,
                  nombre_archivo: documento.nombre_archivo,
                  url_storage: documento.url_storage,
                  tamano_bytes: documento.tamano_bytes,
                  version: documento.version
                })
              }
              className={styles.form.container}
            >
              {/* Archivo actual */}
              <div className={styles.currentFile.container}>
                <div className={styles.currentFile.label}>
                  <FileText size={14} />
                  Archivo actual (v{documento.version}):
                </div>
                <p className={styles.currentFile.filename}>
                  {documento.titulo}.pdf
                </p>
                <p className={styles.currentFile.size}>
                  {(documento.tamano_bytes / 1024).toFixed(2)} KB
                </p>
              </div>

              {/* Subir nuevo archivo */}
              <div>
                <label className={styles.form.label}>
                  <Upload size={14} />
                  Nuevo archivo *
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`${styles.dragDrop.containerBase} ${
                    dragActive
                      ? styles.dragDrop.containerActive
                      : styles.dragDrop.containerInactive
                  } ${reemplazando ? styles.dragDrop.containerDisabled : ''}`}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={reemplazando}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    className={styles.dragDrop.input}
                  />

                  <div className={styles.dragDrop.content}>
                    <div className={styles.dragDrop.iconWrapper}>
                      <Upload size={18} className={styles.dragDrop.icon} />
                    </div>

                    {nuevoArchivo ? (
                      <>
                        <p className={styles.dragDrop.filename}>{nuevoArchivo.name}</p>
                        <p className={styles.dragDrop.fileSize}>
                          {(nuevoArchivo.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                          type="button"
                          onClick={removeFile}
                          disabled={reemplazando}
                          className={styles.dragDrop.changeButton}
                        >
                          Cambiar archivo
                        </button>
                      </>
                    ) : (
                      <>
                        <p className={styles.dragDrop.emptyTitle}>
                          Arrastra un archivo o haz clic
                        </p>
                        <p className={styles.dragDrop.emptySubtitle}>
                          PDF, JPG, PNG, DOC, XLS (máx. 50MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Justificación */}
              <div>
                <label className={styles.form.label}>
                  <FileText size={14} />
                  Justificación *
                </label>
                <textarea
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  required
                  minLength={10}
                  disabled={reemplazando}
                  rows={3}
                  className={styles.form.textarea}
                  placeholder="Explica por qué estás reemplazando este archivo (mínimo 10 caracteres)..."
                />
                <p className={styles.form.helperText}>
                  {justificacion.length}/10 caracteres mínimos
                </p>
              </div>

              {/* Contraseña de confirmación */}
              <div className="max-w-md">
                <label className={styles.form.label}>
                  <Lock size={14} />
                  Confirma tu contraseña *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={reemplazando}
                  className={styles.form.input}
                  placeholder="Tu contraseña de admin"
                />
                <p className={styles.form.helperText}>
                  Confirma tu identidad para proceder
                </p>
              </div>

              {/* Barra de progreso */}
              {reemplazando && progreso > 0 && (
                <div className={styles.progress.container}>
                  <div className={styles.progress.header}>
                    <span className={styles.progress.label}>Progreso</span>
                    <span className={styles.progress.percentage}>{progreso}%</span>
                  </div>
                  <div className={styles.progress.bar}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progreso}%` }}
                      transition={{ duration: 0.3 }}
                      className={styles.progress.fill}
                    />
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className={styles.buttons.container}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={reemplazando}
                  className={styles.buttons.cancel}
                >
                  Cancelar
                </button>

                {/* Wrapper para tooltip */}
                <div className={styles.buttons.tooltipWrapper}>
                  <button type="submit" disabled={isSubmitDisabled} className={styles.buttons.submit}>
                    {reemplazando ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Reemplazando...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        Confirmar Reemplazo
                      </>
                    )}
                  </button>

                  {/* Tooltip informativo */}
                  {!reemplazando &&
                    (!nuevoArchivo || justificacion.length < 10 || !password) && (
                      <div className={styles.tooltip.container}>
                        {!nuevoArchivo && <div>• Debes seleccionar un archivo nuevo</div>}
                        {nuevoArchivo && justificacion.length < 10 && (
                          <div>
                            • Justificación debe tener mínimo 10 caracteres (
                            {justificacion.length}/10)
                          </div>
                        )}
                        {nuevoArchivo && justificacion.length >= 10 && !password && (
                          <div>• Debes confirmar tu contraseña</div>
                        )}
                        <div className={styles.tooltip.arrow}></div>
                      </div>
                    )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
