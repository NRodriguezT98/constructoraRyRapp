/**
 * Hook principal para el Modal de Crear Negociación
 * Orquesta el stepper, form data y navegación entre pasos
 */

import { useCrearNegociacion } from '@/modules/clientes/hooks'
import { validarSumaTotal } from '@/modules/clientes/utils/validar-edicion-fuentes'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { StepNumber } from '../types'
import { useFuentesPago } from './useFuentesPago'
import { useProyectosViviendas } from './useProyectosViviendas'

interface UseModalNegociacionProps {
  isOpen: boolean
  clienteId: string
  viviendaId?: string
  valorVivienda?: number
  onSuccess: (negociacionId: string) => void
  onClose: () => void
}

export function useModalNegociacion({
  isOpen,
  clienteId,
  viviendaId: viviendaIdProp,
  valorVivienda,
  onSuccess,
  onClose,
}: UseModalNegociacionProps) {
  // ============================================
  // HOOKS EXTERNOS
  // ============================================

  const {
    crearNegociacion,
    creando: creandoHook,
    error: errorHook,
    limpiar: limpiarHook,
  } = useCrearNegociacion()

  // ============================================
  // ESTADO LOCAL
  // ============================================

  const [currentStep, setCurrentStep] = useState<StepNumber>(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [descuentoAplicado, setDescuentoAplicado] = useState(0)
  const [notas, setNotas] = useState('')
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================
  // HOOKS PERSONALIZADOS
  // ============================================

  const proyectosViviendas = useProyectosViviendas({
    viviendaIdInicial: viviendaIdProp,
    valorViviendaInicial: valorVivienda,
  })

  const valorTotal = useMemo(() => {
    return Math.max(0, proyectosViviendas.valorNegociado - descuentoAplicado)
  }, [proyectosViviendas.valorNegociado, descuentoAplicado])

  const fuentesPago = useFuentesPago({ valorTotal })

  // ============================================
  // VALIDACIONES POR PASO
  // ============================================

  const paso1Valido = useMemo(() => {
    return (
      proyectosViviendas.viviendaId !== '' &&
      proyectosViviendas.valorNegociado > 0 &&
      descuentoAplicado >= 0 &&
      descuentoAplicado < proyectosViviendas.valorNegociado &&
      valorTotal > 0
    )
  }, [proyectosViviendas.viviendaId, proyectosViviendas.valorNegociado, descuentoAplicado, valorTotal])

  // paso2Valido viene de useFuentesPago
  const { paso2Valido } = fuentesPago

  // ============================================
  // EFECTOS
  // ============================================

  // Cargar proyectos al abrir modal
  useEffect(() => {
    if (isOpen) {
      proyectosViviendas.cargarProyectos()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const handleNext = useCallback(() => {
    if (currentStep === 1 && paso1Valido) {
      setCompletedSteps((prev) => [...new Set([...prev, 1])])
      setCurrentStep(2)
    } else if (currentStep === 2 && paso2Valido) {
      setCompletedSteps((prev) => [...new Set([...prev, 1, 2])])
      setCurrentStep(3)
    }
  }, [currentStep, paso1Valido, paso2Valido])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber)
    }
  }, [currentStep])

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = useCallback(async () => {
    setCreando(true)
    setError(null)

    try {
      // Obtener fuentes para crear
      const fuentesParaCrear = fuentesPago.obtenerFuentesParaCrear()

      // Validar suma total
      const validacion = validarSumaTotal(fuentesParaCrear, valorTotal)

      if (!validacion.valido) {
        setError(validacion.errores.join('\n'))
        setCreando(false)
        return
      }

      // Crear negociación con fuentes de pago
      console.log('📝 Creando negociación con fuentes de pago...')
      const negociacion = await crearNegociacion({
        cliente_id: clienteId,
        vivienda_id: proyectosViviendas.viviendaId,
        valor_negociado: proyectosViviendas.valorNegociado,
        descuento_aplicado: descuentoAplicado,
        notas,
        fuentes_pago: fuentesParaCrear,
      })

      if (!negociacion) {
        setError(errorHook || 'Error al crear negociación')
        setCreando(false)
        return
      }

      console.log('✅ Negociación creada exitosamente:', negociacion.id)

      // Limpiar y cerrar
      limpiarHook()
      onSuccess(negociacion.id)
      handleClose()
    } catch (err) {
      console.error('❌ Error creando negociación:', err)
      setError(err instanceof Error ? err.message : 'Error al crear negociación')
    } finally {
      setCreando(false)
    }
  }, [
    clienteId,
    proyectosViviendas.viviendaId,
    proyectosViviendas.valorNegociado,
    descuentoAplicado,
    notas,
    valorTotal,
    fuentesPago,
    crearNegociacion,
    errorHook,
    limpiarHook,
    onSuccess,
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // CERRAR Y RESETEAR
  // ============================================

  const handleClose = useCallback(() => {
    setCurrentStep(1)
    setCompletedSteps([])
    setDescuentoAplicado(0)
    setNotas('')
    setError(null)
    proyectosViviendas.resetear()
    fuentesPago.resetear()
    onClose()
  }, [proyectosViviendas, fuentesPago, onClose])

  // ============================================
  // RETURN
  // ============================================

  return {
    // Stepper
    currentStep,
    completedSteps,

    // Proyectos y Viviendas
    ...proyectosViviendas,

    // Descuento y Notas
    descuentoAplicado,
    setDescuentoAplicado,
    notas,
    setNotas,

    // Valor Total
    valorTotal,

    // Fuentes de Pago
    ...fuentesPago,

    // Validaciones
    paso1Valido,
    paso2Valido,

    // Estado de creación
    creando: creando || creandoHook,
    error: error || errorHook,

    // Navegación
    handleNext,
    handleBack,

    // Acciones
    handleSubmit,
    handleClose,
  }
}
