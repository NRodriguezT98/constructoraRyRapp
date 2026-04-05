'use client'

import { useCallback, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Banknote,
  Building2,
  Check,
  CircleDollarSign,
  Home,
  Wallet,
} from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
} from '@/modules/clientes/components/asignar-vivienda/types'
import { CampoFormularioDinamico } from '@/modules/clientes/components/fuente-pago-card/CampoFormularioDinamico'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { obtenerMontoParaCierre } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import type {
  CampoConfig,
  TipoFuentePagoConCampos,
  ValorCampo,
  ValoresCampos,
} from '@/modules/configuracion/types/campos-dinamicos.types'
import { CreditoConstructoraForm } from '@/modules/fuentes-pago/components/CreditoConstructoraForm'
import type { ParametrosCredito } from '@/modules/fuentes-pago/types'

import { styles as s } from '../../styles'

interface SeccionFuentesPagoProps {
  valorTotal: number
  cargandoTipos: boolean
  tiposConCampos: TipoFuentePagoConCampos[]
  fuentes: FuentePagoConfiguracion[]
  totalFuentes: number
  diferencia: number
  sumaCierra: boolean
  erroresFuentes: Record<string, string>
  mostrarErroresFuentes: boolean
  handleFuenteEnabledChange: (tipo: TipoFuentePago, enabled: boolean) => void
  handleFuenteConfigChange: (
    tipo: TipoFuentePago,
    config: FuentePagoConfig | null
  ) => void
}

function iconForFuente(nombre: string) {
  const n = nombre.toLowerCase()
  if (n.includes('hipotecario') || n.includes('banco')) return Building2
  if (n.includes('subsidio') || n.includes('vivienda') || n.includes('casa'))
    return Home
  if (n.includes('cuota') || n.includes('inicial')) return Wallet
  if (n.includes('leasing')) return CircleDollarSign
  return Banknote
}

