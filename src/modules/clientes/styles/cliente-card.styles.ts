/**
 * Estilos centralizados para ClienteCard
 * Siguiendo EXACTAMENTE el patrón de ProyectoCard
 */

export const clienteCardStyles = {
  // Contenedores principales por vista (compactos)
  container: {
    grid: 'group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 hover:shadow-xl overflow-hidden',
    lista:
      'group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 hover:shadow-md overflow-hidden',
  },

  // Layout interno compacto
  layout: {
    padding: 'p-4',
    flexRow: 'flex items-start justify-between gap-3',
    flexCol: 'flex-1 min-w-0',
    actions: 'flex items-center gap-1.5',
  },

  // Header del card compacto
  header: {
    wrapper: 'flex items-center gap-2.5 mb-1.5',
    iconWrapper:
      'flex-shrink-0 w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md',
    iconWrapperGrid:
      'flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-3',
    icon: 'w-4 h-4 text-white',
    iconGrid: 'w-6 h-6 text-white',
    titleWrapper: 'flex-1 min-w-0',
  },

  // Textos compactos
  text: {
    title: 'text-base font-bold text-gray-900 dark:text-gray-100 truncate',
    titleGrid: 'text-lg font-bold text-gray-900 dark:text-gray-100 mb-1.5',
    subtitle: 'text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1',
    documento: 'truncate',
  },

  // Info de contacto compacta
  contacto: {
    container: 'space-y-1.5 mb-3',
    item: 'flex items-center gap-2 text-xs',
    icon: 'w-3.5 h-3.5 text-gray-400 flex-shrink-0',
    text: 'text-gray-700 dark:text-gray-300 font-medium truncate',
  },

  // Badges compactos
  badge: {
    container: 'flex items-center gap-1.5 mb-3',
    estado: {
      base: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-white text-xs font-bold shadow-md flex-shrink-0',
      Interesado: 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/30',
      Activo: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30',
      Inactivo: 'bg-gradient-to-r from-gray-500 to-slate-500 shadow-gray-500/30',
      Propietario: 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/30',
    },
    origen: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold',
    dot: 'w-1.5 h-1.5 rounded-full bg-white animate-pulse',
  },

  // Secciones de información
  section: {
    container: 'rounded-lg p-2.5 mb-2.5',
    header: 'flex items-center gap-1.5 mb-1 text-xs font-bold uppercase tracking-wider',
    headerIcon: 'w-3.5 h-3.5',
    content: 'text-xs font-semibold truncate',
    proyectoInteres: {
      bg: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-200/50 dark:border-cyan-700/50',
      text: 'text-cyan-700 dark:text-cyan-300',
      content: 'text-cyan-900 dark:text-cyan-100',
    },
    vivienda: {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200/50 dark:border-emerald-700/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      content: 'text-emerald-900 dark:text-emerald-100',
      valor: 'text-xs font-bold text-emerald-600 dark:text-emerald-400',
    },
  },

  // Estadísticas compactas
  stats: {
    container: 'flex items-center gap-3 text-xs',
    containerGrid: 'grid grid-cols-2 gap-3 mb-3',
    item: 'flex items-center gap-1 text-gray-600 dark:text-gray-400',
    itemGrid:
      'flex items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md',
    icon: 'w-3.5 h-3.5',
    iconGrid: 'w-4 h-4 text-cyan-500',
    label: 'font-medium',
    separator: 'w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600',
    value: 'font-semibold text-gray-900 dark:text-gray-100',
    valueLabel: 'text-xs text-gray-600 dark:text-gray-400',
  },

  // Botones de acción compactos
  button: {
    base: 'p-1.5 rounded-md transition-colors',
    view: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    edit: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    delete:
      'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400',
    deleteConfirm:
      'hover:bg-red-600 dark:hover:bg-red-700 text-white bg-red-500',
    icon: 'w-3.5 h-3.5',
  },

  // Grid específico compacto
  gridOnly: {
    container: 'space-y-3',
    footer: 'pt-3 border-t border-gray-200 dark:border-gray-700',
  },
}

// Configuración de iconos por estado
export const estadoIconos = {
  Interesado: 'UserPlus',
  Activo: 'UserCheck',
  Inactivo: 'UserX',
  Propietario: 'Home',
} as const
