/**
 * 📌 COMPONENTE: PASO ITEM
 *
 * Renderiza un paso individual del proceso con:
 * - Estado visual (dot, badges, iconos)
 * - Información de bloqueo y dependencias
 * - Documentos requeridos (expandible)
 * - Acciones según estado
 */

'use client'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import type { ProcesoNegociacion } from '../types'
import {
    getBadgePorEstado,
    getClasesDotPorEstado,
    getContenidoDot,
    getEstadoPaso,
    getIconoPorEstado
} from '../utils/paso-estado.utils'
import { AccionesPaso } from './acciones-paso'
import { DocumentoItem } from './documento-item'
import { timelineProcesoStyles as styles } from './timeline-proceso.styles'

interface PasoItemProps {
  paso: ProcesoNegociacion
  index: number
  isExpanded: boolean
  onToggle: () => void
  onIniciar: () => void
  onCompletar: () => void
  onDescartar: () => void
  onOmitir: () => void
  onAdjuntarDocumento: (pasoId: string, pasoNombre: string, documentoId: string, documentoNombre: string, file: File, categoriaId?: string | null) => Promise<void>
  onEliminarDocumento: (pasoId: string, documentoId: string, url: string) => Promise<void>
  onCorregirFecha: () => void
  onCorregirDocumento: () => void
  esAdministrador: boolean
  puedeIniciar: boolean
  puedeCompletar: boolean
  estaBloqueado: boolean
  dependenciasIncompletas: ProcesoNegociacion[]
  deshabilitado: boolean
  subiendoDoc: string | null
}

