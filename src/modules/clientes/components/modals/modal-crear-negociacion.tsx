/**
 * Modal para Crear Negociación
 *
 * Vincula Cliente + Vivienda + Valor Negociado
 * Primera etapa del proceso de venta
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

'use client'

import { useCrearNegociacion } from '@/modules/clientes/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Building2,
    ChevronRight,
    DollarSign,
    Home,
    Loader2,
    MessageSquare,
    Sparkles,
    User,
    X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ModalCrearNegociacionProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  clienteNombre?: string
  viviendaId?: string // Opcional: puede venir pre-seleccionada desde un interés
  valorVivienda?: number // Para pre-llenar
  onSuccess: (negociacionId: string) => void
}

// Componente de Input Moderno
function ModernInput({ icon: Icon, label, error, required, className = '', ...props }: any) {
  return (
    <div className="group">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Icon className="h-4 w-4 text-purple-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-purple-600 dark:focus:border-purple-500 ${className}`}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center gap-1 text-sm text-red-500"
          >
            <span className="font-medium">⚠</span> {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

// Componente de Select Moderno
function ModernSelect({ icon: Icon, label, error, required, children, ...props }: any) {
  return (
    <div className="group">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Icon className="h-4 w-4 text-purple-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          {...props}
          className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 transition-all hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-purple-600"
        >
          {children}
        </select>
        <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400" />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center gap-1 text-sm text-red-500"
          >
            <span className="font-medium">⚠</span> {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

// Componente de Textarea Moderno
function ModernTextarea({ icon: Icon, label, error, ...props }: any) {
  return (
    <div className="group">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Icon className="h-4 w-4 text-purple-500" />
        {label}
      </label>
      <div className="relative">
        <textarea
          {...props}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-purple-600 resize-none"
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -10 }}
            className="mt-1.5 flex items-center gap-1 text-sm text-red-500"
          >
            <span className="font-medium">⚠</span> {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

export function ModalCrearNegociacion({
  isOpen,
  onClose,
  clienteId,
  clienteNombre,
  viviendaId: viviendaIdProp,
  valorVivienda,
  onSuccess,
}: ModalCrearNegociacionProps) {
  // Hook de negociación
  const { creando, error, crearNegociacion, limpiar, calcularValorTotal } = useCrearNegociacion()

  // Estado del formulario
  const [viviendaId, setViviendaId] = useState(viviendaIdProp || '')
  const [valorNegociado, setValorNegociado] = useState(valorVivienda || 0)
  const [descuentoAplicado, setDescuentoAplicado] = useState(0)
  const [notas, setNotas] = useState('')

  // Estados para cargar datos
  const [proyectos, setProyectos] = useState<any[]>([])
  const [viviendas, setViviendas] = useState<any[]>([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('')
  const [cargandoProyectos, setCargandoProyectos] = useState(false)
  const [cargandoViviendas, setCargandoViviendas] = useState(false)

  // Valor total calculado
  const valorTotal = calcularValorTotal(valorNegociado, descuentoAplicado)

  /**
   * Cargar proyectos al abrir el modal
   */
  useEffect(() => {
    if (isOpen) {
      cargarProyectos()
    }
  }, [isOpen])

  /**
   * Pre-seleccionar vivienda si viene como prop
   */
  useEffect(() => {
    if (viviendaIdProp) {
      setViviendaId(viviendaIdProp)
      // TODO: Cargar proyecto de la vivienda automáticamente
    }
  }, [viviendaIdProp])

  /**
   * Pre-llenar valor si viene como prop
   */
  useEffect(() => {
    if (valorVivienda) {
      setValorNegociado(valorVivienda)
    }
  }, [valorVivienda])

  /**
   * Cargar viviendas cuando se selecciona un proyecto
   */
  useEffect(() => {
    if (proyectoSeleccionado) {
      cargarViviendas(proyectoSeleccionado)
    } else {
      setViviendas([])
      setViviendaId('')
    }
  }, [proyectoSeleccionado])

  /**
   * Cargar valor de la vivienda cuando se selecciona
   */
  useEffect(() => {
    if (viviendaId) {
      const vivienda = viviendas.find((v) => v.id === viviendaId)
      if (vivienda && vivienda.valor_total) {
        setValorNegociado(vivienda.valor_total)
      }
    }
  }, [viviendaId, viviendas])

  const cargarProyectos = async () => {
    setCargandoProyectos(true)
    try {
      const { proyectosService } = await import('@/modules/proyectos/services/proyectos.service')
      const data = await proyectosService.obtenerProyectos()
      setProyectos(data)
    } catch (error) {
      console.error('Error cargando proyectos:', error)
    } finally {
      setCargandoProyectos(false)
    }
  }

  const cargarViviendas = async (proyectoId: string) => {
    setCargandoViviendas(true)
    try {
      const { viviendasService } = await import('@/modules/viviendas/services/viviendas.service')

      // Obtener todas las viviendas y filtrar por proyecto y disponibilidad
      const todasViviendas = await viviendasService.obtenerTodas()

      // Necesitamos filtrar por proyecto (a través de manzana)
      // Primero obtenemos las manzanas del proyecto
      const manzanas = await viviendasService.obtenerManzanasDisponibles(proyectoId)
      const manzanaIds = manzanas.map((m: any) => m.id)

      // Filtrar viviendas: solo las del proyecto y disponibles
      const disponibles = todasViviendas.filter(
        (v: any) =>
          manzanaIds.includes(v.manzana_id) &&
          v.estado === 'disponible'
      )

      setViviendas(disponibles)
    } catch (error) {
      console.error('Error cargando viviendas:', error)
    } finally {
      setCargandoViviendas(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const negociacion = await crearNegociacion({
      cliente_id: clienteId,
      vivienda_id: viviendaId,
      valor_negociado: valorNegociado,
      descuento_aplicado: descuentoAplicado,
      notas: notas,
    })

    if (negociacion) {
      onSuccess(negociacion.id)
      handleClose()
    }
  }

  const handleClose = () => {
    limpiar()
    setViviendaId(viviendaIdProp || '')
    setValorNegociado(valorVivienda || 0)
    setDescuentoAplicado(0)
    setNotas('')
    setProyectoSeleccionado('')
    setViviendas([])
    onClose()
  }

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
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
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
                      Vincula al cliente con una vivienda para iniciar el proceso de venta
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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

                  {/* Selección de Proyecto */}
                  <ModernSelect
                    icon={Building2}
                    label="Proyecto"
                    required
                    value={proyectoSeleccionado}
                    onChange={(e: any) => setProyectoSeleccionado(e.target.value)}
                    disabled={cargandoProyectos || !!viviendaIdProp}
                  >
                    <option value="">Selecciona un proyecto</option>
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </ModernSelect>

                  {/* Selección de Vivienda */}
                  <ModernSelect
                    icon={Home}
                    label="Vivienda"
                    required
                    value={viviendaId}
                    onChange={(e: any) => setViviendaId(e.target.value)}
                    disabled={!proyectoSeleccionado || cargandoViviendas || !!viviendaIdProp}
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
                    {viviendas.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.manzana_nombre ? `${v.manzana_nombre} - ` : ''}Casa {v.numero} - $
                        {v.valor_total?.toLocaleString('es-CO')}
                      </option>
                    ))}
                  </ModernSelect>

                  {/* Valor Negociado */}
                  <ModernInput
                    icon={DollarSign}
                    label="Valor Negociado"
                    type="number"
                    required
                    value={valorNegociado}
                    onChange={(e: any) => setValorNegociado(Number(e.target.value))}
                    placeholder="120000000"
                  />

                  {/* Descuento Aplicado */}
                  <ModernInput
                    icon={DollarSign}
                    label="Descuento Aplicado (opcional)"
                    type="number"
                    value={descuentoAplicado}
                    onChange={(e: any) => setDescuentoAplicado(Number(e.target.value))}
                    placeholder="0"
                  />

                  {/* Valor Total Calculado */}
                  {(valorNegociado > 0 || descuentoAplicado > 0) && (
                    <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Valor Total
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
                  <ModernTextarea
                    icon={MessageSquare}
                    label="Notas (opcional)"
                    value={notas}
                    onChange={(e: any) => setNotas(e.target.value)}
                    rows={3}
                    placeholder="Condiciones especiales, acuerdos, observaciones..."
                  />

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20"
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

                  {/* Botones */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creando || !viviendaId || valorNegociado <= 0}
                      className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {creando ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Creando...
                        </span>
                      ) : (
                        'Crear Negociación'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
