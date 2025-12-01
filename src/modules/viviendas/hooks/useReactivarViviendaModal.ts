/**
 * 🎣 Hook: Lógica de Modal Reactivar Vivienda
 *
 * Responsabilidad:
 * - Manejar estado del modal (motivo, confirmación, validación)
 * - Validar automáticamente al abrir
 * - Calcular caracteres restantes
 * - Ejecutar reactivación
 * - Limpiar al cerrar
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useViviendaInactivacion } from './useViviendaInactivacion'

// ============================================================
// TIPOS
// ============================================================

interface UseReactivarViviendaModalParams {
  isOpen: boolean
  viviendaId: string
  onSuccess: () => void
  onClose: () => void
}

interface UseReactivarViviendaModalReturn {
  // Estado
  motivo: string
  confirmado: boolean
  validacion: any
  validando: boolean
  procesando: boolean
  error: string | null

  // Validaciones
  motivoValido: boolean
  caracteresRestantes: number
  puedeReactivar: boolean

  // Acciones
  setMotivo: (motivo: string) => void
  setConfirmado: (confirmado: boolean) => void
  handleReactivar: () => Promise<void>
}

const MOTIVO_MINIMO = 30

// ============================================================
// HOOK
// ============================================================

export function useReactivarViviendaModal({
  isOpen,
  viviendaId,
  onSuccess,
  onClose,
}: UseReactivarViviendaModalParams): UseReactivarViviendaModalReturn {
  const { validarReactivacion, reactivar, validando, procesando, error, limpiarError } =
    useViviendaInactivacion()

  const [motivo, setMotivo] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [validacion, setValidacion] = useState<any>(null)

  // Calcular validaciones
  const caracteresRestantes = MOTIVO_MINIMO - motivo.length
  const motivoValido = motivo.trim().length >= MOTIVO_MINIMO
  const puedeReactivar = motivoValido && confirmado && !procesando && validacion?.puedeReactivar

  // Validar al abrir modal
  useEffect(() => {
    if (isOpen && viviendaId) {
      validarReactivacion(viviendaId)
        .then((result) => setValidacion(result))
        .catch((err) => console.error('Error al validar:', err))
    }
  }, [isOpen, viviendaId, validarReactivacion])

  // Limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      setMotivo('')
      setConfirmado(false)
      setValidacion(null)
      limpiarError()
    }
  }, [isOpen, limpiarError])

  // Ejecutar reactivación
  const handleReactivar = useCallback(async () => {
    if (!puedeReactivar) return

    try {
      await reactivar(viviendaId, motivo)
      onSuccess()
      onClose()
    } catch (err) {
      // Error manejado por el hook base
    }
  }, [puedeReactivar, reactivar, viviendaId, motivo, onSuccess, onClose])

  return {
    motivo,
    confirmado,
    validacion,
    validando,
    procesando,
    error,
    motivoValido,
    caracteresRestantes,
    puedeReactivar,
    setMotivo,
    setConfirmado,
    handleReactivar,
  }
}
