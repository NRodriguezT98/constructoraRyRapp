/**
 * ============================================
 * ESTILOS: FuentePagoCard
 * ============================================
 *
 * Estilos centralizados para tarjeta de fuente de pago
 * Diseño: Compacto, glassmorphism, cyan/azul (clientes)
 */

export const fuentePagoCardStyles = {
  container: 'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300',

  header: 'flex items-start justify-between mb-3',

  iconWrapper: 'w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30',
  icon: 'w-5 h-5 text-white',

  title: 'text-sm font-bold text-gray-900 dark:text-white',
  subtitle: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5',

  badge: {
    completo: 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium',
    pendiente: 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium',
    icon: 'w-3.5 h-3.5',
  },

  body: 'space-y-3',

  montos: {
    grid: 'grid grid-cols-3 gap-3',
    label: 'text-xs font-medium text-gray-500 dark:text-gray-400',
    valor: 'text-sm font-bold text-gray-900 dark:text-white',
    valorRecibido: 'text-sm font-bold text-green-600 dark:text-green-400',
    valorSaldo: 'text-sm font-bold text-orange-600 dark:text-orange-400',
  },

  progreso: {
    container: 'space-y-1',
    barra: 'w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    relleno: 'h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full',
    texto: 'text-xs text-gray-600 dark:text-gray-400 text-right font-medium',
  },

  footer: 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2',

  botonSubir: 'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-medium transition-all shadow-md hover:shadow-lg',
}
