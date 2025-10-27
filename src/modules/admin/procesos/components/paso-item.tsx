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

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
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
  onAdjuntarDocumento: (pasoId: string, documentoId: string, documentoNombre: string, file: File) => Promise<void>
  onEliminarDocumento: (pasoId: string, documentoId: string, documentoNombre: string) => Promise<void>
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
  onAdjuntarDocumento,
  onEliminarDocumento,
  puedeIniciar,
  puedeCompletar,
  estaBloqueado,
  dependenciasIncompletas,
  deshabilitado,
  subiendoDoc
}: PasoItemProps) {
  const { isCompletado, isEnProceso, isPendiente, isBloqueado } = getEstadoPaso(paso, estaBloqueado)

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
            ${isBloqueado ? styles.paso.card.bloqueado : styles.paso.card.clickable}
          `}
        >
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
                <span>Iniciado: {new Date(paso.fechaInicio).toLocaleDateString()}</span>
              )}
              {paso.fechaCompletado && (
                <span>Completado: {new Date(paso.fechaCompletado).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>

        {/* Contenido Expandido */}
        <AnimatePresence>
          {isExpanded && !isBloqueado && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.expanded.container}
            >
              <div className={styles.expanded.content}>
                {/* Alerta: Debes iniciar el paso */}
                {isPendiente && (
                  <div className={styles.expanded.alertPendiente.container}>
                    <div className={styles.expanded.alertPendiente.content}>
                      <AlertCircle className={styles.expanded.alertPendiente.icon} />
                      <div className={styles.expanded.alertPendiente.text}>
                        <p className={styles.expanded.alertPendiente.title}>Paso no iniciado</p>
                        <p className={styles.expanded.alertPendiente.subtitle}>
                          Presiona "Iniciar Paso" para empezar a trabajar en este paso.
                        </p>

                        {/* Mostrar requisitos sin iniciar el paso */}
                        {paso.documentosRequeridos && paso.documentosRequeridos.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50">
                            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                              📋 Documentos que necesitarás:
                            </p>
                            <ul className="space-y-1.5">
                              {paso.documentosRequeridos.map(doc => (
                                <li key={doc.id} className="flex items-start gap-2 text-xs">
                                  <span className={`
                                    mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full
                                    ${doc.obligatorio
                                      ? 'bg-red-500 dark:bg-red-400'
                                      : 'bg-blue-400 dark:bg-blue-500'}
                                  `} />
                                  <span className="text-blue-800 dark:text-blue-200">
                                    <span className="font-medium">{doc.nombre}</span>
                                    {doc.obligatorio && (
                                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold">
                                        Obligatorio
                                      </span>
                                    )}
                                    {!doc.obligatorio && (
                                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        Opcional
                                      </span>
                                    )}
                                    {doc.descripcion && (
                                      <span className="block mt-0.5 text-blue-600 dark:text-blue-400 italic">
                                        {doc.descripcion}
                                      </span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Documentos Requeridos - Solo visible si está En Proceso o Completado */}
                {(isEnProceso || isCompletado) && paso.documentosRequeridos && paso.documentosRequeridos.length > 0 && (
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
                            isEnProceso={isEnProceso}
                            isCompletado={isCompletado}
                            deshabilitado={deshabilitado}
                            subiendoDoc={subiendoDoc}
                            onAdjuntar={(file) => onAdjuntarDocumento(paso.id, doc.id, doc.nombre, file)}
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
                  puedeIniciar={puedeIniciar}
                  puedeCompletar={puedeCompletar}
                  deshabilitado={deshabilitado}
                  onIniciar={onIniciar}
                  onCompletar={onCompletar}
                  onDescartar={onDescartar}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
