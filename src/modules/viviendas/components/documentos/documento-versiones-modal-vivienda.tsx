'use client'

/**
 * 📚 COMPONENTE PRESENTACIONAL: DocumentoVersionesModalVivienda
 *
 * Modal para mostrar historial de versiones de documentos
 * Solo UI - Lógica en useDocumentoVersiones
 * ✅ Usa Portal para renderizar en document.body (z-index garantizado)
 */

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Download, Eye, FileText, RotateCcw, Trash2, User, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useDocumentoVersiones } from '../../hooks/useDocumentoVersiones'
import { documentoVersionesModalStyles as styles } from './documento-versiones-modal.styles'

interface DocumentoVersionesModalViviendaProps {
  isOpen: boolean
  documentoId: string
  onClose: () => void
  onVersionRestaurada?: () => void
}

export function DocumentoVersionesModalVivienda({
  isOpen,
  documentoId,
  onClose,
  onVersionRestaurada
}: DocumentoVersionesModalViviendaProps) {
  const {
    versiones,
    cargando,
    restaurando,
    eliminando,
    mostrarModalMotivo,
    versionARestaurar,
    motivoRestauracion,
    setMotivoRestauracion,
    handleVerDocumento,
    handleDescargar,
    solicitarRestauracion,
    cancelarRestauracion,
    handleRestaurar,
    handleEliminar,
  } = useDocumentoVersiones({ documentoId, isOpen, onVersionRestaurada })

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <div className={styles.overlay}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={styles.container}
        >
          {/* Header */}
          <div className={styles.header.container}>
            <div className={styles.header.content}>
              <div>
                <h2 className={styles.header.title}>
                  <FileText className="w-6 h-6" />
                  Historial de Versiones
                </h2>
                <p className={styles.header.subtitle}>
                  {versiones.length} versiones encontradas
                </p>
              </div>
              <button onClick={onClose} className={styles.header.closeButton}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content.container}>
            {cargando ? (
              <div className={styles.content.loading}>
                <div className={styles.content.loadingIcon} />
              </div>
            ) : versiones.length === 0 ? (
              <div className={styles.content.empty}>
                <FileText className={styles.content.emptyIcon} />
                <p className={styles.content.emptyText}>No hay versiones disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versiones.map((version) => {
                  const esActual = version.es_version_actual
                  const esOriginal = version.version === 1
                  const cambios = version.metadata && typeof version.metadata === 'object'
                    ? (version.metadata as any).cambios
                    : null

                  return (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.versionCard.container}
                    >
                      {/* Header con badges */}
                      <div className={styles.versionCard.header}>
                        <div className={styles.versionCard.badges}>
                          <span className={styles.versionCard.versionBadge}>
                            Versión {version.version}
                          </span>
                          {esActual && (
                            <span className={styles.versionCard.actualBadge}>✓ Actual</span>
                          )}
                          {esOriginal && (
                            <span className={styles.versionCard.originalBadge}>⭐ Original</span>
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className={styles.versionCard.metadata}>
                        <div className={styles.versionCard.metadataRow}>
                          <Calendar className={styles.versionCard.metadataIcon} />
                          <span className={styles.versionCard.metadataText}>
                            {new Date(version.fecha_creacion).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <div className={styles.versionCard.metadataRow}>
                          <User className={styles.versionCard.metadataIcon} />
                          <span className={styles.versionCard.metadataText}>
                            {version.nombre_original}
                          </span>
                        </div>
                      </div>

                      {/* Descripción/Cambios */}
                      {(cambios || version.descripcion) && (
                        <div className={styles.versionCard.description}>
                          <p className={styles.versionCard.descriptionText}>
                            {cambios || version.descripcion}
                          </p>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className={styles.versionCard.actions}>
                        <button onClick={() => handleVerDocumento(version)} className={styles.buttons.ver}>
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <button onClick={() => handleDescargar(version)} className={styles.buttons.descargar}>
                          <Download className="w-4 h-4" />
                          Descargar
                        </button>
                        {!esActual && (
                          <>
                            <button
                              onClick={() => solicitarRestauracion(version.id, version.version)}
                              disabled={restaurando === version.id}
                              className={styles.buttons.restaurar}
                            >
                              {restaurando === version.id ? (
                                <>
                                  <div className={styles.buttons.spinner} />
                                  Restaurando...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-4 h-4" />
                                  Restaurar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleEliminar(version.id, version.version)}
                              disabled={eliminando === version.id}
                              className={styles.buttons.eliminar}
                            >
                              {eliminando === version.id ? (
                                <>
                                  <div className={styles.buttons.spinner} />
                                  Eliminando...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal de confirmación con motivo */}
      {mostrarModalMotivo && versionARestaurar && (
        <div className={styles.modalMotivo.overlay}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.modalMotivo.container}
          >
            <h3 className={styles.modalMotivo.title}>
              <RotateCcw className="w-5 h-5 text-orange-600" />
              Restaurar Versión {versionARestaurar.numero}
            </h3>

            <p className={styles.modalMotivo.description}>
              Se creará una nueva versión con el contenido de la versión {versionARestaurar.numero}.
              Por favor, proporciona el motivo de esta restauración para auditoría.
            </p>

            <div className="mb-6">
              <label htmlFor="motivo-restauracion" className={styles.modalMotivo.label}>
                Motivo de restauración *
              </label>
              <textarea
                id="motivo-restauracion"
                value={motivoRestauracion}
                onChange={(e) => setMotivoRestauracion(e.target.value)}
                placeholder="Ej: Versión actual contiene información incorrecta"
                rows={3}
                className={styles.modalMotivo.textarea}
                autoFocus
              />
              <p className={styles.modalMotivo.hint}>
                Este motivo quedará registrado en el historial para auditoría
              </p>
            </div>

            <div className={styles.modalMotivo.buttonsContainer}>
              <button
                onClick={cancelarRestauracion}
                disabled={restaurando !== null}
                className={styles.modalMotivo.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRestaurar(versionARestaurar.id)}
                disabled={!motivoRestauracion.trim() || restaurando !== null}
                className={styles.modalMotivo.confirmButton}
              >
                {restaurando ? (
                  <div className={styles.modalMotivo.confirmButtonContent}>
                    <div className={styles.buttons.spinner} />
                    Restaurando...
                  </div>
                ) : (
                  'Confirmar Restauración'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  // ✅ Renderizar en Portal para garantizar z-index sobre todo (incluyendo sidebar)
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
