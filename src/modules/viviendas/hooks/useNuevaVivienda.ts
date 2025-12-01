/**
 * useNuevaVivienda - Hook con lógica del wizard de 5 pasos
 * ✅ Separación de responsabilidades ESTRICTA
 * ✅ Gestión de pasos
 * ✅ Validación por paso
 * ✅ Preview en tiempo real
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useRouter } from 'next/navigation'

import { viviendasService } from '../services/viviendas.service'
import type { ResumenFinanciero, ViviendaFormData } from '../types'
import { calcularValorTotal } from '../utils'

// ==================== SCHEMAS POR PASO ====================

const paso1Schema = z.object({
  proyecto_id: z.string().min(1, 'Selecciona un proyecto'),
  manzana_id: z.string().min(1, 'Selecciona una manzana'),
  numero: z.string().min(1, 'El número de vivienda es obligatorio'),
})

const paso2Schema = z.object({
  lindero_norte: z
    .string()
    .min(5, 'Describe el lindero Norte (mínimo 5 caracteres)')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-]+$/,
      'Solo se permiten letras, números, espacios, puntos, comas y guiones'
    ),
  lindero_sur: z
    .string()
    .min(5, 'Describe el lindero Sur (mínimo 5 caracteres)')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-]+$/,
      'Solo se permiten letras, números, espacios, puntos, comas y guiones'
    ),
  lindero_oriente: z
    .string()
    .min(5, 'Describe el lindero Oriente (mínimo 5 caracteres)')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-]+$/,
      'Solo se permiten letras, números, espacios, puntos, comas y guiones'
    ),
  lindero_occidente: z
    .string()
    .min(5, 'Describe el lindero Occidente (mínimo 5 caracteres)')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-]+$/,
      'Solo se permiten letras, números, espacios, puntos, comas y guiones'
    ),
})

const paso3SchemaBase = z.object({
  matricula_inmobiliaria: z
    .string()
    .min(1, 'La matrícula inmobiliaria es obligatoria')
    .regex(
      /^[0-9\-]+$/,
      'Solo se permiten números y guiones (Ej: 050-123456)'
    ),
  nomenclatura: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .regex(
      /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ#.,\-()°]+$/,
      'Solo se permiten letras, números, #, -, espacios, puntos, comas, paréntesis y grado (°)'
    ),
  // ✅ SOLUCIÓN PROFESIONAL: String que se valida como número decimal
  area_lote: z
    .string()
    .min(1, 'El área del lote es obligatoria')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Debe ser un número mayor a 0'
    })
    .transform((val) => Number(val)), // Convierte a número al final
  area_construida: z
    .string()
    .min(1, 'El área construida es obligatoria')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Debe ser un número mayor a 0'
    })
    .transform((val) => Number(val)), // Convierte a número al final
  tipo_vivienda: z.enum(['Regular', 'Irregular']),
  certificado_tradicion_file: z.instanceof(File).optional(),
}).refine(
  (data) => {
    // ✅ Validación cruzada: área construida no puede ser mayor al área del lote
    const areaLote = Number(data.area_lote)
    const areaConstruida = Number(data.area_construida)
    return areaConstruida <= areaLote
  },
  {
    message: 'El área construida no puede ser mayor al área del lote',
    path: ['area_construida'], // Mostrar error en el campo area_construida
  }
)

const paso4Schema = z.object({
  // ✅ SOLUCIÓN PROFESIONAL: Acepta string O number, transforma a number
  valor_base: z.union([
    z.string().min(1, 'El valor base es obligatorio'),
    z.number()
  ]).pipe(
    z.coerce.number().min(1, 'El valor base debe ser mayor a 0')
  ),
  es_esquinera: z.boolean(),
  recargo_esquinera: z.union([
    z.string(),
    z.number()
  ]).pipe(
    z.coerce.number().min(0, 'El recargo debe ser mayor o igual a 0')
  ).optional().default(0),
})

// ✅ Schema factory: permite validación async de matrícula duplicada
const createPaso3Schema = (viviendaId?: string) => {
  return paso3SchemaBase
    .superRefine(async (data, ctx) => {
      // ✅ Validación async: Verificar matrícula duplicada
      if (data.matricula_inmobiliaria && data.matricula_inmobiliaria.length >= 7) {
        try {
          const resultado = await viviendasService.verificarMatriculaUnica(
            data.matricula_inmobiliaria,
            viviendaId
          )

          if (!resultado.esUnica && resultado.viviendaDuplicada) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Esta matrícula ya está registrada en la Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`,
              path: ['matricula_inmobiliaria'],
            })
          }
        } catch (error) {
          // No bloqueamos el submit si falla la validación async
        }
      }
    })
}

// Schema base sin validación async (para uso general)
const paso3Schema = paso3SchemaBase

// Schema completo base (sin validación async)
const viviendaSchemaBase = paso1Schema
  .merge(paso2Schema)
  .merge(paso3Schema)
  .merge(paso4Schema)

// ✅ Schema factory completo con validación async
const createViviendaSchema = (viviendaId?: string) => {
  return paso1Schema
    .merge(paso2Schema)
    .merge(createPaso3Schema(viviendaId))
    .merge(paso4Schema)
}

// Schema para tipo (sin validación async)
const viviendaSchema = viviendaSchemaBase

type ViviendaFormSchema = z.infer<typeof viviendaSchema>

// ==================== CONFIGURACIÓN DE PASOS ====================

// ✅ Factory para configuración de pasos (permite inyectar viviendaId)
const createPasosConfig = (viviendaId?: string) => [
  {
    id: 1,
    titulo: 'Ubicación',
    descripcion: 'Selecciona proyecto, manzana y vivienda',
    icon: 'MapPin',
    schema: paso1Schema,
  },
  {
    id: 2,
    titulo: 'Linderos',
    descripcion: 'Define los límites de la vivienda',
    icon: 'Compass',
    schema: paso2Schema,
  },
  {
    id: 3,
    titulo: 'Información Legal',
    descripcion: 'Datos catastrales y documentos',
    icon: 'FileText',
    schema: createPaso3Schema(viviendaId), // ← Schema con validación async
  },
  {
    id: 4,
    titulo: 'Información Financiera',
    descripcion: 'Valor base y recargos',
    icon: 'DollarSign',
    schema: paso4Schema,
  },
  {
    id: 5,
    titulo: 'Resumen',
    descripcion: 'Revisa la información antes de guardar',
    icon: 'CheckCircle',
    schema: z.object({}), // Sin validación, solo preview
  },
]

// ==================== HOOK ====================

interface UseNuevaViviendaParams {
  onSubmit: (data: ViviendaFormData) => Promise<void>
  viviendaId?: string // ← Para modo edición (futuro)
}

export function useNuevaVivienda({ onSubmit, viviendaId }: UseNuevaViviendaParams) {
  const router = useRouter()
  const [pasoActual, setPasoActual] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [gastosNotariales, setGastosNotariales] = useState(5_000_000) // Default: 5M
  const [configuracionRecargos, setConfiguracionRecargos] = useState<any[]>([])

  // ✅ Crear configuración de pasos con validación async
  const PASOS_CONFIG = useMemo(() => createPasosConfig(viviendaId), [viviendaId])

  // ✅ Crear schema con validación async de matrícula
  const schemaConValidacionAsync = useMemo(
    () => createViviendaSchema(viviendaId),
    [viviendaId]
  )

  // 🔒 GUARDIA CRÍTICA: Ref para trackear si el usuario hizo click explícito en "Guardar"
  const submitAutorizadoRef = useRef(false)

  // 🔍 LOGGER: Detectar cambios en pasoActual
  useEffect(() => {

    // 🔒 RESET: Al cambiar de paso, resetear autorización de submit
    submitAutorizadoRef.current = false
  }, [pasoActual])

  // Cargar gastos notariales y configuración de recargos desde DB
  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const [gastos, recargos] = await Promise.all([
          viviendasService.obtenerGastosNotariales(),
          viviendasService.obtenerConfiguracionRecargos(),
        ])


        setGastosNotariales(gastos)
        setConfiguracionRecargos(recargos)
      } catch (error) {
      }
    }
    cargarConfiguracion()
  }, [])

  // React Hook Form con schema BASE (sin validación async)
  // ✅ La validación async se ejecutará solo en handleSiguientePaso paso 3
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    setError,
    getValues,
    formState: { errors, isValidating },
  } = useForm<ViviendaFormSchema>({
    resolver: zodResolver(viviendaSchema), // ← Schema base sin validación async
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
      tipo_vivienda: 'Regular' as const,
      valor_base: 0,
      es_esquinera: false,
      recargo_esquinera: 0,
    },
  })

  // Watch de todos los campos para preview
  const formData = watch()

  // ==================== CÁLCULOS FINANCIEROS ====================

  // Calcular resumen financiero en tiempo real
  const resumenFinanciero = useMemo((): ResumenFinanciero => {
    const valorBase = formData.valor_base || 0
    const recargoEsquinera = formData.es_esquinera ? (formData.recargo_esquinera || 0) : 0
    const valorTotal = calcularValorTotal(valorBase, gastosNotariales, recargoEsquinera)

    return {
      valor_base: valorBase,
      gastos_notariales: gastosNotariales,
      recargo_esquinera: recargoEsquinera,
      valor_total: valorTotal,
    }
  }, [formData.valor_base, formData.es_esquinera, formData.recargo_esquinera, gastosNotariales])

  // ==================== CÁLCULOS ====================

  const pasoActualConfig = useMemo(() => {
    return PASOS_CONFIG.find(p => p.id === pasoActual) || PASOS_CONFIG[0]
  }, [pasoActual])

  const totalPasos = PASOS_CONFIG.length

  const progreso = useMemo(() => {
    return Math.round((pasoActual / totalPasos) * 100)
  }, [pasoActual, totalPasos])

  const esPrimerPaso = pasoActual === 1
  const esUltimoPaso = pasoActual === totalPasos

  // ==================== VALIDACIÓN POR PASO ====================

  const validarPasoActual = useCallback(async (): Promise<boolean> => {

    // 🔍 DEBUGGING: Ver valores actuales del formulario
    const valoresActuales = watch()

    const config = PASOS_CONFIG.find(p => p.id === pasoActual)
    if (!config || pasoActual === 5) {
      return true
    }

    try {
      // ✅ PASO 3: Validación sync + async manual de matrícula
      if (pasoActual === 3) {
        const camposDelPaso = Object.keys(config.schema.shape)

        // 1. Validar campos normales (sync)
        const esValidoSync = await trigger(camposDelPaso as any)

        // 🔍 DEBUG: Ver errores de validación
        if (!esValidoSync) {
          console.error('❌ [PASO 3] Campos con error:', JSON.stringify(errors, null, 2))
          return false
        }

        // ✅ ACUMULAR ERRORES: Validar TODO antes de setear errores
        const erroresEncontrados: Array<{ campo: string; mensaje: string }> = []

        // 2. ✅ Validación cruzada: área construida <= área lote
        const areaLote = Number(getValues('area_lote'))
        const areaConstruida = Number(getValues('area_construida'))

        if (areaConstruida > areaLote) {
          erroresEncontrados.push({
            campo: 'area_construida',
            mensaje: 'El área construida no puede ser mayor al área del lote',
          })
        }

        // 3. Validar matrícula duplicada (async manual)
        const matricula = getValues('matricula_inmobiliaria')

        if (matricula && matricula.length >= 7) {
          try {
            const resultado = await viviendasService.verificarMatriculaUnica(
              matricula,
              viviendaId
            )

            if (!resultado.esUnica && resultado.viviendaDuplicada) {
              erroresEncontrados.push({
                campo: 'matricula_inmobiliaria',
                mensaje: `Esta matrícula ya está registrada en la Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`,
              })
            }
          } catch (error) {
            console.error('❌ [PASO 3] Error al verificar matrícula:', error)
            // Continuamos si falla la verificación de red
          }
        }

        // ✅ Setear TODOS los errores a la vez
        if (erroresEncontrados.length > 0) {
          erroresEncontrados.forEach((error) => {
            setError(error.campo as any, {
              type: 'manual',
              message: error.mensaje,
            })
          })
          return false
        }

        return true
      }

      // Para otros pasos, validación normal
      const camposDelPaso = Object.keys(config.schema.shape)
      const esValido = await trigger(camposDelPaso as any)

      if (!esValido) {
        return false
      }
      return true
    } catch (error) {
      return false
    }
  }, [pasoActual, trigger, watch, setError, errors, PASOS_CONFIG])

  // Validar todos los pasos anteriores a un paso específico
  const validarPasosAnteriores = useCallback(async (hastaElPaso: number): Promise<boolean> => {
    for (let i = 1; i < hastaElPaso; i++) {
      const config = PASOS_CONFIG.find(p => p.id === i)
      if (!config || i === 5) continue // Paso 5 no requiere validación

      try {
        const camposDelPaso = Object.keys(config.schema.shape)
        const esValido = await trigger(camposDelPaso as any)

        if (!esValido) {
          return false
        }
      } catch (error) {
        return false
      }
    }
    return true
  }, [trigger, PASOS_CONFIG])

  // ==================== NAVEGACIÓN ====================

  const irSiguiente = useCallback(async () => {

        const esValido = await validarPasoActual()

    if (!esValido) {
                  return
    }

    if (pasoActual < totalPasos) {
      const siguientePaso = pasoActual + 1

      setPasoActual(prev => {
        return prev + 1
      })

            window.scrollTo({ top: 0, behavior: 'smooth' })

    } else {
    }

      }, [pasoActual, totalPasos, validarPasoActual])

  const irAtras = useCallback(() => {
    if (pasoActual > 1) {
      setPasoActual(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pasoActual])

  const irAPaso = useCallback(async (paso: number) => {
    // Solo permitir ir a pasos anteriores o al actual
    // Para ir a pasos posteriores, se deben validar todos los anteriores
    if (paso < pasoActual) {
      // Permitir retroceder sin validación
      setPasoActual(paso)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (paso === pasoActual) {
      // Ya estamos en este paso, no hacer nada
      return
    }

    // Intentar ir a un paso posterior - validar todos los anteriores
    const pasosAnterioresValidos = await validarPasosAnteriores(paso)

    if (!pasosAnterioresValidos) {
      return
    }

    if (paso >= 1 && paso <= totalPasos) {
      setPasoActual(paso)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pasoActual, totalPasos, validarPasosAnteriores])

  const cancelar = useCallback(() => {
    router.back()
  }, [router])

  // ==================== SUBMIT ====================

  const onSubmitForm = async (data: ViviendaFormSchema) => {
        console.trace('SUBMIT FORM TRACE')

    // 🔒 GUARDIA CRÍTICA #1: Verificar que el usuario autorizó el submit
    if (!submitAutorizadoRef.current) {
                                    return // ← BLOQUEAR COMPLETAMENTE
    }

    // �🚨 GUARDIA CRÍTICA #2: PREVENIR SUBMIT HASTA ESTAR EN PASO 5 (RESUMEN)
    if (pasoActual < 5) {

      // Resetear autorización y avanzar
      submitAutorizadoRef.current = false
      await irSiguiente()
      return
    }

    // Resetear autorización después de usar
    submitAutorizadoRef.current = false

    try {
      setSubmitting(true)

      // Transformar datos al formato esperado
      const viviendaData: ViviendaFormData = {
        ...data,
      }

      await onSubmit(viviendaData)

      // ✅ SOLUCIÓN PROFESIONAL: Navegar inmediatamente
      // React Query ya garantizó que el refetch se completó en el onSuccess
      router.push('/viviendas')
    } catch (error) {
      console.error('❌ Error en handleFormSubmit:', error)

      // Si es error de matrícula duplicada, mostrar en el campo correspondiente
      if (error instanceof Error && error.message.includes('matrícula inmobiliaria')) {
        setError('matricula_inmobiliaria', {
          type: 'manual',
          message: error.message
        })
        // Volver al paso 3 donde está el campo de matrícula
        setPasoActual(3)
      }
      // El toast de error ya se muestra en nueva-vivienda-view.tsx
    } finally {
      setSubmitting(false)
    }
  }

  // ==================== PREVIEW ====================

  const previewData = useMemo(() => {
    return {
      // Paso 1
      proyecto: formData.proyecto_id || null,
      manzana: formData.manzana_id || null,
      numero: formData.numero || null,

      // Paso 2
      linderos: {
        norte: formData.lindero_norte || null,
        sur: formData.lindero_sur || null,
        oriente: formData.lindero_oriente || null,
        occidente: formData.lindero_occidente || null,
      },

      // Paso 3
      legal: {
        matricula: formData.matricula_inmobiliaria || null,
        nomenclatura: formData.nomenclatura || null,
        areaLote: formData.area_lote || 0,
        areaConstruida: formData.area_construida || 0,
        tipoVivienda: formData.tipo_vivienda || 'Regular',
      },

      // Paso 4
      financiero: {
        valorBase: formData.valor_base || 0,
        esEsquinera: formData.es_esquinera || false,
        recargoEsquinera: formData.recargo_esquinera || 0,
      },
    }
  }, [formData])

  // 🔒 Función para autorizar submit desde botón "Guardar Vivienda"
  const autorizarSubmit = useCallback(() => {
        submitAutorizadoRef.current = true
          }, [pasoActual])

  return {
    // Form state
    register,
    handleSubmit: handleSubmit(onSubmitForm),
    errors,
    isValidating, // ← Exponer estado de validación async
    setValue,
    watch,

    // Paso actual
    pasoActual,
    pasoActualConfig,
    totalPasos,
    progreso,
    esPrimerPaso,
    esUltimoPaso,

    // Navegación
    irSiguiente,
    irAtras,
    irAPaso,
    cancelar,

    // Submit
    submitting,
    autorizarSubmit, // ← NUEVA función para autorizar submit

    // Preview
    previewData,
    formData,

    // Finanzas
    gastosNotariales,
    resumenFinanciero,
    configuracionRecargos,

    // Config
    pasos: PASOS_CONFIG,
  }
}
