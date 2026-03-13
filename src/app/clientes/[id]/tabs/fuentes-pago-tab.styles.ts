/**
 * ============================================
 * ESTILOS: Fuentes de Pago Tab
 * ============================================
 *
 * Estilos centralizados para la pestaña de Fuentes de Pago
 * siguiendo el patrón de diseño compacto del proyecto.
 *
 * ✅ Sigue estándar de módulo Clientes (cyan/azul)
 * ✅ Design system compacto (p-4, gap-3, text-sm)
 * ✅ Glassmorphism y animaciones
 * ✅ Dark mode completo
 *
 * @version 1.0.0 - 2025-12-17
 */

// ============================================
// TEMA CLIENTES (CYAN/AZUL)
// ============================================

const clientesTheme = {
  gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
  bg: 'bg-cyan-500',
  text: 'text-cyan-600 dark:text-cyan-400',
  border: 'border-cyan-200 dark:border-cyan-900/50',
  bgLight: 'bg-cyan-50 dark:bg-cyan-900/20',
  textDark: 'text-cyan-900 dark:text-cyan-300',
  focusBorder: 'focus:border-cyan-500',
  focusRing: 'focus:ring-cyan-500/20',
  hover: 'hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700',
}

// ============================================
// CONTENEDOR PRINCIPAL
// ============================================

export const containerStyles = {
  main: 'space-y-4',
  card: 'rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg',
}

// ============================================
// HEADER DE LA PESTAÑA
// ============================================

export const headerStyles = {
  container: `${containerStyles.card} p-4`,

  content: 'flex items-center justify-between',

  leftSection: 'flex items-center gap-3',

  iconContainer: `w-10 h-10 rounded-lg bg-gradient-to-br ${clientesTheme.gradient} flex items-center justify-center shadow-lg shadow-cyan-500/30`,

  icon: 'w-5 h-5 text-white',

  titleSection: 'space-y-1',

  title: 'text-lg font-bold text-gray-900 dark:text-white',

  subtitle: 'text-sm text-gray-600 dark:text-gray-400',

  rightSection: 'flex items-center gap-2',

  actionButton: `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${clientesTheme.bg} text-white text-sm font-medium hover:opacity-90 transition-all shadow-sm`,

  secondaryButton: 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all',
}

// ============================================
// MÉTRICAS (4 CARDS IGUALES)
// ============================================

export const metricasStyles = {
  container: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',

  card: `${containerStyles.card} p-4 group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300`,

  cardContent: 'flex items-center gap-3',

  iconContainer: `w-10 h-10 rounded-lg bg-gradient-to-br shadow-lg flex items-center justify-center`,

  iconSuccess: `w-10 h-10 rounded-lg bg-gradient-to-br shadow-lg flex items-center justify-center from-green-500 to-emerald-600 shadow-green-500/50`,
  iconWarning: `w-10 h-10 rounded-lg bg-gradient-to-br shadow-lg flex items-center justify-center from-orange-500 to-amber-600 shadow-orange-500/50`,
  iconDanger: `w-10 h-10 rounded-lg bg-gradient-to-br shadow-lg flex items-center justify-center from-red-500 to-rose-600 shadow-red-500/50`,
  iconInfo: `w-10 h-10 rounded-lg bg-gradient-to-br shadow-lg flex items-center justify-center ${clientesTheme.gradient} shadow-cyan-500/50`,

  icon: 'w-5 h-5 text-white',

  textSection: 'flex-1',

  value: 'text-xl font-bold',
  valueSuccess: `text-xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent`,
  valueWarning: `text-xl font-bold bg-gradient-to-br from-orange-600 to-amber-600 bg-clip-text text-transparent`,
  valueDanger: `text-xl font-bold bg-gradient-to-br from-red-600 to-rose-600 bg-clip-text text-transparent`,
  valueInfo: `text-xl font-bold bg-gradient-to-br ${clientesTheme.gradient} bg-clip-text text-transparent`,

  label: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium',
}

// ============================================
// ESTADO DE VALIDACIÓN
// ============================================

