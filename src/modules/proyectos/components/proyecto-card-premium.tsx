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

import { formatDateCompact } from '@/lib/utils/date.utils'

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
      className='group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 dark:border-gray-700/50 dark:bg-gray-800/80'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo sutil */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${estadoColor.glow} pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* HEADER */}
      <div className='relative z-10 p-3'>
        {/* Botones de acción (superior derecho) */}
        <div className='mb-1.5 flex items-start justify-end gap-1'>
          {handleViewDetails && (
            <button
              onClick={handleViewDetails}
              className='rounded-lg p-1 text-gray-600 transition-all hover:bg-green-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/30 dark:hover:text-green-400'
              title='Ver detalle'
            >
              <Eye className='h-3.5 w-3.5' />
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={handleEdit}
              className='rounded-lg p-1 text-gray-600 transition-all hover:bg-green-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/30 dark:hover:text-green-400'
              title='Editar'
            >
              <Edit className='h-3.5 w-3.5' />
            </button>
          )}
          {proyecto.archivado
            ? canEdit &&
              onRestore && (
                <button
                  onClick={handleRestore}
                  className='rounded-lg p-1 text-gray-600 transition-all hover:bg-green-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/30 dark:hover:text-green-400'
                  title='Restaurar proyecto'
                >
                  <ArchiveRestore className='h-3.5 w-3.5' />
                </button>
              )
            : canEdit &&
              onArchive && (
                <button
                  onClick={handleArchive}
                  className={`rounded-lg p-1 transition-all ${
                    confirmArchive
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'text-gray-600 hover:bg-amber-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-400'
                  }`}
                  title={confirmArchive ? '¿Confirmar archivado?' : 'Archivar'}
                >
                  <Archive className='h-3.5 w-3.5' />
                </button>
              )}
          {canDelete && onDelete && (
            <button
              onClick={handleDelete}
              className={`rounded-lg p-1 transition-all ${
                confirmDelete
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'text-gray-600 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400'
              }`}
              title={confirmDelete ? '¿Confirmar eliminación?' : 'Eliminar'}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        {/* Icono + Título + Badge Estado */}
        <div className='mb-3 flex items-start gap-2.5'>
          <div
            className={`h-9 w-9 rounded-lg ${estadoColor.bg} flex flex-shrink-0 items-center justify-center shadow-lg`}
          >
            <Building2 className='h-4 w-4 text-white' />
          </div>
          <div className='min-w-0 flex-1'>
            <h3 className='text-sm font-bold text-gray-900 dark:text-white'>
              {proyecto.nombre}
            </h3>
            {proyecto.archivado && (
              <span className='mt-1 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400'>
                <Archive className='h-3 w-3' />
                Archivado
              </span>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 ${estadoColor.bg} text-xs font-bold text-white shadow-md ${
              isCompleted ? 'shadow-green-500/30' : 'shadow-blue-500/30'
            } flex-shrink-0`}
          >
            <div className='h-1.5 w-1.5 rounded-full bg-white' />
            {isCompleted ? 'COMPLETADO' : 'EN PROCESO'}
          </span>
        </div>

        {/* SECCIÓN: Información General */}
        <div className='mb-2.5 rounded-lg border-2 border-slate-200/50 bg-gradient-to-br from-slate-50 to-gray-50 p-2.5 dark:border-slate-700/50 dark:from-slate-900/20 dark:to-gray-900/20'>
          <div className='mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300'>
            <TrendingUp className='h-3.5 w-3.5' />
            Información General
          </div>

          {/* Ubicación */}
          <div className='mb-2 border-b border-slate-200 pb-2 dark:border-slate-700'>
            <div className='flex items-start gap-1.5'>
              <MapPin className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500 dark:text-slate-400' />
              <div className='min-w-0 flex-1'>
                <p className='mb-0.5 text-[9px] font-semibold uppercase text-gray-500 dark:text-gray-400'>
                  Ubicación
                </p>
                <p className='text-xs font-medium text-gray-900 dark:text-white'>
                  {proyecto.ubicacion}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='grid grid-cols-2 gap-1.5'>
            {/* Manzanas */}
            <div className='flex items-center gap-1.5'>
              <div className='flex-shrink-0 rounded-md bg-blue-100 p-1 dark:bg-blue-900/30'>
                <Home className='h-3 w-3 text-blue-600 dark:text-blue-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-[9px] font-semibold uppercase text-gray-500 dark:text-gray-400'>
                  Manzanas
                </p>
                <p className='text-xs font-bold text-gray-900 dark:text-white'>
                  {proyecto.manzanas.length}
                </p>
              </div>
            </div>

            {/* Viviendas */}
            <div className='flex items-center gap-1.5'>
              <div className='flex-shrink-0 rounded-md bg-green-100 p-1 dark:bg-green-900/30'>
                <Building2 className='h-3 w-3 text-green-600 dark:text-green-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-[9px] font-semibold uppercase text-gray-500 dark:text-gray-400'>
                  Viviendas
                </p>
                <p className='text-xs font-bold text-gray-900 dark:text-white'>
                  {totalViviendas}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN: Progreso de Ventas */}
        <div className='mb-2.5 rounded-lg border-2 border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-green-50 p-2.5 dark:border-emerald-700/50 dark:from-emerald-900/20 dark:to-green-900/20'>
          <div className='mb-1.5 flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300'>
              <TrendingUp className='h-3.5 w-3.5' />
              Progreso de Ventas
            </div>
            <div className='bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-lg font-black text-transparent'>
              {progresoVentas}%
            </div>
          </div>

          {/* Barra de progreso */}
          <div className='mb-2 h-2.5 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-800/50'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/50 transition-all duration-500'
              style={{ width: `${progresoVentas}%` }}
            />
          </div>

          {/* Estadística de ventas */}
          <div className='flex items-center justify-between text-xs'>
            <div className='flex items-center gap-1'>
              <div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
              <span className='font-semibold text-gray-600 dark:text-gray-400'>
                Vendidas:
              </span>
            </div>
            <span className='font-bold text-emerald-700 dark:text-emerald-300'>
              {viviendasVendidas} / {totalViviendas}
            </span>
          </div>
        </div>

        {/* SECCIÓN: Completado */}
        {isCompleted && (
          <div className='mb-2.5 rounded-lg border-2 border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50 p-2.5 dark:border-green-700/50 dark:from-green-900/20 dark:to-emerald-900/20'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500'>
                <CheckCircle2 className='h-4 w-4 text-white' />
              </div>
              <div className='flex-1'>
                <p className='text-xs font-bold text-green-700 dark:text-green-300'>
                  Proyecto Completado
                </p>
                <p className='text-[10px] text-green-600 dark:text-green-400'>
                  Finalizado exitosamente
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer con fecha de creación */}
        <div className='flex items-center justify-between gap-2 border-t border-gray-200 pt-2 dark:border-gray-700'>
          <div className='flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400'>
            <Calendar className='h-3 w-3' />
            <span>Creado {formatDateCompact(proyecto.fechaCreacion)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
