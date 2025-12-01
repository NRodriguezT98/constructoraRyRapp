/**
 * ClientesTabla - Vista de tabla para clientes
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Usa DataTable genérico
 * ✅ Columnas específicas de Clientes
 * ✅ Diseño compacto y alineado
 * ✅ Colores purple/violet del módulo
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'
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
    UserX
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

        return (
          <div className={styles.iconCell.container}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isActivo
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-cyan-500 to-blue-600'
            }`}>
              {isActivo ? (
                <UserCheck className="w-3.5 h-3.5 text-white" />
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
        const isInactivo = estado === 'Inactivo'
        const isPropietario = estado === 'Propietario'

        const Icon = isInteresado
          ? Heart
          : isActivo
          ? UserCheck
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

    // 5. PROYECTO (centrado y compacto)
    {
      id: 'proyecto',
      header: 'Proyecto',
      size: 130,
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
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-900 dark:text-white" title={proyecto}>
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

    // 6. VIVIENDA (formato compacto con badge de estado)
    {
      id: 'vivienda',
      header: 'Vivienda',
      size: 100,
      cell: ({ row }) => {
        const cliente = row.original
        let viviendaCompacta = null
        let esInteres = false

        if (cliente.estado === 'Activo' && cliente.vivienda) {
          const manzana = cliente.vivienda.nombre_manzana || ''
          const numero = cliente.vivienda.numero_vivienda || ''
          viviendaCompacta = `${manzana}-${numero}`
          esInteres = false
        } else if (cliente.estado === 'Interesado' && cliente.interes) {
          const manzana = cliente.interes.nombre_manzana || ''
          const numero = cliente.interes.numero_vivienda || ''
          viviendaCompacta = `${manzana}-${numero}`
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

    // 7. VALORES (3 filas: Total / Abonado / Saldo)
    {
      id: 'saldo',
      header: 'Valores',
      size: 140,
      cell: ({ row }) => {
        const cliente = row.original

        if (cliente.estado === 'Activo' && cliente.vivienda) {
          const valorTotal = cliente.vivienda.valor_total || 0
          const totalAbonado = cliente.vivienda.total_abonado || 0
          const saldo = cliente.vivienda.saldo_pendiente || 0

          const formatearValor = (valor: number) => {
            return new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(valor).replace(/\s/g, '')
          }

          const porcentajePagado = valorTotal > 0 ? ((totalAbonado / valorTotal) * 100).toFixed(1) : '0'

          return (
            <div className="flex flex-col gap-1 py-1.5" title={`Progreso de pago: ${porcentajePagado}%`}>
              {/* Total Vivienda */}
              <div className="flex items-center justify-between gap-2 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total:</span>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  {formatearValor(valorTotal)}
                </span>
              </div>

              {/* Total Abonado */}
              <div className="flex items-center justify-between gap-2 px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">Abonado:</span>
                <span className="text-[10px] font-bold text-green-700 dark:text-green-300">
                  {formatearValor(totalAbonado)}
                </span>
              </div>

              {/* Saldo Pendiente */}
              <div className={`flex items-center justify-between gap-2 px-2 py-0.5 rounded-md border ${
                saldo > 0
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30'
                  : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30'
              }`}>
                <span className={`text-[10px] font-semibold ${saldo > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>Saldo:</span>
                <span className={`text-[10px] font-bold ${saldo > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                  {formatearValor(saldo)}
                </span>
              </div>
            </div>
          )
        }

        return (
          <div className={styles.cell.center}>
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">N/A</span>
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
        searchPlaceholder="Buscar clientes..."
        noResultsMessage="No se encontraron clientes"
      />
    </div>
  )
}
