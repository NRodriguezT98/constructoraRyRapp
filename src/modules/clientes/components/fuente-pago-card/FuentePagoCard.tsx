/**
 * FuentePagoCard - Componente Refactorizado V2
 *
 * ✅ REUTILIZACIÓN DE COMPONENTES GENÉRICOS
 * - UI presentacional pura
 * - Lógica en useFuentePagoCard (simplificado)
 * - Upload delegado a DocumentoUploadCompact (genérico reutilizable)
 * - Estilos en fuente-pago-card.styles.ts
 */

'use client'

import { AlertCircle, Building2, DollarSign, Gift, Home } from 'lucide-react'

import type { TipoFuentePago } from '@/modules/clientes/types'
import { DocumentoUploadCompact } from '@/shared/components/documents'
import type { FuentePagoConfig, FuentePagoErrores } from '../asignar-vivienda/types'

import { fuentePagoCardStyles as s } from './fuente-pago-card.styles'
import { useFuentePagoCard } from './useFuentePagoCard'

// ============================================
// CONFIGURACIÓN VISUAL
// ============================================

type TipoConfigItem = {
  icon: typeof DollarSign
  color: string
  bgColor: string
  borderColor: string
  descripcion: string
  requiereCarta: boolean
  requiereEntidad?: boolean // Si necesita banco o caja de compensación
  obligatorio?: boolean
}

const TIPO_CONFIG: Record<TipoFuentePago, TipoConfigItem> = {
  'Cuota Inicial': {
    icon: Home,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-700',
    descripcion: 'Cuota inicial del cliente (pago directo)',
    requiereCarta: false,
  },
  'Crédito Hipotecario': {
    icon: Building2,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    descripcion: 'Crédito bancario aprobado',
    requiereCarta: true,
    requiereEntidad: true, // ✅ Requiere banco
  },
  'Subsidio Mi Casa Ya': {
    icon: Gift,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
    descripcion: 'Subsidio nacional de vivienda',
    requiereCarta: true,
    requiereEntidad: false, // ❌ NO requiere banco/caja (solo número resolución)
  },
  'Subsidio Caja Compensación': {
    icon: DollarSign,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-300 dark:border-orange-700',
    descripcion: 'Subsidio de caja de compensación',
    requiereCarta: true,
    requiereEntidad: true, // ✅ Requiere caja de compensación
  },
}

const BANCOS = [
  'Banco de Bogotá', 'Bancolombia', 'Banco Davivienda', 'BBVA Colombia',
  'Banco de Occidente', 'Banco Popular', 'Banco Caja Social', 'Otro'
]

const CAJAS = ['Comfenalco', 'Comfandi', 'Compensar', 'Comfama', 'Cafam', 'Otro']

const CATEGORIA_CARTAS_APROBACION_ID = '4898e798-c188-4f02-bfcf-b2b15be48e34'

// ============================================
// HELPERS
// ============================================

/**
 * Genera el título formateado del documento según el tipo de fuente
 */
function generarTituloDocumento(
  tipoFuente: TipoFuentePago,
  manzana: string | undefined,
  numeroVivienda: string | undefined,
  clienteNombre: string
): string {
  const vivienda = `${manzana}${numeroVivienda}` // Ej: "A1"
  const nombreMayusculas = clienteNombre.toUpperCase()

  switch (tipoFuente) {
    case 'Crédito Hipotecario':
      return `CARTA DE APROBACIÓN CRÉDITO ${vivienda} - ${nombreMayusculas}`

    case 'Subsidio Caja Compensación':
      return `CARTA CAJA DE COMPENSACIÓN ${vivienda} - ${nombreMayusculas}`

    case 'Subsidio Mi Casa Ya':
      return `CARTA SUBSIDIO MI CASA YA ${vivienda} - ${nombreMayusculas}`

    default:
      return `DOCUMENTO ${tipoFuente.toUpperCase()} ${vivienda} - ${nombreMayusculas}`
  }
}

// ============================================
// PROPS
// ============================================

interface FuentePagoCardProps {
  tipo: TipoFuentePago
  config: FuentePagoConfig | null
  enabled?: boolean
  valorTotal: number
  errores?: FuentePagoErrores
  clienteId: string
  clienteNombre: string
  manzana?: string
  numeroVivienda?: string
  onEnabledChange?: (enabled: boolean) => void
  onChange: (config: FuentePagoConfig | null) => void
  // ⭐ NUEVO: Sistema de documentos pendientes
  tieneCartaAhora?: boolean
  onTieneCartaAhoraChange?: (tiene: boolean) => void
}

// ============================================
// COMPONENTE
// ============================================

