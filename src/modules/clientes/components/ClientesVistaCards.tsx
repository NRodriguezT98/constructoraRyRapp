'use client'

import { motion } from 'framer-motion'

import { Pagination } from '@/shared/components/ui/Pagination'

import type { ClienteResumen } from '../types'

import { ClienteCardCompacta } from './cards/cliente-card-compacta'

interface ClientesVistaCardsProps {
  clientes: ClienteResumen[]
  isFetching: boolean
  paginaActual: number
  totalPaginas: number
  totalFiltrados: number
  itemsPorPagina: number
  canEdit: boolean
  canDelete: boolean
  canCreate: boolean
  onVer: (cliente: ClienteResumen) => void
  onEditar: (cliente: ClienteResumen) => void
  onEliminar: (cliente: ClienteResumen) => void
  onIniciarAsignacion: (cliente: ClienteResumen) => void
  onCambiarPagina: (pagina: number) => void
  onCambiarItemsPorPagina: (items: number) => void
}

export function ClientesVistaCards({
  clientes,
  isFetching,
  paginaActual,
  totalPaginas,
  totalFiltrados,
  itemsPorPagina,
  canEdit,
  canDelete,
  canCreate,
  onVer,
  onEditar,
  onEliminar,
  onIniciarAsignacion,
  onCambiarPagina,
  onCambiarItemsPorPagina,
}: ClientesVistaCardsProps) {
  return (
    <div className='space-y-4'>
      {/* Indicador sutil de recarga */}
      {isFetching && clientes.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50/80 py-2 backdrop-blur-xl dark:border-cyan-800 dark:bg-cyan-950/20'
        >
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent' />
          <span className='text-xs font-medium text-cyan-700 dark:text-cyan-400'>
            Actualizando datos...
          </span>
        </motion.div>
      ) : null}

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {clientes.map(cliente => (
          <ClienteCardCompacta
            key={cliente.id}
            cliente={cliente}
            vista='grid'
            tieneCedula={false}
            onVer={onVer}
            onEditar={canEdit ? onEditar : undefined}
            onEliminar={canDelete ? onEliminar : undefined}
            onIniciarAsignacion={canCreate ? onIniciarAsignacion : undefined}
          />
        ))}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 ? (
        <Pagination
          currentPage={paginaActual}
          totalPages={totalPaginas}
          totalItems={totalFiltrados}
          itemsPerPage={itemsPorPagina}
          onPageChange={onCambiarPagina}
          onItemsPerPageChange={onCambiarItemsPorPagina}
          itemsPerPageOptions={[12, 24, 48]}
        />
      ) : null}
    </div>
  )
}
