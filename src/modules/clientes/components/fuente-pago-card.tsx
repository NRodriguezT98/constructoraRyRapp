/**
 * Componente: Card para Configurar Fuente de Pago
 *
 * Card reutilizable para cada tipo de fuente:
 * - Cuota Inicial (opcional, igual que las demás)
 * - Crédito Hipotecario (opcional, con select de bancos)
 * - Subsidio Mi Casa Ya (opcional)
 * - Subsidio Caja Compensación (opcional, con select Comfenalco/Comfandi)
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
    Building2,
    CheckCircle2,
    DollarSign,
    Gift,
    Home as HomeIcon,
    Info,
    Upload,
    X
} from 'lucide-react'
import { useState } from 'react'
import type { TipoFuentePago } from '../types'

// Bancos predefinidos para Crédito Hipotecario
const BANCOS_COLOMBIA = [
  'Banco de Bogotá',
  'Bancolombia',
  'Banco Davivienda',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Banco Caja Social',
  'Banco AV Villas',
  'Banco Agrario',
  'Banco Pichincha',
  'Banco Falabella',
  'Banco Serfinanza',
  'Banco Cooperativo Coopcentral',
  'Scotiabank Colpatria',
  'Itaú',
  'Otro'
] as const

// Cajas de Compensación Familiar
const CAJAS_COMPENSACION = [
  'Comfenalco',
  'Comfandi',
  'Compensar',
  'Comfama',
  'Cafam',
  'Otro'
] as const

interface FuentePagoConfig {
  tipo: TipoFuentePago
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
}

interface FuentePagoCardProps {
  tipo: TipoFuentePago
  config: FuentePagoConfig | null
  obligatorio?: boolean
  enabled?: boolean
  valorTotal: number
  onEnabledChange?: (enabled: boolean) => void
  onChange: (config: FuentePagoConfig | null) => void
  onUploadDocument?: (file: File) => Promise<string>
}

// Configuración visual por tipo
const TIPO_CONFIG: Record<
  TipoFuentePago,
  {
    icon: LucideIcon
    color: string
    bgColor: string
    borderColor: string
    placeholder: string
    descripcion: string
    requiereCarta: boolean
    tipoCarta: string
  }
> = {
  'Cuota Inicial': {
    icon: DollarSign,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    placeholder: 'Ej: 20.000.000',
    descripcion: 'Abonos progresivos que realiza el cliente',
    requiereCarta: false,
    tipoCarta: '',
  },
  'Crédito Hipotecario': {
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
    placeholder: 'Ej: 100.000.000',
    descripcion: 'Préstamo bancario aprobado (desembolso único)',
    requiereCarta: true,
    tipoCarta: 'Carta de aprobación del banco',
  },
  'Subsidio Mi Casa Ya': {
    icon: Gift,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-700',
    placeholder: 'Ej: 15.000.000',
    descripcion: 'Subsidio del gobierno (desembolso único)',
    requiereCarta: true,
    tipoCarta: 'Carta de asignación del subsidio',
  },
  'Subsidio Caja Compensación': {
    icon: HomeIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-300 dark:border-orange-700',
    placeholder: 'Ej: 8.000.000',
    descripcion: 'Subsidio de caja de compensación (desembolso único)',
    requiereCarta: true,
    tipoCarta: 'Carta de asignación de la caja',
  },
}

export function FuentePagoCard({
  tipo,
  config,
  obligatorio = false,
  enabled: enabledProp,
  valorTotal,
  onEnabledChange,
  onChange,
  onUploadDocument,
}: FuentePagoCardProps) {
  const [enabled, setEnabled] = useState(enabledProp ?? obligatorio)
  const [uploading, setUploading] = useState(false)

  const tipoConfig = TIPO_CONFIG[tipo]
  const Icon = tipoConfig.icon

  const handleEnabledChange = (newEnabled: boolean) => {
    setEnabled(newEnabled)
    onEnabledChange?.(newEnabled)

    if (!newEnabled) {
      onChange(null)
    } else {
      onChange({
        tipo,
        monto_aprobado: 0,
        entidad: '',
        numero_referencia: '',
      })
    }
  }

  const handleMontoChange = (value: string) => {
    const numero = Number(value.replace(/\./g, '').replace(/,/g, ''))
    if (!isNaN(numero)) {
      onChange({
        ...config!,
        monto_aprobado: numero,
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUploadDocument) return

    setUploading(true)
    try {
      const url = await onUploadDocument(file)
      onChange({
        ...config!,
        carta_aprobacion_url: url,
      })
    } catch (error) {
      console.error('Error subiendo documento:', error)
      alert('Error al subir el documento. Intenta nuevamente.')
    } finally {
      setUploading(false)
    }
  }

  const porcentaje = config?.monto_aprobado
    ? ((config.monto_aprobado / valorTotal) * 100).toFixed(1)
    : '0.0'

  return (
    <div
      className={`rounded-xl border-2 transition-all ${
        enabled
          ? `${tipoConfig.bgColor} ${tipoConfig.borderColor}`
          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              enabled ? tipoConfig.bgColor : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <Icon className={`h-6 w-6 ${enabled ? tipoConfig.color : 'text-gray-500'}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">{tipo}</h4>
              {obligatorio && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  Obligatoria
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{tipoConfig.descripcion}</p>
          </div>
        </div>

        {!obligatorio && (
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={enabled}
              onChange={(e) => handleEnabledChange(e.target.checked)}
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-purple-800"></div>
          </label>
        )}
      </div>

      {/* Contenido (solo visible si está enabled) */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 p-4">
              {/* Monto */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <DollarSign className="h-4 w-4" />
                  Monto Aprobado
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    required
                    value={config?.monto_aprobado ? config.monto_aprobado.toLocaleString('es-CO') : ''}
                    onChange={(e) => handleMontoChange(e.target.value)}
                    placeholder={tipoConfig.placeholder}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 pl-8 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                {/* Porcentaje */}
                {config?.monto_aprobado > 0 && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {porcentaje}% del valor total (${valorTotal.toLocaleString('es-CO')})
                  </p>
                )}
              </div>

              {/* Campos específicos por tipo */}
              {tipo !== 'Cuota Inicial' && (
                <>
                  {/* Entidad (SELECT) */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tipo === 'Crédito Hipotecario' ? 'Banco' : tipo === 'Subsidio Caja Compensación' ? 'Caja de Compensación' : 'Entidad'}
                    </label>
                    {tipo === 'Crédito Hipotecario' ? (
                      <div className="relative">
                        <select
                          value={config?.entidad || ''}
                          onChange={(e) =>
                            onChange({
                              ...config!,
                              entidad: e.target.value,
                            })
                          }
                          className="w-full appearance-none rounded-lg border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                          <option value="">Selecciona un banco</option>
                          {BANCOS_COLOMBIA.map((banco) => (
                            <option key={banco} value={banco}>
                              {banco}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : tipo === 'Subsidio Caja Compensación' ? (
                      <div className="relative">
                        <select
                          value={config?.entidad || ''}
                          onChange={(e) =>
                            onChange({
                              ...config!,
                              entidad: e.target.value,
                            })
                          }
                          className="w-full appearance-none rounded-lg border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                          <option value="">Selecciona una caja</option>
                          {CAJAS_COMPENSACION.map((caja) => (
                            <option key={caja} value={caja}>
                              {caja}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={config?.entidad || ''}
                        onChange={(e) =>
                          onChange({
                            ...config!,
                            entidad: e.target.value,
                          })
                        }
                        placeholder="Nombre de la entidad"
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    )}
                  </div>

                  {/* Número de Referencia */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tipo === 'Crédito Hipotecario' ? 'Radicado/Número de Crédito' : 'Número de Asignación'}
                    </label>
                    <input
                      type="text"
                      value={config?.numero_referencia || ''}
                      onChange={(e) =>
                        onChange({
                          ...config!,
                          numero_referencia: e.target.value,
                        })
                      }
                      placeholder="Ej: 12345678"
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Upload Carta (Opcional por ahora) */}
                  {tipoConfig.requiereCarta && (
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Upload className="h-4 w-4" />
                        {tipoConfig.tipoCarta}
                        <span className="text-xs font-normal text-gray-500">(Opcional)</span>
                      </label>

                      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/50">
                        {config?.carta_aprobacion_url ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Documento cargado
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                onChange({
                                  ...config!,
                                  carta_aprobacion_url: undefined,
                                })
                              }
                              className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center gap-2">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {uploading ? 'Subiendo...' : 'Click para subir documento'}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>

                      <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <Info className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Por ahora es opcional. Puedes cargarlo después si lo prefieres.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
