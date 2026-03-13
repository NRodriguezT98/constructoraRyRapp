/**
 * ============================================
 * COMPONENTE: Card de Requisito (SORTABLE)
 * ============================================
 * Tarjeta individual que muestra un requisito con acciones.
 * ✅ DRAG-AND-DROP: Usa @dnd-kit/sortable
 */

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import {
    AlertTriangle,
    CheckCircle,
    Edit,
    FileText,
    FolderOpen,
    GripVertical,
    Share2,
    Target,
    Trash2,
} from 'lucide-react'
import { requisitosConfigStyles as styles } from '../styles/requisitos-config.styles'
import type { RequisitoFuenteConfig } from '../types'

interface RequisitoCardProps {
  requisito: RequisitoFuenteConfig
  index: number
  onEditar: () => void
  onEliminar: () => void
}

export function RequisitoCard({ requisito, index, onEditar, onEliminar }: RequisitoCardProps) {
  // ============================================
  // DRAG-AND-DROP SETUP
  // ============================================
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: requisito.id })
  // Icono según nivel de validación
  const getNivelIcon = () => {
    switch (requisito.nivel_validacion) {
      case 'DOCUMENTO_OBLIGATORIO':
        return AlertTriangle
      case 'DOCUMENTO_OPCIONAL':
        return Target
      case 'SOLO_CONFIRMACION':
        return CheckCircle
      default:
        return FileText
    }
  }

  const NivelIcon = getNivelIcon()
  const nivelStyles = styles.nivelValidacion[requisito.nivel_validacion]

  // Label amigable para nivel
  const getNivelLabel = () => {
    switch (requisito.nivel_validacion) {
      case 'DOCUMENTO_OBLIGATORIO':
        return 'Obligatorio'
      case 'DOCUMENTO_OPCIONAL':
        return 'Opcional'
      case 'SOLO_CONFIRMACION':
        return 'Confirmación'
      default:
        return requisito.nivel_validacion
    }
  }

  // ============================================
  // ESTILOS DINÁMICOS PARA DRAG
  // ============================================
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={styles.card.container}
    >
      {/* Header con drag handle y orden */}
      <div className={styles.card.header}>
        {/* Drag Handle (✅ ACTIVADO) */}
        <div
          {...attributes}
          {...listeners}
          className={`${styles.card.dragHandle} cursor-grab active:cursor-grabbing`}
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Badge de Orden (posición en la lista, no el valor raw de `orden`) */}
        <div className={styles.card.ordenBadge}>{index}</div>

        {/* Contenido principal */}
        <div className={styles.card.content}>
          {/* Título */}
          <h3 className={styles.card.titulo}>{requisito.titulo}</h3>

          {/* Descripción */}
          {requisito.descripcion && (
            <p className={styles.card.descripcion}>{requisito.descripcion}</p>
          )}

          {/* Metadata */}
          <div className={styles.card.metadataGrid}>
            {/* ✅ Badge de Alcance COMPARTIDO */}
            {requisito.alcance === 'COMPARTIDO_CLIENTE' && (
              <div
                className={`${styles.card.badge} bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartido entre Fuentes</span>
              </div>
            )}

            {/* Nivel de Validación */}
            <div className={`${styles.card.badge} ${nivelStyles.container}`}>
              <NivelIcon className="w-3.5 h-3.5" />
              <span>{getNivelLabel()}</span>
            </div>

            {/* Tipo de Documento */}
            {requisito.tipo_documento_sugerido && (
              <div
                className={`${styles.card.badge} bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{requisito.tipo_documento_sugerido}</span>
              </div>
            )}

            {/* Categoría */}
            {requisito.categoria_documento && (
              <div
                className={`${styles.card.badge} bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="capitalize">{requisito.categoria_documento}</span>
              </div>
            )}
          </div>

          {/* Instrucciones (si existen) */}
          {requisito.instrucciones && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>Instrucciones:</strong> {requisito.instrucciones}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className={styles.card.actions}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEditar}
          className={`${styles.card.btnIcon} hover:text-blue-600 dark:hover:text-blue-400`}
          title="Editar requisito"
        >
          <Edit className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEliminar}
          className={`${styles.card.btnIcon} hover:text-red-600 dark:hover:text-red-400`}
          title="Eliminar requisito"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}
