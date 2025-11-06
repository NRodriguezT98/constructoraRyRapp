/**
 * useNuevaVivienda - Hook con lógica del wizard de 5 pasos
 * ✅ Separación de responsabilidades ESTRICTA
 * ✅ Gestión de pasos
 * ✅ Validación por paso
 * ✅ Preview en tiempo real
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
  lindero_norte: z.string().min(5, 'Describe el lindero Norte (mínimo 5 caracteres)'),
  lindero_sur: z.string().min(5, 'Describe el lindero Sur (mínimo 5 caracteres)'),
  lindero_oriente: z.string().min(5, 'Describe el lindero Oriente (mínimo 5 caracteres)'),
  lindero_occidente: z.string().min(5, 'Describe el lindero Occidente (mínimo 5 caracteres)'),
})

const paso3Schema = z.object({
  matricula_inmobiliaria: z.string().min(1, 'La matrícula inmobiliaria es obligatoria'),
  nomenclatura: z.string().min(1, 'La nomenclatura es obligatoria'),
  area_lote: z.number().min(1, 'El área del lote debe ser mayor a 0'),
  area_construida: z.number().min(1, 'El área construida debe ser mayor a 0'),
  tipo_vivienda: z.enum(['Regular', 'Irregular']),
  certificado_tradicion_file: z.instanceof(File).optional(),
})

const paso4Schema = z.object({
  valor_base: z.number().min(1, 'El valor base debe ser mayor a 0'),
  es_esquinera: z.boolean(),
  recargo_esquinera: z.number().min(0, 'El recargo debe ser mayor o igual a 0'),
})

// Schema completo (para validación final)
const viviendaSchema = paso1Schema
  .merge(paso2Schema)
  .merge(paso3Schema)
  .merge(paso4Schema)

type ViviendaFormSchema = z.infer<typeof viviendaSchema>

// ==================== CONFIGURACIÓN DE PASOS ====================

const PASOS_CONFIG = [
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
    schema: paso3Schema,
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
}

export function useNuevaVivienda({ onSubmit }: UseNuevaViviendaParams) {
  const router = useRouter()
  const [pasoActual, setPasoActual] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [gastosNotariales, setGastosNotariales] = useState(5_000_000) // Default: 5M
  const [configuracionRecargos, setConfiguracionRecargos] = useState<any[]>([])

  // Cargar gastos notariales y configuración de recargos desde DB
  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const [gastos, recargos] = await Promise.all([
          viviendasService.obtenerGastosNotariales(),
          viviendasService.obtenerConfiguracionRecargos(),
        ])

        console.log('✅ Gastos notariales cargados desde DB:', gastos)
        console.log('✅ Recargos cargados desde DB:', recargos)

        setGastosNotariales(gastos)
        setConfiguracionRecargos(recargos)
      } catch (error) {
        console.error('❌ Error cargando configuración:', error)
      }
    }
    cargarConfiguracion()
  }, [])

  // React Hook Form con validación completa
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    setError,
    formState: { errors },
  } = useForm<ViviendaFormSchema>({
    resolver: zodResolver(viviendaSchema),
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
      area_lote: 0,
      area_construida: 0,
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
    console.log('🔍 [VALIDAR PASO] Iniciando validación del paso:', pasoActual)

    // 🔍 DEBUGGING: Ver valores actuales del formulario
    const valoresActuales = watch()
    console.log('📋 [VALIDAR PASO] Valores actuales del formulario:', valoresActuales)

    const config = PASOS_CONFIG.find(p => p.id === pasoActual)
    if (!config || pasoActual === 5) {
      console.log('✅ [VALIDAR PASO] Paso sin validación requerida')
      return true
    }

    try {
      // ✅ PASO 3: Validación manual completa (esperando async ANTES de setError)
      if (pasoActual === 3) {
        console.log('🔍 [PASO 3] Iniciando validación manual completa')

        const matricula = watch('matricula_inmobiliaria')
        const nomenclatura = watch('nomenclatura')
        const areaLote = watch('area_lote')
        const areaConstruida = watch('area_construida')
        const tipoVivienda = watch('tipo_vivienda')

        console.log('📋 [PASO 3] Valores:', { matricula, nomenclatura, areaLote, areaConstruida, tipoVivienda })

        // Objeto para acumular errores
        const erroresDetectados: Array<{ campo: string; mensaje: string }> = []

        // 1. Validar matrícula (básica)
        if (!matricula || matricula.trim() === '') {
          erroresDetectados.push({
            campo: 'matricula_inmobiliaria',
            mensaje: 'La matrícula inmobiliaria es obligatoria'
          })
        }

        // 2. Validar nomenclatura
        if (!nomenclatura || nomenclatura.trim() === '') {
          erroresDetectados.push({
            campo: 'nomenclatura',
            mensaje: 'La nomenclatura es obligatoria'
          })
        }

        // 3. Validar área lote
        if (!areaLote || areaLote <= 0) {
          erroresDetectados.push({
            campo: 'area_lote',
            mensaje: 'El área del lote debe ser mayor a 0'
          })
        }

        // 4. Validar área construida
        if (!areaConstruida || areaConstruida <= 0) {
          erroresDetectados.push({
            campo: 'area_construida',
            mensaje: 'El área construida debe ser mayor a 0'
          })
        }

        // 5. Validar tipo vivienda
        if (!tipoVivienda || (tipoVivienda !== 'Regular' && tipoVivienda !== 'Irregular')) {
          erroresDetectados.push({
            campo: 'tipo_vivienda',
            mensaje: 'Selecciona un tipo de vivienda válido'
          })
        }

        // 6. Validar matrícula duplicada (ASYNC - esperar ANTES de setError)
        if (matricula && matricula.trim() !== '' && erroresDetectados.findIndex(e => e.campo === 'matricula_inmobiliaria') === -1) {
          console.log('🔍 [PASO 3] Validando unicidad de matrícula:', matricula)

          try {
            // Timeout de 10 segundos para la validación
            const timeoutPromise = new Promise<boolean>((_, reject) => {
              setTimeout(() => reject(new Error('Timeout validando matrícula')), 10000)
            })

            const validacionPromise = viviendasService.verificarMatriculaUnica(matricula)

            const esUnica = await Promise.race([validacionPromise, timeoutPromise])
            console.log('📊 [PASO 3] Resultado verificarMatriculaUnica:', esUnica)

            if (!esUnica) {
              console.error('❌ [PASO 3] Matrícula duplicada:', matricula)
              erroresDetectados.push({
                campo: 'matricula_inmobiliaria',
                mensaje: `La matrícula inmobiliaria "${matricula}" ya está registrada en otra vivienda.`
              })
            } else {
              console.log('✅ [PASO 3] Matrícula única validada')
            }
          } catch (error) {
            console.error('❌ [PASO 3] Error verificando matrícula:', error)

            // Si es timeout, permitir continuar pero con advertencia
            if (error instanceof Error && error.message.includes('Timeout')) {
              console.warn('⚠️ [PASO 3] Timeout en validación - permitiendo continuar')
            } else {
              // Para otros errores, agregar mensaje de error
              erroresDetectados.push({
                campo: 'matricula_inmobiliaria',
                mensaje: 'Error al verificar la matrícula. Intenta nuevamente.'
              })
            }
          }
        }

        // 7. AHORA SÍ: Establecer TODOS los errores al mismo tiempo
        if (erroresDetectados.length > 0) {
          console.error('❌ [PASO 3] Errores encontrados:', erroresDetectados)

          erroresDetectados.forEach(error => {
            setError(error.campo as any, {
              type: 'manual',
              message: error.mensaje
            })
          })

          return false
        }

        console.log('✅ [PASO 3] Validación manual completada exitosamente')
        return true
      }

      // Para otros pasos, usar validación Zod normal
      const camposDelPaso = Object.keys(config.schema.shape)
      console.log('📋 [VALIDAR PASO] Campos a validar:', camposDelPaso)

      const esValido = await trigger(camposDelPaso as any)
      console.log('📊 [VALIDAR PASO] Resultado validación Zod:', esValido)

      if (!esValido) {
        console.error('❌ [VALIDAR PASO] Validación Zod falló')

        // 🔍 DEBUGGING: Ver qué campos tienen errores
        console.log('🔍 [VALIDAR PASO] Errores detectados:', errors)

        // Mostrar detalles de cada campo con error
        Object.keys(errors).forEach(campo => {
          console.log(`  ❌ Campo "${campo}":`, errors[campo as keyof typeof errors]?.message)
        })

        return false
      }

      console.log('✅ [VALIDAR PASO] Validación completada exitosamente')
      return true
    } catch (error) {
      console.error('❌ [VALIDAR PASO] Error en validación:', error)
      return false
    }
  }, [pasoActual, trigger, watch, setError])

  // Validar todos los pasos anteriores a un paso específico
  const validarPasosAnteriores = useCallback(async (hastaElPaso: number): Promise<boolean> => {
    for (let i = 1; i < hastaElPaso; i++) {
      const config = PASOS_CONFIG.find(p => p.id === i)
      if (!config || i === 5) continue // Paso 5 no requiere validación

      try {
        const camposDelPaso = Object.keys(config.schema.shape)
        const esValido = await trigger(camposDelPaso as any)

        if (!esValido) {
          console.log(`❌ Paso ${i} inválido. Completa los pasos anteriores primero.`)
          return false
        }
      } catch (error) {
        console.error(`Error validando paso ${i}:`, error)
        return false
      }
    }
    return true
  }, [trigger])

  // ==================== NAVEGACIÓN ====================

  const irSiguiente = useCallback(async () => {
    console.log('🔍 [IR SIGUIENTE] Paso actual:', pasoActual, 'Total pasos:', totalPasos)

    const esValido = await validarPasoActual()

    console.log('📊 [IR SIGUIENTE] ¿Paso válido?:', esValido)

    if (!esValido) {
      console.log('❌ Paso inválido, no se puede continuar')
      return
    }

    if (pasoActual < totalPasos) {
      console.log('➡️ [IR SIGUIENTE] Avanzando al paso:', pasoActual + 1)
      setPasoActual(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      console.log('🏁 [IR SIGUIENTE] Ya estás en el último paso')
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
      console.log(`❌ No se puede ir al paso ${paso}. Completa los pasos anteriores primero.`)
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
    console.log('🚀 [SUBMIT FORM] ¡FORMULARIO ENVIADO!')
    console.log('📍 [SUBMIT FORM] Paso actual:', pasoActual)
    console.log('📝 [SUBMIT FORM] Datos:', data)

    try {
      setSubmitting(true)
      console.log('📝 [NUEVA VIVIENDA] Enviando formulario completo:', data)
      console.log('📄 [NUEVA VIVIENDA] Certificado en data:', data.certificado_tradicion_file)
      console.log('📄 [NUEVA VIVIENDA] Tipo de certificado:', typeof data.certificado_tradicion_file)

      if (data.certificado_tradicion_file) {
        console.log('✅ [NUEVA VIVIENDA] Archivo File detectado:', {
          name: data.certificado_tradicion_file.name,
          size: data.certificado_tradicion_file.size,
          type: data.certificado_tradicion_file.type
        })
      } else {
        console.warn('⚠️ [NUEVA VIVIENDA] NO hay certificado en el formulario')
      }

      // Transformar datos al formato esperado
      const viviendaData: ViviendaFormData = {
        ...data,
      }

      console.log('🚀 [NUEVA VIVIENDA] Llamando a viviendasService.crear()...')
      await onSubmit(viviendaData)

      // Redirigir después de guardar
      router.push('/viviendas')
    } catch (error) {
      console.error('❌ [NUEVA VIVIENDA] Error al crear vivienda:', error)

      // Si es error de matrícula duplicada, mostrar en el campo correspondiente
      if (error instanceof Error && error.message.includes('matrícula inmobiliaria')) {
        setError('matricula_inmobiliaria', {
          type: 'manual',
          message: error.message
        })
        // Volver al paso 3 donde está el campo de matrícula
        setPasoActual(3)
      } else {
        // Otros errores se muestran en consola
        console.error('Error inesperado:', error)
      }
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

  return {
    // Form state
    register,
    handleSubmit: handleSubmit(onSubmitForm),
    errors,
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
