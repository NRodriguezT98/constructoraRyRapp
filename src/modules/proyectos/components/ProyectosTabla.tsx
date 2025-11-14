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
import { useProyectoTabla } from '../hooks/useProyectoTabla'
import type { Proyecto } from '../types'
import { formatearEstadoProyecto } from '../utils/estado.utils'
import { proyectosTablaStyles as styles } from './ProyectosTabla.styles'

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
  // ✅ Componente interno para estadísticas de viviendas (usa hook)
  function ViviendaEstadisticas({ proyecto }: { proyecto: Proyecto }) {
    const stats = useProyectoTabla(proyecto)

    return (
      <div className={styles.viviendas.container}>
        {/* Estadísticas en grid compacto */}
        <div className={styles.statsGrid.container}>
          <div className={styles.statsGrid.cell}>
            <div className={styles.statsGrid.label}>Disp.</div>
            <div className={cn(styles.statsGrid.value, styles.statsGrid.disponibles)}>
              {stats.totalDisponibles}
            </div>
          </div>
          <div className={styles.statsGrid.cell}>
            <div className={styles.statsGrid.label}>Asig.</div>
            <div className={cn(styles.statsGrid.value, styles.statsGrid.asignadas)}>
              {stats.totalAsignadas}
            </div>
          </div>
          <div className={styles.statsGrid.cell}>
            <div className={styles.statsGrid.label}>Vend.</div>
            <div className={cn(styles.statsGrid.value, styles.statsGrid.vendidas)}>
              {stats.totalVendidas}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className={styles.progressBar.container}>
          <div className={styles.progressBar.track}>
            <div
              className={styles.progressBar.fillVendidas}
              style={{ width: `${stats.porcentajeVendidas}%` }}
            />
            <div
              className={styles.progressBar.fillAsignadas}
              style={{
                left: `${stats.porcentajeVendidas}%`,
                width: `${stats.porcentajeAsignadas}%`
              }}
            />
          </div>
          <span className={styles.progressBar.label}>
            {stats.totalVendidas + stats.totalAsignadas}/{stats.totalViviendas}
          </span>
        </div>
      </div>
    )
  }

  const columns: ColumnDef<Proyecto>[] = [
    {
      accessorKey: 'nombre',
      header: () => <div className={styles.header.wrapper}>Proyecto</div>,
      size: 220,
      cell: ({ row }) => (
        <div className={styles.nombre.container}>
          <div className={styles.iconContainer}>
            <Building2 className={styles.iconSvg} />
          </div>
          <span className={styles.nombre.text}>
            {row.original.nombre}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'ubicacion',
      header: () => <div className={styles.header.wrapper}>Ubicación</div>,
      size: 180,
      cell: ({ row }) => (
        <div className={styles.ubicacion.container}>
          <MapPin className={styles.ubicacion.icon} />
          <span className={styles.ubicacion.text}>{row.original.ubicacion}</span>
        </div>
      ),
    },
    {
      accessorKey: 'estado',
      header: () => <div className={styles.header.wrapper}>Estado</div>,
      size: 140,
      cell: ({ row }) => {
        const estado = row.original.estado
        const esEnProceso = estado === 'en_proceso' || estado === 'en_construccion'
        const esCompletado = estado === 'completado'

        return (
          <div className={styles.cell.center}>
            <div className={cn(
              styles.badge.base,
              esCompletado && styles.badge.completado,
              esEnProceso && styles.badge.enProceso,
              !esEnProceso && !esCompletado && styles.badge.default
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
      header: () => <div className={styles.header.wrapper}>Manzanas</div>,
      size: 90,
      cell: ({ row }) => (
        <div className={styles.cell.center}>
          <div className={styles.manzanasBadge}>
            <Building2 className={styles.manzanasIcon} />
            <span className={styles.manzanasCount}>
              {row.original.manzanas.length}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'viviendas_resumen',
      header: () => <div className={styles.header.wrapper}>Viviendas</div>,
      size: 200,
      cell: ({ row }) => <ViviendaEstadisticas proyecto={row.original} />,
    },
    {
      id: 'acciones',
      header: () => <div className={styles.header.wrapper}>Acciones</div>,
      size: 120,
      cell: ({ row }) => (
        <div className={styles.actions.container}>
          {onView && (
            <button
              onClick={() => onView(row.original)}
              className={cn(styles.actions.button.base, styles.actions.button.view)}
              title="Ver detalles"
            >
              <Eye className={styles.actions.icon} />
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(row.original)}
              className={cn(styles.actions.button.base, styles.actions.button.edit)}
              title="Editar proyecto"
            >
              <Edit2 className={styles.actions.icon} />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(row.original.id)}
              className={cn(styles.actions.button.base, styles.actions.button.delete)}
              title="Eliminar proyecto"
            >
              <Trash2 className={styles.actions.icon} />
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
