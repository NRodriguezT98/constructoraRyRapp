/**
 * PermisosView.styles.ts — Estilos para la vista de administración de permisos RBAC
 */

export const permisosViewStyles = {
  // Contenedor principal
  container: 'space-y-4',

  // Encabezado
  header: {
    wrapper: 'flex items-center justify-between',
    left: 'flex items-center gap-3',
    iconWrapper:
      'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30',
    title: 'text-base font-bold text-gray-900 dark:text-white',
    subtitle: 'text-xs text-gray-500 dark:text-gray-400 mt-0.5',
    badge:
      'hidden items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 dark:border-indigo-800/50 dark:bg-indigo-900/20 sm:flex',
    badgeText: 'text-xs font-medium text-indigo-700 dark:text-indigo-300',
  },

  // Barra de filtros
  filtros: {
    wrapper:
      'backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-lg flex flex-wrap items-center gap-2',
    searchWrapper: 'relative min-w-[200px] flex-1',
    searchIcon:
      'pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400',
    searchInput:
      'w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm placeholder:text-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200',
    select:
      'rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-1.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200',
    clearButton:
      'rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20',
  },

  // Tabla
  tabla: {
    wrapper:
      'overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg',
    overflow: 'overflow-x-auto',
    table: 'w-full text-sm',
    thead:
      'border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/60',
    thModulo:
      'sticky left-0 z-20 border-r border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-36',
    thAccion:
      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-28',
    thRol:
      'px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[110px]',
    thAdmin:
      'px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 min-w-[110px]',
    tbody: 'divide-y divide-gray-100 dark:divide-gray-700/50',
    tr: 'transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/30',
    tdModulo:
      'sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 px-4 py-2.5 align-top font-semibold text-gray-800 dark:text-gray-100 text-xs uppercase tracking-wide',
    tdAccion:
      'px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300',
    tdCell: 'px-4 py-2.5 text-center',
    // Botón permiso activo
    toggleOn:
      'inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm transition-all hover:bg-indigo-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
    // Botón permiso inactivo
    toggleOff:
      'inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 transition-all hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400/40',
    // Administrador siempre activo (no editable)
    toggleAdmin:
      'inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-200 dark:bg-indigo-900/50 text-indigo-400 dark:text-indigo-500 cursor-not-allowed opacity-70',
    // Celda vacía (no aplica)
    toggleEmpty: 'text-gray-200 dark:text-gray-700',
  },

  // Footer / leyenda
  footer: {
    wrapper:
      'flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-900/40 px-4 py-3 text-xs',
    legend: 'flex items-center gap-4',
    legendItem: 'flex items-center gap-1.5 text-gray-500 dark:text-gray-400',
    legendItemActive:
      'flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium',
    adminNote: 'text-gray-400 dark:text-gray-500 italic',
  },

  // Estados especiales
  loadingWrapper: 'flex items-center justify-center p-16',
  loadingSpinner:
    'h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600',
  errorWrapper:
    'rounded-xl border border-red-200 bg-red-50/80 dark:border-red-800/50 dark:bg-red-900/20 p-6',
  errorInner: 'flex items-center gap-3',
  errorTitle: 'font-semibold text-red-900 dark:text-red-100 text-sm',
  errorText: 'text-xs text-red-700 dark:text-red-300 mt-0.5',
  emptyWrapper: 'py-12 text-center',
  emptyText: 'text-sm text-gray-400 dark:text-gray-500',
} as const

// ── Exportaciones para PermisosView v4 (accordion + DnD) ─────────────────────

import type { Rol } from '../types'

/** Color de acento (borde izquierdo) por módulo */
export const MODULE_ACCENT: Record<string, string> = {
  proyectos: 'bg-emerald-500',
  viviendas: 'bg-amber-500',
  clientes: 'bg-cyan-500',
  documentos: 'bg-rose-500',
  negociaciones: 'bg-purple-500',
  abonos: 'bg-indigo-500',
  usuarios: 'bg-blue-500',
  auditorias: 'bg-violet-500',
  reportes: 'bg-teal-500',
  administracion: 'bg-gray-500',
}

/** Clases del wrapper de ícono por módulo */
export const MODULE_ICON_BG: Record<string, string> = {
  proyectos:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  viviendas:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  clientes: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400',
  documentos:
    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
  negociaciones:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  abonos:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  usuarios: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  auditorias:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  reportes: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
  administracion:
    'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-400',
}

/** Tokens visuales por rol (excluye Administrador) */
export const ROL_VISUAL: Record<
  Exclude<Rol, 'Administrador'>,
  {
    gradient: string
    bg: string
    header: string
    toggleOn: string
  }
> = {
  Contabilidad: {
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    header: 'text-sky-600 dark:text-sky-400',
    toggleOn:
      'bg-sky-500 text-white hover:bg-sky-600 focus:ring-2 focus:ring-sky-500/30',
  },
  'Administrador de Obra': {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    header: 'text-amber-600 dark:text-amber-400',
    toggleOn:
      'bg-amber-500 text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-500/30',
  },
  Gerencia: {
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    header: 'text-violet-600 dark:text-violet-400',
    toggleOn:
      'bg-violet-500 text-white hover:bg-violet-600 focus:ring-2 focus:ring-violet-500/30',
  },
}

/** Estilos compartidos de filas de la tabla */
export const sharedStyles = {
  trModule:
    'bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 first:border-t-0',
  trAction: 'transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-900/30',
  toggleBase:
    'inline-flex h-7 w-7 items-center justify-center rounded-lg shadow-sm transition-all hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  toggleOff:
    'bg-gray-200 text-gray-400 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400/30',
  toggleAdmin:
    'inline-flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-lg bg-indigo-100 text-indigo-400 opacity-70 dark:bg-indigo-900/40 dark:text-indigo-500',
} as const
