/**
 * Hook para formulario de Asignar Vivienda
 * ✅ React Hook Form + Zod (ESTÁNDAR DE LA APLICACIÓN)
 * ✅ Validación por paso
 * ✅ Sistema touchedFields (no mostrar errores hasta interacción)
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import type { AsignarViviendaFormData } from '../schemas'
import { asignarViviendaSchema } from '../schemas'

interface UseAsignarViviendaFormProps {
  initialData?: Partial<AsignarViviendaFormData>
  currentStep: number
}

export function useAsignarViviendaForm({
  initialData,
  currentStep,
}: UseAsignarViviendaFormProps) {

  // ============================================
  // REACT HOOK FORM CON ZOD
  // ============================================

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting, isValid },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm<any>({ // Usar any temporalmente para evitar conflictos de tipos
    resolver: zodResolver(asignarViviendaSchema),
    mode: 'onChange', // Validar mientras escribe
    defaultValues: {
      proyecto_id: initialData?.proyecto_id || '',
      vivienda_id: initialData?.vivienda_id || '',
      valor_negociado: initialData?.valor_negociado || 0,
      descuento_aplicado: initialData?.descuento_aplicado || 0,
      notas: initialData?.notas || '',
      fuentes: initialData?.fuentes || [],
      valor_total: initialData?.valor_total || 0,
    },
  })

  // ============================================
  // VALORES OBSERVADOS
  // ============================================

  const watchedFields = watch()

  const proyecto_id = watch('proyecto_id')
  const vivienda_id = watch('vivienda_id')
  const valor_negociado = watch('valor_negociado')
  const descuento_aplicado = watch('descuento_aplicado')
  const notas = watch('notas')
  const fuentes = watch('fuentes')
  const valor_total = watch('valor_total')

  // ============================================
  // VALIDACIÓN POR PASO
  // ============================================

  // Validar SOLO campos del paso actual
  const validarPaso = async (step: number): Promise<boolean> => {
    let isValid = false

    switch (step) {
      case 1:
        // Validar paso 1
        isValid = await trigger(['proyecto_id', 'vivienda_id', 'valor_negociado', 'descuento_aplicado'])
        break

      case 2:
        // Validar paso 2
        isValid = await trigger(['fuentes', 'valor_total'])
        break

      case 3:
        // Paso 3 es solo revisión, no tiene validación
        isValid = true
        break

      default:
        isValid = false
    }

    return isValid
  }

  // ============================================
  // PASO 1: HELPERS
  // ============================================

  const paso1Valido = () => {
    return (
      !!proyecto_id &&
      !!vivienda_id &&
      valor_negociado > 0 &&
      descuento_aplicado >= 0 &&
      descuento_aplicado < valor_negociado
    )
  }

  const camposCompletadosPaso1 = () => {
    return [
      !!proyecto_id,
      !!vivienda_id,
      valor_negociado > 0,
      descuento_aplicado >= 0 && descuento_aplicado < valor_negociado,
    ].filter(Boolean).length
  }

  const porcentajeProgresoPaso1 = () => {
    return Math.round((camposCompletadosPaso1() / 4) * 100)
  }

  // ============================================
  // PASO 2: HELPERS
  // ============================================

  const totalFuentes = fuentes.reduce((acc, f) => acc + (f.monto_aprobado || 0), 0)
  const diferencia = valor_total - totalFuentes
  const sumaCierra = Math.abs(diferencia) < 0.01

  const paso2Valido = () => {
    return (
      fuentes.length > 0 &&
      sumaCierra &&
      fuentes.every((f) => {
        // Validar monto obligatorio para todas las fuentes
        const montoValido = f.monto_aprobado > 0

        // Cuota Inicial: solo requiere monto
        if (f.tipo === 'Cuota Inicial') {
          return montoValido
        }

        // Subsidio Mi Casa Ya: requiere monto, entidad NO es obligatoria, numero_referencia es opcional
        if (f.tipo === 'Subsidio Mi Casa Ya') {
          return montoValido
        }

        // Crédito Hipotecario: requiere monto, entidad (banco), numero_referencia
        if (f.tipo === 'Crédito Hipotecario') {
          const entidadValida = f.entidad && f.entidad.trim() !== ''
          const numeroValido = f.numero_referencia && f.numero_referencia.trim() !== ''
          return montoValido && entidadValida && numeroValido
        }

        // Subsidio Caja Compensación: requiere monto, entidad (caja), numero_referencia (acta), fecha_acta
        if (f.tipo === 'Subsidio Caja Compensación') {
          const entidadValida = f.entidad && f.entidad.trim() !== ''
          const numeroValido = f.numero_referencia && f.numero_referencia.trim() !== ''
          const fechaActaValida = f.fecha_acta && f.fecha_acta.trim() !== ''
          return montoValido && entidadValida && numeroValido && fechaActaValida
        }

        // Fallback: requiere monto, entidad y número
        const entidadValida = f.entidad && f.entidad.trim() !== ''
        const numeroValido = f.numero_referencia && f.numero_referencia.trim() !== ''
        return montoValido && entidadValida && numeroValido
      })
    )
  }

  // ============================================
  // RESET AL CAMBIAR INITIALDATA
  // ============================================

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]) // ✅ SOLO initialData (reset es estable pero ESLint no lo detecta)

  // ============================================
  // RETURN
  // ============================================

  return {
    // React Hook Form
    register,
    handleSubmit,
    errors,
    touchedFields, // ✅ SISTEMA ESTÁNDAR: mostrar error solo si touched
    isSubmitting,
    isValid,
    setValue,
    watch,
    trigger,
    reset,

    // Valores observados
    proyecto_id,
    vivienda_id,
    valor_negociado,
    descuento_aplicado,
    notas,
    fuentes,
    valor_total,

    // Validación por paso
    validarPaso,
    paso1Valido: paso1Valido(),
    paso2Valido: paso2Valido(),

    // Progreso Paso 1
    camposCompletadosPaso1: camposCompletadosPaso1(),
    porcentajeProgresoPaso1: porcentajeProgresoPaso1(),

    // Progreso Paso 2
    totalFuentes,
    diferencia,
    sumaCierra,
  }
}