export function FuentePagoCard(props: FuentePagoCardProps) {
  const {
    tipo, config, valorTotal, errores, clienteId, clienteNombre, manzana, numeroVivienda, onChange,
    tieneCartaAhora = false,
    onTieneCartaAhoraChange
  } = props

  console.log(`🎨 [FuentePagoCard ${tipo}] Render:`, {
    enabled: props.enabled,
    config,
    clienteId,
    manzana,
    numeroVivienda,
  })

  // ✅ Hook con lógica simplificada (sin upload)
  const hook = useFuentePagoCard({
    tipo,
    config,
    obligatorio: TIPO_CONFIG[tipo].obligatorio,
    enabledProp: props.enabled,
    onEnabledChange: props.onEnabledChange,
    onChange,
  })

  console.log(`🎨 [FuentePagoCard ${tipo}] Hook enabled:`, hook.enabled)

  const tipoConfig = TIPO_CONFIG[tipo]
  const Icon = tipoConfig.icon

  const porcentaje = config?.monto_aprobado && valorTotal > 0
    ? ((config.monto_aprobado / valorTotal) * 100).toFixed(1)
    : '0.0'

  console.log(`🔴 [FuentePagoCard ${tipo}] ANTES DE RETURN:`, {
    'hook.enabled': hook.enabled,
    'tipoConfig.requiereCarta': tipoConfig.requiereCarta,
    clienteId,
    manzana,
    numeroVivienda,
    config,
  })

  return (
    <div className={hook.enabled ? s.container.enabled(tipoConfig.bgColor, tipoConfig.borderColor) : s.container.disabled}>
      {/* Header */}
      <div className={s.header.container}>
        <div className="flex items-center gap-3">
          <div className={hook.enabled ? s.header.iconWrapper.enabled(tipoConfig.bgColor) : s.header.iconWrapper.disabled}>
            <Icon className={hook.enabled ? s.header.icon.enabled(tipoConfig.color) : s.header.icon.disabled} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={s.header.title}>{tipo}</h4>
              {tipoConfig.obligatorio && (
                <span className={s.header.badgeObligatorio}>Obligatoria</span>
              )}
            </div>
            <p className={s.header.description}>{tipoConfig.descripcion}</p>
          </div>
        </div>

        {!tipoConfig.obligatorio && (
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={hook.enabled}
              onChange={(e) => hook.handleEnabledChange(e.target.checked)}
            />
            <div className={s.toggle.track} />
          </label>
        )}
      </div>

      {/* Body */}
      {hook.enabled && (
        <div className={s.body.container}>
          {/* Monto */}
          <div>
            <label className={s.input.label}>
              <DollarSign className="h-4 w-4" />
              Monto Aprobado <span className={s.input.labelRequired}>*</span>
            </label>
            <input
              type="text"
              value={config?.monto_aprobado?.toLocaleString('es-CO') || ''}
              onChange={(e) => hook.handleMontoChange(e.target.value)}
              className={s.input.field}
              placeholder="Ej: 50.000.000"
            />
            {errores?.monto_aprobado && (
              <p className={s.input.error}>
                <AlertCircle className="h-3 w-3" />
                {errores.monto_aprobado}
              </p>
            )}
            <p className={s.info.text}>
              Representa el {porcentaje}% del valor total
            </p>
          </div>

          {/* Entidad (Banco o Caja) - Solo para Crédito Hipotecario y Subsidio Caja */}
          {tipoConfig.requiereEntidad && (
            <div>
              <label className={s.input.label}>
                <Building2 className="h-4 w-4" />
                {tipo === 'Crédito Hipotecario' ? 'Banco' : 'Caja de Compensación'} <span className={s.input.labelRequired}>*</span>
              </label>
              <select
                value={config?.entidad || ''}
                onChange={(e) => hook.handleEntidadChange(e.target.value)}
                className={s.select.field}
              >
                <option value="">Seleccionar...</option>
                {(tipo === 'Crédito Hipotecario' ? BANCOS : CAJAS).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errores?.entidad && (
                <p className={s.input.error}>
                  <AlertCircle className="h-3 w-3" />
                  {errores.entidad}
                </p>
              )}
            </div>
          )}

          {/* Sistema de Documentos Pendientes */}
          {tipoConfig.requiereCarta && (
            <div className="md:col-span-2 space-y-3">
              {/* Checkbox: ¿Tienes la carta ahora? */}
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/30 cursor-pointer hover:bg-cyan-100/50 dark:hover:bg-cyan-950/50 transition-all">
                <input
                  type="checkbox"
                  checked={tieneCartaAhora}
                  onChange={(e) => onTieneCartaAhoraChange?.(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                    ¿Tienes la carta de aprobación ahora?
                  </p>
                  <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-0.5">
                    Si no la tienes, se creará un recordatorio para subirla después
                  </p>
                </div>
              </label>

              {/* Upload solo si tiene la carta ahora */}
              {tieneCartaAhora && (
                <div>
                  <label className={s.input.label}>
                    Carta de Aprobación
                    {tipoConfig.obligatorio && <span className={s.input.labelRequired}> * (Obligatorio)</span>}
                  </label>

                  <DocumentoUploadCompact
                entidadId={clienteId}
                tipoEntidad="cliente"
                categoriaId={CATEGORIA_CARTAS_APROBACION_ID}
                titulo={generarTituloDocumento(tipo, manzana, numeroVivienda, clienteNombre)}
                descripcion={`Carta de aprobación de ${tipo}${config?.entidad ? ` - ${config.entidad}` : ''}`}
                metadata={{
                  tipo_fuente: tipo,
                  entidad: config?.entidad,
                  vivienda: `${manzana}${numeroVivienda}`,
                  subido_desde: 'asignacion_vivienda',
                }}
                validaciones={[
                  {
                    campo: 'vivienda',
                    valor: manzana && numeroVivienda,
                    mensaje: 'Selecciona una vivienda primero',
                  },
                  // Solo validar entidad si el tipo la requiere
                  ...(tipoConfig.requiereEntidad ? [{
                    campo: 'entidad',
                    valor: config?.entidad,
                    mensaje: `Selecciona el ${tipo === 'Crédito Hipotecario' ? 'banco' : 'caja de compensación'} primero`,
                  }] : []),
                ]}
                existingUrl={config?.carta_aprobacion_url}
                onUploadSuccess={(url) => {
                  if (config) {
                    onChange({
                      ...config,
                      carta_aprobacion_url: url,
                    })
                  }
                }}
                onUploadError={(error) => {
                  console.error('Error subiendo documento:', error)
                }}
                onRemove={hook.handleRemoveDocument}
                maxSizeMB={10}
                allowedTypes={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
              />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
