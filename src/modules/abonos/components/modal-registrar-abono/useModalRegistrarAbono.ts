import { getTodayDateString } from '@/lib/utils/date.utils'
import { useEffect, useState } from 'react'
import { validarDesembolso, type ResultadoValidacion } from '../../services/validacion-desembolsos.service'
import type { FuentePagoConAbonos } from '../../types'

interface UseModalRegistrarAbonoProps {
  negociacionId: string
  fuentePreseleccionada: FuentePagoConAbonos
  onSuccess: () => void
  onClose: () => void
}

export function useModalRegistrarAbono({
  negociacionId,
  fuentePreseleccionada,
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
  const [loading, setLoading] = useState(false)
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('Transferencia')
  const [validacionDesembolso, setValidacionDesembolso] = useState<ResultadoValidacion | null>(null)

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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setLoading(true)

    try {
      // ✅ VALIDACIÓN: Verificar que el paso del proceso esté completado (solo para desembolsos)
      if (esDesembolsoCompleto) {
        const resultadoValidacion = await validarDesembolso(
          negociacionId,
          fuentePreseleccionada.tipo
        )

        setValidacionDesembolso(resultadoValidacion)

        if (!resultadoValidacion.permitido) {
          setErrors({
            submit: resultadoValidacion.razon || 'No se puede registrar el desembolso en este momento.',
          })
          setLoading(false)
          return
        }
      }

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
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al registrar el abono')
      }

      // Reset form
      setFormData({
        monto: montoAutomatico?.toString() || '',
        fecha_abono: getTodayDateString(),
        metodo_pago: 'Transferencia',
        observaciones: '',
      })
      setErrors({})
      setMetodoSeleccionado('Transferencia')
      setValidacionDesembolso(null)

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error:', error)
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
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

  // Limpiar validación de desembolso
  const limpiarValidacion = () => {
    setValidacionDesembolso(null)
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
    loading,
    metodoSeleccionado,
    esDesembolsoCompleto,
    montoAutomatico,
    saldoPendiente,
    montoIngresado,
    validacionDesembolso,

    // Handlers
    handleSubmit,
    updateField,
    selectMetodo,
    limpiarValidacion,

    // Utilidades
    formatCurrency,
  }
}
