'use client'

/**
 * 📚 COMPONENTE PRESENTACIONAL: DocumentoVersionesModalVivienda
 *
 * Modal para mostrar historial de versiones de documentos
 * Solo UI - Lógica en useDocumentoVersiones
 * ✅ Usa Portal para renderizar en document.body (z-index garantizado)
 */

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Download, Edit3, Eye, FileText, RotateCcw, Trash2, User, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { useDocumentoVersiones } from '../../hooks/useDocumentoVersiones'

import { DocumentoRenombrarModal } from './documento-renombrar-modal'
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
    cargarVersiones, // ✅ Para refrescar después de renombrar
  } = useDocumentoVersiones({ documentoId, isOpen, onVersionRestaurada })

  // Estado para modal de renombrar
  const [documentoRenombrar, setDocumentoRenombrar] = useState<{ id: string, titulo: string } | null>(null)

  // Helper para formatear nombre de usuario desde email
  const formatearNombreUsuario = (email: string | null) => {
    if (!email) return 'Usuario desconocido'

    // Si es un email, extraer la parte antes del @
    if (email.includes('@')) {
      const nombreParte = email.split('@')[0]
      // Convertir guiones bajos y puntos en espacios, capitalizar
      const nombreFormateado = nombreParte
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
        .join(' ')
      return nombreFormateado
    }

    return email
  }

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
                        {/* Fecha de subida */}
                        <div className={styles.versionCard.metadataRow}>
                          <Calendar className={styles.versionCard.metadataIcon} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Fecha de subida:
                          </span>
                          <span className={styles.versionCard.metadataText}>
                            {new Date(version.fecha_creacion).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            {new Date(version.fecha_creacion).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>

                        {/* Usuario que subió */}
                        <div className={styles.versionCard.metadataRow}>
                          <User className={styles.versionCard.metadataIcon} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Subido por:
                          </span>
                          <span className={styles.versionCard.metadataText}>
                            {version.usuario
                              ? `${version.usuario.nombres} ${version.usuario.apellidos}`
                              : formatearNombreUsuario(version.subido_por)
                            }
                          </span>
                        </div>

                        {/* Nombre del archivo */}
                        <div className={styles.versionCard.metadataRow}>
                          <FileText className={styles.versionCard.metadataIcon} />
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
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Ver - Verde */}
                        <button
                          onClick={() => handleVerDocumento(version)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>

                        {/* Descargar - Azul */}
                        <button
                          onClick={() => handleDescargar(version)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </button>

                        {esActual ? (
                          <>
                            {/* Renombrar - Naranja (solo versión actual) */}
                            <button
                              onClick={() => setDocumentoRenombrar({ id: documentoId, titulo: version.titulo || 'Sin título' })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white transition-colors shadow-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Renombrar
                            </button>

                            {/* Eliminar - Rojo */}
                            <button
                              onClick={() => handleEliminar(version.id, version.version)}
                              disabled={eliminando === version.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {eliminando === version.id ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Eliminando...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Eliminar
                                </>
                              )}
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Restaurar - Naranja (versiones antiguas) */}
                            <button
                              onClick={() => solicitarRestauracion(version.id, version.version)}
                              disabled={restaurando === version.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {restaurando === version.id ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Restaurando...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Restaurar
                                </>
                              )}
                            </button>

                            {/* Eliminar - Rojo (versiones antiguas) */}
                            <button
                              onClick={() => handleEliminar(version.id, version.version)}
                              disabled={eliminando === version.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {eliminando === version.id ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Eliminando...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal de renombrar */}
      {documentoRenombrar && (
        <DocumentoRenombrarModal
          isOpen={!!documentoRenombrar}
          documentoId={documentoRenombrar.id}
          tituloActual={documentoRenombrar.titulo}
          onClose={() => setDocumentoRenombrar(null)}
          onSuccess={() => {
            setDocumentoRenombrar(null)
            // Recargar versiones para ver el título actualizado
            cargarVersiones()
          }}
        />
      )}
    </AnimatePresence>
  )

  // ✅ Renderizar en Portal para garantizar z-index sobre todo (incluyendo sidebar)
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
