'use client'

import { motion } from 'framer-motion'
import { MapPin, Building2, Calendar, Home, Edit2, Trash2, Eye } from 'lucide-react'
import { formatDate } from '../../../shared/utils/format'
import { cn } from '../../../shared/utils/helpers'
import { useProyectoCard } from '../hooks/useProyectoCard'
import { proyectoCardStyles as styles } from '../styles/proyecto-card.styles'
import type { Proyecto, VistaProyecto } from '../types'

interface ProyectoCardProps {
  proyecto: Proyecto
  vista: VistaProyecto
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
}

/**
 * Componente de presentación para tarjetas de proyecto
 * Lógica extraída a useProyectoCard hook
 * Estilos centralizados en proyecto-card.styles.ts
 */
export function ProyectoCard({ proyecto, vista, onEdit, onDelete }: ProyectoCardProps) {
  // Hook personalizado - Toda la lógica de negocio
  const {
    confirmDelete,
    totalViviendas,
    handleDelete,
    handleEdit,
    handleViewDetails
  } = useProyectoCard({ proyecto, onEdit, onDelete })

  // Vista Lista
  if (vista === 'lista') {
    return (
      <motion.div
        className={styles.container.lista}
        whileHover={{ scale: 1.01 }}
      >
        <div className={styles.layout.padding}>
          <div className={styles.layout.flexRow}>
            {/* Información Principal */}
            <div className={styles.layout.flexCol}>
              <div className={styles.header.wrapper}>
                <div className={styles.header.iconWrapper}>
                  <Building2 className={styles.header.icon} />
                </div>
                <div className={styles.header.titleWrapper}>
                  <h3 className={styles.text.title}>
                    {proyecto.nombre}
                  </h3>
                  <p className={styles.text.ubicacion}>
                    <MapPin className={styles.text.ubicacionIcon} />
                    <span className={styles.text.ubicacionText}>{proyecto.ubicacion}</span>
                  </p>
                </div>
              </div>

              <p className={styles.text.description}>
                {proyecto.descripcion}
              </p>

              {/* Estadísticas */}
              <div className={styles.stats.container}>
                <div className={styles.stats.item}>
                  <Home className={styles.stats.icon} />
                  <span className={styles.stats.label}>{proyecto.manzanas.length}</span>
                  <span>manzana{proyecto.manzanas.length !== 1 ? 's' : ''}</span>
                </div>
                <div className={styles.stats.separator} />
                <div className={styles.stats.item}>
                  <Building2 className={styles.stats.icon} />
                  <span className={styles.stats.label}>{totalViviendas}</span>
                  <span>vivienda{totalViviendas !== 1 ? 's' : ''}</span>
                </div>
                <div className={styles.stats.separator} />
                <div className={styles.stats.item}>
                  <Calendar className={styles.stats.icon} />
                  <span>{formatDate(proyecto.fechaCreacion)}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className={styles.layout.actions}>
              <button
                onClick={handleViewDetails}
                className={cn(styles.button.base, styles.button.view)}
                title="Ver detalles"
              >
                <Eye className={styles.button.icon} />
              </button>
              <button
                onClick={handleEdit}
                className={cn(styles.button.base, styles.button.edit)}
                title="Editar proyecto"
              >
                <Edit2 className={styles.button.icon} />
              </button>
              <button
                onClick={handleDelete}
                className={cn(
                  styles.button.base,
                  confirmDelete ? styles.button.deleteConfirm : styles.button.delete
                )}
                title={confirmDelete ? "¿Confirmar eliminación?" : "Eliminar proyecto"}
              >
                <Trash2 className={styles.button.icon} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Vista Grid
  return (
    <motion.div
      className={styles.container.grid}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Cabecera con gradiente */}
      <div className="relative h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
        <div className="relative flex items-start justify-end gap-1">
          <button
            onClick={handleViewDetails}
            className={cn(styles.button.base, "hover:bg-white/20 text-white backdrop-blur-sm")}
            title="Ver detalles"
          >
            <Eye className={styles.button.icon} />
          </button>
          <button
            onClick={handleEdit}
            className={cn(styles.button.base, "hover:bg-white/20 text-white backdrop-blur-sm")}
            title="Editar"
          >
            <Edit2 className={styles.button.icon} />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              styles.button.base,
              "backdrop-blur-sm",
              confirmDelete ? "bg-red-500 text-white" : "hover:bg-white/20 text-white"
            )}
            title={confirmDelete ? "¿Confirmar?" : "Eliminar"}
          >
            <Trash2 className={styles.button.icon} />
          </button>
        </div>

        {/* Icono del proyecto */}
        <div className="absolute -bottom-6 left-6">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className={cn(styles.layout.padding, "pt-10", styles.gridOnly.container)}>
        <div>
          <h3 className={cn(styles.text.titleGrid, "line-clamp-1")}>
            {proyecto.nombre}
          </h3>
          <p className={cn(styles.text.ubicacion, "mb-3")}>
            <MapPin className={styles.text.ubicacionIcon} />
            <span className={styles.text.ubicacionText}>{proyecto.ubicacion}</span>
          </p>
        </div>

        <p className={styles.text.descriptionGrid}>
          {proyecto.descripcion}
        </p>

        {/* Estadísticas en grid */}
        <div className={cn(styles.stats.containerGrid, "pt-3 border-t border-gray-100 dark:border-gray-700")}>
          <div className={styles.stats.itemGrid}>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Home className={styles.stats.iconGrid} />
            </div>
            <div>
              <div className={styles.stats.value}>{proyecto.manzanas.length}</div>
              <div className={styles.stats.valueLabel}>Manzanas</div>
            </div>
          </div>
          <div className={styles.stats.itemGrid}>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Building2 className={cn(styles.stats.iconGrid, "text-green-600 dark:text-green-400")} />
            </div>
            <div>
              <div className={styles.stats.value}>{totalViviendas}</div>
              <div className={styles.stats.valueLabel}>Viviendas</div>
            </div>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Calendar className="w-3.5 h-3.5" />
          <span>Creado el {formatDate(proyecto.fechaCreacion)}</span>
        </div>
      </div>
    </motion.div>
  )
}