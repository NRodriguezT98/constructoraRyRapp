'use client'

import { motion } from 'framer-motion'
import { MapPin, Building2, Calendar, Home, Edit2, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '../../../shared/utils/format'
import { cn } from '../../../shared/utils/helpers'
import type { Proyecto, VistaProyecto } from '../types'

interface ProyectoCardProps {
  proyecto: Proyecto
  vista: VistaProyecto
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
}

export function ProyectoCard({ proyecto, vista, onEdit, onDelete }: ProyectoCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }

    onDelete?.(proyecto.id)
    setConfirmDelete(false)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/proyectos/${proyecto.id}`)
  }

  const totalViviendas = proyecto.manzanas.reduce((sum, m) => sum + m.totalViviendas, 0)

  if (vista === 'lista') {
    return (
      <motion.div
        className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg overflow-hidden"
        whileHover={{ scale: 1.01 }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Información Principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                    {proyecto.nombre}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{proyecto.ubicacion}</span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {proyecto.descripcion}
              </p>

              {/* Estadísticas */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Home className="w-4 h-4" />
                  <span className="font-medium">{proyecto.manzanas.length}</span>
                  <span>manzana{proyecto.manzanas.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{totalViviendas}</span>
                  <span>vivienda{totalViviendas !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(proyecto.fechaCreacion)}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewDetails}
                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(proyecto)
                }}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                title="Editar proyecto"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  confirmDelete
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                )}
                title={confirmDelete ? "¿Confirmar eliminación?" : "Eliminar proyecto"}
              >
                <Trash2 className="w-4 h-4" />
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
      className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-2xl overflow-hidden"
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Cabecera con gradiente */}
      <div className="relative h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
        <div className="relative flex items-start justify-end gap-1">
          <button
            onClick={handleViewDetails}
            className="p-2 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(proyecto)
            }}
            className="p-2 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              "p-2 rounded-lg transition-colors backdrop-blur-sm",
              confirmDelete
                ? "bg-red-500 text-white"
                : "hover:bg-white/20 text-white"
            )}
            title={confirmDelete ? "¿Confirmar?" : "Eliminar"}
          >
            <Trash2 className="w-4 h-4" />
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
      <div className="p-6 pt-10 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
            {proyecto.nombre}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{proyecto.ubicacion}</span>
          </p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {proyecto.descripcion}
        </p>

        {/* Estadísticas en grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{proyecto.manzanas.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Manzanas</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{totalViviendas}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Viviendas</div>
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