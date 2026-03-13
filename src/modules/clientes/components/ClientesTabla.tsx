/**
 * ClientesTabla - Vista de tabla para clientes
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Usa DataTable genérico
 * ✅ Columnas específicas de Clientes
 * ✅ Diseño compacto y alineado
 * ✅ Colores purple/violet del módulo
 */

'use client'

import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import {
    Building2,
    Edit2,
    Eye,
    Heart,
    Phone,
    Trash2,
    User,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react'

import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { DataTable } from '@/shared/components/table/DataTable'
import { cn } from '@/shared/utils/helpers'

import type { ClienteResumen } from '../types'

interface ClientesTablaProps {
  clientes: ClienteResumen[]
  onView?: (cliente: ClienteResumen) => void
  onEdit?: (cliente: ClienteResumen) => void
  onDelete?: (id: string) => void
  canEdit?: boolean
  canDelete?: boolean
  initialSorting?: SortingState
}

// Estilos compactos del módulo
const styles = {
  // Container para células con icono
  iconCell: {
    container: 'flex items-center gap-1.5',
    icon: 'w-3 h-3 flex-shrink-0',
    text: 'text-xs font-medium text-gray-700 dark:text-gray-300 truncate',
  },

  // Badges de estado
  badge: {
    base: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold whitespace-nowrap',
    interesado: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30',
    activo: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30',
    renuncio: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30', // ⭐ NUEVO
    inactivo: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md shadow-gray-500/30',
    propietario: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30',
  },

  // Badge de origen (cyan/blue del módulo)
  origenBadge: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold',

  // Células genéricas
  cell: {
    center: 'flex items-center justify-center',
    textCompact: 'text-xs font-medium text-gray-700 dark:text-gray-300 truncate',
  },

  // Acciones (cyan/blue del módulo)
  actions: {
    container: 'flex items-center justify-center gap-1',
    button: 'p-1.5 rounded-lg transition-all',
    view: 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30',
    edit: 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    delete: 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30',
  },
}

export function ClientesTabla({
  clientes,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  initialSorting,
}: ClientesTablaProps) {
  const columns: ColumnDef<ClienteResumen>[] = [
    // 1. CLIENTE (nombre formateado con Title Case - SIN TRUNCAR)
    {
      accessorKey: 'nombre_completo',
      header: 'Cliente',
      size: 200,
      cell: ({ row }) => {
        const nombreCompleto = formatNombreCompleto(row.original.nombre_completo)
        const estado = row.original.estado
        const isActivo = estado === 'Activo'
        const isRenuncio = estado === 'Renunció' // ⭐ NUEVO

        return (
          <div className={styles.iconCell.container}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isActivo
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : isRenuncio
                ? 'bg-gradient-to-br from-red-500 to-rose-600' // ⭐ NUEVO - Rojo para renunció
                : 'bg-gradient-to-br from-cyan-500 to-blue-600'
            }`}>
              {isActivo ? (
                <UserCheck className="w-3.5 h-3.5 text-white" />
              ) : isRenuncio ? (
                <UserX className="w-3.5 h-3.5 text-white" /> // ⭐ Usuario con X rojo
              ) : (
                <User className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white" title={nombreCompleto}>
              {nombreCompleto}
            </span>
          </div>
        )
      },
    },

    // 2. DOCUMENTO (CC 12345678)
    {
      accessorKey: 'numero_documento',
      header: 'Documento',
      size: 110,
      cell: ({ row }) => (
        <div className={styles.cell.center}>
          <span className={styles.cell.textCompact}>
            CC {row.original.numero_documento}
          </span>
        </div>
      ),
    },

    // 3. TELÉFONO
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      size: 110,
      cell: ({ row }) => {
        const telefono = row.original.telefono
        return telefono ? (
          <div className={styles.iconCell.container}>
            <Phone className={`${styles.iconCell.icon} text-purple-600 dark:text-purple-400`} />
            <span className={styles.iconCell.text} title={telefono}>
              {telefono}
            </span>
          </div>
        ) : (
          <div className={styles.cell.center}>
            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
          </div>
        )
      },
    },

    // 4. ESTADO (badge con colores)
    {
      accessorKey: 'estado',
      header: 'Estado',
      size: 120,
      cell: ({ row }) => {
        const estado = row.original.estado
        const isInteresado = estado === 'Interesado'
        const isActivo = estado === 'Activo'
        const isRenuncio = estado === 'Renunció' // ⭐ NUEVO
        const isInactivo = estado === 'Inactivo'
        const isPropietario = estado === 'Propietario'

        const Icon = isInteresado
          ? Heart
          : isActivo
          ? UserCheck
          : isRenuncio
          ? UserX // ⭐ Usuario con X (igual que UserCheck pero rojo)
          : isInactivo
          ? UserX
          : Users

        return (
          <div className={styles.cell.center}>
            <div
              className={cn(
                styles.badge.base,
                isInteresado && styles.badge.interesado,
                isActivo && styles.badge.activo,
                isRenuncio && styles.badge.renuncio, // ⭐ NUEVO
                isInactivo && styles.badge.inactivo,
                isPropietario && styles.badge.propietario
              )}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span>{estado}</span>
            </div>
          </div>
        )
      },
    },

    // 5. PROYECTO (nowrap — sin salto de línea, sin puntos suspensivos)
    {
      id: 'proyecto',
      header: 'Proyecto',
      size: 160,
      cell: ({ row }) => {
        const cliente = row.original
        const proyecto = cliente.estado === 'Activo'
          ? cliente.vivienda?.nombre_proyecto
          : cliente.estado === 'Interesado'
          ? cliente.interes?.nombre_proyecto
          : null

        return (
          <div className={styles.cell.center}>
            {proyecto ? (
              <div className="flex items-center gap-1.5 max-w-full overflow-hidden">
                <Building2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span
                  className="text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap overflow-hidden"
                  title={proyecto}
                >
                  {proyecto}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
            )}
          </div>
        )
      },
    },

    // 6. VIVIENDA (formato compacto con badge de estado - SORTABLE)
    {
      id: 'vivienda',
      header: 'Vivienda',
      size: 100,
      enableSorting: true,
      // AccessorFn para que TanStack Table reconozca el valor
      accessorFn: (row) => {
        if (row.estado === 'Activo' && row.vivienda) {
          const manzana = row.vivienda.nombre_manzana || ''
          const numero = row.vivienda.numero_vivienda || ''
          return `${manzana}${numero}`
        } else if (row.estado === 'Interesado' && row.interes) {
          const manzana = row.interes.nombre_manzana || ''
          const numero = row.interes.numero_vivienda || ''
          return `${manzana}${numero}`
        }
        return ''
      },
      sortingFn: (rowA, rowB) => {
        const clienteA = rowA.original
        const clienteB = rowB.original

        // Obtener identificador de vivienda (manzana + numero)
        const getViviendaId = (cliente: ClienteResumen) => {
          if (cliente.estado === 'Activo' && cliente.vivienda) {
            const manzana = cliente.vivienda.nombre_manzana || ''
            const numero = cliente.vivienda.numero_vivienda || ''
            return `${manzana}${numero}`
          } else if (cliente.estado === 'Interesado' && cliente.interes) {
            const manzana = cliente.interes.nombre_manzana || ''
            const numero = cliente.interes.numero_vivienda || ''
            return `${manzana}${numero}`
          }
          return ''
        }

        const viviendaA = getViviendaId(clienteA)
        const viviendaB = getViviendaId(clienteB)

        // Si alguno está vacío, ponerlo al final
        if (!viviendaA && viviendaB) return 1
        if (viviendaA && !viviendaB) return -1
        if (!viviendaA && !viviendaB) return 0

        // Ordenar alfabéticamente (A1, A2, A3, B1, B2...)
        return viviendaA.localeCompare(viviendaB, undefined, { numeric: true })
      },
      cell: ({ row }) => {
        const cliente = row.original
        let viviendaCompacta = null
        let esInteres = false

        if (cliente.estado === 'Activo' && cliente.vivienda) {
          const manzana = cliente.vivienda.nombre_manzana || ''
          const numero = cliente.vivienda.numero_vivienda || ''
          viviendaCompacta = `${manzana}${numero}`
          esInteres = false
        } else if (cliente.estado === 'Interesado' && cliente.interes) {
          const manzana = cliente.interes.nombre_manzana || ''
          const numero = cliente.interes.numero_vivienda || ''
          viviendaCompacta = `${manzana}${numero}`
          esInteres = true
        }

        return viviendaCompacta ? (
          <div className="flex items-center justify-center h-full">
            {esInteres ? (
              // Badge azul con icono corazón para INTERESADO
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/30 px-2.5 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 shadow-sm">
                <Heart className="w-3.5 h-3.5" />
                {viviendaCompacta}
              </span>
            ) : (
              // Badge verde con checkmark para ACTIVO
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/30 px-2.5 py-1.5 rounded-lg border border-green-300 dark:border-green-800 shadow-sm">
                <UserCheck className="w-3.5 h-3.5" />
                {viviendaCompacta}
              </span>
            )}
          </div>
        ) : (
          <div className={styles.cell.center}>
            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
          </div>
        )
      },
    },

    // 7. VALORES — Saldo héroe + barra de progreso compacta
    {
      id: 'saldo',
      header: 'Saldo / Progreso',
      size: 160,
      cell: ({ row }) => {
        const cliente = row.original

        if (cliente.estado === 'Activo' && cliente.vivienda) {
          const valorTotal = cliente.vivienda.valor_total || 0
          const totalAbonado = cliente.vivienda.total_abonado || 0
          const saldo = cliente.vivienda.saldo_pendiente || 0
          const porcentaje = valorTotal > 0 ? Math.round((totalAbonado / valorTotal) * 100) : 0
          const pagadoCompleto = saldo === 0 && valorTotal > 0

          const fmt = (v: number) =>
            new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(v).replace(/\s/g, '')

          return (
            <div className="py-1.5 space-y-1.5">
              {/* Saldo — valor principal */}
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">Saldo</span>
                <span className={`text-xs font-bold ${
                  pagadoCompleto
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {pagadoCompleto ? '✓ Pagado' : fmt(saldo)}
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                    porcentaje >= 100
                      ? 'bg-emerald-500'
                      : porcentaje >= 50
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(porcentaje, 100)}%` }}
                />
              </div>

              {/* Total + % */}
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-[10px] text-gray-400 dark:text-gray-500" title={`Total: ${fmt(valorTotal)}`}>
                  {fmt(valorTotal)}
                </span>
                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  {porcentaje}%
                </span>
              </div>
            </div>
          )
        }

        return (
          <div className={styles.cell.center}>
            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
          </div>
        )
      },
    },

    // 8. ACCIONES (botones contextuales)
    {
      id: 'acciones',
      header: 'Acciones',
      size: 100,
      cell: ({ row }) => (
        <div className={styles.actions.container}>
          {onView && (
            <button
              onClick={() => onView(row.original)}
              className={cn(styles.actions.button, styles.actions.view)}
              title="Ver detalle"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(row.original)}
              className={cn(styles.actions.button, styles.actions.edit)}
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(row.original.id)}
              className={cn(styles.actions.button, styles.actions.delete)}
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="clientes-tabla-wrapper w-full">
      <style jsx>{`
        .clientes-tabla-wrapper :global(thead) {
          background: linear-gradient(135deg, #0891b2 0%, #6366f1 50%, #8b5cf6 100%) !important;
        }
        .clientes-tabla-wrapper :global(thead th) {
          color: white !important;
          font-weight: 600 !important;
        }
        .clientes-tabla-wrapper :global(thead button) {
          color: white !important;
        }
        .clientes-tabla-wrapper :global(thead .opacity-40) {
          opacity: 0.6 !important;
        }
        .clientes-tabla-wrapper :global(tbody tr:hover) {
          background: linear-gradient(90deg, rgba(8, 145, 178, 0.05) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(139, 92, 246, 0.05) 100%) !important;
        }
        .clientes-tabla-wrapper :global(tbody tr) {
          transition: all 0.2s ease;
        }
      `}</style>
      <DataTable
        columns={columns}
        data={clientes}
        initialSorting={initialSorting}
      />
    </div>
  )
}
