/**
 * Estilos específicos para NegociacionCard
 * Diseño compacto y profesional con dark mode
 */

export const negociacionCardStyles = {
  // Contenedor principal
  container: {
    base: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300',
  },

  // Header de la tarjeta
  header: {
    wrapper: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700',
    clienteContainer: 'flex items-center justify-between',
    clienteInfo: 'flex items-center gap-3',
    iconWrapper: 'w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center',
    icon: 'w-6 h-6 text-white',
    nombre: 'text-lg font-semibold text-gray-900 dark:text-white',
    documento: 'text-xs text-gray-500 dark:text-gray-400',
  },

  // Información del proyecto
  proyecto: {
    container: 'flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300',
    icon: 'w-4 h-4',
    text: 'font-medium',
  },

  // Contenido principal
  content: {
    wrapper: 'p-4 space-y-4',
  },

  // Detalles de la vivienda
  vivienda: {
    container: 'grid grid-cols-2 gap-3 pb-3 border-b border-gray-200 dark:border-gray-700',
    item: 'flex items-center gap-2 text-sm',
    icon: 'w-4 h-4 text-gray-400 dark:text-gray-500',
    label: 'text-gray-500 dark:text-gray-400',
    value: 'font-medium text-gray-900 dark:text-white',
  },

  // Resumen financiero
  financiero: {
    container: 'space-y-2',
    row: 'flex justify-between items-center',
    label: 'text-sm text-gray-600 dark:text-gray-400',
    valor: 'text-sm font-semibold text-gray-900 dark:text-white',
    valorAbonado: 'text-sm font-semibold text-green-600 dark:text-green-400',
    valorPendiente: 'text-sm font-semibold text-orange-600 dark:text-orange-400',
  },

  // Barra de progreso
  progreso: {
    wrapper: 'mt-3',
    container: 'h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden',
    barra: 'h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500',
    label: 'flex justify-between items-center mt-2',
    texto: 'text-xs text-gray-500 dark:text-gray-400',
    porcentaje: 'text-xs font-semibold text-orange-600 dark:text-orange-400',
  },

  // Fuentes de pago
  fuentes: {
    container: 'space-y-2',
    titulo: 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2',
    lista: 'space-y-2',
    item: 'bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700',
    itemHeader: 'flex justify-between items-center mb-1',
    tipo: 'text-sm font-medium text-gray-900 dark:text-white',
    montos: 'text-xs text-gray-500 dark:text-gray-400',
    progreso: 'h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mt-2',
    progresoFill: 'h-full transition-all duration-300',
    progresoCompleto: 'bg-gradient-to-r from-green-500 to-emerald-500',
    progresoParcial: 'bg-gradient-to-r from-orange-500 to-amber-500',
    empty: 'text-sm text-gray-400 dark:text-gray-500 italic',
  },

  // Footer con acciones
  footer: {
    wrapper: 'px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center gap-2',
    badge: 'px-3 py-1 rounded-full text-xs font-medium',
    badgeActiva: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    badgePendiente: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
}