export function SeccionFuentesPago({
  valorTotal,
  cargandoTipos,
  tiposConCampos,
  fuentes,
  totalFuentes,
  diferencia,
  sumaCierra,
  erroresFuentes,
  mostrarErroresFuentes,
  handleFuenteEnabledChange,
  handleFuenteConfigChange,
}: SeccionFuentesPagoProps) {
  const pct =
    valorTotal > 0 ? Math.min(100, (totalFuentes / valorTotal) * 100) : 0

  if (cargandoTipos) {
    return (
      <div className={s.loadingRow}>
        <div className={s.spinner} />
        <span>Cargando fuentes de pago activas...</span>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {/* Barra de progreso de cobertura */}
      <div className={s.fuentes.progressWrapper}>
        <div className='mb-1 flex items-center justify-between'>
          <span className={s.fuentes.progressLabel}>
            Por cubrir: {formatCurrency(valorTotal)}
          </span>
          <span
            className={
              sumaCierra
                ? 'font-mono text-[11px] font-semibold text-emerald-500'
                : s.fuentes.progressLabelRight
            }
          >
            {sumaCierra
              ? '✓ Cubierto exactamente'
              : `${formatCurrency(totalFuentes)} (${pct.toFixed(0)}%)`}
          </span>
        </div>
        <div className={s.fuentes.progressTrack}>
          <motion.div
            className={
              sumaCierra ? s.fuentes.progressFull : s.fuentes.progressPartial
            }
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Lista de fuentes */}
      <div>
        {fuentes.map(fuente => {
          const tipoConCampos = tiposConCampos.find(
            t => t.nombre === fuente.tipo
          )
          const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
          const generaCuotas =
            tipoConCampos?.logica_negocio?.genera_cuotas ?? false
          // Para crédito constructora: muestra capital (sin intereses) para que
          // el badge sea coherente con la barra de progreso
          const monto = fuente.config
            ? obtenerMontoParaCierre(fuente.config, tipoConCampos, camposConfig)
            : 0
          const esError = mostrarErroresFuentes && erroresFuentes[fuente.tipo]

          return (
            <div key={fuente.tipo}>
              {/* Fila de toggle */}
              <div className={s.fuentes.fuenteRow}>
                {/* Icono */}
                <div className={s.fuentes.fuenteIconWrapper(fuente.enabled)}>
                  {(() => {
                    const Icon = iconForFuente(fuente.tipo)
                    return (
                      <Icon className={s.fuentes.fuenteIcon(fuente.enabled)} />
                    )
                  })()}
                </div>

                {/* Switch + nombre */}
                <span
                  className={
                    fuente.enabled
                      ? s.fuentes.fuenteNombreOn
                      : s.fuentes.fuenteNombreOff
                  }
                >
                  {fuente.tipo}
                </span>

                {fuente.enabled && monto > 0 && (
                  <span className={s.fuentes.fuenteMontoOn}>
                    {formatCurrency(monto)}
                  </span>
                )}

                <button
                  type='button'
                  role='switch'
                  aria-checked={fuente.enabled}
                  className='ml-auto shrink-0'
                  onClick={() =>
                    handleFuenteEnabledChange(
                      fuente.tipo as TipoFuentePago,
                      !fuente.enabled
                    )
                  }
                >
                  <div className={s.switch.track(fuente.enabled)}>
                    <div className={s.switch.thumb(fuente.enabled)} />
                  </div>
                </button>
              </div>

              {/* Contenido expandible */}
              <AnimatePresence>
                {fuente.enabled && (
                  <motion.div
                    key={`content-${fuente.tipo}`}
                    initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                    animate={{
                      height: 'auto',
                      opacity: 1,
                      transitionEnd: { overflow: 'visible' },
                    }}
                    exit={{ overflow: 'hidden', height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <FuenteExpandida
                      fuente={fuente}
                      camposConfig={camposConfig}
                      permiteMultiples={
                        tipoConCampos?.permite_multiples_abonos ?? false
                      }
                      generaCuotas={generaCuotas}
                      esError={!!esError}
                      mensajeError={erroresFuentes[fuente.tipo] ?? ''}
                      onChange={config => {
                        handleFuenteConfigChange(
                          fuente.tipo as TipoFuentePago,
                          config
                        )
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Panel totales */}
      <div className={s.fuentes.totalesBox}>
        <div className={s.fuentes.totalesRow}>
          <span className={s.fuentes.totalesLabel}>
            <Banknote className={s.fuentes.totalesLabelIcon} />
            Total fuentes
          </span>
          <span className={s.fuentes.totalesValue}>
            {formatCurrency(totalFuentes)}
          </span>
        </div>
        <div className={s.fuentes.totalesRow}>
          <span className={s.fuentes.totalesLabel}>
            <AlertCircle className={s.fuentes.totalesLabelIcon} />
            Diferencia
          </span>
          <span
            className={`${s.fuentes.totalesValue} ${
              diferencia !== 0 ? 'text-rose-500' : 'text-emerald-500'
            }`}
          >
            {diferencia !== 0 ? formatCurrency(Math.abs(diferencia)) : '—'}
          </span>
        </div>

        <div className={s.fuentes.totalesDivider} />

        {sumaCierra ? (
          <p className={s.fuentes.okMsg}>
            <Check className={s.fuentes.okIcon} />
            Puedes continuar
          </p>
        ) : (
          <p className={s.fuentes.errMsg}>
            <AlertCircle className={s.fuentes.errIcon} />
            {diferencia > 0
              ? `Falta cubrir ${formatCurrency(diferencia)}`
              : `Exceso de ${formatCurrency(Math.abs(diferencia))}`}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Subcomponente: Fuente Expandida ──────────────────────

interface FuenteExpandidaProps {
  fuente: FuentePagoConfiguracion
  camposConfig: CampoConfig[]
  permiteMultiples: boolean
  generaCuotas: boolean
  esError: boolean
  mensajeError: string
  onChange: (config: FuentePagoConfig) => void
}

function FuenteExpandida({
  fuente,
  camposConfig,
  permiteMultiples,
  generaCuotas,
  esError,
  mensajeError,
  onChange,
}: FuenteExpandidaProps) {
  const sorted = [...camposConfig].sort((a, b) => a.orden - b.orden)

  // Acumula los tres updates que emite CreditoConstructoraForm antes de llamar onChange
  const creditoRef = useRef<{
    monto_aprobado?: number
    capital_para_cierre?: number
    parametrosCredito?: ParametrosCredito
  }>({
    monto_aprobado: fuente.config?.monto_aprobado,
    capital_para_cierre: fuente.config?.capital_para_cierre,
    parametrosCredito: fuente.config?.parametrosCredito,
  })

  const handleCreditoActualizar = useCallback(
    (
      campo: 'monto_aprobado' | 'capital_para_cierre' | 'parametrosCredito',
      valor: unknown
    ) => {
      creditoRef.current = { ...creditoRef.current, [campo]: valor }
      const acc = creditoRef.current
      if (acc.monto_aprobado != null && acc.monto_aprobado > 0) {
        onChange({
          tipo: fuente.tipo as TipoFuentePago,
          monto_aprobado: acc.monto_aprobado,
          capital_para_cierre: acc.capital_para_cierre,
          parametrosCredito: acc.parametrosCredito,
          permite_multiples_abonos: permiteMultiples,
          campos: {},
        })
      }
    },
    [onChange, fuente.tipo, permiteMultiples]
  )

  const [valores, setValores] = useState<ValoresCampos>(() => {
    const initial: ValoresCampos = {}
    sorted.forEach(campo => {
      if (fuente.config?.campos?.[campo.nombre] !== undefined) {
        initial[campo.nombre] = fuente.config.campos[campo.nombre]
      } else if (campo.nombre === 'monto_aprobado') {
        initial[campo.nombre] = fuente.config?.monto_aprobado ?? 0
      } else if (campo.nombre === 'entidad') {
        initial[campo.nombre] = fuente.config?.entidad ?? ''
      } else if (campo.nombre === 'numero_referencia') {
        initial[campo.nombre] = fuente.config?.numero_referencia ?? ''
      } else if (campo.tipo === 'number' || campo.tipo === 'currency') {
        initial[campo.nombre] = 0
      } else if (campo.tipo === 'checkbox') {
        initial[campo.nombre] = false
      } else {
        initial[campo.nombre] = ''
      }
    })
    return initial
  })

  const buildConfig = (newValores: ValoresCampos): FuentePagoConfig => {
    const montoCampo = sorted.find(c => c.rol === 'monto')
    const entidadCampo = sorted.find(c => c.rol === 'entidad')
    const refCampo = sorted.find(c => c.rol === 'referencia')
    return {
      tipo: fuente.tipo as TipoFuentePago,
      monto_aprobado: montoCampo
        ? ((newValores[montoCampo.nombre] as number) ?? 0)
        : 0,
      entidad: entidadCampo
        ? ((newValores[entidadCampo.nombre] as string) ?? '')
        : '',
      numero_referencia: refCampo
        ? ((newValores[refCampo.nombre] as string) ?? '')
        : '',
      permite_multiples_abonos: permiteMultiples,
      campos: { ...newValores },
    }
  }

  const handleCampoChange = (nombre: string, valor: ValorCampo) => {
    const newValores = { ...valores, [nombre]: valor }
    setValores(newValores)
    onChange(buildConfig(newValores))
  }

  // Crédito con la constructora: muestra el formulario de amortización
  if (generaCuotas) {
    return (
      <div className={s.fuentes.fuenteContent}>
        <CreditoConstructoraForm
          parametrosIniciales={fuente.config?.parametrosCredito}
          onActualizar={handleCreditoActualizar}
        />
      </div>
    )
  }

  return (
    <div className={s.fuentes.fuenteContent}>
      {sorted.map(campo => (
        <CampoFormularioDinamico
          key={campo.nombre}
          config={campo}
          value={valores[campo.nombre] ?? null}
          onChange={valor => handleCampoChange(campo.nombre, valor)}
          error={
            esError && campo.rol === 'referencia' ? mensajeError : undefined
          }
        />
      ))}
    </div>
  )
}
