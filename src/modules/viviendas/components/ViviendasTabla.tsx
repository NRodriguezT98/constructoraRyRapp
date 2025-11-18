/**
 * ViviendasTabla - Vista de tabla para viviendas
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Usa DataTable genérico
 * ✅ Columnas específicas de Viviendas
 * ✅ Diseño compacto y alineado
 * ✅ Colores naranja/ámbar del módulo
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Building2, CheckCircle2, Clock, Edit2, Eye, Home, Trash2 } from 'lucide-react'

import { DataTable } from '@/shared/components/table/DataTable'
import { cn } from '@/shared/utils/helpers'
import type { Vivienda } from '../types'
import { viviendasTablaStyles as styles } from './ViviendasTabla.styles'

interface ViviendasTablaProps {
  viviendas: Vivienda[]
  onView?: (vivienda: Vivienda) => void
  onEdit?: (vivienda: Vivienda) => void
  onDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function ViviendasTabla({
  viviendas,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ViviendasTablaProps) {
  const columns: ColumnDef<Vivienda>[] = [
    // Identificador Completo (Manzana + Número) - COMPACTO
    {
      id: 'identificador',
      header: 'Vivienda',
      size: 130,
      accessorFn: (row) => `${row.manzanas?.nombre || ''} ${row.numero}`,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const manzanaA = rowA.original.manzanas?.nombre || ''
        const manzanaB = rowB.original.manzanas?.nombre || ''
        const numeroA = rowA.original.numero
        const numeroB = rowB.original.numero

        // Ordenar primero por manzana, luego por número
        if (manzanaA !== manzanaB) {
          return manzanaA.localeCompare(manzanaB)
        }
        return numeroA - numeroB
      },
      cell: ({ row }) => {
        const identificador = `Mz. ${row.original.manzanas?.nombre || 'N/A'} Casa ${row.original.numero}`
        return (
          <div className={styles.numero.container}>
            <div className={styles.iconContainer}>
              <Home className={styles.iconSvg} />
            </div>
            <span className={styles.numero.text}>{identificador}</span>
          </div>
        )
      },
    },

    // Proyecto (solo nombre) - COMPACTO
    {
      id: 'proyecto',
      header: 'Proyecto',
      size: 140,
      accessorFn: (row) => row.manzanas?.proyectos?.nombre || '',
      cell: ({ row }) => {
        const nombreProyecto = row.original.manzanas?.proyectos?.nombre || 'Sin proyecto'
        return (
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <span className={styles.proyecto.nombre} title={nombreProyecto}>
              {nombreProyecto}
            </span>
          </div>
        )
      },
    },

    // Nomenclatura - MÁS COMPACTO
    {
      accessorKey: 'nomenclatura',
      header: 'Nomenclatura',
      size: 110,
      cell: ({ row }) => (
        <div className={styles.cell.center}>
          <span className={styles.cell.textCompact} title={row.original.nomenclatura || 'N/A'}>
            {row.original.nomenclatura || 'N/A'}
          </span>
        </div>
      ),
    },

    // Matrícula Inmobiliaria - MÁS COMPACTO
    {
      accessorKey: 'matricula_inmobiliaria',
      header: 'Matrícula',
      size: 100,
      cell: ({ row }) => (
        <div className={styles.cell.center}>
          <span className={styles.cell.textCompact} title={row.original.matricula_inmobiliaria || 'N/A'}>
            {row.original.matricula_inmobiliaria || 'N/A'}
          </span>
        </div>
      ),
    },

    // Tipo de Vivienda - REDUCIDO
    {
      accessorKey: 'tipo_vivienda',
      header: 'Tipo',
      size: 80,
      cell: ({ row }) => (
        <div className={styles.cell.center}>
          <span className={styles.cell.textCompact}>
            {row.original.tipo_vivienda || 'N/A'}
          </span>
        </div>
      ),
    },

    // Estado - COMPACTO
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 110,
      cell: ({ row }) => {
        const estado = row.original.estado
        const esDisponible = estado === 'Disponible'
        const esAsignada = estado === 'Asignada'
        const esEntregada = estado === 'Entregada'

        return (
          <div className={styles.cell.center}>
            <div
              className={cn(
                styles.badge.base,
                esDisponible && styles.badge.disponible,
                esAsignada && styles.badge.asignada,
                esEntregada && styles.badge.entregada,
                !esDisponible && !esAsignada && !esEntregada && styles.badge.default
              )}
            >
              {esDisponible ? (
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              ) : esAsignada ? (
                <Clock className="w-3 h-3 flex-shrink-0" />
              ) : esEntregada ? (
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              ) : null}
              <span>{estado}</span>
            </div>
          </div>
        )
      },
    },

    // Valor Total - COMPACTO
    {
      accessorKey: 'valor_total',
      header: 'Valor',
      size: 120,
      cell: ({ row }) => {
        const valorFormateado = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(row.original.valor_total)
        return (
          <div className={styles.cell.center}>
            <span className={styles.valor.text}>{valorFormateado}</span>
          </div>
        )
      },
    },

    // Progreso de Pagos (con tooltip) - COMPACTO
    {
      id: 'progreso_pagos',
      header: 'Pagos',
      size: 100,
      accessorFn: (row) => row.porcentaje_pagado || 0,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const porcentajeA = rowA.original.porcentaje_pagado || 0
        const porcentajeB = rowB.original.porcentaje_pagado || 0
        return porcentajeA - porcentajeB
      },
      cell: ({ row }) => {
        const estaAsignada = row.original.estado === 'Asignada' || row.original.estado === 'Entregada'
        const porcentajePagado = row.original.porcentaje_pagado || 0
        const totalAbonadoFormateado = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(row.original.total_abonado || 0)
        return (
          <div className={styles.progressBar.container}>
            {estaAsignada ? (
              // Vivienda asignada - mostrar progreso real
              <div
                className="relative group"
                title={`Total abonado: ${totalAbonadoFormateado}`}
              >
                <div className={styles.progressBar.track}>
                  <div
                    className={styles.progressBar.fill}
                    style={{ width: `${porcentajePagado}%` }}
                  />
                </div>
                <span className={styles.progressBar.label}>{porcentajePagado}%</span>

                {/* Tooltip al hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {totalAbonadoFormateado}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700" />
                </div>
              </div>
            ) : (
              // Vivienda NO asignada - barra oscura con mensaje
              <div
                className="relative group"
                title="Vivienda no asignada"
              >
                <div className={styles.progressBar.trackDisabled}>
                  <div className={styles.progressBar.fillDisabled} style={{ width: '0%' }} />
                </div>
                <span className={styles.progressBar.labelDisabled}>0%</span>

                {/* Tooltip al hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Sin asignar
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700" />
                </div>
              </div>
            )}
          </div>
        )
      },
    },

    // Acciones - COMPACTO
    {
      id: 'acciones',
      header: 'Acciones',
      size: 100,
      enableSorting: false,
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
              title="Editar"
            >
              <Edit2 className={styles.actions.icon} />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(row.original.id)}
              className={cn(styles.actions.button.base, styles.actions.button.delete)}
              title="Eliminar"
            >
              <Trash2 className={styles.actions.icon} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} data={viviendas} gradientColor="orange" />
}
