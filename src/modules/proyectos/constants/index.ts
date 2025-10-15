import { EstadoProyecto } from '../types'

// Array de estados para filtros
export const ESTADOS_PROYECTO = [
  { value: 'en_planificacion' as EstadoProyecto, label: 'En Planificación' },
  { value: 'en_construccion' as EstadoProyecto, label: 'En Construcción' },
  { value: 'completado' as EstadoProyecto, label: 'Completado' },
  { value: 'pausado' as EstadoProyecto, label: 'Pausado' },
]

// Colores por estado
export const ESTADO_COLORS: Record<EstadoProyecto, string> = {
  en_planificacion:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  en_construccion:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  completado:
    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  pausado: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
}

// Labels de estado
export const ESTADO_LABELS: Record<EstadoProyecto, string> = {
  en_planificacion: 'En Planificación',
  en_construccion: 'En Construcción',
  completado: 'Completado',
  pausado: 'Pausado',
}

// Iconos por estado
export const ESTADO_ICONS: Record<EstadoProyecto, string> = {
  en_planificacion: '📋',
  en_construccion: '🏗️',
  completado: '✅',
  pausado: '⏸️',
}

// Valores por defecto para proyectos
export const PROYECTO_DEFAULTS = {
  presupuesto: 100000,
  diasEstimados: 365,
  responsable: 'RyR Constructora',
  telefono: '+57 123 456 7890',
  email: 'info@ryrconstrucora.com',
  precioBaseVivienda: 80000000,
  superficiePorVivienda: 120,
}

// Límites y validaciones
export const PROYECTO_LIMITES = {
  nombreMin: 3,
  nombreMax: 100,
  descripcionMin: 10,
  descripcionMax: 500,
  ubicacionMin: 5,
  ubicacionMax: 200,
  manzanasMin: 1,
  manzanasMax: 26,
  viviendasMin: 1,
  viviendasMax: 100,
}

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.6,
  },
  spring: {
    stiffness: 400,
    damping: 25,
  },
  transition: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 12,
  },
}

// Configuración de paginación
export const PAGINATION_CONFIG = {
  itemsPerPage: 12,
  maxVisiblePages: 5,
}
