/**
 * 🎭 SISTEMA DE MODALES MODERNOS
 *
 * Exporta todos los componentes del sistema de modales
 * para importaciones limpias.
 *
 * Ejemplo de uso:
 * ```tsx
 * import { useModal, ConfirmModal, AlertModal } from '@/shared/components/modals'
 *
 * function MyComponent() {
 *   const { confirm, alert } = useModal()
 *
 *   const handleDelete = async () => {
 *     const confirmed = await confirm({
 *       title: '¿Eliminar elemento?',
 *       message: 'Esta acción no se puede deshacer',
 *       variant: 'danger'
 *     })
 *     if (confirmed) {
 *       // proceder...
 *     }
 *   }
 *
 *   const showSuccess = async () => {
 *     await alert({
 *       title: 'Éxito',
 *       message: 'La operación se completó correctamente',
 *       variant: 'success'
 *     })
 *   }
 * }
 * ```
 */

// Context y Hook
export { ModalProvider, useModal } from './modal-context'
export type {
  AlertOptions,
  ConfirmOptions,
  ModalVariant,
} from './modal-context'

// Componentes
export { AlertModal } from './alert-modal'
export { ConfirmModal } from './confirm-modal'

// 🆕 Modales Refactorizados (modernos)
export {
  ConfirmacionModal,
  type ConfirmacionVariant,
} from './ConfirmacionModal'
export { PromptModal } from './PromptModal'
