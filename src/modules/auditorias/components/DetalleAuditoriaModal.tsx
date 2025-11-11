/**
 * DetalleAuditoriaModal - Modal para mostrar detalles de auditoría
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO (< 150 líneas)
 * ✅ SOLO orquestación, SIN lógica
 * ✅ Usa renders específicos por módulo
 * ✅ Separación de responsabilidades perfecta
 *
 * Arquitectura:
 * - Hook: useDetalleAuditoria (lógica)
 * - Renders: detalle-renders/* (UI específica)
 * - Shared: AccionBadge, InfoCard (componentes reutilizables)
 * - Utils: formatters (funciones puras)
 * - Styles: detalle-modal.styles (estilos centralizados)
 */

'use client'

import { motion } from 'framer-motion'
import { Calendar, ChevronDown, ChevronUp, FileText, User, X } from 'lucide-react'

import { useDetalleAuditoria } from '../hooks'
import { detalleModalStyles as styles } from '../styles/detalle-modal.styles'
import type { AuditLogRecord } from '../types'
import { getAccionLabel } from '../utils/formatters'

import {
    ClienteDetalleRender,
    DocumentoReemplazoDetalleRender,
    GenericoDetalleRender,
    NegociacionDetalleRender,
    ProyectoDetalleRender,
    ViviendaDetalleRender
} from './detalle-renders'
import { AccionBadge } from './shared'

interface DetalleAuditoriaModalProps {
  registro: AuditLogRecord
  onClose: () => void
}

export function DetalleAuditoriaModal({ registro, onClose }: DetalleAuditoriaModalProps) {
  const { seccionAbierta, toggleSeccion, datosFormateados, mostrarSeccionJson } = useDetalleAuditoria(registro)

  // Seleccionar render según módulo y tipo de operación
  const renderDetallesModulo = () => {
    const metadata = datosFormateados.metadata

    // Detectar reemplazo de archivos (tipo_operacion específico)
    if (metadata.tipo_operacion === 'reemplazo_archivo_admin') {
      return <DocumentoReemplazoDetalleRender metadata={metadata} />
    }

    // Renders por módulo estándar
    switch (registro.modulo) {
      case 'proyectos':
        return <ProyectoDetalleRender metadata={metadata} />
      case 'viviendas':
        return <ViviendaDetalleRender metadata={metadata} />
      case 'clientes':
        return <ClienteDetalleRender metadata={metadata} />
      case 'negociaciones':
        return <NegociacionDetalleRender metadata={metadata} />
      default:
        return <GenericoDetalleRender registro={registro} />
    }
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.overlay}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={styles.modalContainer}
      >
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.header.container}>
            <div className={styles.header.pattern} />
            <div className={styles.header.content}>
              <div className="flex items-center gap-4">
                <div className={styles.header.iconBox}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={styles.header.title}>Detalles de Auditoría</h3>
                  <p className={styles.header.subtitle}>
                    {registro.modulo || registro.tabla} • {getAccionLabel(registro.accion)}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className={styles.header.closeButton}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={styles.body}>
            <div className="space-y-3">
              {/* Información de la Acción */}
              <div className={styles.accion.container}>
                <div className="flex items-center gap-3">
                  <AccionBadge accion={registro.accion} />
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className={styles.accion.usuario.label}>Realizado por</p>
                      <p className={styles.accion.usuario.email}>
                        {registro.usuarioEmail}
                        {registro.usuarioRol && (
                          <span className={styles.accion.usuario.rolBadge}>{registro.usuarioRol}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <div className="text-right">
                    <p className={styles.accion.fecha.label}>Fecha y Hora</p>
                    <p className={styles.accion.fecha.valor}>{datosFormateados.fechaFormateada}</p>
                  </div>
                </div>
              </div>

              {/* Detalles del Módulo */}
              <div className={styles.detalles.container}>
                <h4 className={styles.detalles.titulo}>
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Información Detallada
                </h4>
                {renderDetallesModulo()}
              </div>

              {/* JSON Completo (colapsable) */}
              {mostrarSeccionJson && (
                <div className="space-y-2">
                  <button onClick={() => toggleSeccion('json')} className={styles.json.button}>
                    <span className={styles.json.label}>
                      <FileText className="w-4 h-4 text-gray-400" />
                      Ver datos técnicos (JSON)
                    </span>
                    {seccionAbierta === 'json' ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {seccionAbierta === 'json' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.json.content}
                    >
                      <GenericoDetalleRender registro={registro} />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button onClick={onClose} className={styles.closeButtonFooter}>
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
