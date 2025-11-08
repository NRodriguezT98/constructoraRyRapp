/**
 * 📄 PLANTILLA CARD
 *
 * Tarjeta individual de plantilla con estadísticas, badges y acciones.
 * Diseño premium con glassmorphism y hover effects.
 */

'use client'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    Check,
    Copy,
    FileText,
    Star,
    Trash2
} from 'lucide-react'

import { procesosStyles as styles } from '../styles/procesos.styles'
import type { PlantillaProceso } from '../types'

interface PlantillaCardProps {
  plantilla: PlantillaProceso
  onEditar: (id: string) => void
  onDuplicar: (plantilla: PlantillaProceso) => void
  onEliminar: (id: string) => void
  onEstablecerPredeterminada: (id: string) => void
  deshabilitado: boolean
}

export function PlantillaCard({
  plantilla,
  onEditar,
  onDuplicar,
  onEliminar,
  onEstablecerPredeterminada,
  deshabilitado
}: PlantillaCardProps) {
  // Calcular estadísticas
  const totalPasos = plantilla.pasos.length
  const pasosObligatorios = plantilla.pasos.filter(p => p.obligatorio).length
  const pasosCondicionales = plantilla.pasos.filter(p =>
    p.condiciones.fuentesPagoRequeridas.length > 0
  ).length

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => onEditar(plantilla.id)}
      className={styles.grid.card.container}
    >
      <div className={styles.grid.card.glow} />

      {/* Header con ícono y acciones */}
      <div className={styles.grid.card.header}>
        <div className={styles.grid.card.iconCircle}>
          <FileText className={styles.grid.card.icon} />
        </div>

        <div className={styles.grid.card.actions} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onDuplicar(plantilla)}
            disabled={deshabilitado}
            className={styles.grid.card.actionButton}
            title="Duplicar plantilla"
          >
            <Copy className={styles.grid.card.actionIcon} />
          </button>

          {!plantilla.esPredeterminado && (
            <button
              onClick={() => onEliminar(plantilla.id)}
              disabled={deshabilitado}
              className={styles.grid.card.actionButton}
              title="Eliminar plantilla"
            >
              <Trash2 className={styles.grid.card.actionIcon} />
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className={styles.grid.card.content}>
        <h3 className={styles.grid.card.title}>{plantilla.nombre}</h3>
        {plantilla.descripcion && (
          <p className={styles.grid.card.description}>{plantilla.descripcion}</p>
        )}

        {/* Badges */}
        <div className={styles.grid.card.badges}>
          {plantilla.esPredeterminado && (
            <span className={styles.grid.card.badgePredeterminado}>
              <Star className="w-3 h-3 inline-block mr-1" />
              Predeterminada
            </span>
          )}

          {plantilla.activo ? (
            <span className={styles.grid.card.badgeActivo}>
              <Check className="w-3 h-3 inline-block mr-1" />
              Activa
            </span>
          ) : (
            <span className={styles.grid.card.badgeInactivo}>
              Inactiva
            </span>
          )}
        </div>

        {/* Estadísticas */}
        <div className={styles.grid.card.stats}>
          <div className={styles.grid.card.stat.container}>
            <FileText className={styles.grid.card.stat.icon} />
            <div>
              <div className={styles.grid.card.stat.value}>{totalPasos}</div>
              <div className={styles.grid.card.stat.label}>Pasos totales</div>
            </div>
          </div>

          <div className={styles.grid.card.stat.container}>
            <AlertCircle className={styles.grid.card.stat.icon} />
            <div>
              <div className={styles.grid.card.stat.value}>{pasosObligatorios}</div>
              <div className={styles.grid.card.stat.label}>Obligatorios</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.grid.card.footer}>
        <span className={styles.grid.card.footerText}>
          {pasosCondicionales} pasos condicionales
        </span>

        {!plantilla.esPredeterminado && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEstablecerPredeterminada(plantilla.id)
            }}
            disabled={deshabilitado}
            className={styles.grid.card.footerButton}
          >
            Establecer predeterminada
          </button>
        )}
      </div>
    </motion.div>
  )
}
