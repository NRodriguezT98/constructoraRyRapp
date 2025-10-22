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
  // CÁLCULO DE PROGRESO (Mejora #3)
  // ============================================

  const progressStep1 = useMemo(() => {
    const campos = [
      proyectosViviendas.proyectoSeleccionado,
      proyectosViviendas.viviendaId,
      proyectosViviendas.valorNegociado > 0,
      valorTotal > 0,
    ]
    const completos = campos.filter(Boolean).length
    return Math.round((completos / campos.length) * 100)
  }, [
    proyectosViviendas.proyectoSeleccionado,
    proyectosViviendas.viviendaId,
    proyectosViviendas.valorNegociado,
    valorTotal,
  ])

  const progressStep2 = useMemo(() => {
    if (valorTotal === 0) return 0

    const fuentesHabilitadas = fuentesPago.fuentes.filter((f) => f.enabled).length
    const sumaCierra = fuentesPago.sumaCierra

    if (fuentesHabilitadas === 0) return 0
    if (sumaCierra) return 100

    // Calcular % basado en cuánto falta/sobra
    const porcentajeCubierto = (fuentesPago.totalFuentes / valorTotal) * 100
    return Math.min(porcentajeCubierto, 99) // Máximo 99% si no cierra exacto
  }, [fuentesPago.fuentes, fuentesPago.sumaCierra, fuentesPago.totalFuentes, valorTotal])

  // ============================================
  // VALIDACIÓN DE CAMPOS (Mejora #1)
  // ============================================

  const validacionCampos = useMemo(() => {
    return {
      proyecto: {
        valido: !!proyectosViviendas.proyectoSeleccionado,
        mensaje: proyectosViviendas.proyectoSeleccionado ? 'Proyecto seleccionado' : 'Selecciona un proyecto',
      },
      vivienda: {
        valido: !!proyectosViviendas.viviendaId,
        mensaje: proyectosViviendas.viviendaId ? 'Vivienda seleccionada' : 'Selecciona una vivienda',
      },
      valorVivienda: {
        valido: proyectosViviendas.valorNegociado > 0,
        mensaje: proyectosViviendas.valorNegociado > 0
          ? 'Valor cargado'
          : 'Selecciona una vivienda con valor',
      },
      descuento: {
        valido: descuentoAplicado >= 0 && descuentoAplicado < proyectosViviendas.valorNegociado,
        mensaje: descuentoAplicado >= proyectosViviendas.valorNegociado
          ? 'El descuento no puede ser mayor al valor'
          : 'Descuento válido',
      },
    }
  }, [
    proyectosViviendas.proyectoSeleccionado,
    proyectosViviendas.viviendaId,
    proyectosViviendas.valorNegociado,
    descuentoAplicado,
  ])

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
    // PASO 1: Validar información básica
    if (currentStep === 1) {
      const errores: string[] = []

      if (!proyectosViviendas.proyectoSeleccionado) {
        errores.push('Debe seleccionar un proyecto')
      }
      if (!proyectosViviendas.viviendaId) {
        errores.push('Debe seleccionar una vivienda')
      }
      if (proyectosViviendas.valorNegociado <= 0) {
        errores.push('El valor de la vivienda debe ser mayor a 0')
      }
      if (descuentoAplicado < 0) {
        errores.push('El descuento no puede ser negativo')
      }
      if (descuentoAplicado >= proyectosViviendas.valorNegociado) {
        errores.push('El descuento no puede ser mayor o igual al valor de la vivienda')
      }
      if (valorTotal <= 0) {
        errores.push('El valor total debe ser mayor a 0')
      }

      if (errores.length > 0) {
        setError(errores.join('\n'))
        return
      }

      // Limpiar errores y avanzar
      setError(null)
      setCompletedSteps((prev) => [...new Set([...prev, 1])])
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // PASO 2: Validar fuentes de pago
    else if (currentStep === 2) {
      const errores: string[] = []
      const fuentesHabilitadas = fuentesPago.fuentes.filter((f) => f.enabled)

      // Validar que haya al menos una fuente
      if (fuentesHabilitadas.length === 0) {
        errores.push('Debe configurar al menos una fuente de pago')
      }

      // Validar cada fuente habilitada
      fuentesHabilitadas.forEach((fuente) => {
        if (!fuente.config) {
          errores.push(`${fuente.tipo}: No está configurada`)
          return
        }

        const config = fuente.config
        const nombreFuente = fuente.tipo

        // Validar monto
        if (!config.monto_aprobado || config.monto_aprobado <= 0) {
          errores.push(`${nombreFuente}: El monto debe ser mayor a 0`)
        }

        // Validar campos específicos por tipo (excepto Cuota Inicial)
        if (fuente.tipo !== 'Cuota Inicial') {
          if (!config.entidad || config.entidad.trim() === '') {
            errores.push(`${nombreFuente}: Debe especificar la entidad (banco o caja)`)
          }
          if (!config.numero_referencia || config.numero_referencia.trim() === '') {
            errores.push(`${nombreFuente}: Debe especificar el número de referencia o radicado`)
          }
        }
      })

      // Validar que la suma cierre exacto
      if (!fuentesPago.sumaCierra) {
        const diferencia = Math.abs(valorTotal - fuentesPago.totalFuentes)
        if (fuentesPago.totalFuentes < valorTotal) {
          errores.push(
            `Faltan $${diferencia.toLocaleString('es-CO')} para completar el valor total`
          )
        } else {
          errores.push(
            `Hay un excedente de $${diferencia.toLocaleString('es-CO')}. Ajusta los montos`
          )
        }
      }

      if (errores.length > 0) {
        setError(errores.join('\n'))
        return
      }

      // Limpiar errores y avanzar
      setError(null)
      setCompletedSteps((prev) => [...new Set([...prev, 1, 2])])
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep, proyectosViviendas, descuentoAplicado, valorTotal, fuentesPago])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 3) {
      setCurrentStep(step as StepNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

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

    // Validaciones (Mejora #1)
    paso1Valido,
    paso2Valido,
    validacionCampos,

    // Progreso (Mejora #3)
    progressStep1,
    progressStep2,

    // Estado de creación
    creando: creando || creandoHook,
    error: error || errorHook,

    // Navegación
    handleNext,
    handleBack,
    handleCancel,
    goToStep,

    // Acciones
    handleSubmit,
  }
}
