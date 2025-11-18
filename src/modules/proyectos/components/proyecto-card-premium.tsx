/**
 * ProyectoCardPremium - Card optimizada con progreso de ventas
 * ✅ Información General (ubicación completa + estadísticas)
 * ✅ Progreso de Ventas (viviendas vendidas/total)
 * ✅ Barra de progreso calculada automáticamente
 * ✅ Estados visuales claros (En Proceso / Completado)
 * ✅ Permisos desde servidor (no recalcula en cada tarjeta)
 */

'use client'

import { motion } from 'framer-motion'
import {
    Archive,
    ArchiveRestore,
    Building2,
    Calendar,
    CheckCircle2,
    Edit,
    Eye,
    Home,
    MapPin,
    Trash2,
    TrendingUp,
} from 'lucide-react'

import { formatDate } from '@/shared/utils'

import { useProyectoCard } from '../hooks/useProyectoCard'
import type { Proyecto } from '../types'

interface ProyectoCardPremiumProps {
  proyecto: Proyecto
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
  onRestore?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ProyectoCardPremium({
  proyecto,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  canEdit = false,
  canDelete = false,
}: ProyectoCardPremiumProps) {
  const {
    confirmDelete,
    confirmArchive,
    totalViviendas,
    viviendasVendidas,
    progresoVentas,
    handleDelete,
    handleArchive,
    handleEdit,
    handleViewDetails,
  } = useProyectoCard({ proyecto, onEdit, onDelete, onArchive })

  const handleRestore = () => {
    if (onRestore) {
      onRestore(proyecto.id)
    }
  }

  // Determinar estado del proyecto
  const isCompleted = proyecto.estado === 'completado'
  const estadoColor = isCompleted
    ? {
        gradient: 'from-green-500 to-emerald-500',
        bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
        glow: 'from-green-500/5 via-emerald-500/5 to-green-500/5',
      }
    : {
        gradient: 'from-blue-500 to-indigo-500',
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        glow: 'from-blue-500/5 via-indigo-500/5 to-blue-500/5',
      }

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo sutil */}
      <div className={`absolute inset-0 bg-gradient-to-br ${estadoColor.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      {/* HEADER */}
      <div className="relative z-10 p-3">
        {/* Botones de acción (superior derecho) */}
        <div className="flex items-start justify-end gap-1 mb-1.5">
          {handleViewDetails && (
            <button
              onClick={handleViewDetails}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-all"
              title="Ver detalle"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-all"
              title="Editar"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {proyecto.archivado ? (
            canEdit && onRestore && (
              <button
                onClick={handleRestore}
                className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-all"
                title="Restaurar proyecto"
              >
                <ArchiveRestore className="w-3.5 h-3.5" />
              </button>
            )
          ) : (
            canEdit && onArchive && (
              <button
                onClick={handleArchive}
                className={`p-1 rounded-lg transition-all ${
                  confirmArchive
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
                title={confirmArchive ? '¿Confirmar archivado?' : 'Archivar'}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )
          )}
          {canDelete && onDelete && (
            <button
              onClick={handleDelete}
              className={`p-1 rounded-lg transition-all ${
                confirmDelete
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
              }`}
              title={confirmDelete ? '¿Confirmar eliminación?' : 'Eliminar'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Icono + Título + Badge Estado */}
        <div className="flex items-start gap-2.5 mb-3">
          <div className={`w-9 h-9 rounded-lg ${estadoColor.bg} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {proyecto.nombre}
            </h3>
            {proyecto.archivado && (
              <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-700 dark:text-amber-400">
                <Archive className="w-3 h-3" />
                Archivado
              </span>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${estadoColor.bg} text-white text-xs font-bold shadow-md ${
              isCompleted ? 'shadow-green-500/30' : 'shadow-blue-500/30'
            } flex-shrink-0`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {isCompleted ? 'COMPLETADO' : 'EN PROCESO'}
          </span>
        </div>

        {/* SECCIÓN: Información General */}
        <div className="mb-2.5 rounded-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-200/50 dark:border-slate-700/50 p-2.5">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            Información General
          </div>

          {/* Ubicación */}
          <div className="mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-0.5">
                  Ubicación
                </p>
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  {proyecto.ubicacion}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Manzanas */}
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                <Home className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Manzanas
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {proyecto.manzanas.length}
                </p>
              </div>
            </div>

            {/* Viviendas */}
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                <Building2 className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Viviendas
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {totalViviendas}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN: Progreso de Ventas */}
        <div className="mb-2.5 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200/50 dark:border-emerald-700/50 p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              Progreso de Ventas
            </div>
            <div className="text-lg font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {progresoVentas}%
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-800/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500 shadow-lg shadow-emerald-500/50"
              style={{ width: `${progresoVentas}%` }}
            />
          </div>

          {/* Estadística de ventas */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                Vendidas:
              </span>
            </div>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              {viviendasVendidas} / {totalViviendas}
            </span>
          </div>
        </div>

        {/* SECCIÓN: Completado */}
        {isCompleted && (
          <div className="mb-2.5 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200/50 dark:border-green-700/50 p-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-green-700 dark:text-green-300">
                  Proyecto Completado
                </p>
                <p className="text-[10px] text-green-600 dark:text-green-400">
                  Finalizado exitosamente
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer con fecha de creación */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Creado {formatDate(proyecto.fechaCreacion)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
