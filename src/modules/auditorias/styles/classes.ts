/**
 * Clases de Tailwind reutilizables para el módulo de Auditorías
 */

export const auditoriaStyles = {
  // Contenedores
  container: 'min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6',
  card: 'bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden',
  cardHeader: 'px-6 py-4 border-b border-slate-200 bg-slate-50',
  cardBody: 'p-6',

  // Tabs
  tabsList: 'flex gap-2 p-1 bg-slate-100 rounded-lg',
  tab: 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
  tabActive: 'bg-white text-blue-600 shadow-sm',
  tabInactive: 'text-slate-600 hover:text-slate-900 hover:bg-white/50',

  // Filtros
  filtrosContainer: 'flex flex-wrap gap-3 mb-6',
  input: 'px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all',
  select: 'px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white',

  // Botones
  btnPrimary: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium',
  btnSecondary: 'px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium',
  btnGhost: 'px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all',
  btnIcon: 'p-2 rounded-lg hover:bg-slate-100 transition-colors',

  // Tabla
  table: 'w-full border-collapse',
  tableHeader: 'bg-slate-50 border-b border-slate-200',
  th: 'px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider',
  tr: 'border-b border-slate-100 hover:bg-slate-50 transition-colors',
  td: 'px-4 py-3 text-sm text-slate-700',

  // Badges
  badgeBase: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  badgeCreate: 'bg-green-100 text-green-800',
  badgeUpdate: 'bg-blue-100 text-blue-800',
  badgeDelete: 'bg-red-100 text-red-800',

  // Timeline
  timelineContainer: 'space-y-4',
  timelineItem: 'relative pl-8 pb-6 border-l-2 border-slate-200 last:border-l-0',
  timelineDot: 'absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full',
  timelineDotCreate: 'bg-green-500',
  timelineDotUpdate: 'bg-blue-500',
  timelineDotDelete: 'bg-red-500',

  // Estadísticas
  statCard: 'bg-gradient-to-br from-white to-slate-50 rounded-lg p-6 border border-slate-200',
  statValue: 'text-3xl font-bold text-slate-900',
  statLabel: 'text-sm text-slate-600 mt-1',
  statIcon: 'w-10 h-10 rounded-lg flex items-center justify-center',

  // Modal/Dialog
  modal: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50',
  modalContent: 'bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden',
  modalHeader: 'px-6 py-4 border-b border-slate-200 flex items-center justify-between',
  modalBody: 'p-6 overflow-y-auto max-h-[calc(90vh-120px)]',
  modalFooter: 'px-6 py-4 border-t border-slate-200 flex justify-end gap-3',

  // Paginación
  pagination: 'flex items-center justify-between mt-6 pt-4 border-t border-slate-200',
  paginationButton: 'px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  paginationActive: 'bg-blue-600 text-white border-blue-600',

  // Estados
  loading: 'flex items-center justify-center py-12',
  spinner: 'w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin',
  emptyState: 'text-center py-12 text-slate-500',
  errorState: 'bg-red-50 border border-red-200 rounded-lg p-4 text-red-800',
}
