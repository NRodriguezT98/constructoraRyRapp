/**
 * Sistema de estilos compartidos para todas las variantes de ClienteCard
 *
 * ✅ CONSISTENCIA VISUAL garantizada
 * ✅ Un solo lugar para modificar dimensiones/espaciado
 * ✅ Temas por estado (Interesado=Cyan, Activo=Verde, Inactivo=Gris)
 */

export type EstadoCliente = 'Interesado' | 'Activo' | 'Inactivo'

/**
 * Configuración de temas por estado
 */
export const clienteCardThemes = {
  Interesado: {
    // Cyan/Azul - Para clientes que están explorando
    bg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    textDark: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-700',
    glow: 'from-cyan-500/20 to-blue-500/20',
    shadow: 'shadow-cyan-500/50',
    hoverShadow: 'hover:shadow-cyan-500/20',
    badge: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  },
  Activo: {
    // Verde/Esmeralda - Para clientes con vivienda asignada
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    textDark: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-700',
    glow: 'from-emerald-500/20 to-teal-500/20',
    shadow: 'shadow-emerald-500/50',
    hoverShadow: 'hover:shadow-emerald-500/20',
    badge: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  Inactivo: {
    // Gris - Para clientes inactivos
    bg: 'bg-gradient-to-br from-gray-500 to-slate-600',
    bgLight: 'bg-gray-100 dark:bg-gray-900/30',
    text: 'text-gray-600 dark:text-gray-400',
    textDark: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    glow: 'from-gray-500/20 to-slate-500/20',
    shadow: 'shadow-gray-500/50',
    hoverShadow: 'hover:shadow-gray-500/20',
    badge: 'bg-gradient-to-br from-gray-500 to-slate-600',
  },
}

/**
 * Estilos base compartidos por todas las cards
 * (dimensiones, espaciado, estructura)
 */
export const clienteCardBaseStyles = {
  // Contenedor principal
  container: 'group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300',

  // Efecto de brillo
  glow: 'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',

  // Padding del contenido
  content: 'relative z-10 p-3',

  // Header
  header: {
    container: 'space-y-2 min-h-[85px]',
    actions: 'flex items-start justify-end gap-1 mb-1.5',
    actionButton: 'p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all',
    actionButtonDelete: 'p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all',
    titleSection: 'flex items-start gap-2.5 mb-3',
    icon: 'w-9 h-9 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0',
    iconSize: 'w-4 h-4 text-white',
    info: 'flex-1 min-w-0',
    title: 'text-sm font-bold text-gray-900 dark:text-white',
    documento: 'text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5',
    documentoLabel: 'font-semibold',
    estadoCivil: 'text-[10px] text-gray-400 dark:text-gray-500 mt-0.5',
    badges: 'flex flex-col items-end gap-1 flex-shrink-0',
    badge: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-white text-xs font-bold shadow-md',
    badgeDot: 'w-1.5 h-1.5 rounded-full bg-white animate-pulse',
  },

  // Secciones de contenido
  section: {
    container: 'mb-2.5 rounded-lg border-2 p-2.5',
    title: 'flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider',
    titleIcon: 'w-3.5 h-3.5',
    content: 'space-y-1.5',
  },

  // Items dentro de secciones
  item: {
    container: 'flex items-center gap-1.5',
    icon: 'p-1 rounded-md flex-shrink-0',
    iconSize: 'w-3 h-3',
    info: 'flex-1 min-w-0',
    label: 'text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase',
    value: 'text-xs font-medium text-gray-900 dark:text-white truncate',
    valueBold: 'text-xs font-bold text-gray-900 dark:text-white',
  },

  // Footer
  footer: {
    container: 'flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700',
    text: 'flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400',
    icon: 'w-3 h-3',
  },
}

/**
 * Estilos para badges secundarios (indicadores especiales)
 */
export const badgeSecondaryStyles = {
  success: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
  warning: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  info: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
}

/**
 * Helper para obtener clase de sección según tema
 */
export const getSectionClasses = (estado: EstadoCliente, hasContent: boolean) => {
  const theme = clienteCardThemes[estado]

  if (hasContent) {
    return `${clienteCardBaseStyles.section.container} bg-gradient-to-br from-${estado === 'Interesado' ? 'cyan' : estado === 'Activo' ? 'emerald' : 'gray'}-50 to-${estado === 'Interesado' ? 'blue' : estado === 'Activo' ? 'teal' : 'slate'}-50 dark:from-${estado === 'Interesado' ? 'cyan' : estado === 'Activo' ? 'emerald' : 'gray'}-900/20 dark:to-${estado === 'Interesado' ? 'blue' : estado === 'Activo' ? 'teal' : 'slate'}-900/20 ${theme.border}`
  }

  return `${clienteCardBaseStyles.section.container} bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10 border-gray-200/30 dark:border-gray-700/30`
}
