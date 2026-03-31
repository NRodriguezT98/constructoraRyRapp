/**
 * Card compacta de documento eliminado (Papelera)
 * Diseño de fila única con toda la info y acciones inline
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Clock, FileText, Home, RotateCcw, Trash2, User } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { DocumentoProyecto } from '@/modules/documentos/types/documento.types'
import type { TipoEntidad } from '@/modules/documentos/types/entidad.types'

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
    badge: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  },
  viviendas: {
    icono: Home,
    label: 'Viviendas',
    tipoEntidad: 'vivienda' as TipoEntidad,
    strip: 'from-orange-500 to-amber-600',
    icon: 'from-orange-500 to-amber-600',
    badge: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  clientes: {
    icono: User,
    label: 'Clientes',
    tipoEntidad: 'cliente' as TipoEntidad,
    strip: 'from-cyan-500 to-blue-600',
    icon: 'from-cyan-500 to-blue-600',
    badge: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
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

  const { isExpanded, versiones, isLoading, stats, toggleExpansion } = useVersionesEliminadasCard({
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
    <div className="group bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative">
      {/* Colored left accent strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${cfg.strip}`} />

      {/* Compact main row */}
      <div className="pl-4 pr-3 py-3 flex items-start gap-3">
        {/* Module icon */}
        <div
          className={`mt-0.5 w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.icon} flex items-center justify-center shadow-sm flex-shrink-0`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {documento.titulo}
            </h3>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${cfg.badge}`}
            >
              {cfg.label}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              v{documento.version}
            </span>
            {stats.totalVersiones > 1 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400">
                {stats.totalVersiones} versiones
              </span>
            )}
          </div>

          {/* Metadata chips */}
          <div className="flex items-center gap-x-3 gap-y-1 mt-1.5 flex-wrap">
            {documento.entidad_nombre ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                <User className="w-3 h-3 flex-shrink-0" />
                {documento.entidad_nombre}
              </span>
            ) : null}
            {documento.fecha_documento ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-500">
                <FileText className="w-3 h-3 flex-shrink-0" />
                {formatDateCompact(documento.fecha_documento)}
              </span>
            ) : null}
            {fechaEliminacion ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-red-500 dark:text-red-400">
                <Clock className="w-3 h-3 flex-shrink-0" />
                {fechaEliminacion}
              </span>
            ) : null}
            {documento.usuario ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                <User className="w-3 h-3 flex-shrink-0" />
                {documento.usuario.nombres} {documento.usuario.apellidos}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: compact action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0 self-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRestaurarTodo(documento.id, documento.titulo ?? '')}
            disabled={isDisabled}
            title="Restaurar documento"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${restaurando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Restaurar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEliminarDefinitivo(documento.id, documento.titulo ?? '')}
            disabled={isDisabled}
            title="Eliminar permanentemente"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eliminar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleExpansion}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isExpanded ? 'Contraer versiones' : 'Ver versiones'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
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
            className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
          >
            <VersionesList
              versiones={versiones as unknown as DocumentoConUsuario[]}
              modulo={modulo}
              isLoading={isLoading}
              seleccionadas={new Set()}
              onVersionToggle={() => {}}
              onSelectAll={() => {}}
              onDeselectAll={() => {}}
              onRestoreSelected={() => {}}
              totalVersiones={stats.totalVersiones}
              isRestoring={false}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
