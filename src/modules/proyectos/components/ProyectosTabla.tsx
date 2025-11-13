/**
 * ProyectosTabla - Vista de tabla para proyectos
 * ✅ Usa DataTable genérico
 * ✅ Columnas específicas de proyectos
 * ✅ Diseño compacto y alineado
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Building2, CheckCircle2, Clock, Edit2, Eye, MapPin, Trash2 } from 'lucide-react'

import { DataTable } from '@/shared/components/table/DataTable'
import { cn } from '@/shared/utils/helpers'
import type { Proyecto } from '../types'
import { formatearEstadoProyecto } from '../utils/estado.utils'

interface ProyectosTablaProps {
  proyectos: Proyecto[]
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
  onView?: (proyecto: Proyecto) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ProyectosTabla({
  proyectos,
  onEdit,
  onDelete,
  onView,
  canEdit,
  canDelete,
}: ProyectosTablaProps) {
  const columns: ColumnDef<Proyecto>[] = [
    {
      accessorKey: 'nombre',
      header: () => <div className="text-center">Proyecto</div>,
      size: 220,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md shadow-green-500/20">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
            {row.original.nombre}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'ubicacion',
      header: () => <div className="text-center">Ubicación</div>,
      size: 180,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{row.original.ubicacion}</span>
        </div>
      ),
    },
    {
      accessorKey: 'estado',
      header: () => <div className="text-center">Estado</div>,
      size: 140,
      cell: ({ row }) => {
        const estado = row.original.estado
        const esEnProceso = estado === 'en_proceso' || estado === 'en_construccion'
        const esCompletado = estado === 'completado'

        return (
          <div className="flex justify-center">
            <div className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-[11px] whitespace-nowrap',
              esCompletado && 'bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800/50 text-green-700 dark:text-green-300',
              esEnProceso && 'bg-blue-100 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800/50 text-blue-700 dark:text-blue-300',
              !esEnProceso && !esCompletado && 'bg-gray-100 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300'
            )}>
              {esCompletado ? (
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              ) : esEnProceso ? (
                <Clock className="w-3 h-3 flex-shrink-0" />
              ) : null}
              <span>{formatearEstadoProyecto(estado)}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'manzanas',
      header: () => <div className="text-center">Manzanas</div>,
      size: 90,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
            <Building2 className="w-3 h-3 text-green-600 dark:text-green-400" />
            <span className="font-bold text-green-700 dark:text-green-300 text-xs">
              {row.original.manzanas.length}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'viviendas_resumen',
      header: () => <div className="text-center">Viviendas</div>,
      size: 200,
      cell: ({ row }) => {
        const totalViviendas = row.original.manzanas.reduce(
          (sum, m) => sum + m.totalViviendas,
          0
        )
        const totalVendidas = row.original.manzanas.reduce(
          (sum, m) => sum + m.viviendasVendidas,
          0
        )
        const totalAsignadas = 0 // TODO: Query real
        const totalDisponibles = totalViviendas - totalVendidas - totalAsignadas

        return (
          <div className="flex flex-col gap-1">
            {/* Estadísticas en grid compacto */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-500 font-medium mb-0.5">Disp.</div>
                <div className="font-bold text-xs text-gray-700 dark:text-gray-300">{totalDisponibles}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-500 font-medium mb-0.5">Asig.</div>
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400">{totalAsignadas}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-500 font-medium mb-0.5">Vend.</div>
                <div className="font-bold text-xs text-green-600 dark:text-green-400">{totalVendidas}</div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ width: `${totalViviendas > 0 ? (totalVendidas / totalViviendas) * 100 : 0}%` }}
                />
                <div
                  className="absolute top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                  style={{
                    left: `${totalViviendas > 0 ? (totalVendidas / totalViviendas) * 100 : 0}%`,
                    width: `${totalViviendas > 0 ? (totalAsignadas / totalViviendas) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 min-w-[35px] text-right">
                {totalVendidas + totalAsignadas}/{totalViviendas}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'acciones',
      header: () => <div className="text-center">Acciones</div>,
      size: 120,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          {onView && (
            <button
              onClick={() => onView(row.original)}
              className="group p-1.5 rounded-md bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 transition-all hover:scale-105"
              title="Ver detalles"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(row.original)}
              className="group p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all hover:scale-105"
              title="Editar proyecto"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(row.original.id)}
              className="group p-1.5 rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all hover:scale-105"
              title="Eliminar proyecto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={proyectos}
      gradientColor="green"
      pageSize={10}
      showPagination={true}
    />
  )
}