export const validacionStyles = {
  container: `${containerStyles.card} p-4`,

  header: 'flex items-center gap-3 mb-3',

  iconSuccess: 'w-5 h-5 text-green-600 dark:text-green-400',
  iconWarning: 'w-5 h-5 text-orange-600 dark:text-orange-400',
  iconDanger: 'w-5 h-5 text-red-600 dark:text-red-400',

  title: 'font-semibold text-gray-900 dark:text-white',

  mensajes: 'space-y-2',

  mensaje: 'flex items-start gap-2 text-sm',

  mensajeSuccess: `flex items-start gap-2 text-sm text-green-700 dark:text-green-300`,
  mensajeWarning: `flex items-start gap-2 text-sm text-orange-700 dark:text-orange-300`,
  mensajeDanger: `flex items-start gap-2 text-sm text-red-700 dark:text-red-300`,

  acciones: 'flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700',
}

// ============================================
// LISTA DE FUENTES
// ============================================

export const fuentesListStyles = {
  container: `${containerStyles.card} p-4`,

  header: 'flex items-center justify-between mb-4',

  headerTitle: 'font-semibold text-gray-900 dark:text-white flex items-center gap-2',

  headerIcon: `w-4 h-4 ${clientesTheme.text}`,

  agregarButton: `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-dashed ${clientesTheme.border} ${clientesTheme.text} text-sm font-medium hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all`,

  lista: 'space-y-3',

  emptyState: 'text-center py-8',
  emptyIcon: 'w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3',
  emptyTitle: 'text-lg font-medium text-gray-600 dark:text-gray-400 mb-2',
  emptySubtitle: 'text-sm text-gray-500 dark:text-gray-500',
}

// ============================================
// EMPTY STATE (SIN VIVIENDA)
// ============================================

export const emptyStateStyles = {
  // Container principal con glassmorphism
  container:
    'rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/90 via-gray-50/90 to-orange-50/90 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-orange-950/50 border border-gray-200/50 dark:border-gray-700/50 p-5 text-center shadow-xl space-y-4',

  // Icono con gradiente y animación
  iconWrapper:
    'mx-auto mb-3 w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 flex items-center justify-center shadow-2xl shadow-orange-500/30',
  icon: 'w-8 h-8 text-white',

  // Títulos
  title: 'text-xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 dark:from-white dark:via-gray-100 dark:to-orange-100 bg-clip-text text-transparent',
  description: 'text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed',

  // Checklist container
  checklistContainer:
    'mt-4 rounded-xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/50 p-3 text-left shadow-lg',
  checklistHeader:
    'flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 pb-2 border-b border-gray-200 dark:border-gray-700',
  checklistItems: 'space-y-2',
  checklistItem: 'flex items-start gap-3',

  // Iconos de checklist
  checklistIconPending: 'w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5',

  // Textos de checklist
  checklistTextPending: 'text-sm font-medium text-gray-700 dark:text-gray-300',

  // Call to Action
  ctaContainer:
    'mt-4 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30 border border-orange-200/50 dark:border-orange-800/50 p-3 backdrop-blur-sm',
  ctaInfo: 'flex items-start gap-4 text-left',
  ctaIcon: 'w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1 animate-bounce',
  ctaTitle: 'text-sm font-bold text-orange-900 dark:text-orange-100 mb-1',
  ctaDescription: 'text-xs text-orange-700 dark:text-orange-300 leading-relaxed',
  ctaButton:
    'mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700 text-white font-semibold text-sm shadow-lg shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300',

  // Footer
  footerInfo: 'flex items-start gap-3 text-left mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
  footerIcon: 'w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5',
  footerText: 'text-xs text-gray-600 dark:text-gray-400 leading-relaxed',
}

// ============================================
// CARD DE FUENTE INDIVIDUAL
// ============================================

