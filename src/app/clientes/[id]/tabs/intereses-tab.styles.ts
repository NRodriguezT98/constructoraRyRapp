/**
 * ============================================
 * ESTILOS: Intereses Tab
 * ============================================
 *
 * Estilos centralizados para la pestaña de Intereses
 * siguiendo el patrón de diseño compacto del proyecto.
 *
 * ✅ Sigue estándar de módulo Clientes (cyan/azul)
 * ✅ Design system compacto (p-5, space-y-4)
 * ✅ Glassmorphism y animaciones
 * ✅ Dark mode completo
 *
 * @version 1.0.0 - 2025-12-23
 */

// ============================================
// TEMA INTERESES (ROSA/PÚRPURA/ROSA)
// ============================================

const interesesTheme = {
  gradient: 'from-pink-500 via-rose-600 to-red-600',
  bg: 'bg-pink-500',
  text: 'text-pink-600 dark:text-pink-400',
  border: 'border-pink-200 dark:border-pink-900/50',
  bgLight: 'bg-pink-50 dark:bg-pink-900/20',
  textDark: 'text-pink-900 dark:text-pink-300',
  focusBorder: 'focus:border-pink-500',
  focusRing: 'focus:ring-pink-500/20',
  hover: 'hover:from-pink-600 hover:via-rose-700 hover:to-red-700',
}

// ============================================
// EMPTY STATE (SIN INTERESES)
// ============================================

export const emptyStateStyles = {
  // Container principal con glassmorphism
  container:
    'rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/90 via-pink-50/90 to-rose-50/90 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-pink-950/50 border border-gray-200/50 dark:border-gray-700/50 p-5 text-center shadow-xl space-y-4',

  // Icono con gradiente y animación
  iconWrapper:
    'mx-auto mb-3 w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 via-rose-600 to-red-600 flex items-center justify-center shadow-2xl shadow-pink-500/30',
  icon: 'w-8 h-8 text-white',

  // Títulos
  title: 'text-xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900 dark:from-white dark:via-gray-100 dark:to-pink-100 bg-clip-text text-transparent',
  description: 'text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed',

  // Checklist container
  checklistContainer:
    'mt-4 rounded-xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/50 p-3 text-left shadow-lg',
  checklistHeader:
    'flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 pb-2 border-b border-gray-200 dark:border-gray-700',
  checklistItems: 'space-y-2',
  checklistItem: 'flex items-start gap-3',

  // Iconos de checklist
  checklistIconPending: 'w-5 h-5 text-pink-500 dark:text-pink-400 flex-shrink-0 mt-0.5',

  // Textos de checklist
  checklistTextPending: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  checklistSubtext: 'text-xs text-gray-500 dark:text-gray-400 mt-1',

  // Call to Action
  ctaContainer:
    'mt-4 rounded-xl bg-gradient-to-r from-pink-50 via-rose-50 to-red-50 dark:from-pink-950/30 dark:via-rose-950/30 dark:to-red-950/30 border border-pink-200/50 dark:border-pink-800/50 p-3 backdrop-blur-sm',
  ctaInfo: 'flex items-start gap-4 text-left',
  ctaIcon: 'w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1 animate-pulse',
  ctaTitle: 'text-sm font-bold text-pink-900 dark:text-pink-100 mb-1',
  ctaDescription: 'text-xs text-pink-700 dark:text-pink-300 leading-relaxed',
  ctaButton:
    'mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 via-rose-600 to-red-600 hover:from-pink-600 hover:via-rose-700 hover:to-red-700 text-white font-semibold text-sm shadow-lg shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300',

  // Footer
  footerInfo: 'flex items-start gap-3 text-left mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
  footerIcon: 'w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5',
  footerText: 'text-xs text-gray-600 dark:text-gray-400 leading-relaxed',
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

  scaleIn: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: 'spring' as const, stiffness: 200 }
  },
}

// Export consolidado
export const interesesTabStyles = {
  emptyState: emptyStateStyles,
  animations,
  theme: interesesTheme,
}
