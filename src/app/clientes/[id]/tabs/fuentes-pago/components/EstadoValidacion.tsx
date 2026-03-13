/**
 * ============================================
 * COMPONENTE: Estado de Validación
 * ============================================
 *
 * Muestra el estado actual de validación de las fuentes de pago
 * con mensajes contextuales y acciones sugeridas.
 */

import { motion } from 'framer-motion'
import {
    AlertTriangle,
    ArrowRight,
    Calculator,
    CheckCircle,
    FileText,
    XCircle
} from 'lucide-react'

import { fuentesPagoTabStyles as styles } from '../../fuentes-pago-tab.styles'
import type { EstadoValidacion } from '../hooks/useFuentesPagoTab'

interface EstadoValidacionProps {
  estadoValidacion: EstadoValidacion
  onNavegar: (destino: 'documentos' | 'abonos') => void
  onVerDetalle: () => void
}

export function EstadoValidacionComponent({
  estadoValidacion,
  onNavegar,
  onVerDetalle
}: EstadoValidacionProps) {
  const {
    tieneFuentes,
    sumaCuadra,
    todasConDocumentacion,
    puedeRegistrarAbonos,
    mensajesValidacion
  } = estadoValidacion

  // Determinar icono y título principal
  const getMainStatus = () => {
    if (puedeRegistrarAbonos) {
      return {
        icon: CheckCircle,
        iconClass: styles.validacion.iconSuccess,
        title: '✅ Todo Listo para Abonos',
        titleClass: 'text-green-700 dark:text-green-300',
      }
    }

    if (!tieneFuentes) {
      return {
        icon: XCircle,
        iconClass: styles.validacion.iconDanger,
        title: '❌ Sin Fuentes Configuradas',
        titleClass: 'text-red-700 dark:text-red-300',
      }
    }

    return {
      icon: AlertTriangle,
      iconClass: styles.validacion.iconWarning,
      title: '⚠️ Configuración Pendiente',
      titleClass: 'text-orange-700 dark:text-orange-300',
    }
  }

  const mainStatus = getMainStatus()

  return (
    <motion.div
      className={styles.validacion.container}
      {...styles.animations.fadeInUp}
    >
      {/* Header con estado principal */}
      <div className={styles.validacion.header}>
        <mainStatus.icon className={mainStatus.iconClass} />
        <h3 className={`${styles.validacion.title} ${mainStatus.titleClass}`}>
          {mainStatus.title}
        </h3>
      </div>

      {/* Mensajes de validación */}
      {mensajesValidacion.length > 0 && (
        <div className={styles.validacion.mensajes}>
          {mensajesValidacion.map((mensaje, index) => {
            const isWarning = mensaje.includes('⚠️') || mensaje.includes('💰') || mensaje.includes('📄')
            const isDanger = mensaje.includes('❌')

            const messageClass = isDanger
              ? styles.validacion.mensajeDanger
              : isWarning
                ? styles.validacion.mensajeWarning
                : styles.validacion.mensajeSuccess

            return (
              <motion.div
                key={index}
                className={messageClass}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{mensaje}</span>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Acciones contextuales */}
      {!puedeRegistrarAbonos && (
        <div className={styles.validacion.acciones}>
          {!todasConDocumentacion && (
            <motion.button
              onClick={() => onNavegar('documentos')}
              className={styles.header.secondaryButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText className="w-4 h-4" />
              <span>Gestionar Documentos</span>
            </motion.button>
          )}

          <motion.button
            onClick={onVerDetalle}
            className={styles.header.secondaryButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calculator className="w-4 h-4" />
            <span>Ver Detalle</span>
          </motion.button>
        </div>
      )}

      {/* CTA principal cuando todo esté listo */}
      {puedeRegistrarAbonos && (
        <div className={styles.validacion.acciones}>
          <motion.button
            onClick={() => onNavegar('abonos')}
            className={styles.header.actionButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight className="w-4 h-4" />
            <span>Ir al Módulo de Abonos</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
