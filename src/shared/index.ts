/**
 * Shared - Recursos compartidos globales
 *
 * Este módulo exporta todos los recursos compartidos de la aplicación:
 * - hooks: Custom hooks reutilizables
 * - constants: Configuraciones y constantes globales
 * - types: Tipos de TypeScript compartidos
 * - utils: Funciones de utilidad
 * - styles: Animaciones y clases CSS
 * - components: Componentes UI reutilizables
 */

// Hooks
export * from './hooks'

// Constants
export * from './constants'

// Types
export * from './types'

// Utils
export * from './utils'

// Styles
export * from './styles'

// Components (con alias para evitar conflictos)
export {
  LoadingSpinner,
  LoadingOverlay,
  LoadingDots,
  Skeleton,
} from './components/ui/Loading'

export { EmptyState } from './components/ui/EmptyState'

export {
  Notification as NotificationComponent,
  NotificationContainer,
  type NotificationType,
} from './components/ui/Notification'

export { Modal, ConfirmModal } from './components/ui/Modal'
