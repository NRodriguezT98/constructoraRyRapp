/**
 * useEditarVivienda - Hook PROFESIONAL para edición de viviendas
 * ✅ React Hook Form con Zod validation
 * ✅ React Query para mutations y cache
 * ✅ Wizard multi-paso con validación por paso
 * ✅ Separación de responsabilidades ESTRICTA
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import {
    paso1Schema,
    paso2Schema,
    paso3SchemaBase,
    paso4Schema,
    viviendaFullSchema,
    type ViviendaSchemaType
} from '../schemas/vivienda.schemas'
import { viviendasService } from '../services/viviendas.service'
import type { ResumenFinanciero, Vivienda, ViviendaFormData } from '../types'
import { calcularValorTotal, detectarCambiosVivienda } from '../utils'

import {
    useActualizarViviendaMutation,
    useConfiguracionRecargosQuery,
    useGastosNotarialesQuery,
    useManzanasDisponiblesQuery,
    useProyectosActivosQuery,
} from './useViviendasQuery'

// ==================== SCHEMAS POR PASO ====================
// ✅ Importados desde archivo compartido (DRY principle)

type FormData = ViviendaSchemaType// ==================== PASOS ====================

const PASOS = [
  { id: 1, key: 'ubicacion' as const, titulo: 'Ubicación', schema: paso1Schema },
  { id: 2, key: 'linderos' as const, titulo: 'Linderos', schema: paso2Schema },
  { id: 3, key: 'legal' as const, titulo: 'Legal', schema: paso3SchemaBase },
  { id: 4, key: 'financiero' as const, titulo: 'Financiero', schema: paso4Schema },
]

// ==================== PROPS ====================

interface UseEditarViviendaProps {
  vivienda: Vivienda | null
  onSuccess?: (viviendaActualizada: Vivienda) => void
  onCancel?: () => void
}

// ==================== HOOK ====================

export function useEditarVivienda({ vivienda, onSuccess, onCancel }: UseEditarViviendaProps) {
  const router = useRouter()

  // ============================================
  // ESTADO DEL WIZARD
  // ============================================
  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<number[]>([])
  const [validandoMatricula, setValidandoMatricula] = useState(false)
  const [hayFormularioConCambios, setHayFormularioConCambios] = useState(false)
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false)

  // ============================================
  // REACT QUERY - DATOS DEL SERVIDOR
  // ============================================
  const { data: proyectos = [], isLoading: cargandoProyectos } = useProyectosActivosQuery()
  const { data: gastosNotariales = 0 } = useGastosNotarialesQuery()
  const { data: configuracionRecargos = [] } = useConfiguracionRecargosQuery()

  // Cargar manzanas del proyecto (solo si hay proyecto_id)
  const proyectoId = vivienda?.manzanas?.proyecto_id
  const { data: manzanas = [], isLoading: cargandoManzanas } = useManzanasDisponiblesQuery(proyectoId || '')

  // Mutation para actualizar
  const actualizarMutation = useActualizarViviendaMutation()

  // ============================================
  // REACT HOOK FORM
  // ============================================
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    trigger,
    getValues,
    reset,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(viviendaFullSchema),
    mode: 'onChange',
    defaultValues: {
      proyecto_id: '',
      manzana_id: '',
      numero: '',
      lindero_norte: '',
      lindero_sur: '',
      lindero_oriente: '',
      lindero_occidente: '',
      matricula_inmobiliaria: '',
      nomenclatura: '',
      area_lote: '',
      area_construida: '',
      tipo_vivienda: '',
      valor_base: 0,
      es_esquinera: false,
      recargo_esquinera: 0,
    },
  })

  // ============================================
  // CARGAR DATOS INICIALES DE LA VIVIENDA
  // ============================================
  useEffect(() => {
    if (vivienda) {
      reset({
        proyecto_id: vivienda.manzanas?.proyecto_id || '',
        manzana_id: vivienda.manzana_id,
        numero: String(vivienda.numero),
        lindero_norte: vivienda.lindero_norte || '',
        lindero_sur: vivienda.lindero_sur || '',
        lindero_oriente: vivienda.lindero_oriente || '',
        lindero_occidente: vivienda.lindero_occidente || '',
        matricula_inmobiliaria: vivienda.matricula_inmobiliaria || '',
        nomenclatura: vivienda.nomenclatura || '',
        area_lote: String(vivienda.area_lote || ''),
        area_construida: String(vivienda.area_construida || ''),
        tipo_vivienda: vivienda.tipo_vivienda || '',
        valor_base: vivienda.valor_base || 0,
        es_esquinera: vivienda.es_esquinera || false,
        recargo_esquinera: vivienda.recargo_esquinera || 0,
      })

      // ✅ Solo marcar paso 1 como completado (ubicación no editable)
      // Los demás pasos requieren validación manual antes de avanzar
      setPasosCompletados([1])
    }
  }, [vivienda, reset])

  // Detectar cambios en el formulario
  useEffect(() => {
    setHayFormularioConCambios(isDirty)
  }, [isDirty])

  // ============================================
  // WATCH VALORES
  // ============================================
  const formData = watch()
  const esEsquinera = watch('es_esquinera')
  const valorBase = watch('valor_base')
  const recargoEsquinera = watch('recargo_esquinera')

  // ============================================
  // MANZANA SELECCIONADA
  // ============================================
  const manzanaSeleccionada = useMemo(() => {
    if (!formData.manzana_id) return null
    return manzanas.find((m) => m.id === formData.manzana_id)
  }, [formData.manzana_id, manzanas])

  // ============================================
  // RESUMEN FINANCIERO
  // ============================================
  const resumenFinanciero: ResumenFinanciero = useMemo(() => {
    const recargoFinal = esEsquinera ? recargoEsquinera || 0 : 0
    const valorTotal = calcularValorTotal(valorBase || 0, gastosNotariales, recargoFinal)

    return {
      valor_base: valorBase || 0,
      gastos_notariales: gastosNotariales,
      recargo_esquinera: recargoFinal,
      valor_total: valorTotal,
    }
  }, [valorBase, esEsquinera, recargoEsquinera, gastosNotariales])

  // ============================================
  // PREVIEW DATA
  // ============================================
  const previewData = useMemo(() => {
    const proyecto = proyectos.find((p) => p.id === formData.proyecto_id)
    const manzana = manzanas.find((m) => m.id === formData.manzana_id)

    return {
      ...formData,
      proyecto_nombre: proyecto?.nombre || '',
      manzana_nombre: manzana?.nombre || '',
      ...resumenFinanciero,
    }
  }, [formData, proyectos, manzanas, resumenFinanciero])

  // ============================================
  // CAMBIOS DETECTADOS (para paso 5)
  // ============================================
  const cambiosDetectados = useMemo(() => {
    if (!vivienda) return []
    return detectarCambiosVivienda({ viviendaActual: vivienda, formData })
  }, [vivienda, formData])

  // ============================================
  // CONFIGURACIÓN DEL PASO ACTUAL
  // ============================================
  const pasoActualConfig = PASOS.find((p) => p.id === pasoActual) || PASOS[0]
  const totalPasos = PASOS.length
  const progreso = (pasoActual / totalPasos) * 100
  const esPrimerPaso = pasoActual === 1
  const esUltimoPaso = pasoActual === totalPasos

  // ============================================
  // VALIDACIÓN POR PASO
  // ============================================
  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    const pasoConfig = PASOS.find((p) => p.id === pasoActual)
    if (!pasoConfig) return true

    // ✅ PASO 1 en modo edición: Ya está validado (datos existentes, no modificables)
    if (pasoActual === 1 && vivienda) {
      return true
    }

    // Validar con el schema del paso
    const valido = await trigger(Object.keys(pasoConfig.schema.shape) as any)

    // ✅ Validaciones adicionales para paso 3: Ejecutar en PARALELO
    if (pasoActual === 3 && valido) {
      const erroresEncontrados: Array<{ campo: string; mensaje: string }> = []

      // Preparar validaciones síncronas y asíncronas
      const areaLote = Number(getValues('area_lote'))
      const areaConstruida = Number(getValues('area_construida'))
      const matricula = getValues('matricula_inmobiliaria')

      // Validación síncrona: Área construida <= Área del lote
      if (areaConstruida > areaLote) {
        erroresEncontrados.push({
          campo: 'area_construida',
          mensaje: 'El área construida no puede ser mayor al área del lote'
        })
      }

      // Validación asíncrona: Matrícula única (solo si cambió)
      if (matricula && matricula !== vivienda?.matricula_inmobiliaria) {
        setValidandoMatricula(true)
        try {
          const resultado = await viviendasService.verificarMatriculaUnica(matricula, vivienda?.id)
          if (!resultado.esUnica && resultado.viviendaDuplicada) {
            erroresEncontrados.push({
              campo: 'matricula_inmobiliaria',
              mensaje: `Esta matrícula ya está registrada en la Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`
            })
          }
        } catch (error) {
          erroresEncontrados.push({
            campo: 'matricula_inmobiliaria',
            mensaje: 'Error al validar la matrícula. Intenta nuevamente.'
          })
        } finally {
          setValidandoMatricula(false)
        }
      }

      // ✅ Setear TODOS los errores al mismo tiempo
      if (erroresEncontrados.length > 0) {
        erroresEncontrados.forEach((error) => {
          setError(error.campo as any, {
            type: 'manual',
            message: error.mensaje
          })
        })
        return false
      }
    }

    return valido
  }, [pasoActual, trigger, getValues, vivienda])

  // ============================================
  // NAVEGACIÓN
  // ============================================
  const irSiguiente = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return

    // Marcar paso como completado
    if (!pasosCompletados.includes(pasoActual)) {
      setPasosCompletados((prev) => [...prev, pasoActual])
    }

    // Avanzar
    if (pasoActual < totalPasos) {
      setPasoActual(pasoActual + 1)
    }
  }, [pasoActual, totalPasos, validarPasoActual, pasosCompletados])

  const irAtras = useCallback(() => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1)
    }
  }, [pasoActual])

  const irAPaso = useCallback((paso: number) => {
    // ✅ Solo permitir ir a:
    // 1. Pasos completados (hacia atrás o cualquier paso ya validado)
    // 2. El paso actual
    // ❌ NO permitir saltar hacia adelante sin validar
    if (pasosCompletados.includes(paso) || paso === pasoActual) {
      setPasoActual(paso)
    } else {
      toast.warning('Completa el paso actual', {
        description: 'Debes completar el paso actual antes de avanzar'
      })
    }
  }, [pasosCompletados, pasoActual])

  // ============================================
  // SUBMIT
  // ============================================
  // Mostrar modal de confirmación en lugar de guardar directamente
  const mostrarConfirmacion = useCallback(() => {
    console.log('🔵 mostrarConfirmacion llamado')
    setMostrarModalConfirmacion(true)
  }, [])

  // Guardar cambios después de confirmar
  const confirmarYGuardar = useCallback(
    async () => {
      if (!vivienda) return

      const data = getValues()

      try {
        // Preparar datos para actualización
        const updateData: Partial<ViviendaFormData> = {
          lindero_norte: data.lindero_norte,
          lindero_sur: data.lindero_sur,
          lindero_oriente: data.lindero_oriente,
          lindero_occidente: data.lindero_occidente,
          matricula_inmobiliaria: data.matricula_inmobiliaria,
          nomenclatura: data.nomenclatura,
          area_lote: Number(data.area_lote),
          area_construida: Number(data.area_construida),
          tipo_vivienda: data.tipo_vivienda as any,
          valor_base: data.valor_base,
          es_esquinera: data.es_esquinera,
          recargo_esquinera: data.recargo_esquinera,
        }

        // Ejecutar mutation
        const viviendaActualizada = await actualizarMutation.mutateAsync({
          id: vivienda.id,
          data: updateData,
        })

        // Éxito
        setHayFormularioConCambios(false)
        setMostrarModalConfirmacion(false)
        onSuccess?.(viviendaActualizada)
      } catch (error) {
        console.error('Error en submit:', error)
      }
    },
    [vivienda, actualizarMutation, onSuccess, getValues]
  )

  // ============================================
  // CANCELAR
  // ============================================
  const cancelar = useCallback(() => {
    if (hayFormularioConCambios) {
      const confirmar = window.confirm('¿Estás seguro? Los cambios no guardados se perderán.')
      if (!confirmar) return
    }

    setPasoActual(1)
    setHayFormularioConCambios(false)
    onCancel?.()
  }, [hayFormularioConCambios, onCancel])

  // ============================================
  // RETURN
  // ============================================
  return {
    // React Hook Form
    register,
    errors,
    setValue,
    watch,
    formData,

    // Estado del wizard
    pasoActual,
    pasoActualConfig,
    totalPasos,
    progreso,
    esPrimerPaso,
    esUltimoPaso,
    pasosCompletados,
    pasos: PASOS,

    // Datos
    previewData,
    resumenFinanciero,
    cambiosDetectados,

    // Datos del servidor (React Query)
    proyectos,
    manzanas,
    manzanaSeleccionada,
    gastosNotariales,
    configuracionRecargos,

    // Estados de carga
    cargandoProyectos,
    cargandoManzanas,
    validandoMatricula,
    submitting: actualizarMutation.isPending,
    hayFormularioConCambios,

    // Modal de confirmación
    mostrarModalConfirmacion,
    setMostrarModalConfirmacion,

    // Acciones
    irSiguiente,
    irAtras,
    irAPaso,
    cancelar,
    mostrarConfirmacion,
    confirmarYGuardar,
  }
}
