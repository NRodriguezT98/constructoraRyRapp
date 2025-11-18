/**
 * ConfirmarCambiosModal - Componente presentacional puro
 *
 * ✅ Componente presentacional (< 150 líneas)
 * ✅ Separación de responsabilidades ESTRICTA
 * ✅ Lógica en hook, estilos centralizados, UI pura
 */

'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Building2, CheckCircle2, Home, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'

import { useConfirmarCambiosModal } from '../hooks/useConfirmarCambiosModal'
import type { ResumenCambios } from '../hooks/useDetectarCambios'

import { confirmarCambiosStyles as styles } from './confirmar-cambios-modal.styles'

interface ConfirmarCambiosModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cambios: ResumenCambios
  isLoading?: boolean
}

export function ConfirmarCambiosModal({
  isOpen,
  onClose,
  onConfirm,
  cambios,
  isLoading = false,
}: ConfirmarCambiosModalProps) {
  // Hook con lógica de negocio
  const {
    tieneCambiosProyecto,
    tieneCambiosManzanas,
    getManzanaContainerClass,
    getManzanaBadgeClass,
    getManzanaIconClass,
    getConfirmButtonText,
  } = useConfirmarCambiosModal({ cambios, isLoading })

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.overlay}>
      {/* Overlay */}
      <motion.div
        {...styles.animations.overlay}
        className={styles.overlayBg}
        onClick={(e) => {
          if (!isLoading) {
            onClose()
          }
        }}
      />

      {/* Modal */}
      <motion.div
        {...styles.animations.modal}
        className={styles.modal}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {/* Header */}
        <div className={styles.header.container}>
          <div className={styles.header.pattern} />
          <div className={styles.header.content}>
            <div className={styles.header.left}>
              <div className={styles.header.icon}>
                <AlertTriangle className={styles.header.iconSvg} />
              </div>
              <div className={styles.header.textContainer}>
                <h3 className={styles.header.title}>Confirmar Cambios</h3>
                <p className={styles.header.subtitle}>
                  Revisa los cambios antes de guardar
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className={styles.header.closeButton}
            >
              <X className={styles.header.closeIcon} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body.container}>
          {/* Resumen */}
          <div className={styles.body.resumen.container}>
            <CheckCircle2 className={styles.body.resumen.icon} />
            <p className={styles.body.resumen.text}>
              Se detectaron <strong className={styles.body.resumen.strong}>{cambios.totalCambios}</strong> cambio(s) en total
            </p>
          </div>

          {/* Cambios en el Proyecto */}
          {tieneCambiosProyecto && (
            <div className={styles.body.section.container}>
              <h4 className={styles.body.section.header}>
                <Building2 className={styles.body.section.headerIcon} />
                Cambios en el Proyecto ({cambios.proyecto.length})
              </h4>
              <div className={styles.body.section.list}>
                {cambios.proyecto.map((cambio, index) => (
                  <div key={index} className={styles.cards.proyecto.container}>
                    <div className={styles.cards.proyecto.header}>
                      <Pencil className={styles.cards.proyecto.headerIcon} />
                      <span className={styles.cards.proyecto.label}>{cambio.label}</span>
                    </div>
                    <div className={styles.cards.proyecto.grid}>
                      <div className={styles.cards.proyecto.anterior.container}>
                        <span className={styles.cards.proyecto.anterior.label}>Anterior</span>
                        <p className={styles.cards.proyecto.anterior.value}>{cambio.valorAnterior}</p>
                      </div>
                      <div className={styles.cards.proyecto.nuevo.container}>
                        <span className={styles.cards.proyecto.nuevo.label}>Nuevo</span>
                        <p className={styles.cards.proyecto.nuevo.value}>{cambio.valorNuevo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cambios en Manzanas */}
          {tieneCambiosManzanas && (
            <div className={styles.body.section.container}>
              <h4 className={styles.body.section.header}>
                <Home className={styles.body.section.headerIcon} />
                Cambios en Manzanas ({cambios.manzanas.length})
              </h4>
              <div className={styles.body.section.list}>
                {cambios.manzanas.map((cambio, index) => {
                  const containerClass = styles.cards.manzana[getManzanaContainerClass(cambio.tipo)]
                  const badgeClass = styles.cards.manzana[getManzanaBadgeClass(cambio.tipo)]
                  const iconClass = styles.cards.manzana[getManzanaIconClass(cambio.tipo)]

                  return (
                    <div key={index} className={containerClass}>
                      <div className={styles.cards.manzana.header}>
                        {cambio.tipo === 'agregada' && <Plus className={iconClass} />}
                        {cambio.tipo === 'eliminada' && <Trash2 className={iconClass} />}
                        {cambio.tipo === 'modificada' && <Pencil className={iconClass} />}
                        <span className={styles.cards.manzana.nombre}>
                          Manzana <strong>{cambio.nombre}</strong>
                        </span>
                        <span className={badgeClass}>{cambio.tipo}</span>
                      </div>

                      {cambio.cambios && (
                        <div className={styles.cards.manzana.detalles.container}>
                          {cambio.cambios.nombreAnterior && cambio.cambios.nombreNuevo && (
                            <p className={styles.cards.manzana.detalles.text}>
                              <span className={styles.cards.manzana.detalles.label}>Nombre:</span>{' '}
                              <span className={styles.cards.manzana.detalles.valorAnterior}>
                                {cambio.cambios.nombreAnterior}
                              </span>
                              {styles.cards.manzana.detalles.separador}
                              <strong className={styles.cards.manzana.detalles.valorNuevo}>
                                {cambio.cambios.nombreNuevo}
                              </strong>
                            </p>
                          )}
                          {cambio.cambios.viviendasAnterior !== undefined &&
                           cambio.cambios.viviendasNuevo !== undefined && (
                            <p className={styles.cards.manzana.detalles.text}>
                              <span className={styles.cards.manzana.detalles.label}>Viviendas:</span>{' '}
                              <span className={styles.cards.manzana.detalles.valorAnterior}>
                                {cambio.cambios.viviendasAnterior}
                              </span>
                              {styles.cards.manzana.detalles.separador}
                              <strong className={styles.cards.manzana.detalles.valorNuevo}>
                                {cambio.cambios.viviendasNuevo}
                              </strong>
                            </p>
                          )}
                          {cambio.tipo === 'agregada' &&
                           cambio.cambios.viviendasNuevo !== undefined && (
                            <p className={styles.cards.manzana.detalles.text}>
                              <span className={styles.cards.manzana.detalles.label}>Viviendas:</span>{' '}
                              <strong className={styles.cards.manzana.detalles.valorNuevo}>
                                {cambio.cambios.viviendasNuevo}
                              </strong>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer.container}>
          <div className={styles.footer.buttonsContainer}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={styles.footer.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`${styles.footer.confirmButton} ${isLoading ? 'opacity-90 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Guardando cambios...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar y Guardar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
