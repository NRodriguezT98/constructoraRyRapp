import { useEffect, useRef, useState } from 'react'

import { formatDateCompact, getTodayDateString } from '@/lib/utils/date.utils'
import {
    eliminarComprobante,
    generarPathComprobante,
    subirComprobante,
} from '../../services/abonos-storage.service'
import type { FuentePagoConAbonos } from '../../types'

type FaseLoading = 'idle' | 'subiendo' | 'guardando'

interface UseModalRegistrarAbonoProps {
  negociacionId: string
  fuentePreseleccionada: FuentePagoConAbonos
  fechaMinima?: string  // fecha_negociacion — límite inferior para fecha_abono (YYYY-MM-DD)
  onSuccess: () => void
  onClose: () => void
}

export function useModalRegistrarAbono({
  negociacionId,
  fuentePreseleccionada,
  fechaMinima,
  onSuccess,
  onClose,
}: UseModalRegistrarAbonoProps) {
  // Determinar si es desembolso completo (Crédito o Subsidio)
  const esDesembolsoCompleto =
    fuentePreseleccionada?.tipo === 'Crédito Hipotecario' ||
    fuentePreseleccionada?.tipo === 'Subsidio Mi Casa Ya' ||
    fuentePreseleccionada?.tipo === 'Subsidio Caja Compensación'

  const montoAutomatico = esDesembolsoCompleto ? fuentePreseleccionada?.monto_aprobado : null

  const [formData, setFormData] = useState({
    monto: montoAutomatico?.toString() || '',
    fecha_abono: getTodayDateString(),
    metodo_pago: 'Transferencia',
    observaciones: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [faseLoading, setFaseLoading] = useState<FaseLoading>('idle')
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('Transferencia')
  const [validacionDesembolso] = useState<null>(null)
  const [comprobante, setComprobante] = useState<File | null>(null)
  const cancelledRef = useRef(false)

  // Actualizar monto si cambia el tipo de fuente
  useEffect(() => {
    if (esDesembolsoCompleto && montoAutomatico) {
      setFormData((prev) => ({ ...prev, monto: montoAutomatico.toString() }))
    }
  }, [esDesembolsoCompleto, montoAutomatico])

  const saldoPendiente = fuentePreseleccionada?.saldo_pendiente || 0
  const montoIngresado = parseFloat(formData.monto) || 0

  // Validar formulario
  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!esDesembolsoCompleto) {
      const monto = parseFloat(formData.monto)
      if (!formData.monto || isNaN(monto) || monto <= 0) {
        newErrors.monto = 'El monto debe ser mayor a cero'
      } else if (monto > saldoPendiente) {
        newErrors.monto = `No puede exceder el saldo pendiente`
      }
    }

    if (!formData.fecha_abono) {
      newErrors.fecha_abono = 'La fecha es obligatoria'
    } else if (fechaMinima && formData.fecha_abono < fechaMinima) {
      newErrors.fecha_abono = `La fecha no puede ser anterior al inicio de la negociación (${formatDateCompact(fechaMinima)})`
    } else if (formData.fecha_abono > getTodayDateString()) {
      newErrors.fecha_abono = `La fecha no puede ser mayor a hoy (${formatDateCompact(getTodayDateString())})`
    }

    if (!comprobante) {
      newErrors.comprobante = 'El comprobante de pago es obligatorio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulario (2 fases: subir comprobante → guardar abono)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) return
    if (!comprobante) return  // redundant but keeps TS happy

    cancelledRef.current = false

    // ── Fase 1: subir comprobante a Storage ────────────────
    setFaseLoading('subiendo')
    const path = generarPathComprobante(negociacionId, fuentePreseleccionada?.id, comprobante)

    let uploadedPath: string
    try {
      uploadedPath = await subirComprobante(path, comprobante)
    } catch {
      setFaseLoading('idle')
      setErrors({ submit: 'No se pudo subir el comprobante. Verifica tu conexión e intenta de nuevo.' })
      return
    }

    // Si el usuario cerró el modal durante la subida, hacer rollback silencioso
    if (cancelledRef.current) {
      await eliminarComprobante(uploadedPath)
      return
    }

    // ── Fase 2: registrar abono en la BD ───────────────────
    setFaseLoading('guardando')

    try {
      const response = await fetch('/api/abonos/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negociacion_id: negociacionId,
          fuente_pago_id: fuentePreseleccionada?.id,
          monto: parseFloat(formData.monto),
          fecha_abono: formData.fecha_abono,
          metodo_pago: metodoSeleccionado,
          notas: formData.observaciones || null,
          comprobante_path: uploadedPath,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al registrar el abono')
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Error guardando abono:', msg)
      setFaseLoading('idle')
      setErrors({
        submit: 'El abono no pudo guardarse. El comprobante puede haber quedado sin registrar — intenta de nuevo.',
      })
      return
    }

    // ── Éxito ──────────────────────────────────────────────
    setFormData({
      monto: montoAutomatico?.toString() || '',
      fecha_abono: getTodayDateString(),
      metodo_pago: 'Transferencia',
      observaciones: '',
    })
    setErrors({})
    setMetodoSeleccionado('Transferencia')
    setComprobante(null)
    setFaseLoading('idle')

    onSuccess()
    onClose()
  }

  // Cierre consciente del modal (marca cancelado para rollback si upload en curso)
  const handleClose = () => {
    cancelledRef.current = true
    onClose()
  }

  // Actualizar campo del formulario
  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // Seleccionar método de pago
  const selectMetodo = (metodo: string) => {
    setMetodoSeleccionado(metodo)
    updateField('metodo_pago', metodo)
  }

  // Limpiar error de submit
  const limpiarValidacion = () => {
    setErrors((prev) => ({ ...prev, submit: '' }))
  }

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return {
    // Estado
    formData,
    errors,
    faseLoading,
    loading: faseLoading !== 'idle',  // compatibilidad con UI existente
    metodoSeleccionado,
    esDesembolsoCompleto,
    montoAutomatico,
    saldoPendiente,
    montoIngresado,
    validacionDesembolso,
    comprobante,

    // Handlers
    handleSubmit,
    handleClose,
    updateField,
    selectMetodo,
    limpiarValidacion,
    setComprobante,

    // Utilidades
    formatCurrency,
  }
}
