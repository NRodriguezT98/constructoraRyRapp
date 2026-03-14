/**
 * Hook principal para la página de Asignar Vivienda
 * âœ… REFACTORIZADO: React Hook Form + Zod (ESTÁNDAR DE LA APLICACIÃ“N)
 * âœ… Sistema touchedFields (validación progresiva)
 * âœ… Orquesta stepper, form data y navegación entre pasos
 * âœ… React Query: Invalidación automática de cache
 */

import { useCallback, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase/client'
import {
    useAsignarViviendaForm,
    useFuentesPago,
    useProyectosViviendas,
} from '@/modules/clientes/components/asignar-vivienda/hooks'
import type { StepNumber } from '@/modules/clientes/components/asignar-vivienda/types'
import { useCrearNegociacion } from '@/modules/clientes/hooks'
import { validarSumaTotal } from '@/modules/clientes/utils/validar-edicion-fuentes'
import { useModal } from '@/shared/components/modals'

interface UseAsignarViviendaPageProps {
  clienteId: string
  viviendaId?: string
  valorVivienda?: number
}

export function useAsignarViviendaPage({
  clienteId,
  viviendaId: viviendaIdProp,
  valorVivienda,
}: UseAsignarViviendaPageProps) {
  const router = useRouter()
  const { confirm } = useModal()
  const queryClient = useQueryClient() // âœ… React Query client

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
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarErroresPaso2, setMostrarErroresPaso2] = useState(false)

  // ============================================
  // HOOKS PERSONALIZADOS (REUTILIZADOS) - PRIMERO
  // ============================================

  const proyectosViviendas = useProyectosViviendas({
    viviendaIdInicial: viviendaIdProp,
    valorViviendaInicial: valorVivienda,
  })

  // ============================================
  // REACT HOOK FORM (SISTEMA ESTÁNDAR) âœ…
  // ============================================

  // âœ… MEMO para prevenir bucle infinito (objeto estable)
  const initialData = useMemo(() => ({
    proyecto_id: proyectosViviendas.proyectoSeleccionado,
    vivienda_id: proyectosViviendas.viviendaId,
    valor_negociado: proyectosViviendas.valorNegociado,
    aplicar_descuento: false,
    descuento_aplicado: 0,
    tipo_descuento: '',
    motivo_descuento: '',
    valor_escritura_publica: 128000000, // Default sugerido $128M
    notas: '',
    fuentes: [],
    valor_total: 0,
  }), [
    proyectosViviendas.proyectoSeleccionado,
    proyectosViviendas.viviendaId,
    proyectosViviendas.valorNegociado,
  ])

  const form = useAsignarViviendaForm({
    initialData,
    currentStep,
  })

  // Sincronizar valores del formulario con hooks legacy
  const {
    descuento_aplicado: descuentoAplicado,
    tipo_descuento: tipoDescuento,
    motivo_descuento: motivoDescuento,
    valor_escritura_publica: valorEscrituraPublica,
    notas,
  } = form

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
  // VALIDACIÃ“N DE CAMPOS (Mejora #1)
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
  // NAVEGACIÃ“N (REFACTORIZADO CON REACT HOOK FORM) âœ…
  // ============================================

  const handleNext = useCallback(async () => {
    setError(null)

    // Paso 1: Validar con React Hook Form
    if (currentStep === 1) {
      const isStepValid = await form.validarPaso(currentStep)

      if (!isStepValid) {
        // Scroll al primer campo con error
        setTimeout(() => {
          const firstError = document.querySelector('[class*="border-red"]') || document.querySelector('[class*="text-red"]')
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 100)
        return
      }
    }

    // Paso 2: Validar fuentes de pago
    if (currentStep === 2) {
      // Activar visualización de errores
      setMostrarErroresPaso2(true)

      // Verificar que haya al menos una fuente activa
      if (fuentesPago.fuentesActivas.length === 0) {
        setError('âš ï¸ Debes activar al menos una fuente de pago')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // Verificar que la suma cierre (este es el único error global)
      if (!fuentesPago.sumaCierra) {
        const faltante = fuentesPago.diferencia > 0
          ? `Falta $${fuentesPago.diferencia.toLocaleString('es-CO')} para completar el monto`
          : `Sobra $${Math.abs(fuentesPago.diferencia).toLocaleString('es-CO')}`
        setError(`âš ï¸ La suma de fuentes no coincide. ${faltante}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // Validar campos individuales (los errores se mostrarán debajo de cada campo)
      const hayErrores = !fuentesPago.paso2Valido

      if (hayErrores) {
        // Scroll al primer campo con error
        setTimeout(() => {
          const firstError = document.querySelector('[class*="border-red"]') || document.querySelector('[class*="text-red"]')
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 100)
        return
      }

      // âœ… Ya no validamos documentos aquí
      // El sistema creará documentos_pendientes automáticamente
      // Usuario sube documentos desde la pestaña Documentos del cliente
    }

    // Paso válido: avanzar
    setCompletedSteps((prev) => [...new Set([...prev, currentStep])])
    const nextStep = (currentStep + 1) as StepNumber
    if (nextStep <= 3) {
      setCurrentStep(nextStep)
      setMostrarErroresPaso2(false) // Reset al cambiar de paso
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep, form, fuentesPago])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setMostrarErroresPaso2(false) // Limpiar errores al retroceder
      setCurrentStep((prev) => (prev - 1) as StepNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 3) {
      setMostrarErroresPaso2(false) // Limpiar errores al cambiar de paso
      setCurrentStep(step as StepNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const handleCancel = useCallback(async () => {
    const confirmed = await confirm({
      title: '¿Cancelar creación?',
      message: 'Se perderá toda la información ingresada.',
      confirmText: 'Cancelar Negociación',
      cancelText: 'Continuar Editando',
      variant: 'warning'
    })

    if (confirmed) {
      router.push(`/clientes/${clienteId}` as any)
    }
  }, [clienteId, router, confirm])

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
      const negociacion = await crearNegociacion({
        cliente_id: clienteId,
        vivienda_id: proyectosViviendas.viviendaId,
        valor_negociado: proyectosViviendas.valorNegociado,
        descuento_aplicado: descuentoAplicado,
        tipo_descuento: tipoDescuento,
        motivo_descuento: motivoDescuento,
        valor_escritura_publica: valorEscrituraPublica,
        notas,
        fuentes_pago: fuentesParaCrear,
      })

      if (!negociacion) {
        setError(errorHook || 'Error al crear negociación')
        setCreando(false)
        return
      }


      // â­ Consultar fuentes de pago creadas
      const { data: fuentesPagoCreadas, error: errorFuentes } = await supabase
        .from('fuentes_pago')
        .select('id, tipo, entidad')
        .eq('negociacion_id', negociacion.id)

      if (errorFuentes || !fuentesPagoCreadas) {
        console.error('âŒ Error consultando fuentes de pago:', errorFuentes)
        setError(errorFuentes?.message || 'Error consultando fuentes de pago')
        setCreando(false)
        return
      }

      // â­ Obtener IDs únicos de entidades (excluyendo nulls)
      const entidadIds = [...new Set(
        fuentesPagoCreadas
          .map(f => f.entidad)
          .filter((id): id is string => id !== null)
      )]

      // â­ Consultar nombres de entidades en una sola query
      const nombresEntidades = new Map<string, string>()
      if (entidadIds.length > 0) {
        const { data: entidades } = await supabase
          .from('entidades_financieras')
          .select('id, nombre')
          .in('id', entidadIds)

        entidades?.forEach(e => {
          nombresEntidades.set(e.id, e.nombre)
        })
      }


      // Sistema de vista_documentos_pendientes_fuentes calcula pendientes automáticamente

      // Limpiar y navegar al detalle del cliente
      limpiarHook()
      router.push(`/clientes/${clienteId}?tab=vivienda-asignada&highlight=${negociacion.id}` as any)
    } catch (err) {
      console.error('âŒ Error creando negociación:', err)

      // Mensaje de error más claro
      const errorMsg = err instanceof Error ? err.message : 'Error al crear negociación'
      setError(
        `${errorMsg}\n\nâš ï¸ Por favor revisa la información del descuento y vuelve a configurar las fuentes de pago.`
      )

      // â­ VOLVER AL PASO 1 para que usuario revise los datos
      setCurrentStep(1)

      // â­ RESETEAR fuentes de pago para evitar inconsistencias
      // Las fuentes se recalcularán automáticamente con el valorTotal correcto
      fuentesPago.resetear()

      // Scroll al error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setCreando(false)
    }
  }, [
    clienteId,
    proyectosViviendas.viviendaId,
    proyectosViviendas.viviendas,
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
  // RETURN (REFACTORIZADO) âœ…
  // ============================================

  // â­ Obtener datos de vivienda seleccionada para documentos
  const viviendaSeleccionada = proyectosViviendas.viviendas.find(
    (v) => v.id === proyectosViviendas.viviendaId
  )

  return {
    // Stepper
    currentStep,
    completedSteps,

    // âœ… React Hook Form (SISTEMA ESTÁNDAR)
    form, // Exponer todo el form para acceso directo
    register: form.register,
    errors: form.errors,
    touchedFields: form.touchedFields, // âœ… Sistema estándar (reemplaza pasosTouched)
    setValue: form.setValue,
    watch: form.watch,

    // Proyectos y Viviendas
    ...proyectosViviendas,

    // â­ Datos para documentos de fuentes de pago
    manzanaVivienda: viviendaSeleccionada?.manzana_nombre,
    numeroVivienda: viviendaSeleccionada?.numero,

    // Descuento y Notas (desde form)
    descuentoAplicado: form.descuento_aplicado,
    setDescuentoAplicado: (val: number) => form.setValue('descuento_aplicado', val),
    notas: form.notas,
    setNotas: (val: string) => form.setValue('notas', val),

    // Valor Total
    valorTotal,

    // Fuentes de Pago
    ...fuentesPago,

    // Validaciones (desde form)
    paso1Valido: form.paso1Valido,
    paso2Valido: form.paso2Valido,
    validacionCampos, // Mantener por compatibilidad (deprecar luego)

    // Progreso (desde form)
    progressStep1: form.porcentajeProgresoPaso1,
    progressStep2,

    // Estado de creación
    creando: creando || creandoHook,
    error: error || errorHook,
    mostrarErroresPaso2,

    // Navegación
    handleNext,
    handleBack,
    handleCancel,
    goToStep,

    // Acciones
    handleSubmit,
  }
}
