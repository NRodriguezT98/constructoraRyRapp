/**
 * Modal para Crear Negociación con Cierre Financiero
 *
 * NUEVO FLUJO (3 pasos):
 * 1. Información Básica (Cliente, Vivienda, Valores)
 * 2. Fuentes de Pago (Configuración completa del financiamiento)
 * 3. Revisión y Confirmación
 *
 * ⚠️ VALIDACIÓN CRÍTICA: Suma de fuentes = Valor total vivienda
 *
 * Al crear:
 * - Negociación con estado "Cierre Financiero"
 * - Todas las fuentes de pago configuradas
 * - Cliente pasa a estado "Activo"
 * - Vivienda marcada como "reservada"
 */

'use client'

import { supabase } from '@/lib/supabase/client-browser'
import { FuentePagoCard, StepperNegociacion } from '@/modules/clientes/components'
import { useCrearNegociacion } from '@/modules/clientes/hooks'
import type { CrearFuentePagoDTO, TipoFuentePago } from '@/modules/clientes/types'
import { validarSumaTotal } from '@/modules/clientes/utils/validar-edicion-fuentes'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    ChevronRight,
    DollarSign,
    Home,
    Loader2,
    MessageSquare,
    Sparkles,
    User,
    X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface ModalCrearNegociacionNuevoProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  clienteNombre?: string
  viviendaId?: string
  valorVivienda?: number
  onSuccess: (negociacionId: string) => void
}

interface FuentePagoConfiguracion {
  tipo: TipoFuentePago
  enabled: boolean
  config: CrearFuentePagoDTO | null
}

