/**
 * Estilos centralizados para ModalRegistroPago.
 *
 * REGLA CRÍTICA: Todas las clases de color son strings literales completos.
 * NUNCA usar template literals con variables JS para construir clases Tailwind
 * (serían purgadas en producción por el JIT compiler).
 */
import type { ModoRegistro } from '../../types'

// ─────────────────────────────────────────────────────────────────────────────
// Tipo de esquema de color
// ─────────────────────────────────────────────────────────────────────────────

export type ColorScheme = {
  /** Gradiente header/botones: 'from-X via-Y to-Z' */
  gradient: string
  /** Gradiente hover del botón de submit del modo abono: 'hover:from-X ...' */
  gradientHover: string
  /** Fondo light para card de desembolso y cards seleccionados */
  bgLight: string
  /** Borde del item seleccionado (método, fuente activa) */
  borderSelected: string
  /** Texto de acento (valor numérico, icono) con dark mode incluido */
  textAccent: string
  /** Clases completas para el card de desembolso (bg + border) */
  desembolsoCard: string
  /** Badge del header en modo abono */
  headerBadgeAbono: string
  /** Badge del header en modo desembolso */
  headerBadgeDesembolso: string
  /** Clase de fondo para el ícono del método seleccionado */
  metodoBg: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapa de esquemas por tipo de fuente (strings literales estáticos)
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_SCHEMES: Record<string, ColorScheme> = {
  'Cuota Inicial': {
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    gradientHover: 'hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700',
    bgLight: 'bg-blue-500/10 dark:bg-blue-500/10',
    borderSelected: 'border-blue-500',
    textAccent: 'text-blue-600 dark:text-blue-400',
    desembolsoCard: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso: 'bg-purple-900/40 border border-purple-400/40 text-white/90',
    metodoBg: 'bg-blue-500',
  },
  'Crédito Hipotecario': {
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    gradientHover: 'hover:from-purple-700 hover:via-pink-700 hover:to-rose-700',
    bgLight: 'bg-purple-500/10 dark:bg-purple-500/10',
    borderSelected: 'border-purple-500',
    textAccent: 'text-purple-600 dark:text-purple-400',
    desembolsoCard: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso: 'bg-purple-900/40 border border-purple-400/40 text-white/90',
    metodoBg: 'bg-purple-500',
  },
  'Subsidio Mi Casa Ya': {
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    gradientHover: 'hover:from-green-700 hover:via-emerald-700 hover:to-teal-700',
    bgLight: 'bg-green-500/10 dark:bg-green-500/10',
    borderSelected: 'border-green-500',
    textAccent: 'text-green-600 dark:text-green-400',
    desembolsoCard: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso: 'bg-green-900/40 border border-green-400/40 text-white/90',
    metodoBg: 'bg-green-500',
  },
  'Subsidio Caja Compensación': {
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    gradientHover: 'hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700',
    bgLight: 'bg-orange-500/10 dark:bg-orange-500/10',
    borderSelected: 'border-orange-500',
    textAccent: 'text-orange-600 dark:text-orange-400',
    desembolsoCard: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso: 'bg-orange-900/40 border border-orange-400/40 text-white/90',
    metodoBg: 'bg-orange-500',
  },
}

const DEFAULT_SCHEME = COLOR_SCHEMES['Cuota Inicial']

export function getColorScheme(tipo: string): ColorScheme {
  return COLOR_SCHEMES[tipo] ?? DEFAULT_SCHEME
}

// ─────────────────────────────────────────────────────────────────────────────
// Estilos generados del modal
// ─────────────────────────────────────────────────────────────────────────────

export function getModalStyles(scheme: ColorScheme, modo: ModoRegistro) {
  return {
    dialogContent: 'sm:max-w-[560px] p-0 gap-0 border-0 bg-white dark:bg-gray-900 overflow-hidden rounded-2xl',
    body: 'px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto',
    label: 'text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1.5',
    input: 'w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm outline-none',
    inputError: 'w-full px-4 py-2.5 border-2 border-red-400 dark:border-red-600 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-400/20 transition-all text-sm outline-none',
    header: {
      container: `relative overflow-hidden bg-gradient-to-br ${scheme.gradient} px-5 py-4`,
      badge: `text-[10px] font-semibold px-2 py-0.5 rounded-full ${modo === 'desembolso' ? scheme.headerBadgeDesembolso : scheme.headerBadgeAbono}`,
      iconWrapper: 'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center flex-shrink-0',
      infoCard: 'bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 mt-3',
      selBtnActive: 'text-xs px-2.5 py-1 rounded-lg bg-white/30 border border-white/60 text-white font-semibold',
      selBtnInactive: 'text-xs px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all',
    },
    footer: {
      container: 'flex gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700',
      cancelButton: 'flex-1 h-11 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
      submitAbono: 'flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all',
      submitDesembolso: 'flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all',
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────────────────────

export const METODO_PAGO_GRADIENTE: Record<string, string> = {
  Efectivo: 'from-green-500 to-emerald-500',
  Transferencia: 'from-blue-500 to-cyan-500',
  Cheque: 'from-purple-500 to-pink-500',
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