export function PasoItem({
  paso,
  index,
  isExpanded,
  onToggle,
  onIniciar,
  onCompletar,
  onDescartar,
  onOmitir,
  onAdjuntarDocumento,
  onEliminarDocumento,
  onCorregirFecha,
  onCorregirDocumento,
  esAdministrador,
  puedeIniciar,
  puedeCompletar,
  estaBloqueado,
  dependenciasIncompletas,
  deshabilitado,
  subiendoDoc
}: PasoItemProps) {
  const { isCompletado, isEnProceso, isPendiente, isBloqueado, isOmitido } = getEstadoPaso(paso, estaBloqueado)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={styles.paso.container}
    >
      {/* Dot */}
      <div className={`${styles.paso.dot.base} ${getClasesDotPorEstado(paso, estaBloqueado, styles)}`}>
        {getContenidoDot(paso, index, estaBloqueado)}
      </div>

      {/* Contenido */}
      <div className={styles.paso.content}>
        <div
          onClick={!isBloqueado ? onToggle : undefined}
          className={`
            ${styles.paso.card.base}
            ${isCompletado ? styles.paso.card.completado : ''}
            ${isEnProceso ? styles.paso.card.enProceso : ''}
            ${isPendiente && !isBloqueado ? styles.paso.card.pendiente : ''}
            ${isBloqueado ? styles.paso.card.bloqueado : ''}
            relative
          `}
        >
          {/* Indicador "EN CURSO" para paso activo */}
          {isEnProceso && (
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              EN CURSO
            </div>
          )}

          {/* Marca de completado para pasos finalizados */}
          {isCompletado && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full p-1.5 shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}

          {/* Header del Paso */}
          <div className={styles.paso.header.container}>
            <div className={styles.paso.header.left}>
              <div className={styles.paso.header.iconRow}>
                {getIconoPorEstado(paso, estaBloqueado)}
                <h3 className={isBloqueado ? styles.paso.header.titleBloqueado : styles.paso.header.title}>
                  {paso.nombre}
                </h3>
              </div>
              {paso.descripcion && (
                <p className={isBloqueado ? styles.paso.header.descriptionBloqueado : styles.paso.header.description}>
                  {paso.descripcion}
                </p>
              )}
            </div>

            {!isBloqueado && (
              <button className={styles.paso.header.toggleButton}>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* Badges */}
          <div className={styles.paso.badges.container}>
            {getBadgePorEstado(paso, estaBloqueado, styles).element}

            {paso.esObligatorio && (
              <span className={styles.paso.badges.obligatorio}>
                Obligatorio
              </span>
            )}
          </div>

          {/* Mensaje de Bloqueo */}
          {isBloqueado && dependenciasIncompletas.length > 0 && (
            <div className={styles.paso.bloqueoAlert.container}>
              <div className={styles.paso.bloqueoAlert.content}>
                <AlertCircle className={styles.paso.bloqueoAlert.icon} />
                <div className={styles.paso.bloqueoAlert.text}>
                  <p className={styles.paso.bloqueoAlert.title}>Paso bloqueado</p>
                  <p className={styles.paso.bloqueoAlert.subtitle}>
                    Debes completar primero:
                  </p>
                  <ul className={styles.paso.bloqueoAlert.list}>
                    {dependenciasIncompletas.map(dep => (
                      <li key={dep.id} className={styles.paso.bloqueoAlert.listItem}>
                        • Paso {dep.orden}: {dep.nombre}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Fechas */}
          {(paso.fechaInicio || paso.fechaCompletado) && (
            <div className={styles.paso.fechas.container}>
              {paso.fechaInicio && (
                <span>Iniciado el: {formatDateForDisplay(paso.fechaInicio)}</span>
              )}
              {paso.fechaCompletado && (
                <span>Completado el: {formatDateForDisplay(paso.fechaCompletado)}</span>
              )}
            </div>
          )}

          {/* Motivo de Omisión */}
          {isOmitido && paso.motivoOmision && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Motivo de Omisión:
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 italic">
                    "{paso.motivoOmision}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenido Expandido */}
        <AnimatePresence>
          {isExpanded && !isBloqueado && !isOmitido && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.expanded.container}
            >
              <div className={styles.expanded.content}>
                {/* Alerta: Paso pendiente simplificada */}
                {isPendiente && (
                  <div className={styles.expanded.alertPendiente.container}>
                    <div className={styles.expanded.alertPendiente.content}>
                      <AlertCircle className={styles.expanded.alertPendiente.icon} />
                      <div className={styles.expanded.alertPendiente.text}>
                        <p className={styles.expanded.alertPendiente.title}>Paso pendiente</p>
                        <p className={styles.expanded.alertPendiente.subtitle}>
                          Adjunta un documento para iniciar este paso automáticamente.
                        </p>
                        <p className="text-xs mt-2 text-blue-700 dark:text-blue-300">
                          ℹ️ Los documentos marcados con <span className="text-red-600 dark:text-red-400 font-bold">*</span> son obligatorios para completar el paso.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documentos Requeridos - Visible en Pendiente, En Proceso o Completado */}
                {(isPendiente || isEnProceso || isCompletado) && paso.documentosRequeridos && paso.documentosRequeridos.length > 0 && (
                  <div>
                    <h4 className={styles.expanded.section.title}>
                      Documentos Requeridos:
                    </h4>
                    <div className={styles.expanded.section.list}>
                      {paso.documentosRequeridos.map(doc => {
                        const urlSubido = paso.documentosUrls?.[doc.id] || paso.documentosUrls?.[doc.nombre]

                        return (
                          <DocumentoItem
                            key={doc.id}
                            documento={doc}
                            urlSubido={urlSubido}
                            isPendiente={isPendiente}
                            isEnProceso={isEnProceso}
                            isCompletado={isCompletado}
                            deshabilitado={deshabilitado}
                            subiendoDoc={subiendoDoc}
                            onAdjuntar={(file) => onAdjuntarDocumento(paso.id, paso.nombre, doc.id, doc.nombre, file, doc.categoriaId)}
                            onEliminar={() => onEliminarDocumento(paso.id, doc.id, doc.nombre)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Notas */}
                {paso.notas && (
                  <div>
                    <h4 className={styles.expanded.notas.title}>Notas:</h4>
                    <p className={styles.expanded.notas.content}>
                      {paso.notas}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <AccionesPaso
                  isPendiente={isPendiente}
                  isEnProceso={isEnProceso}
                  isCompletado={isCompletado}
                  puedeCompletar={puedeCompletar}
                  permiteOmitir={paso.permiteOmitir}
                  deshabilitado={deshabilitado}
                  esAdministrador={esAdministrador}
                  onCompletar={onCompletar}
                  onDescartar={onDescartar}
                  onOmitir={onOmitir}
                  onCorregirFecha={onCorregirFecha}
                  onCorregirDocumento={onCorregirDocumento}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
