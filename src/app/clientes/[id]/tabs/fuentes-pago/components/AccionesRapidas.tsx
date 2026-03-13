/**
 * ============================================
 * COMPONENTE: Acciones Rápidas
 * ============================================
 *
 * Cards de acciones contextuales que guían al usuario
 * hacia los módulos relacionados.
 */

import { motion } from 'framer-motion'
import {
    ArrowRight,
    FileText,
    TrendingUp
} from 'lucide-react'

import { fuentesPagoTabStyles as styles } from '../../fuentes-pago-tab.styles'

interface AccionesRapidasProps {
  onNavegar: (destino: 'documentos' | 'abonos') => void
  fuentesSinDocumentacion: number
  puedeRegistrarAbonos: boolean
}

export function AccionesRapidas({
  onNavegar,
  fuentesSinDocumentacion,
  puedeRegistrarAbonos
}: AccionesRapidasProps) {

  const acciones = [
    {
      id: 'documentos',
      titulo: 'Gestionar Documentación',
      subtitulo: fuentesSinDocumentacion > 0
        ? `${fuentesSinDocumentacion} fuentes necesitan documentos`
        : 'Todas las fuentes tienen documentación',
      icon: FileText,
      iconStyles: styles.acciones.iconDocumentos,
      onClick: () => onNavegar('documentos'),
      destacado: fuentesSinDocumentacion > 0,
    },
    {
      id: 'abonos',
      titulo: 'Ver Módulo de Abonos',
      subtitulo: puedeRegistrarAbonos
        ? 'Todo listo para registrar pagos'
        : 'Completa la configuración primero',
      icon: TrendingUp,
      iconStyles: styles.acciones.iconAbonos,
      onClick: () => onNavegar('abonos'),
      destacado: puedeRegistrarAbonos,
    },
  ]

  return (
    <motion.div
      className={styles.acciones.container}
      variants={styles.animations.staggerChildren}
      initial="initial"
      animate="animate"
    >
      {acciones.map((accion, index) => (
        <motion.div
          key={accion.id}
          className={`${styles.acciones.card} ${
            accion.destacado
              ? 'ring-2 ring-cyan-500/20 border-cyan-200 dark:border-cyan-700'
              : ''
          }`}
          onClick={accion.onClick}
          variants={styles.animations.fadeInUp}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={styles.acciones.content}>
            <div className={accion.iconStyles}>
              <accion.icon className={styles.acciones.icon} />
            </div>

            <div className={styles.acciones.textSection}>
              <h4 className={styles.acciones.title}>
                {accion.titulo}
              </h4>
              <p className={styles.acciones.subtitle}>
                {accion.subtitulo}
              </p>
            </div>

            <ArrowRight className={styles.acciones.arrow} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
