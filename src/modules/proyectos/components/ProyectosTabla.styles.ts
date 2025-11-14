/**
 * ProyectosTabla.styles.ts - Estilos centralizados para tabla de proyectos
 * ✅ Strings de Tailwind organizados
 * ✅ Fácil mantenimiento
 * ✅ No duplicación
 */

export const proyectosTablaStyles = {
  // Iconos y avatares
  iconContainer: 'w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md shadow-green-500/20',
  iconSvg: 'w-4 h-4 text-white',
  
  // Badges de estado
  badge: {
    base: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-[11px] whitespace-nowrap',
    completado: 'bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800/50 text-green-700 dark:text-green-300',
    enProceso: 'bg-blue-100 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800/50 text-blue-700 dark:text-blue-300',
    default: 'bg-gray-100 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300',
  },
  
  // Badges de manzanas
  manzanasBadge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50',
  manzanasIcon: 'w-3 h-3 text-green-600 dark:text-green-400',
  manzanasCount: 'font-bold text-green-700 dark:text-green-300 text-xs',
  
  // Ubicación
  ubicacion: {
    container: 'flex items-center justify-center gap-1.5',
    icon: 'w-3.5 h-3.5 flex-shrink-0 text-green-500',
    text: 'text-sm text-gray-700 dark:text-gray-300 truncate',
  },
  
  // Nombre de proyecto
  nombre: {
    container: 'flex items-center justify-center gap-2',
    text: 'font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1',
  },
  
  // Barra de progreso
  progressBar: {
    container: 'flex items-center gap-1.5',
    track: 'flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative',
    fillVendidas: 'absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all',
    fillAsignadas: 'absolute top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all',
    label: 'text-[10px] font-bold text-gray-600 dark:text-gray-400 min-w-[35px] text-right',
  },
  
  // Grid de estadísticas
  statsGrid: {
    container: 'grid grid-cols-3 gap-1.5 text-[10px]',
    cell: 'text-center',
    label: 'text-gray-500 dark:text-gray-500 font-medium mb-0.5',
    value: 'font-bold text-xs',
    disponibles: 'text-gray-700 dark:text-gray-300',
    asignadas: 'text-blue-600 dark:text-blue-400',
    vendidas: 'text-green-600 dark:text-green-400',
  },
  
  // Columna de viviendas (resumen completo)
  viviendas: {
    container: 'flex flex-col gap-1',
  },
  
  // Botones de acciones
  actions: {
    container: 'flex items-center justify-center gap-1.5',
    button: {
      base: 'group p-1.5 rounded-md transition-all hover:scale-105',
      view: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50',
      edit: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50',
      delete: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50',
    },
    icon: 'w-3.5 h-3.5',
  },
  
  // Headers de columnas
  header: {
    wrapper: 'text-center',
  },
  
  // Contenedores de celdas
  cell: {
    center: 'flex justify-center',
  },
}
