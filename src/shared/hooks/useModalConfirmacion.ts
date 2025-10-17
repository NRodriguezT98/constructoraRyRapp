/**
 * Hook para gestionar modales de confirmación
 * Simplifica el uso del componente ModalConfirmacion
 *
 * @example
 * ```tsx
 * const { modalAbierto, abrirModal, cerrarModal, confirmar } = useModalConfirmacion({
 *   onConfirm: async () => {
 *     await eliminarCliente(id)
 *   }
 * })
 *
 * // En el JSX:
 * <button onClick={abrirModal}>Eliminar</button>
 *
 * <ModalConfirmacion
 *   isOpen={modalAbierto}
 *   onClose={cerrarModal}
 *   onConfirm={confirmar}
 *   title="Eliminar Cliente"
 *   message="¿Estás seguro?"
 *   variant="danger"
 * />
 * ```
 */

import { useCallback, useState } from 'react'

interface UseModalConfirmacionOptions {
  /** Función a ejecutar al confirmar */
  onConfirm: () => void | Promise<void>

  /** Callback después de confirmar exitosamente */
  onSuccess?: () => void

  /** Callback si hay error */
  onError?: (error: unknown) => void
}

export function useModalConfirmacion({
  onConfirm,
  onSuccess,
  onError,
}: UseModalConfirmacionOptions) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const abrirModal = useCallback(() => {
    setModalAbierto(true)
  }, [])

  const cerrarModal = useCallback(() => {
    if (!isLoading) {
      setModalAbierto(false)
    }
  }, [isLoading])

  const confirmar = useCallback(async () => {
    setIsLoading(true)

    try {
      await onConfirm()
      onSuccess?.()
      setModalAbierto(false)
    } catch (error) {
      console.error('Error en confirmación:', error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [onConfirm, onSuccess, onError])

  return {
    modalAbierto,
    abrirModal,
    cerrarModal,
    confirmar,
    isLoading,
  }
}