export const fuenteCardStyles = {
  container: `${containerStyles.card} p-4 hover:shadow-xl transition-all duration-300`,

  header: 'flex items-center justify-between mb-3',

  leftSection: 'flex items-center gap-3',

  tipoIcon: 'w-8 h-8 rounded-lg flex items-center justify-center',
  tipoIconCuota: `w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30`,
  tipoIconCredito: `w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30`,
  tipoIconSubsidio: `w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30`,

  tipoIconSymbol: 'w-4 h-4',
  tipoIconSymbolCuota: `w-4 h-4 text-blue-600 dark:text-blue-400`,
  tipoIconSymbolCredito: `w-4 h-4 text-green-600 dark:text-green-400`,
  tipoIconSymbolSubsidio: `w-4 h-4 text-purple-600 dark:text-purple-400`,

  tipoInfo: 'space-y-0.5',
  tipoTitulo: 'font-semibold text-gray-900 dark:text-white text-sm',
  tipoEntidad: 'text-xs text-gray-600 dark:text-gray-400',

  rightSection: 'flex items-center gap-2',

  estadoBadge: 'px-2 py-1 rounded-md text-xs font-semibold',
  estadoPendiente: `px-2 py-1 rounded-md text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300`,
  estadoProceso: `px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`,
  estadoCompletada: `px-2 py-1 rounded-md text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300`,

  actionButton: 'p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all',

  body: 'space-y-3',

  montoSection: 'grid grid-cols-2 gap-4',

  montoItem: 'space-y-1',
  montoLabel: 'text-xs text-gray-500 dark:text-gray-400 font-medium',
  montoValue: 'font-bold',
  montoAprobado: `font-bold ${clientesTheme.textDark}`,
  montoRecibido: `font-bold text-green-700 dark:text-green-300`,
  montoPendiente: `font-bold text-orange-700 dark:text-orange-300`,

  progressSection: 'space-y-2',
  progressLabel: 'flex items-center justify-between text-xs',
  progressLabelText: 'font-medium text-gray-700 dark:text-gray-300',
  progressLabelPorcentaje: 'font-semibold text-gray-600 dark:text-gray-400',

  progressBar: 'h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
  progressFill: 'h-full bg-gradient-to-r transition-all duration-500',
  progressFillLow: `h-full bg-gradient-to-r transition-all duration-500 from-red-500 to-rose-600`,
  progressFillMed: `h-full bg-gradient-to-r transition-all duration-500 from-orange-500 to-amber-600`,
  progressFillHigh: `h-full bg-gradient-to-r transition-all duration-500 from-green-500 to-emerald-600`,

  documentacionSection: 'pt-3 border-t border-gray-200 dark:border-gray-700',
  documentacionHeader: 'flex items-center justify-between mb-2',
  documentacionTitle: 'text-xs font-semibold text-gray-700 dark:text-gray-300',
  documentacionEstado: 'text-xs',
  documentacionSi: `text-xs text-green-600 dark:text-green-400 font-semibold`,
  documentacionNo: `text-xs text-orange-600 dark:text-orange-400 font-semibold`,

  documentacionAcciones: 'flex items-center gap-2',
  documentacionButton: 'text-xs px-2 py-1 rounded-md font-medium transition-all',
  documentacionButtonPrimary: `text-xs px-2 py-1 rounded-md font-medium transition-all ${clientesTheme.bg} text-white hover:opacity-90`,
  documentacionButtonSecondary: `text-xs px-2 py-1 rounded-md font-medium transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600`,
}

// ============================================
// ACCIONES RÁPIDAS
// ============================================

export const accionesStyles = {
  container: 'grid grid-cols-1 md:grid-cols-2 gap-3',

  card: `${containerStyles.card} p-4 hover:shadow-xl transition-all duration-300 cursor-pointer group`,

  content: 'flex items-center gap-3',

  iconContainer: `w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`,

  iconDocumentos: `w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform from-blue-500 to-indigo-600 shadow-blue-500/30`,
  iconAbonos: `w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform from-green-500 to-emerald-600 shadow-green-500/30`,

  icon: 'w-5 h-5 text-white',

  textSection: 'flex-1',

  title: 'font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors',

  subtitle: 'text-sm text-gray-600 dark:text-gray-400 mt-0.5',

  arrow: 'w-4 h-4 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all',
}

// ============================================
// ANIMACIONES FRAMER MOTION
// ============================================

export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },

  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },

  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  },

  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }
}

// ============================================
// BREAKPOINTS RESPONSIVE
// ============================================

export const responsive = {
  mobile: 'sm:',
  tablet: 'md:',
  desktop: 'lg:',
  wide: 'xl:',
}

// Export consolidado
export const fuentesPagoTabStyles = {
  container: containerStyles,
  header: headerStyles,
  metricas: metricasStyles,
  validacion: validacionStyles,
  fuentesList: fuentesListStyles,
  fuenteCard: fuenteCardStyles,
  acciones: accionesStyles,
  emptyState: emptyStateStyles,
  animations,
  responsive,
  theme: clientesTheme,
}
