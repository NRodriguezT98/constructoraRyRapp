'use client'

/**
 * ============================================
 * MODAL: Editar Fuentes de Pago (REFACTORIZADO)
 * ============================================
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * - Sin lógica de negocio (delegada a hook)
 * - Sin estado complejo (solo UI)
 * - Estilos centralizados
 * - Colores CYAN/AZUL (módulo clientes)
 *
 * 🆕 SISTEMA DE DOCUMENTOS PENDIENTES:
 * - Permite agregar fuentes sin carta de aprobación
 * - Sistema crea automáticamente "documento pendiente"
 * - Banner en pestaña Documentos alerta al usuario
 * - Vinculación automática al subir documento
 *
 * @version 2.1.0 - 2025-11-29 (Integración sistema de documentos pendientes)
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, DollarSign, FileText, Plus, Trash2, X } from 'lucide-react'

import { editarFuentesStyles as styles } from './EditarFuentesPagoModal.styles'
import { TIPOS_FUENTE, obtenerEntidadesPorTipo, requiereEntidad, useEditarFuentesPagoModal } from './hooks/useEditarFuentesPagoModal'

// ============================================
// TYPES
// ============================================

export interface FuentePagoEditable {
  id?: string
  tipo: string
  monto: number
  monto_recibido: number
  entidad?: string
  numero_referencia?: string
  detalles?: string
  esNueva?: boolean
}

interface EditarFuentesPagoModalProps {
  isOpen: boolean
  onClose: () => void
  fuentesActuales: FuentePagoEditable[]
  valorFinal: number
  onGuardar: (fuentes: FuentePagoEditable[]) => Promise<void>
}

// ============================================
// COMPONENTE
// ============================================

export function EditarFuentesPagoModal(props: EditarFuentesPagoModalProps) {
  const {
    fuentes,
    isSubmitting,
    totalFuentes,
    diferencia,
    esValido,
    erroresPorFuente,
    handleAgregarFuente,
    handleEliminarFuente,
    handleCambiarCampo,
    handleGuardar,
    handleCancelar,
  } = useEditarFuentesPagoModal(props)

  if (!props.isOpen) return null

  const esDiferenciaValida = Math.abs(diferencia) < 0.01

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancelar}
          className={styles.backdrop}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={styles.modal}
        >
          {/* Header */}
          <div className={styles.header.container}>
            <div className="flex items-center gap-3">
              <div className={styles.header.iconWrapper}>
                <DollarSign className={styles.header.icon} />
              </div>
              <div>
                <h2 className={styles.header.title}>Editar Fuentes de Pago</h2>
                <p className={styles.header.subtitle}>Ajusta los montos y tipos de financiamiento</p>
              </div>
            </div>
            <button onClick={handleCancelar} className={styles.header.closeButton}>
              <X className={styles.header.icon} />
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Validation Summary */}
            <div className={esDiferenciaValida ? styles.validationSummary.containerValid : styles.validationSummary.containerInvalid}>
              <div className={styles.validationSummary.grid}>
                <div>
                  <p className={styles.validationSummary.label}>Valor Final Negociación:</p>
                  <p className={styles.validationSummary.valorFinal}>
                    ${props.valorFinal.toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={styles.validationSummary.label}>Total Fuentes:</p>
                  <p className={esDiferenciaValida ? styles.validationSummary.totalValid : styles.validationSummary.totalInvalid}>
                    ${totalFuentes.toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={styles.validationSummary.label}>Diferencia:</p>
                  <p className={esDiferenciaValida ? styles.validationSummary.diferenciaValid : styles.validationSummary.diferenciaInvalid}>
                    {esDiferenciaValida ? (
                      <CheckCircle2 className={styles.validationSummary.icon} />
                    ) : (
                      <AlertCircle className={styles.validationSummary.icon} />
                    )}
                    ${Math.abs(diferencia).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </div>

            {/* Fuentes List */}
            <div className={styles.fuentesList}>
              {fuentes.map((fuente, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.fuenteRow.container}
                >
                  <div className={styles.fuenteRow.grid}>
                    {/* Tipo */}
                    <div className={styles.fuenteRow.colTipo}>
                      <label className={styles.fuenteRow.label}>Tipo de Fuente *</label>
                      <select
                        value={fuente.tipo}
                        onChange={(e) => handleCambiarCampo(index, 'tipo', e.target.value)}
                        disabled={fuentes.length >= TIPOS_FUENTE.length}
                        className={styles.fuenteRow.select}
                      >
                        <option value={fuente.tipo}>{fuente.tipo}</option>
                        {TIPOS_FUENTE.filter(tipo => {
                          if (tipo === fuente.tipo) return false
                          return !fuentes.some((f, i) => i !== index && f.tipo === tipo)
                        }).map((tipo) => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>

                    {/* Monto */}
                    <div className={styles.fuenteRow.colMonto}>
                      <label className={styles.fuenteRow.label}>
                        Monto Configurado * {fuente.monto_recibido > 0 && (
                          <span className={styles.fuenteRow.montoRecibidoLabel}>
                            (≥ ${fuente.monto_recibido.toLocaleString('es-CO')})
                          </span>
                        )}
                      </label>
                      <div className={styles.fuenteRow.montoWrapper}>
                        <span className={styles.fuenteRow.montoSymbol}>$</span>
                        <input
                          type="text"
                          value={(fuente.monto || 0).toLocaleString('es-CO')}
                          onChange={(e) => {
                            const valor = e.target.value.replace(/[^0-9]/g, '')
                            handleCambiarCampo(index, 'monto', Number(valor))
                          }}
                          placeholder="0"
                          className={styles.fuenteRow.montoInput}
                        />
                      </div>
                    </div>

                    {/* Entidad */}
                    <div className={styles.fuenteRow.colEntidad}>
                      <label className={styles.fuenteRow.label}>
                        Entidad {requiereEntidad(fuente.tipo) && '*'}
                      </label>
                      {requiereEntidad(fuente.tipo) ? (
                        <select
                          value={fuente.entidad || ''}
                          onChange={(e) => handleCambiarCampo(index, 'entidad', e.target.value)}
                          className={styles.fuenteRow.select}
                        >
                          <option value="">Seleccionar...</option>
                          {obtenerEntidadesPorTipo(fuente.tipo).map((entidad) => (
                            <option key={entidad} value={entidad}>{entidad}</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value="N/A" disabled className={styles.fuenteRow.inputDisabled} />
                      )}
                    </div>

                    {/* Delete Button */}
                    <div className={styles.fuenteRow.colDelete}>
                      <button
                        onClick={() => handleEliminarFuente(index)}
                        disabled={fuente.monto_recibido > 0}
                        className={fuente.monto_recibido > 0 ? styles.fuenteRow.deleteButtonDisabled : styles.fuenteRow.deleteButtonEnabled}
                        title={fuente.monto_recibido > 0 ? 'No se puede eliminar (tiene abonos)' : 'Eliminar fuente'}
                      >
                        <Trash2 className={styles.fuenteRow.deleteIcon} />
                      </button>
                    </div>
                  </div>

                  {/* Errors */}
                  {erroresPorFuente[index].length > 0 && (
                    <div className={styles.fuenteRow.errorsContainer}>
                      <ul className={styles.fuenteRow.errorsList}>
                        {erroresPorFuente[index].map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Add Button */}
            {fuentes.length < TIPOS_FUENTE.length && (
              <button onClick={handleAgregarFuente} className={styles.addButton}>
                <Plus className={styles.addIcon} />
                Agregar Nueva Fuente
              </button>
            )}

            {/* Info: Documentos pendientes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30 p-3"
            >
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 text-xs text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">💡 Sobre las cartas de aprobación</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Puedes guardar fuentes de pago sin la carta de aprobación.
                    El sistema creará un recordatorio en la <strong>pestaña Documentos</strong> donde podrás subirla más tarde.
                    La vinculación será automática al subir el documento.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className={styles.footer.container}>
            <div>
              {!esValido && (
                <p className={styles.footer.warningContainer}>
                  <AlertCircle className={styles.footer.warningIcon} />
                  {!esDiferenciaValida
                    ? `Ajusta los montos para igualar el valor final (diferencia: $${Math.abs(diferencia).toLocaleString('es-CO')})`
                    : 'Corrige los errores antes de guardar'}
                </p>
              )}
            </div>
            <div className={styles.footer.buttonsContainer}>
              <button
                onClick={handleCancelar}
                disabled={isSubmitting}
                className={styles.footer.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={!esValido || isSubmitting}
                className={esValido && !isSubmitting ? styles.footer.saveButtonEnabled : styles.footer.saveButtonDisabled}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