export function ModalCrearNegociacionNuevo({
  isOpen,
  onClose,
  clienteId,
  clienteNombre,
  viviendaId: viviendaIdProp,
  valorVivienda,
  onSuccess,
}: ModalCrearNegociacionNuevoProps) {
  // ============================================
  // HOOKS
  // ============================================

  const {
    crearNegociacion,
    creando: creandoHook,
    error: errorHook,
    limpiar: limpiarHook,
  } = useCrearNegociacion()

  // ============================================
  // ESTADO
  // ============================================

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // PASO 1: Información Básica
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('')
  const [viviendaId, setViviendaId] = useState(viviendaIdProp || '')
  const [valorNegociado, setValorNegociado] = useState(valorVivienda || 0)
  const [descuentoAplicado, setDescuentoAplicado] = useState(0)
  const [notas, setNotas] = useState('')

  // PASO 2: Fuentes de Pago
  const [fuentes, setFuentes] = useState<FuentePagoConfiguracion[]>([
    {
      tipo: 'Cuota Inicial',
      enabled: true, // Siempre habilitada
      config: {
        tipo: 'Cuota Inicial',
        monto_aprobado: 0,
        permite_multiples_abonos: true,
      },
    },
    {
      tipo: 'Crédito Hipotecario',
      enabled: false,
      config: null,
    },
    {
      tipo: 'Subsidio Mi Casa Ya',
      enabled: false,
      config: null,
    },
    {
      tipo: 'Subsidio Caja Compensación',
      enabled: false,
      config: null,
    },
  ])

  // Datos para selects
  const [proyectos, setProyectos] = useState<any[]>([])
  const [viviendas, setViviendas] = useState<any[]>([])
  const [cargandoProyectos, setCargandoProyectos] = useState(false)
  const [cargandoViviendas, setCargandoViviendas] = useState(false)
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================
  // CÁLCULOS
  // ============================================

  const valorTotal = useMemo(() => {
    return Math.max(0, valorNegociado - descuentoAplicado)
  }, [valorNegociado, descuentoAplicado])

  const fuentesActivas = useMemo(() => {
    return fuentes.filter((f) => f.enabled && f.config !== null)
  }, [fuentes])

  const totalFuentes = useMemo(() => {
    return fuentesActivas.reduce((sum, f) => sum + (f.config?.monto_aprobado || 0), 0)
  }, [fuentesActivas])

  const diferencia = useMemo(() => {
    return valorTotal - totalFuentes
  }, [valorTotal, totalFuentes])

  const sumaCierra = diferencia === 0 && totalFuentes > 0

  // ============================================
  // VALIDACIONES POR PASO
  // ============================================

  const paso1Valido = useMemo(() => {
    return (
      viviendaId !== '' &&
      valorNegociado > 0 &&
      descuentoAplicado >= 0 &&
      descuentoAplicado < valorNegociado &&
      valorTotal > 0
    )
  }, [viviendaId, valorNegociado, descuentoAplicado, valorTotal])

  const paso2Valido = useMemo(() => {
    // Debe haber al menos cuota inicial
    const tieneCuotaInicial = fuentes.some(
      (f) => f.tipo === 'Cuota Inicial' && f.enabled && (f.config?.monto_aprobado || 0) > 0
    )

    // Suma debe cerrar
    return tieneCuotaInicial && sumaCierra
  }, [fuentes, sumaCierra])

  // ============================================
  // EFECTOS
  // ============================================

  // Cargar proyectos al abrir
  useEffect(() => {
    if (isOpen) {
      cargarProyectos()
    }
  }, [isOpen])

  // Cargar viviendas cuando cambia proyecto
  useEffect(() => {
    if (proyectoSeleccionado) {
      cargarViviendas(proyectoSeleccionado)
    } else {
      setViviendas([])
      if (!viviendaIdProp) {
        setViviendaId('')
      }
    }
  }, [proyectoSeleccionado, viviendaIdProp])

  // Auto-llenar valor cuando se selecciona vivienda
  useEffect(() => {
    if (viviendaId && !valorVivienda) {
      const vivienda = viviendas.find((v) => v.id === viviendaId)
      if (vivienda?.valor_total) {
        setValorNegociado(vivienda.valor_total)
      }
    }
  }, [viviendaId, viviendas, valorVivienda])

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const cargarProyectos = async () => {
    setCargandoProyectos(true)
    try {
      const { proyectosService } = await import('@/modules/proyectos/services/proyectos.service')
      const data = await proyectosService.obtenerProyectos()
      setProyectos(data || [])
    } catch (error) {
      console.error('Error cargando proyectos:', error)
    } finally {
      setCargandoProyectos(false)
    }
  }

  const cargarViviendas = async (proyectoId: string) => {
    setCargandoViviendas(true)
    try {
      // Cargar viviendas disponibles con info de manzana incluida
      const { data, error } = await supabase
        .from('viviendas')
        .select(`
          *,
          manzanas!inner (
            id,
            nombre,
            proyecto_id
          )
        `)
        .eq('manzanas.proyecto_id', proyectoId)
        .eq('estado', 'Disponible')
        .order('numero')

      if (error) throw error

      // Transformar para incluir manzana_nombre directamente
      const viviendasConManzana = (data || []).map((v: any) => ({
        ...v,
        manzana_nombre: v.manzanas?.nombre,
      }))

      setViviendas(viviendasConManzana)
    } catch (error) {
      console.error('Error cargando viviendas:', error)
    } finally {
      setCargandoViviendas(false)
    }
  }

  // ============================================
  // HANDLERS DE NAVEGACIÓN
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
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)
    }
  }, [currentStep])

  // ============================================
  // HANDLERS DE FUENTES
  // ============================================

  const handleFuenteEnabledChange = useCallback((tipo: TipoFuentePago, enabled: boolean) => {
    setFuentes((prev) =>
      prev.map((f) => {
        if (f.tipo === tipo) {
          return {
            ...f,
            enabled,
            config: enabled
              ? {
                  tipo,
                  monto_aprobado: 0,
                  permite_multiples_abonos: tipo === 'Cuota Inicial',
                }
              : null,
          }
        }
        return f
      })
    )
  }, [])

  const handleFuenteConfigChange = useCallback((tipo: TipoFuentePago, config: CrearFuentePagoDTO | null) => {
    setFuentes((prev) =>
      prev.map((f) => {
        if (f.tipo === tipo) {
          return { ...f, config }
        }
        return f
      })
    )
  }, [])

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async () => {
    setCreando(true)
    setError(null)

    try {
      // Validar suma total
      const fuentesParaCrear = fuentesActivas
        .map((f) => f.config)
        .filter((c): c is CrearFuentePagoDTO => c !== null)

      const validacion = validarSumaTotal(fuentesParaCrear, valorTotal)

      if (!validacion.valido) {
        setError(validacion.errores.join('\n'))
        setCreando(false)
        return
      }

      // ⭐ Llamar al hook para crear negociación con fuentes de pago
      console.log('📝 Creando negociación con fuentes de pago...')
      const negociacion = await crearNegociacion({
        cliente_id: clienteId,
        vivienda_id: viviendaId,
        valor_negociado: valorNegociado,
        descuento_aplicado: descuentoAplicado,
        notas,
        fuentes_pago: fuentesParaCrear,
      })

      if (!negociacion) {
        // Error ya fue seteado por el hook
        setError(errorHook || 'Error al crear negociación')
        setCreando(false)
        return
      }

      console.log('✅ Negociación creada exitosamente:', negociacion.id)

      // Limpiar hook
      limpiarHook()

      // Llamar onSuccess y cerrar
      onSuccess(negociacion.id)
      handleClose()
    } catch (err) {
      console.error('❌ Error creando negociación:', err)
      setError(err instanceof Error ? err.message : 'Error al crear negociación')
    } finally {
      setCreando(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setCompletedSteps([])
    setProyectoSeleccionado('')
    setViviendaId(viviendaIdProp || '')
    setValorNegociado(valorVivienda || 0)
    setDescuentoAplicado(0)
    setNotas('')
    setFuentes([
      { tipo: 'Cuota Inicial', enabled: true, config: { tipo: 'Cuota Inicial', monto_aprobado: 0, permite_multiples_abonos: true } },
      { tipo: 'Crédito Hipotecario', enabled: false, config: null },
      { tipo: 'Subsidio Mi Casa Ya', enabled: false, config: null },
      { tipo: 'Subsidio Caja Compensación', enabled: false, config: null },
    ])
    setError(null)
    onClose()
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Crear Negociación</h2>
                    <p className="mt-1 text-sm text-purple-100">
                      Configura el financiamiento completo para vincular cliente y vivienda
                    </p>
                  </div>
                </div>
              </div>

              {/* Stepper */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 dark:border-gray-700 dark:bg-gray-800/50">
                <StepperNegociacion currentStep={currentStep} completedSteps={completedSteps} />
              </div>

              {/* Contenido */}
              <div className="max-h-[calc(90vh-280px)] overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <Paso1InfoBasica
                      key="paso1"
                      clienteNombre={clienteNombre}
                      proyectos={proyectos}
                      viviendas={viviendas}
                      cargandoProyectos={cargandoProyectos}
                      cargandoViviendas={cargandoViviendas}
                      proyectoSeleccionado={proyectoSeleccionado}
                      viviendaId={viviendaId}
                      valorNegociado={valorNegociado}
                      descuentoAplicado={descuentoAplicado}
                      valorTotal={valorTotal}
                      notas={notas}
                      viviendaIdProp={viviendaIdProp}
                      onProyectoChange={setProyectoSeleccionado}
                      onViviendaChange={setViviendaId}
                      onValorNegociadoChange={setValorNegociado}
                      onDescuentoChange={setDescuentoAplicado}
                      onNotasChange={setNotas}
                    />
                  )}

                  {currentStep === 2 && (
                    <Paso2FuentesPago
                      key="paso2"
                      fuentes={fuentes}
                      valorTotal={valorTotal}
                      totalFuentes={totalFuentes}
                      diferencia={diferencia}
                      sumaCierra={sumaCierra}
                      onFuenteEnabledChange={handleFuenteEnabledChange}
                      onFuenteConfigChange={handleFuenteConfigChange}
                    />
                  )}

                  {currentStep === 3 && (
                    <Paso3Revision
                      key="paso3"
                      clienteNombre={clienteNombre || 'Cliente'}
                      proyectoNombre={proyectos.find((p) => p.id === proyectoSeleccionado)?.nombre || ''}
                      vivienda={viviendas.find((v) => v.id === viviendaId)}
                      valorNegociado={valorNegociado}
                      descuentoAplicado={descuentoAplicado}
                      valorTotal={valorTotal}
                      notas={notas}
                      fuentes={fuentesActivas.filter((f) => f.config !== null) as Array<{ tipo: TipoFuentePago; config: CrearFuentePagoDTO }>}
                    />
                  )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer con botones */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={currentStep === 1 ? handleClose : handleBack}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {currentStep === 1 ? (
                      <>
                        <X className="h-5 w-5" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="h-5 w-5" />
                        Anterior
                      </>
                    )}
                  </button>

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={currentStep === 1 ? !paso1Valido : !paso2Valido}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>Siguiente</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={creando}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {creando ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Creando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Crear Negociación</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================
// COMPONENTES DE PASOS
// ============================================

/** PASO 1: Información Básica */
function Paso1InfoBasica({
  clienteNombre,
  proyectos,
  viviendas,
  cargandoProyectos,
  cargandoViviendas,
  proyectoSeleccionado,
  viviendaId,
  valorNegociado,
  descuentoAplicado,
  valorTotal,
  notas,
  viviendaIdProp,
  onProyectoChange,
  onViviendaChange,
  onValorNegociadoChange,
  onDescuentoChange,
  onNotasChange,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Info del Cliente */}
      <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {clienteNombre || 'Cliente seleccionado'}
            </p>
          </div>
        </div>
      </div>

      {/* Proyecto */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Building2 className="h-4 w-4 text-purple-500" />
          Proyecto
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={proyectoSeleccionado}
            onChange={(e) => onProyectoChange(e.target.value)}
            disabled={cargandoProyectos || !!viviendaIdProp}
            className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 transition-all hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Selecciona un proyecto</option>
            {proyectos.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400" />
        </div>
      </div>

      {/* Vivienda */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Home className="h-4 w-4 text-purple-500" />
          Vivienda
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={viviendaId}
            onChange={(e) => onViviendaChange(e.target.value)}
            disabled={!proyectoSeleccionado || cargandoViviendas || !!viviendaIdProp}
            className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 transition-all hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">
              {cargandoViviendas
                ? 'Cargando viviendas...'
                : !proyectoSeleccionado
                  ? 'Primero selecciona un proyecto'
                  : viviendas.length === 0
                    ? 'No hay viviendas disponibles'
                    : 'Selecciona una vivienda'}
            </option>
            {viviendas.map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.manzana_nombre ? `Manzana ${v.manzana_nombre} - ` : ''}Casa {v.numero}
              </option>
            ))}
          </select>
          <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400" />
        </div>
      </div>

      {/* Valor de la Vivienda (Read-only) */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <DollarSign className="h-4 w-4 text-purple-500" />
          Valor de la Vivienda
          <span className="text-xs text-gray-500 ml-1">(auto-llenado desde vivienda)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="text"
            readOnly
            value={valorNegociado ? valorNegociado.toLocaleString('es-CO') : '0'}
            placeholder="Selecciona una vivienda"
            className="w-full cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 pl-8 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>
        {valorNegociado > 0 && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: Si hay descuento, configúralo abajo para ajustar el valor final
          </p>
        )}
      </div>

      {/* Descuento */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <DollarSign className="h-4 w-4 text-purple-500" />
          Descuento Aplicado
          <span className="text-xs text-gray-500">(opcional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="text"
            value={descuentoAplicado ? descuentoAplicado.toLocaleString('es-CO') : ''}
            onChange={(e) => {
              const valor = e.target.value.replace(/\./g, '').replace(/,/g, '')
              const numero = Number(valor)
              if (!isNaN(numero)) {
                onDescuentoChange(numero)
              }
            }}
            placeholder="0"
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pl-8 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Valor Total */}
      {(valorNegociado > 0 || descuentoAplicado > 0) && (
        <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor Total a Financiar
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${valorTotal.toLocaleString('es-CO')}
            </span>
          </div>
          {descuentoAplicado > 0 && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Descuento: -${descuentoAplicado.toLocaleString('es-CO')} (
              {((descuentoAplicado / valorNegociado) * 100).toFixed(1)}%)
            </p>
          )}
        </div>
      )}

      {/* Notas */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <MessageSquare className="h-4 w-4 text-purple-500" />
          Notas
          <span className="text-xs text-gray-500">(opcional)</span>
        </label>
        <textarea
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          rows={3}
          placeholder="Condiciones especiales, acuerdos, observaciones..."
          className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </motion.div>
  )
}

/** PASO 2: Fuentes de Pago */
function Paso2FuentesPago({
  fuentes,
  valorTotal,
  totalFuentes,
  diferencia,
  sumaCierra,
  onFuenteEnabledChange,
  onFuenteConfigChange,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Resumen del Valor */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Valor Total a Financiar
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            ${valorTotal.toLocaleString('es-CO')}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Configura las fuentes de pago para cubrir este monto
          </p>
        </div>
      </div>

      {/* Fuentes de Pago */}
      <div className="space-y-4">
        {fuentes.map((fuente: FuentePagoConfiguracion) => (
          <FuentePagoCard
            key={fuente.tipo}
            tipo={fuente.tipo}
            config={fuente.config}
            obligatorio={fuente.tipo === 'Cuota Inicial'}
            enabled={fuente.enabled}
            valorTotal={valorTotal}
            onEnabledChange={(enabled) => onFuenteEnabledChange(fuente.tipo, enabled)}
            onChange={(config) => onFuenteConfigChange(fuente.tipo, config)}
          />
        ))}
      </div>

      {/* Validación Visual */}
      <div
        className={`rounded-xl border-2 p-6 transition-all ${
          sumaCierra
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : totalFuentes > 0
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Fuentes de Pago:
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${totalFuentes.toLocaleString('es-CO')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor Total Vivienda:
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${valorTotal.toLocaleString('es-CO')}
            </span>
          </div>

          <div className="border-t-2 border-gray-300 pt-3 dark:border-gray-600">
            {sumaCierra ? (
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6" />
                <div>
                  <p className="font-bold">¡Financiamiento completo!</p>
                  <p className="text-sm">Las fuentes cubren exactamente el valor total.</p>
                </div>
              </div>
            ) : diferencia > 0 ? (
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-bold">Faltan ${Math.abs(diferencia).toLocaleString('es-CO')}</p>
                  <p className="text-sm">
                    Ajusta los montos o agrega más fuentes para cubrir el total.
                  </p>
                </div>
              </div>
            ) : diferencia < 0 ? (
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-bold">
                    Excedente de ${Math.abs(diferencia).toLocaleString('es-CO')}
                  </p>
                  <p className="text-sm">
                    Las fuentes superan el valor total. Reduce los montos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-bold">Configura las fuentes de pago</p>
                  <p className="text-sm">
                    Debes cubrir los ${valorTotal.toLocaleString('es-CO')} del valor total.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/** PASO 3: Revisión y Confirmación */
function Paso3Revision({
  clienteNombre,
  proyectoNombre,
  vivienda,
  valorNegociado,
  descuentoAplicado,
  valorTotal,
  notas,
  fuentes,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Información Básica */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <Home className="h-5 w-5 text-purple-600" />
          Información Básica
        </h3>

        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Cliente</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {clienteNombre}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyecto</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {proyectoNombre}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Vivienda</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {vivienda?.manzana_nombre ? `${vivienda.manzana_nombre} - ` : ''}Casa{' '}
              {vivienda?.numero || '—'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Valor Negociado
            </dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              ${valorNegociado.toLocaleString('es-CO')}
            </dd>
          </div>

          {descuentoAplicado > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Descuento</dt>
              <dd className="mt-1 text-base font-semibold text-orange-600 dark:text-orange-400">
                -${descuentoAplicado.toLocaleString('es-CO')}
              </dd>
            </div>
          )}

          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</dt>
            <dd className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              ${valorTotal.toLocaleString('es-CO')}
            </dd>
          </div>

          {notas && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Notas</dt>
              <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300">{notas}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Fuentes de Pago Configuradas */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <DollarSign className="h-5 w-5 text-purple-600" />
          Fuentes de Pago Configuradas
        </h3>

        <div className="space-y-3">
          {fuentes.map((fuente: any) => {
            const porcentaje = ((fuente.config.monto_aprobado / valorTotal) * 100).toFixed(1)

            return (
              <div
                key={fuente.tipo}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{fuente.tipo}</p>
                    {fuente.config.entidad && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {fuente.config.entidad}
                      </p>
                    )}
                    {fuente.config.numero_referencia && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Ref: {fuente.config.numero_referencia}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${fuente.config.monto_aprobado.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{porcentaje}%</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmación */}
      <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Importante</h4>
            <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              Al confirmar, se creará la negociación con el cierre financiero completo. La vivienda
              quedará <strong>reservada</strong> y el cliente pasará a estado <strong>Activo</strong>.
              Podrás empezar a recibir abonos inmediatamente.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
