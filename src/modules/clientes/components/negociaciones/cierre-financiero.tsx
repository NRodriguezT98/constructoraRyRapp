/**
 * Componente Cierre Financiero
 *
 * Gestiona las 4 fuentes de pago para completar el valor de la negociación:
 * 1. Cuota Inicial (permite múltiples abonos)
 * 2. Crédito Hipotecario (pago único)
 * 3. Subsidio Mi Casa Ya (pago único)
 * 4. Subsidio Caja de Compensación (pago único)
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

'use client'

import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    BadgeDollarSign,
    Building2,
    CheckCircle2,
    CreditCard,
    DollarSign,
    FileText,
    Home,
    Info,
    Loader2,
    Plus,
    Save,
    Shield,
    Trash2,
    TrendingUp,
    Upload,
    Wallet,
    X
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface FuentePago {
  id?: string
  tipo: 'Cuota Inicial' | 'Crédito Hipotecario' | 'Subsidio Mi Casa Ya' | 'Subsidio Caja Compensación'
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
}

interface CierreFinancieroProps {
  negociacionId: string
  valorTotal: number
  onCierreCompleto: () => void
  onCancelar: () => void
}

// Configuración de las fuentes de pago
const TIPOS_FUENTE = {
  'Cuota Inicial': {
    icon: Wallet,
    color: 'purple',
    bgLight: 'bg-purple-50',
    bgDark: 'bg-purple-900/20',
    textLight: 'text-purple-600',
    textDark: 'text-purple-400',
    borderLight: 'border-purple-200',
    borderDark: 'border-purple-700',
    label: 'Cuota Inicial',
    descripcion: 'Pagos directos del cliente (permite múltiples abonos)',
    requiereEntidad: false,
    permiteMultiples: true,
  },
  'Crédito Hipotecario': {
    icon: Building2,
    color: 'blue',
    bgLight: 'bg-blue-50',
    bgDark: 'bg-blue-900/20',
    textLight: 'text-blue-600',
    textDark: 'text-blue-400',
    borderLight: 'border-blue-200',
    borderDark: 'border-blue-700',
    label: 'Crédito Hipotecario',
    descripcion: 'Financiación bancaria',
    requiereEntidad: true,
    permiteMultiples: false,
  },
  'Subsidio Mi Casa Ya': {
    icon: Home,
    color: 'green',
    bgLight: 'bg-green-50',
    bgDark: 'bg-green-900/20',
    textLight: 'text-green-600',
    textDark: 'text-green-400',
    borderLight: 'border-green-200',
    borderDark: 'border-green-700',
    label: 'Subsidio Mi Casa Ya',
    descripcion: 'Subsidio del gobierno nacional',
    requiereEntidad: false,
    permiteMultiples: false,
  },
  'Subsidio Caja Compensación': {
    icon: Shield,
    color: 'orange',
    bgLight: 'bg-orange-50',
    bgDark: 'bg-orange-900/20',
    textLight: 'text-orange-600',
    textDark: 'text-orange-400',
    borderLight: 'border-orange-200',
    borderDark: 'border-orange-700',
    label: 'Subsidio Caja Compensación',
    descripcion: 'Subsidio de caja de compensación familiar',
    requiereEntidad: true,
    permiteMultiples: false,
  },
} as const

export function CierreFinanciero({
  negociacionId,
  valorTotal,
  onCierreCompleto,
  onCancelar,
}: CierreFinancieroProps) {
  // Estado
  const [fuentesPago, setFuentesPago] = useState<FuentePago[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [activando, setActivando] = useState(false)
  const [subiendoArchivo, setSubiendoArchivo] = useState<string | null>(null) // ID de fuente subiendo
  const [error, setError] = useState<string | null>(null)
  const [totales, setTotales] = useState({
    total: 0,
    porcentaje: 0,
    diferencia: 0,
  })

  /**
   * Cargar fuentes de pago existentes
   */
  useEffect(() => {
    cargarFuentesPago()
  }, [negociacionId])

  /**
   * Calcular totales cuando cambian las fuentes
   */
  useEffect(() => {
    calcularTotales()
  }, [fuentesPago, valorTotal])

  const cargarFuentesPago = async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await fuentesPagoService.obtenerFuentesPagoNegociacion(negociacionId)
      setFuentesPago(
        data.map((f: any) => ({
          id: f.id,
          tipo: f.tipo,
          monto_aprobado: f.monto_aprobado || 0,
          entidad: f.entidad,
          numero_referencia: f.numero_referencia,
          carta_aprobacion_url: f.carta_aprobacion_url,
          carta_asignacion_url: f.carta_asignacion_url,
        }))
      )
    } catch (err: any) {
      console.error('Error cargando fuentes:', err)
      setError(`Error cargando fuentes de pago: ${err.message}`)
    } finally {
      setCargando(false)
    }
  }

  const calcularTotales = () => {
    const total = fuentesPago.reduce((sum, f) => sum + (f.monto_aprobado || 0), 0)
    const porcentaje = valorTotal > 0 ? (total / valorTotal) * 100 : 0
    const diferencia = valorTotal - total

    setTotales({ total, porcentaje, diferencia })
  }

  const agregarFuente = (tipo: FuentePago['tipo']) => {
    // Verificar si ya existe este tipo (excepto Cuota Inicial que puede repetirse)
    if (tipo !== 'Cuota Inicial') {
      const existe = fuentesPago.some((f) => f.tipo === tipo)
      if (existe) {
        setError(`Ya existe una fuente de tipo "${tipo}"`)
        return
      }
    }

    setFuentesPago([
      ...fuentesPago,
      {
        tipo,
        monto_aprobado: 0,
        entidad: '',
        numero_referencia: '',
      },
    ])
    setError(null)
  }

  const actualizarFuente = (index: number, campo: keyof FuentePago, valor: any) => {
    const nuevasFuentes = [...fuentesPago]
    nuevasFuentes[index] = { ...nuevasFuentes[index], [campo]: valor }
    setFuentesPago(nuevasFuentes)
  }

  const eliminarFuente = async (index: number) => {
    const fuente = fuentesPago[index]

    // Si tiene ID, eliminar de la BD
    if (fuente.id) {
      try {
        await fuentesPagoService.eliminarFuentePago(fuente.id)
      } catch (err: any) {
        setError(`Error eliminando fuente: ${err.message}`)
        return
      }
    }

    // Eliminar del estado
    setFuentesPago(fuentesPago.filter((_, i) => i !== index))
    setError(null)
  }

  const subirCartaAprobacion = async (
    fuenteId: string,
    archivo: File,
    tipoDocumento: 'aprobacion' | 'asignacion'
  ) => {
    try {
      setSubiendoArchivo(fuenteId)
      setError(null)

      const url = await fuentesPagoService.subirCartaAprobacion({
        fuentePagoId: fuenteId,
        archivo,
        tipoDocumento,
      })

      // Actualizar la fuente en el estado local
      setFuentesPago((prev) =>
        prev.map((f) =>
          f.id === fuenteId
            ? {
                ...f,
                [tipoDocumento === 'aprobacion'
                  ? 'carta_aprobacion_url'
                  : 'carta_asignacion_url']: url,
              }
            : f
        )
      )

      alert('✅ Documento subido correctamente')
    } catch (err: any) {
      console.error('Error subiendo documento:', err)
      setError(`Error subiendo documento: ${err.message}`)
    } finally {
      setSubiendoArchivo(null)
    }
  }

  const guardarFuentes = async () => {
    try {
      setGuardando(true)
      setError(null)

      // Validar que todas las fuentes tengan monto > 0
      const invalidas = fuentesPago.filter((f) => !f.monto_aprobado || f.monto_aprobado <= 0)
      if (invalidas.length > 0) {
        setError('Todas las fuentes deben tener un monto aprobado mayor a 0')
        return
      }

      // Validar entidades requeridas
      for (const fuente of fuentesPago) {
        const config = TIPOS_FUENTE[fuente.tipo]
        if (config.requiereEntidad && !fuente.entidad?.trim()) {
          setError(`La fuente "${fuente.tipo}" requiere especificar la entidad`)
          return
        }
      }

      // ⚠️ Validar documentos requeridos
      for (const fuente of fuentesPago) {
        if (fuente.tipo === 'Crédito Hipotecario' && !fuente.carta_aprobacion_url) {
          setError('Crédito Hipotecario requiere carta de aprobación del banco')
          return
        }
        if (fuente.tipo === 'Subsidio Caja Compensación' && !fuente.carta_aprobacion_url) {
          setError('Subsidio Caja Compensación requiere carta de aprobación')
          return
        }
      }

      // Guardar cada fuente
      for (const fuente of fuentesPago) {
        if (fuente.id) {
          // Actualizar existente
          await fuentesPagoService.actualizarFuentePago(fuente.id, {
            monto_aprobado: fuente.monto_aprobado,
            entidad: fuente.entidad,
            numero_referencia: fuente.numero_referencia,
          })
        } else {
          // Crear nueva
          await fuentesPagoService.crearFuentePago({
            negociacion_id: negociacionId,
            tipo: fuente.tipo,
            monto_aprobado: fuente.monto_aprobado,
            entidad: fuente.entidad,
            numero_referencia: fuente.numero_referencia,
          })
        }
      }

      // Pasar negociación a "Cierre Financiero"
      await negociacionesService.pasarACierreFinanciero(negociacionId)

      // Recargar fuentes
      await cargarFuentesPago()

      alert('✅ Fuentes de pago guardadas correctamente')
    } catch (err: any) {
      console.error('Error guardando fuentes:', err)
      setError(`Error guardando fuentes: ${err.message}`)
    } finally {
      setGuardando(false)
    }
  }

  const activarNegociacion = async () => {
    try {
      setActivando(true)
      setError(null)

      // Verificar que el cierre esté completo
      const completo = await fuentesPagoService.verificarCierreFinancieroCompleto(
        negociacionId,
        valorTotal
      )

      if (!completo) {
        setError(
          'El cierre financiero no está completo. La suma de las fuentes debe ser igual al valor total de la negociación.'
        )
        return
      }

      // Activar negociación
      await negociacionesService.activarNegociacion(negociacionId)

      // Notificar éxito
      onCierreCompleto()
    } catch (err: any) {
      console.error('Error activando negociación:', err)
      setError(`Error activando negociación: ${err.message}`)
    } finally {
      setActivando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const cierreCompleto = Math.abs(totales.diferencia) < 1 // Margen de error de 1 peso
  const porcentajeCubierto = totales.porcentaje

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Cierre Financiero</h2>
            <p className="mt-2 text-purple-100">
              Configura las fuentes de pago para completar el valor de la negociación
            </p>
          </div>
          <button
            onClick={onCancelar}
            className="rounded-lg bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resumen de valores */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-purple-100">Valor Total Negociación</p>
            <p className="mt-1 text-2xl font-bold">${valorTotal.toLocaleString('es-CO')}</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-purple-100">Total Fuentes</p>
            <p className="mt-1 text-2xl font-bold">${totales.total.toLocaleString('es-CO')}</p>
            <p className="mt-1 text-xs text-purple-200">
              {porcentajeCubierto.toFixed(1)}% cubierto
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-purple-100">
              {totales.diferencia > 0 ? 'Falta' : totales.diferencia < 0 ? 'Exceso' : 'Completo'}
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                cierreCompleto
                  ? 'text-green-300'
                  : totales.diferencia > 0
                    ? 'text-yellow-300'
                    : 'text-red-300'
              }`}
            >
              ${Math.abs(totales.diferencia).toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(porcentajeCubierto, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${
                cierreCompleto
                  ? 'bg-green-400'
                  : porcentajeCubierto > 100
                    ? 'bg-red-400'
                    : 'bg-yellow-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Botones para agregar fuentes */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Plus className="h-5 w-5" />
          Agregar Fuente de Pago
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(TIPOS_FUENTE) as [FuentePago['tipo'], typeof TIPOS_FUENTE[keyof typeof TIPOS_FUENTE]][]).map(([tipo, config]) => {
            const Icon = config.icon
            const yaExiste = fuentesPago.some((f) => f.tipo === tipo)
            const deshabilitado = yaExiste && !config.permiteMultiples

            return (
              <button
                key={tipo}
                onClick={() => agregarFuente(tipo)}
                disabled={deshabilitado}
                className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                  deshabilitado
                    ? 'cursor-not-allowed opacity-50'
                    : `${config.borderLight} hover:shadow-lg dark:${config.borderDark} hover:scale-[1.02]`
                }`}
              >
                <div className={`${config.bgLight} dark:${config.bgDark} absolute inset-0 opacity-50`} />
                <div className="relative">
                  <Icon className={`h-8 w-8 ${config.textLight} dark:${config.textDark} mb-2`} />
                  <p className={`font-semibold ${config.textLight} dark:${config.textDark}`}>
                    {config.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {config.descripcion}
                  </p>
                  {deshabilitado && (
                    <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                      Ya agregado
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista de fuentes agregadas */}
      {fuentesPago.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <BadgeDollarSign className="h-5 w-5" />
            Fuentes Configuradas ({fuentesPago.length})
          </h3>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {fuentesPago.map((fuente, index) => {
                const config = TIPOS_FUENTE[fuente.tipo]
                const Icon = config.icon

                return (
                  <motion.div
                    key={`${fuente.tipo}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`rounded-xl border-2 ${config.borderLight} dark:${config.borderDark} overflow-hidden bg-white dark:bg-gray-800`}
                  >
                    {/* Header de la fuente */}
                    <div className={`${config.bgLight} dark:${config.bgDark} flex items-center justify-between p-4`}>
                      <div className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 ${config.textLight} dark:${config.textDark}`} />
                        <div>
                          <p className={`font-semibold ${config.textLight} dark:${config.textDark}`}>
                            {config.label}
                          </p>
                          {config.permiteMultiples && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Abono #{fuentesPago.filter((f) => f.tipo === fuente.tipo).indexOf(fuente) + 1}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarFuente(index)}
                        className="rounded-lg bg-red-500/10 p-2 text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Formulario */}
                    <div className="space-y-4 p-4">
                      {/* Monto (Cuota Inicial) o Monto Aprobado (otras fuentes) */}
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <DollarSign className="h-4 w-4 text-purple-500" />
                          {fuente.tipo === 'Cuota Inicial' ? 'Monto' : 'Monto Aprobado'}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            $
                          </span>
                          <input
                            type="text"
                            value={
                              fuente.monto_aprobado
                                ? fuente.monto_aprobado.toLocaleString('es-CO')
                                : ''
                            }
                            onChange={(e) => {
                              const valor = e.target.value.replace(/\./g, '').replace(/,/g, '')
                              const numero = Number(valor)
                              if (!isNaN(numero)) {
                                actualizarFuente(index, 'monto_aprobado', numero)
                              }
                            }}
                            placeholder="0"
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 pl-8 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>
                        {fuente.tipo === 'Cuota Inicial' && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Dinero que el cliente ya tiene disponible
                          </p>
                        )}
                      </div>

                      {/* Entidad (si se requiere) */}
                      {config.requiereEntidad && (
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Building2 className="h-4 w-4 text-purple-500" />
                            {fuente.tipo === 'Crédito Hipotecario' ? 'Banco' : 'Entidad'}{' '}
                            {config.requiereEntidad && <span className="text-red-500">*</span>}
                          </label>
                          {fuente.tipo === 'Crédito Hipotecario' ? (
                            <select
                              value={fuente.entidad || ''}
                              onChange={(e) => actualizarFuente(index, 'entidad', e.target.value)}
                              className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                              <option value="">Selecciona un banco</option>
                              <option value="Bancolombia">Bancolombia</option>
                              <option value="Banco de Bogotá">Banco de Bogotá</option>
                              <option value="Banco Agrario">Banco Agrario</option>
                              <option value="Fondo Nacional del Ahorro">Fondo Nacional del Ahorro</option>
                              <option value="BBVA">BBVA</option>
                              <option value="Banco Caja Social">Banco Caja Social</option>
                              <option value="Banco Popular">Banco Popular</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={fuente.entidad || ''}
                              onChange={(e) => actualizarFuente(index, 'entidad', e.target.value)}
                              placeholder="Ej: Comfandi"
                              className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                          )}
                        </div>
                      )}

                      {/* Número de Referencia (solo para fuentes que NO son Cuota Inicial) */}
                      {fuente.tipo !== 'Cuota Inicial' && (
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <CreditCard className="h-4 w-4 text-purple-500" />
                            Número de Referencia
                          </label>
                          <input
                            type="text"
                            value={fuente.numero_referencia || ''}
                            onChange={(e) =>
                              actualizarFuente(index, 'numero_referencia', e.target.value)
                            }
                            placeholder="Ej: CRED-2024-001"
                            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          />
                        </div>
                      )}

                      {/* Carta de Aprobación (REQUERIDA para Crédito Hipotecario y Subsidio Caja) */}
                      {(fuente.tipo === 'Crédito Hipotecario' || fuente.tipo === 'Subsidio Caja Compensación') && fuente.id && (
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <FileText className="h-4 w-4 text-purple-500" />
                            Carta de Aprobación <span className="text-red-500">*</span>
                          </label>
                          {fuente.carta_aprobacion_url ? (
                            <div className="flex items-center gap-2 rounded-lg border-2 border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20">
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                  Documento cargado
                                </p>
                                <a
                                  href={fuente.carta_aprobacion_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-green-600 hover:underline dark:text-green-400"
                                >
                                  Ver documento
                                </a>
                              </div>
                              <label className="cursor-pointer rounded-lg bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700">
                                <Upload className="inline h-3 w-3 mr-1" />
                                Cambiar
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  disabled={subiendoArchivo === fuente.id}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file && fuente.id) {
                                      subirCartaAprobacion(fuente.id, file, 'aprobacion')
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 p-4 transition-colors hover:border-purple-500 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/40">
                              {subiendoArchivo === fuente.id ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    Subiendo...
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    Subir carta de aprobación (PDF, JPG, PNG)
                                  </span>
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    disabled={subiendoArchivo === fuente.id}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file && fuente.id) {
                                        subirCartaAprobacion(fuente.id, file, 'aprobacion')
                                      }
                                    }}
                                  />
                                </>
                              )}
                            </label>
                          )}
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Documento obligatorio antes de activar la negociación
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-100">Error</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Estado del cierre */}
      {fuentesPago.length > 0 && (
        <div
          className={`rounded-xl border-2 p-4 ${
            cierreCompleto
              ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
              : 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
          }`}
        >
          <div className="flex items-start gap-3">
            {cierreCompleto ? (
              <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
            ) : (
              <Info className="h-6 w-6 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            )}
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  cierreCompleto
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-yellow-900 dark:text-yellow-100'
                }`}
              >
                {cierreCompleto ? '¡Cierre Financiero Completo!' : 'Cierre Incompleto'}
              </p>
              <p
                className={`mt-1 text-sm ${
                  cierreCompleto
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}
              >
                {cierreCompleto
                  ? 'Las fuentes de pago cubren el 100% del valor de la negociación. Puedes activar la negociación.'
                  : `La suma de las fuentes debe ser igual al valor total (${
                      totales.diferencia > 0 ? 'falta' : 'excede'
                    } $${Math.abs(totales.diferencia).toLocaleString('es-CO')})`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={onCancelar}
          className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>

        {fuentesPago.length > 0 && !cierreCompleto && (
          <button
            onClick={guardarFuentes}
            disabled={guardando}
            className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Guardando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="h-5 w-5" />
                Guardar Fuentes
              </span>
            )}
          </button>
        )}

        {cierreCompleto && (
          <button
            onClick={activarNegociacion}
            disabled={activando}
            className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activando ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Activando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Activar Negociación
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
