/**
 * Hook principal para la página de Crear Negociación
 * Orquesta el stepper, form data y navegación entre pasos
 *
 * ⚠️ Reutiliza hooks del modal refactorizado
 */

import {
    useFuentesPago,
    useProyectosViviendas
} from '@/modules/clientes/components/modals/modal-crear-negociacion/hooks'
import type { StepNumber } from '@/modules/clientes/components/modals/modal-crear-negociacion/types'
import { useCrearNegociacion } from '@/modules/clientes/hooks'
import { validarSumaTotal } from '@/modules/clientes/utils/validar-edicion-fuentes'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface UseCrearNegociacionPageProps {
  clienteId: string
  viviendaId?: string
  valorVivienda?: number
}

export function useCrearNegociacionPage({
  clienteId,
  viviendaId: viviendaIdProp,
  valorVivienda,
}: UseCrearNegociacionPageProps) {
  const router = useRouter()

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
  // HOOKS PERSONALIZADOS (REUTILIZADOS)
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

  const { paso2Valido } = fuentesPago

  // ============================================
  // EFECTOS
  // ============================================

  // Cargar proyectos al montar
  useEffect(() => {
    proyectosViviendas.cargarProyectos()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const handleNext = useCallback(() => {
    if (currentStep === 1 && paso1Valido) {
      setCompletedSteps((prev) => [...new Set([...prev, 1])])
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentStep === 2 && paso2Valido) {
      setCompletedSteps((prev) => [...new Set([...prev, 1, 2])])
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep, paso1Valido, paso2Valido])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const handleCancel = useCallback(() => {
    if (confirm('¿Estás seguro de cancelar? Se perderá toda la información ingresada.')) {
      router.push(`/clientes/${clienteId}` as any)
    }
  }, [clienteId, router])

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
      console.log('📝 Creando negociación desde vista completa...')
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

      // Limpiar y navegar al detalle del cliente
      limpiarHook()
      router.push(`/clientes/${clienteId}?tab=negociaciones&highlight=${negociacion.id}` as any)
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
    router,
  ])

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
    handleCancel,

    // Acciones
    handleSubmit,
  }
}
