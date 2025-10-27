/**
 * 📝 COMPONENTE: PASO PLANTILLA ITEM
 *
 * Item de paso en el formulario de plantilla.
 * Formulario expandible con nombre, descripción, documentos, condiciones y dependencias.
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    GripVertical,
    Plus,
    Trash2
} from 'lucide-react'
import { TipoFuentePago, type PasoPlantilla } from '../types'
import { formularioPlantillaStyles as styles } from './formulario-plantilla.styles'

interface PasoPlantillaItemProps {
  paso: PasoPlantilla
  index: number
  isExpanded: boolean
  onToggle: () => void
  onUpdate: (cambios: Partial<PasoPlantilla>) => void
  onDelete: () => void
  onAgregarDocumento: () => void
  onEliminarDocumento: (docId: string) => void
  onActualizarDocumento: (docId: string, cambios: any) => void
  pasosDisponibles: PasoPlantilla[]
}

export function PasoPlantillaItem({
  paso,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAgregarDocumento,
  onEliminarDocumento,
  onActualizarDocumento,
  pasosDisponibles
}: PasoPlantillaItemProps) {
  const hasErrors = !paso.nombre.trim()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={styles.pasoItem.container(hasErrors)}
    >
      {/* Header del paso */}
      <div onClick={onToggle} className={styles.pasoItem.header.container}>
        <GripVertical className={styles.pasoItem.header.gripIcon} />

        <div className={styles.pasoItem.header.numberBadge}>
          {index + 1}
        </div>

        <div className={styles.pasoItem.header.content}>
          <p className={styles.pasoItem.header.title}>
            {paso.nombre || <span className={styles.pasoItem.header.titleEmpty}>Sin nombre</span>}
          </p>
          {paso.descripcion && (
            <p className={styles.pasoItem.header.subtitle}>{paso.descripcion}</p>
          )}
        </div>

        <div className={styles.pasoItem.header.badges.container}>
          {paso.obligatorio && (
            <span className={styles.pasoItem.header.badges.obligatorio}>
              Obligatorio
            </span>
          )}
          {paso.documentos.length > 0 && (
            <span className={styles.pasoItem.header.badges.documentos}>
              {paso.documentos.length} {paso.documentos.length === 1 ? 'doc' : 'docs'}
            </span>
          )}
          {hasErrors && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Contenido expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={styles.pasoItem.expanded.container}
          >
            <div className={styles.pasoItem.expanded.content}>
              {/* Campos básicos */}
              <div className={styles.pasoItem.expanded.grid}>
                {/* Nombre */}
                <div className={styles.pasoItem.expanded.gridFull}>
                  <label className={styles.pasoItem.form.label}>
                    Nombre del Paso *
                  </label>
                  <input
                    type="text"
                    value={paso.nombre}
                    onChange={(e) => onUpdate({ nombre: e.target.value })}
                    placeholder="Ej: Firma de Promesa de Compraventa"
                    className={styles.pasoItem.form.input}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Descripción */}
                <div className={styles.pasoItem.expanded.gridFull}>
                  <label className={styles.pasoItem.form.label}>
                    Descripción
                  </label>
                  <textarea
                    value={paso.descripcion}
                    onChange={(e) => onUpdate({ descripcion: e.target.value })}
                    placeholder="Describe este paso..."
                    rows={2}
                    className={styles.pasoItem.form.textarea}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4">
                <label className={styles.pasoItem.form.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={paso.obligatorio}
                    onChange={(e) => onUpdate({ obligatorio: e.target.checked })}
                    className={styles.pasoItem.form.checkbox}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={styles.pasoItem.form.checkboxText}>Obligatorio</span>
                </label>

                <label className={styles.pasoItem.form.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={paso.permiteOmitir}
                    onChange={(e) => onUpdate({ permiteOmitir: e.target.checked })}
                    className={styles.pasoItem.form.checkbox}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={styles.pasoItem.form.checkboxText}>Permite Omitir</span>
                </label>
              </div>

              {/* Fuentes de pago requeridas */}
              <div>
                <label className={styles.pasoItem.form.label}>
                  Fuentes de Pago Requeridas
                  <span className="ml-2 text-xs text-gray-500">
                    (vacío = aplica a todas)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(TipoFuentePago).map(fuente => (
                    <label
                      key={fuente}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300
                               bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={paso.condiciones.fuentesPagoRequeridas.includes(fuente)}
                        onChange={(e) => {
                          const nuevasFuentes = e.target.checked
                            ? [...paso.condiciones.fuentesPagoRequeridas, fuente]
                            : paso.condiciones.fuentesPagoRequeridas.filter(f => f !== fuente)

                          onUpdate({
                            condiciones: {
                              ...paso.condiciones,
                              fuentesPagoRequeridas: nuevasFuentes
                            }
                          })
                        }}
                        className={styles.pasoItem.form.checkbox}
                      />
                      <span className={styles.pasoItem.form.checkboxText}>{fuente}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Depende de */}
              {pasosDisponibles.length > 0 && (
                <div>
                  <label className={styles.pasoItem.form.label}>
                    Depende de (pasos previos)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {pasosDisponibles
                      .filter(p => p.orden < paso.orden)
                      .map(pasoDisponible => (
                        <label
                          key={pasoDisponible.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300
                                   bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={paso.condiciones.dependeDe.includes(pasoDisponible.id)}
                            onChange={(e) => {
                              const nuevasDependencias = e.target.checked
                                ? [...paso.condiciones.dependeDe, pasoDisponible.id]
                                : paso.condiciones.dependeDe.filter(d => d !== pasoDisponible.id)

                              onUpdate({
                                condiciones: {
                                  ...paso.condiciones,
                                  dependeDe: nuevasDependencias
                                }
                              })
                            }}
                            className={styles.pasoItem.form.checkbox}
                          />
                          <span className={styles.pasoItem.form.checkboxText}>
                            {pasoDisponible.orden}. {pasoDisponible.nombre}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* Documentos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={styles.pasoItem.form.label}>
                    Documentos Requeridos
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAgregarDocumento()
                    }}
                    className={styles.button.add}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Documento</span>
                  </button>
                </div>

                {paso.documentos.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No hay documentos requeridos
                  </p>
                ) : (
                  <div className="space-y-2">
                    {paso.documentos.map(doc => (
                      <div
                        key={doc.id}
                        className={styles.pasoItem.documento.container}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className={styles.pasoItem.documento.icon} />

                        <div className={styles.pasoItem.documento.content}>
                          <input
                            type="text"
                            value={doc.nombre}
                            onChange={(e) => onActualizarDocumento(doc.id, {
                              nombre: e.target.value
                            })}
                            placeholder="Nombre del documento"
                            className={styles.pasoItem.documento.input}
                          />

                          <div className={styles.pasoItem.documento.checkboxContainer}>
                            <label className={styles.pasoItem.documento.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={doc.obligatorio}
                                onChange={(e) => onActualizarDocumento(doc.id, {
                                  obligatorio: e.target.checked
                                })}
                                className={styles.pasoItem.documento.checkbox}
                              />
                              <span>Obligatorio</span>
                            </label>
                          </div>
                        </div>

                        <button
                          onClick={() => onEliminarDocumento(doc.id)}
                          className={styles.pasoItem.documento.deleteButton}
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón eliminar paso */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-red-50 text-red-600 hover:bg-red-100
                           transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Paso</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
