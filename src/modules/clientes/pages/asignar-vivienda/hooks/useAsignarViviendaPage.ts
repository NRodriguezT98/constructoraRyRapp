/**
 * Hook principal para la página de Asignar Vivienda
 * ✅ REFACTORIZADO: React Hook Form + Zod (ESTÁNDAR DE LA APLICACIÓN)
 * ✅ Sistema touchedFields (validación progresiva)
 * ✅ Orquesta stepper, form data y navegación entre pasos
 */

import { useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import {
    useAsignarViviendaForm,
    useFuentesPago,
    useProyectosViviendas,
} from '@/modules/clientes/components/asignar-vivienda/hooks'
import type { StepNumber } from '@/modules/clientes/components/asignar-vivienda/types'
import { useCrearNegociacion } from '@/modules/clientes/hooks'
import { crearDocumentosPendientesBatch } from '@/modules/clientes/services/documentos-pendientes.service'
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
  // REACT HOOK FORM (SISTEMA ESTÁNDAR) ✅
  // ============================================

  // ✅ MEMO para prevenir bucle infinito (objeto estable)
  const initialData = useMemo(() => ({
    proyecto_id: proyectosViviendas.proyectoSeleccionado,
    vivienda_id: proyectosViviendas.viviendaId,
    valor_negociado: proyectosViviendas.valorNegociado,
    descuento_aplicado: 0,
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
  const descuentoAplicado = form.descuento_aplicado
  const notas = form.notas

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
  // NAVEGACIÓN (REFACTORIZADO CON REACT HOOK FORM) ✅
  // ============================================

  const handleNext = useCallback(async () => {
    setError(null)

    // Paso 1: Validar con React Hook Form
    if (currentStep === 1) {
      const isStepValid = await form.validarPaso(currentStep)

      if (!isStepValid) {
        // Los errores se muestran automáticamente debajo de cada campo
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    // Paso 2: Validar fuentes de pago
    if (currentStep === 2) {
      // Activar visualización de errores
      setMostrarErroresPaso2(true)

      // Verificar que haya al menos una fuente activa
      if (fuentesPago.fuentesActivas.length === 0) {
        setError('⚠️ Debes activar al menos una fuente de pago')
        return
      }

      // Verificar que la suma cierre (este es el único error global)
      if (!fuentesPago.sumaCierra) {
        const faltante = fuentesPago.diferencia > 0
          ? `Falta $${fuentesPago.diferencia.toLocaleString('es-CO')} para completar el monto`
          : `Sobra $${Math.abs(fuentesPago.diferencia).toLocaleString('es-CO')}`
        setError(`⚠️ La suma de fuentes no coincide. ${faltante}`)
        return
      }

      // Validar campos individuales (los errores se mostrarán debajo de cada campo)
      const hayErrores = !fuentesPago.paso2Valido

      if (hayErrores) {
        // Los errores individuales ya se muestran en cada fuente
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // ⭐ VALIDAR DOCUMENTOS OBLIGATORIOS (Crédito Hipotecario y Caja Compensación)
      const documentosFaltantes: string[] = []

      fuentesPago.fuentesActivas.forEach((fuente) => {
        const tipo = fuente.tipo
        const config = fuente.config

        // Crédito Hipotecario requiere carta de aprobación
        if (tipo === 'Crédito Hipotecario' && !config?.carta_aprobacion_url) {
          documentosFaltantes.push('Carta de Aprobación de Crédito Hipotecario')
        }

        // Subsidio Caja Compensación requiere carta
        if (tipo === 'Subsidio Caja Compensación' && !config?.carta_aprobacion_url) {
          documentosFaltantes.push('Carta de Aprobación de Subsidio Caja Compensación')
        }
      })

      if (documentosFaltantes.length > 0) {
        const listaDocumentos = documentosFaltantes.map((doc) => `• ${doc}`).join('\n')
        setError(`⚠️ Documentos obligatorios faltantes:\n\n${listaDocumentos}\n\nPor favor sube los documentos requeridos antes de continuar.`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    // Paso válido: avanzar
    setCompletedSteps((prev) => [...new Set([...prev, currentStep])])
    const nextStep = (currentStep + 1) as StepNumber
    if (nextStep <= 3) {
      setCurrentStep(nextStep)
      setMostrarErroresPaso2(false) // Reset al cambiar de paso
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep, form])

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

      // ⭐ NUEVO: Crear documentos pendientes para cartas NO subidas
      const viviendaSeleccionada = proyectosViviendas.viviendas.find(
        (v) => v.id === proyectosViviendas.viviendaId
      )

      if (viviendaSeleccionada?.manzana_nombre && viviendaSeleccionada?.numero) {
        const documentosPendientes = fuentesPago.fuentesActivas
          .filter((fuente) => {
            // Solo crear pendiente si:
            // 1. La fuente requiere carta (no es Cuota Inicial)
            // 2. NO marcó "tengo la carta ahora"
            // 3. NO tiene carta subida
            const requiereCarta = fuente.tipo !== 'Cuota Inicial'
            const noTieneCartaAhora = !fuentesPago.tieneCartasAhora[fuente.tipo]
            const noSubioCarta = !fuente.config?.carta_aprobacion_url

            return requiereCarta && noTieneCartaAhora && noSubioCarta
          })
          .map((fuente) => ({
            clienteId,
            tipoFuente: fuente.tipo,
            entidad: fuente.config?.entidad,
            manzana: viviendaSeleccionada.manzana_nombre!,
            numeroVivienda: viviendaSeleccionada.numero.toString(),
          }))

        if (documentosPendientes.length > 0) {
          console.log('📋 Creando documentos pendientes:', documentosPendientes)
          await crearDocumentosPendientesBatch(documentosPendientes)
          console.log(`✅ ${documentosPendientes.length} documento(s) pendiente(s) creado(s)`)
        }
      }

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
  // RETURN (REFACTORIZADO) ✅
  // ============================================

  // ⭐ Obtener datos de vivienda seleccionada para documentos
  const viviendaSeleccionada = proyectosViviendas.viviendas.find(
    (v) => v.id === proyectosViviendas.viviendaId
  )

  return {
    // Stepper
    currentStep,
    completedSteps,

    // ✅ React Hook Form (SISTEMA ESTÁNDAR)
    form, // Exponer todo el form para acceso directo
    register: form.register,
    errors: form.errors,
    touchedFields: form.touchedFields, // ✅ Sistema estándar (reemplaza pasosTouched)
    setValue: form.setValue,
    watch: form.watch,

    // Proyectos y Viviendas
    ...proyectosViviendas,

    // ⭐ Datos para documentos de fuentes de pago
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
