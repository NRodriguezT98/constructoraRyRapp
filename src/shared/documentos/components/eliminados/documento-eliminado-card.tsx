/**
 * Card compacta de documento eliminado (Papelera)
 * Diseño de fila única con toda la info y acciones inline
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Home,
  RotateCcw,
  Trash2,
  User,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'
import type { TipoEntidad } from '@/shared/documentos/types/entidad.types'

import { useVersionesEliminadasCard } from '../../hooks/useVersionesEliminadasCard'

import { VersionesList } from './components'

type DocumentoConUsuario = DocumentoProyecto & {
  entidad_nombre?: string
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }
}

interface DocumentoEliminadoCardProps {
  documento: DocumentoConUsuario
  modulo: 'proyectos' | 'viviendas' | 'clientes'
  onRestaurarTodo: (id: string, titulo: string) => void
  onEliminarDefinitivo: (id: string, titulo: string) => void
  restaurando: boolean
  eliminando: boolean
}

const MODULO_CFG = {
  proyectos: {
    icono: FileText,
    label: 'Proyectos',
    tipoEntidad: 'proyecto' as TipoEntidad,
    strip: 'from-green-500 to-emerald-600',
    icon: 'from-green-500 to-emerald-600',
    badge:
      'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  },
  viviendas: {
    icono: Home,
    label: 'Viviendas',
    tipoEntidad: 'vivienda' as TipoEntidad,
    strip: 'from-orange-500 to-amber-600',
    icon: 'from-orange-500 to-amber-600',
    badge:
      'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  clientes: {
    icono: User,
    label: 'Clientes',
    tipoEntidad: 'cliente' as TipoEntidad,
    strip: 'from-cyan-500 to-blue-600',
    icon: 'from-cyan-500 to-blue-600',
    badge:
      'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  },
} as const

export function DocumentoEliminadoCard({
  documento,
  modulo,
  onRestaurarTodo,
  onEliminarDefinitivo,
  restaurando,
  eliminando,
}: DocumentoEliminadoCardProps) {
  const cfg = MODULO_CFG[modulo]
  const Icon = cfg.icono
  const isDisabled = restaurando || eliminando

  const { isExpanded, versiones, isLoading, stats, toggleExpansion } =
    useVersionesEliminadasCard({
      documentoId: documento.id,
      documentoTitulo: documento.titulo ?? '',
      modulo,
      tipoEntidad: cfg.tipoEntidad,
    })

  const fechaEliminacion = documento.fecha_actualizacion
    ? new Date(documento.fecha_actualizacion).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className='group relative overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800/90'>
      {/* Colored left accent strip */}
      <div
        className={`absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b ${cfg.strip}`}
      />

      {/* Compact main row */}
      <div className='flex items-start gap-3 py-3 pl-4 pr-3'>
        {/* Module icon */}
        <div
          className={`mt-0.5 h-8 w-8 rounded-lg bg-gradient-to-br ${cfg.icon} flex flex-shrink-0 items-center justify-center shadow-sm`}
        >
          <Icon className='h-4 w-4 text-white' />
        </div>

        {/* Content */}
        <div className='min-w-0 flex-1'>
          {/* Title + badges */}
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
              {documento.titulo}
            </h3>
            <span
              className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.badge}`}
            >
              {cfg.label}
            </span>
            <span className='inline-flex items-center rounded border border-red-200 bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'>
              v{documento.version}
            </span>
            {stats.totalVersiones > 1 && (
              <span className='inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-700/60 dark:text-gray-400'>
                {stats.totalVersiones} versiones
              </span>
            )}
          </div>

          {/* Metadata chips */}
          <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1'>
            {documento.entidad_nombre ? (
              <span className='inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-400'>
                <User className='h-3 w-3 flex-shrink-0' />
                {documento.entidad_nombre}
              </span>
            ) : null}
            {documento.fecha_documento ? (
              <span className='inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-500'>
                <FileText className='h-3 w-3 flex-shrink-0' />
                {formatDateCompact(documento.fecha_documento)}
              </span>
            ) : null}
            {fechaEliminacion ? (
              <span className='inline-flex items-center gap-1 text-[11px] text-red-500 dark:text-red-400'>
                <Clock className='h-3 w-3 flex-shrink-0' />
                {fechaEliminacion}
              </span>
            ) : null}
            {documento.usuario ? (
              <span className='inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400'>
                <User className='h-3 w-3 flex-shrink-0' />
                {documento.usuario.nombres} {documento.usuario.apellidos}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: compact action buttons */}
        <div className='flex flex-shrink-0 items-center gap-1.5 self-center'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onRestaurarTodo(documento.id, documento.titulo ?? '')
            }
            disabled={isDisabled}
            title='Restaurar documento'
            className='inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
          >
            <RotateCcw
              className={`h-3.5 w-3.5 ${restaurando ? 'animate-spin' : ''}`}
            />
            <span className='hidden sm:inline'>Restaurar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onEliminarDefinitivo(documento.id, documento.titulo ?? '')
            }
            disabled={isDisabled}
            title='Eliminar permanentemente'
            className='inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
          >
            <Trash2 className='h-3.5 w-3.5' />
            <span className='hidden sm:inline'>Eliminar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleExpansion}
            className='rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
            aria-label={isExpanded ? 'Contraer versiones' : 'Ver versiones'}
          >
            {isExpanded ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </motion.button>
        </div>
      </div>

      {/* Expandable versiones */}
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden border-t border-gray-200 dark:border-gray-700'
          >
            <VersionesList
              versiones={versiones as unknown as DocumentoConUsuario[]}
              modulo={modulo}
              isLoading={isLoading}
              seleccionadas={new Set()}
              onVersionToggle={() => {
                /* noop: eliminados no permiten toggle de versiones */
              }}
              onSelectAll={() => {
                /* noop: eliminados no permiten selección */
              }}
              onDeselectAll={() => {
                /* noop: eliminados no permiten selección */
              }}
              onRestoreSelected={() => {
                /* noop: gestión de restauración se maneja externamente */
              }}
              totalVersiones={stats.totalVersiones}
              isRestoring={false}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
