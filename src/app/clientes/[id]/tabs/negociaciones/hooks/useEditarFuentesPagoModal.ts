'use client'

/**
 * ============================================
 * HOOK: useEditarFuentesPagoModal
 * ============================================
 *
 * ✅ LÓGICA DE NEGOCIO para modal de edición de fuentes de pago
 * Maneja estado, validaciones, cálculos y handlers.
 *
 * @version 1.0.0 - 2025-11-28
 */

import { useEffect, useMemo, useState } from 'react'
import type { FuentePagoEditable } from '../EditarFuentesPagoModal'

// ============================================
// CONSTANTES
// ============================================

export const TIPOS_FUENTE = [
  'Cuota Inicial',
  'Crédito Hipotecario',
  'Subsidio Caja Compensación',
  'Subsidio Mi Casa Ya',
] as const

export const BANCOS = [
  'Bancolombia',
  'Banco de Bogotá',
  'Banco Davivienda',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Banco Caja Social',
  'Otro',
]

export const CAJAS = [
  'Comfenalco',
  'Comfandi',
  'Compensar',
  'Comfama',
  'Cafam',
  'Otro',
]

// ============================================
// HELPERS
// ============================================

export function obtenerEntidadesPorTipo(tipo: string): string[] {
  if (tipo === 'Crédito Hipotecario') return BANCOS
  if (tipo === 'Subsidio Caja Compensación') return CAJAS
  return []
}

export function requiereEntidad(tipo: string): boolean {
  return tipo === 'Crédito Hipotecario' || tipo === 'Subsidio Caja Compensación'
}

// ============================================
// TYPES
// ============================================

interface UseEditarFuentesPagoModalProps {
  isOpen: boolean
  fuentesActuales: FuentePagoEditable[]
  valorFinal: number
  onGuardar: (fuentes: FuentePagoEditable[]) => Promise<void>
  onClose: () => void
}

// ============================================
// HOOK
// ============================================

export function useEditarFuentesPagoModal({
  isOpen,
  fuentesActuales,
  valorFinal,
  onGuardar,
  onClose,
}: UseEditarFuentesPagoModalProps) {
  // =====================================================
  // STATE
  // =====================================================

  const [fuentes, setFuentes] = useState<FuentePagoEditable[]>(() =>
    JSON.parse(JSON.stringify(fuentesActuales))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFuentes(JSON.parse(JSON.stringify(fuentesActuales)))
    }
  }, [isOpen, fuentesActuales])

  // =====================================================
  // CÁLCULOS Y VALIDACIONES
  // =====================================================

  const totalFuentes = useMemo(() => {
    return fuentes.reduce((sum, f) => sum + (f.monto || 0), 0)
  }, [fuentes])

  const diferencia = useMemo(() => {
    return totalFuentes - valorFinal
  }, [totalFuentes, valorFinal])

  const esValido = useMemo(() => {
    if (Math.abs(diferencia) > 0.01) return false

    return fuentes.every(f => {
      if (!f.tipo || f.monto <= 0) return false
      if (requiereEntidad(f.tipo) && !f.entidad) return false
      return true
    })
  }, [diferencia, fuentes])

  const erroresPorFuente = useMemo(() => {
    return fuentes.map(f => {
      const errores: string[] = []

      if (!f.tipo) errores.push('Tipo requerido')
      if (f.monto <= 0) errores.push('Monto debe ser > 0')
      if (f.monto < f.monto_recibido) {
        errores.push(`Monto no puede ser menor al recibido ($${f.monto_recibido.toLocaleString('es-CO')})`)
      }
      if (requiereEntidad(f.tipo) && !f.entidad) {
        errores.push('Entidad requerida para este tipo de fuente')
      }

      return errores
    })
  }, [fuentes])

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleAgregarFuente = () => {
    const tiposUsados = fuentes.map(f => f.tipo)
    const tipoDisponible = TIPOS_FUENTE.find(tipo => !tiposUsados.includes(tipo)) || TIPOS_FUENTE[0]

    setFuentes([
      ...fuentes,
      {
        tipo: tipoDisponible,
        monto: 0,
        monto_recibido: 0,
        esNueva: true,
      },
    ])
  }

  const handleEliminarFuente = (index: number) => {
    const fuente = fuentes[index]

    if (fuente.monto_recibido > 0) {
      alert('❌ No puedes eliminar una fuente de pago que ya tiene abonos registrados')
      return
    }

    setFuentes(fuentes.filter((_, i) => i !== index))
  }

  const handleCambiarCampo = (
    index: number,
    campo: keyof FuentePagoEditable,
    valor: string | number
  ) => {
    const nuevasFuentes = [...fuentes]
    nuevasFuentes[index] = {
      ...nuevasFuentes[index],
      [campo]: valor,
    }
    setFuentes(nuevasFuentes)
  }

  const handleGuardar = async () => {
    if (!esValido) return

    setIsSubmitting(true)
    try {
      await onGuardar(fuentes)
      onClose()
    } catch (error) {
      console.error('Error al guardar fuentes:', error)
      alert('❌ Error al guardar cambios. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelar = () => {
    setFuentes(JSON.parse(JSON.stringify(fuentesActuales)))
    onClose()
  }

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    fuentes,
    isSubmitting,

    // Cálculos
    totalFuentes,
    diferencia,
    esValido,
    erroresPorFuente,

    // Handlers
    handleAgregarFuente,
    handleEliminarFuente,
    handleCambiarCampo,
    handleGuardar,
    handleCancelar,
  }
}
