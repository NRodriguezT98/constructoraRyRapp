/**
 * 🎣 Hook: Lógica de Modal Desactivar Vivienda
 *
 * Responsabilidad:
 * - Manejar estado del modal (motivo, confirmación, validación)
 * - Validar automáticamente al abrir
 * - Calcular caracteres restantes
 * - Ejecutar desactivación
 * - Limpiar al cerrar
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { logger } from '@/lib/utils/logger'

import type { ValidacionEliminacion } from '../services/viviendas-inactivacion.service'
import { useViviendaInactivacion } from './useViviendaInactivacion'

// ============================================================
// TIPOS
// ============================================================

interface UseDesactivarViviendaModalParams {
  isOpen: boolean
  viviendaId: string
  onSuccess: () => void
  onClose: () => void
}

interface UseDesactivarViviendaModalReturn {
  // Estado
  motivo: string
  confirmado: boolean
  validacion: ValidacionEliminacion | null
  validando: boolean
  procesando: boolean
  error: string | null

  // Validaciones
  motivoValido: boolean
  caracteresRestantes: number
  puedeDesactivar: boolean

  // Acciones
  setMotivo: (motivo: string) => void
  setConfirmado: (confirmado: boolean) => void
  handleDesactivar: () => Promise<void>
}

const MOTIVO_MINIMO = 50

// ============================================================
// HOOK
// ============================================================

export function useDesactivarViviendaModal({
  isOpen,
  viviendaId,
  onSuccess,
  onClose,
}: UseDesactivarViviendaModalParams): UseDesactivarViviendaModalReturn {
  const { validarEliminacion, desactivar, validando, procesando, error, limpiarError } =
    useViviendaInactivacion()

  const [motivo, setMotivo] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [validacion, setValidacion] = useState<ValidacionEliminacion | null>(null)

  // Calcular validaciones
  const caracteresRestantes = MOTIVO_MINIMO - motivo.length
  const motivoValido = motivo.trim().length >= MOTIVO_MINIMO
  const puedeDesactivar = !!(motivoValido && confirmado && !procesando && validacion?.puedeEliminar)

  // Validar al abrir modal
  useEffect(() => {
    if (isOpen && viviendaId) {
      validarEliminacion(viviendaId)
        .then((result) => setValidacion(result))
        .catch((err) => logger.error('Error al validar:', err))
    }
  }, [isOpen, viviendaId, validarEliminacion])

  // Limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      setMotivo('')
      setConfirmado(false)
      setValidacion(null)
      limpiarError()
    }
  }, [isOpen, limpiarError])

  // Ejecutar desactivación
  const handleDesactivar = useCallback(async () => {
    if (!puedeDesactivar) return

    try {
      await desactivar(viviendaId, motivo)
      onSuccess()
      onClose()
    } catch (err) {
      // Error manejado por el hook base
    }
  }, [puedeDesactivar, desactivar, viviendaId, motivo, onSuccess, onClose])

  return {
    motivo,
    confirmado,
    validacion,
    validando,
    procesando,
    error,
    motivoValido,
    caracteresRestantes,
    puedeDesactivar,
    setMotivo,
    setConfirmado,
    handleDesactivar,
  }
}
