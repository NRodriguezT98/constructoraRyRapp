import * as styles from '../cliente-detalle.styles'

const ESTADO_CONFIG = {
  Interesado: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  Activo: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    dot: 'bg-green-500',
  },
  Inactivo: {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    text: 'text-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500',
  },
  Renunció: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
  },
} as const

interface EstadoBadgeProps {
  estado: string
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const { bg, text, dot } =
    ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG] ||
    ESTADO_CONFIG.Interesado

  return (
    <span className={`${bg} ${text} ${styles.headerClasses.statusBadge}`}>
      <span className={`${dot} ${styles.headerClasses.statusDot}`} />
      <span className={styles.headerClasses.statusText}>{estado}</span>
    </span>
  )
}
