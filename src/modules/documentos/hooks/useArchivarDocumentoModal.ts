/**
 * ============================================
 * HOOK: useArchivarDocumentoModal
 * ============================================
 * Lógica para modal de archivado con motivo
 */

import { useCallback, useState } from 'react'

interface UseArchivarDocumentoModalProps {
  onConfirm: (motivoCategoria: string, motivoDetalle: string) => void | Promise<void> // ✅ motivoDetalle ahora obligatorio
  onClose: () => void
}

export function useArchivarDocumentoModal({ onConfirm, onClose }: UseArchivarDocumentoModalProps) {
  const [motivoCategoria, setMotivoCategoria] = useState('')
  const [motivoDetalle, setMotivoDetalle] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validarFormulario = useCallback((): boolean => {
    setError(null)

    if (!motivoCategoria) {
      setError('Por favor selecciona un motivo de archivado')
      return false
    }

    // ✅ Validar que observaciones sea obligatoria
    if (!motivoDetalle.trim()) {
      setError('Las observaciones son obligatorias')
      return false
    }

    // ✅ Validar longitud mínima
    if (motivoDetalle.trim().length < 10) {
      setError('Las observaciones deben tener al menos 10 caracteres')
      return false
    }

    return true
  }, [motivoCategoria, motivoDetalle])

  const handleConfirm = useCallback(async () => {
    if (!validarFormulario()) return

    setProcesando(true)
    setError(null)

    try {
      // ✅ Observaciones ahora son obligatorias, siempre se envían
      await onConfirm(motivoCategoria, motivoDetalle.trim())
      // Resetear form en caso de éxito
      setMotivoCategoria('')
      setMotivoDetalle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al archivar documento')
    } finally {
      setProcesando(false)
    }
  }, [validarFormulario, onConfirm, motivoCategoria, motivoDetalle])

  const handleClose = useCallback(() => {
    if (procesando) return

    // Resetear estado
    setMotivoCategoria('')
    setMotivoDetalle('')
    setError(null)

    onClose()
  }, [procesando, onClose])

  const handleChangeMotivoCategoria = useCallback((value: string) => {
    setMotivoCategoria(value)
    setError(null) // Limpiar error al cambiar
  }, [])

  const handleChangeMotivoDetalle = useCallback((value: string) => {
    setMotivoDetalle(value)
    setError(null) // Limpiar error al escribir
  }, [])

  return {
    // Estado
    motivoCategoria,
    motivoDetalle,
    procesando,
    error,

    // Validación
    isValid: motivoCategoria.length > 0 && motivoDetalle.trim().length >= 10,

    // Handlers
    handleConfirm,
    handleClose,
    handleChangeMotivoCategoria,
    handleChangeMotivoDetalle,
  }
}
