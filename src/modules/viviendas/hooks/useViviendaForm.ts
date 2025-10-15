import { useCallback, useEffect, useMemo, useState } from 'react'
import { MENSAJES, PASOS_FORMULARIO, VIVIENDA_DEFAULTS } from '../constants'
import { viviendasService } from '../services/viviendas.service'
import type {
    ConfiguracionRecargo,
    ManzanaConDisponibilidad,
    PasoFormulario,
    Proyecto,
    ResumenFinanciero,
    ViviendaFormData,
} from '../types'
import {
    calcularValorTotal,
    validarArea,
    validarLindero,
    validarMatricula,
    validarNomenclatura,
    validarValorBase
} from '../utils'

/**
 * Hook principal para el formulario de creación de viviendas
 * Maneja la lógica completa del wizard multi-paso
 */
export function useViviendaForm() {
  // ============================================
  // ESTADO
  // ============================================

  // Paso actual del wizard
  const [pasoActual, setPasoActual] = useState<PasoFormulario>('ubicacion')

  // Pasos completados
  const [pasosCompletados, setPasosCompletados] = useState<PasoFormulario[]>([])

  // Datos del formulario
  const [formData, setFormData] = useState<Partial<ViviendaFormData>>({
    es_esquinera: false,
    recargo_esquinera: 0,
  })

  // Errores de validación
  const [errores, setErrores] = useState<Record<string, string>>({})

  // Estados de carga
  const [loading, setLoading] = useState(false)
  const [loadingProyectos, setLoadingProyectos] = useState(false)
  const [loadingManzanas, setLoadingManzanas] = useState(false)

  // Datos de selección
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [manzanas, setManzanas] = useState<ManzanaConDisponibilidad[]>([])
  const [numerosOcupados, setNumerosOcupados] = useState<string[]>([])
  const [numerosDisponibles, setNumerosDisponibles] = useState<number[]>([])
  const [gastosNotariales, setGastosNotariales] = useState(VIVIENDA_DEFAULTS.GASTOS_NOTARIALES)
  const [configuracionRecargos, setConfiguracionRecargos] = useState<ConfiguracionRecargo[]>([])

  // Validación de matrícula
  const [validandoMatricula, setValidandoMatricula] = useState(false)

  // ============================================
  // CARGA INICIAL
  // ============================================

  useEffect(() => {
    cargarProyectos()
    cargarConfiguracionRecargos()
  }, [])

  const cargarProyectos = useCallback(async () => {
    try {
      setLoadingProyectos(true)
      const data = await viviendasService.obtenerProyectos()
      setProyectos(data)
    } catch (error) {
      console.error('Error cargando proyectos:', error)
    } finally {
      setLoadingProyectos(false)
    }
  }, [])

  const cargarConfiguracionRecargos = useCallback(async () => {
    try {
      const [recargos, gastosNot] = await Promise.all([
        viviendasService.obtenerConfiguracionRecargos(),
        viviendasService.obtenerGastosNotariales(),
      ])
      setConfiguracionRecargos(recargos)
      setGastosNotariales(gastosNot)
    } catch (error) {
      console.error('Error cargando configuración:', error)
    }
  }, [])

  // ============================================
  // SELECCIÓN DE PROYECTO
  // ============================================

  const seleccionarProyecto = useCallback(
    async (proyectoId: string) => {
      setFormData((prev) => ({
        ...prev,
        proyecto_id: proyectoId,
        manzana_id: undefined,
        numero: undefined,
      }))

      // Cargar manzanas disponibles del proyecto
      try {
        setLoadingManzanas(true)
        const data = await viviendasService.obtenerManzanasDisponibles(proyectoId)
        setManzanas(data)
      } catch (error) {
        console.error('Error cargando manzanas:', error)
      } finally {
        setLoadingManzanas(false)
      }
    },
    []
  )

  // ============================================
  // SELECCIÓN DE MANZANA
  // ============================================

  const seleccionarManzana = useCallback(
    async (manzanaId: string) => {
      try {
        // Obtener números ocupados y generar disponibles
        const [ocupados, manzanaData] = await Promise.all([
          viviendasService.obtenerNumerosOcupados(manzanaId),
          manzanas.find((m) => m.id === manzanaId),
        ])

        setNumerosOcupados(ocupados)

        // Generar lista de números disponibles
        if (manzanaData) {
          const totalViviendas = manzanaData.total_viviendas
          const disponibles: number[] = []

          for (let i = 1; i <= totalViviendas; i++) {
            if (!ocupados.includes(i.toString())) {
              disponibles.push(i)
            }
          }

          setNumerosDisponibles(disponibles)

          // NO asignar automáticamente, dejar que el usuario seleccione
          setFormData((prev) => ({
            ...prev,
            manzana_id: manzanaId,
            numero: undefined, // Vacío hasta que el usuario seleccione
          }))
        }
      } catch (error) {
        console.error('Error cargando números disponibles:', error)
      }
    },
    [manzanas]
  )

  // ============================================
  // MANZANA SELECCIONADA
  // ============================================

  const manzanaSeleccionada = useMemo(() => {
    if (!formData.manzana_id) return null
    return manzanas.find((m) => m.id === formData.manzana_id)
  }, [formData.manzana_id, manzanas])

  // ============================================
  // ACTUALIZAR CAMPO
  // ============================================

  const actualizarCampo = useCallback(<K extends keyof ViviendaFormData>(
    campo: K,
    valor: ViviendaFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }))

    // Limpiar error del campo
    setErrores((prev) => {
      const newErrors = { ...prev }
      delete newErrors[campo]
      return newErrors
    })
  }, [])

  // ============================================
  // TOGGLE CASA ESQUINERA
  // ============================================

  const toggleEsquinera = useCallback((checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      es_esquinera: checked,
      recargo_esquinera: checked ? prev.recargo_esquinera || 0 : 0,
    }))
  }, [])

  // ============================================
  // RESUMEN FINANCIERO CALCULADO
  // ============================================

  const resumenFinanciero: ResumenFinanciero = useMemo(() => {
    const valorBase = formData.valor_base || 0
    const recargoEsquinera = formData.es_esquinera ? formData.recargo_esquinera || 0 : 0
    const valorTotal = calcularValorTotal(valorBase, gastosNotariales, recargoEsquinera)

    return {
      valor_base: valorBase,
      gastos_notariales: gastosNotariales,
      recargo_esquinera: recargoEsquinera,
      valor_total: valorTotal,
    }
  }, [formData.valor_base, formData.es_esquinera, formData.recargo_esquinera, gastosNotariales])

  // ============================================
  // VALIDACIÓN POR PASO
  // ============================================

  const validarPasoUbicacion = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.proyecto_id) {
      newErrors.proyecto_id = 'Debe seleccionar un proyecto'
    }
    if (!formData.manzana_id) {
      newErrors.manzana_id = 'Debe seleccionar una manzana'
    }
    if (!formData.numero) {
      newErrors.numero = 'El número de vivienda es requerido'
    }

    setErrores(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const validarPasoLinderos = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    const errorNorte = validarLindero(formData.lindero_norte || '')
    if (errorNorte) newErrors.lindero_norte = errorNorte

    const errorSur = validarLindero(formData.lindero_sur || '')
    if (errorSur) newErrors.lindero_sur = errorSur

    const errorOriente = validarLindero(formData.lindero_oriente || '')
    if (errorOriente) newErrors.lindero_oriente = errorOriente

    const errorOccidente = validarLindero(formData.lindero_occidente || '')
    if (errorOccidente) newErrors.lindero_occidente = errorOccidente

    setErrores(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const validarPasoLegal = useCallback(async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    const errorMatricula = validarMatricula(formData.matricula_inmobiliaria || '')
    if (errorMatricula) {
      newErrors.matricula_inmobiliaria = errorMatricula
    } else if (formData.matricula_inmobiliaria) {
      // Validar que la matrícula sea única
      setValidandoMatricula(true)
      try {
        const esUnica = await viviendasService.verificarMatriculaUnica(
          formData.matricula_inmobiliaria
        )
        if (!esUnica) {
          newErrors.matricula_inmobiliaria =
            'Esta matrícula inmobiliaria ya existe. Cada vivienda debe tener una matrícula única.'
        }
      } catch (error) {
        console.error('Error validando matrícula:', error)
        newErrors.matricula_inmobiliaria = 'Error al validar la matrícula. Intente nuevamente.'
      } finally {
        setValidandoMatricula(false)
      }
    }

    const errorNomenclatura = validarNomenclatura(formData.nomenclatura || '')
    if (errorNomenclatura) newErrors.nomenclatura = errorNomenclatura

    const errorAreaLote = validarArea(formData.area_lote || '', 'lote')
    if (errorAreaLote) newErrors.area_lote = errorAreaLote

    const errorAreaConstruida = validarArea(formData.area_construida || '', 'construida')
    if (errorAreaConstruida) newErrors.area_construida = errorAreaConstruida

    if (!formData.tipo_vivienda) {
      newErrors.tipo_vivienda = 'El tipo de vivienda es requerido'
    }

    setErrores(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const validarPasoFinanciero = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    const errorValorBase = validarValorBase(formData.valor_base || 0)
    if (errorValorBase) newErrors.valor_base = errorValorBase

    if (formData.es_esquinera && !formData.recargo_esquinera) {
      newErrors.recargo_esquinera = 'Debe seleccionar el recargo para casa esquinera'
    }

    setErrores(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // ============================================
  // NAVEGACIÓN ENTRE PASOS
  // ============================================

  const avanzarPaso = useCallback(async () => {
    // Validar paso actual antes de avanzar
    let esValido = false

    switch (pasoActual) {
      case 'ubicacion':
        esValido = validarPasoUbicacion()
        break
      case 'linderos':
        esValido = validarPasoLinderos()
        break
      case 'legal':
        esValido = await validarPasoLegal() // Ahora es async
        break
      case 'financiero':
        esValido = validarPasoFinanciero()
        break
      case 'resumen':
        esValido = true
        break
    }

    if (!esValido) return

    // Marcar paso como completado
    if (!pasosCompletados.includes(pasoActual)) {
      setPasosCompletados((prev) => [...prev, pasoActual])
    }

    // Avanzar al siguiente paso
    const pasoIndex = PASOS_FORMULARIO.findIndex((p) => p.id === pasoActual)
    if (pasoIndex < PASOS_FORMULARIO.length - 1) {
      setPasoActual(PASOS_FORMULARIO[pasoIndex + 1].id)
    }
  }, [
    pasoActual,
    pasosCompletados,
    validarPasoUbicacion,
    validarPasoLinderos,
    validarPasoLegal,
    validarPasoFinanciero,
  ])

  const retrocederPaso = useCallback(() => {
    const pasoIndex = PASOS_FORMULARIO.findIndex((p) => p.id === pasoActual)
    if (pasoIndex > 0) {
      setPasoActual(PASOS_FORMULARIO[pasoIndex - 1].id)
    }
  }, [pasoActual])

  const irAPaso = useCallback((paso: PasoFormulario) => {
    setPasoActual(paso)
  }, [])

  // ============================================
  // SUBMIT
  // ============================================

  const submitFormulario = useCallback(async () => {
    try {
      setLoading(true)

      // Validar todos los pasos
      const ubicacionValida = validarPasoUbicacion()
      const linderosValidos = validarPasoLinderos()
      const legalValido = validarPasoLegal()
      const financieroValido = validarPasoFinanciero()

      if (!ubicacionValida || !linderosValidos || !legalValido || !financieroValido) {
        throw new Error('Por favor completa todos los campos requeridos')
      }

      // Crear vivienda
      await viviendasService.crear(formData as ViviendaFormData)

      // Resetear formulario
      resetFormulario()

      return { success: true, mensaje: MENSAJES.EXITO_CREAR }
    } catch (error: any) {
      console.error('Error creando vivienda:', error)
      return { success: false, mensaje: error.message || MENSAJES.ERROR_CREAR }
    } finally {
      setLoading(false)
    }
  }, [formData, validarPasoUbicacion, validarPasoLinderos, validarPasoLegal, validarPasoFinanciero])

  // ============================================
  // RESET
  // ============================================

  const resetFormulario = useCallback(() => {
    setFormData({ es_esquinera: false, recargo_esquinera: 0 })
    setPasoActual('ubicacion')
    setPasosCompletados([])
    setErrores({})
    setManzanas([])
  }, [])

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado del wizard
    pasoActual,
    pasosCompletados,
    formularioCompleto: pasosCompletados.length === PASOS_FORMULARIO.length,

    // Datos
    formData,
    errores,
    resumenFinanciero,

    // Datos de selección
    proyectos,
    manzanas,
    manzanaSeleccionada,
    numerosDisponibles,
    gastosNotariales,
    configuracionRecargos,

    // Estados de carga
    loading,
    loadingProyectos,
    loadingManzanas,
    validandoMatricula,

    // Acciones
    actualizarCampo,
    seleccionarProyecto,
    seleccionarManzana,
    toggleEsquinera,
    avanzarPaso,
    retrocederPaso,
    irAPaso,
    submitFormulario,
    resetFormulario,
  }
}
