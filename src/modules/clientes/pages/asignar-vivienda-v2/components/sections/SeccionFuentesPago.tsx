'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
} from '@/modules/clientes/components/asignar-vivienda/types'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'

import { styles as s } from '../../styles'

interface SeccionFuentesPagoProps {
  valorTotal: number
  cargandoTipos: boolean
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

const SIN_ENTIDAD = new Set<TipoFuentePago>(['Cuota Inicial'])

export function SeccionFuentesPago({
  valorTotal,
  cargandoTipos,
  fuentes,
  totalFuentes,
  diferencia,
  sumaCierra,
  erroresFuentes,
  mostrarErroresFuentes,
  handleFuenteEnabledChange,
  handleFuenteConfigChange,
}: SeccionFuentesPagoProps) {
  const { data: tiposConCampos = [] } = useTiposFuentesConCampos()

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
      <div>
        <div className='mb-1 flex items-center justify-between'>
          <span className={s.fuentes.progressLabel}>
            Por cubrir: {formatCurrency(valorTotal)}
          </span>
          <span
            className={
              sumaCierra
                ? 'font-mono text-[11px] text-emerald-400'
                : s.fuentes.progressLabelRight
            }
          >
            {sumaCierra
              ? '✓ Cubierto exactamente'
              : `${formatCurrency(totalFuentes)} cubierto (${pct.toFixed(0)}%)`}
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
          const monto = fuente.config
            ? obtenerMonto(fuente.config, camposConfig)
            : 0
          const esError = mostrarErroresFuentes && erroresFuentes[fuente.tipo]
          const omitirEntidad = SIN_ENTIDAD.has(fuente.tipo as TipoFuentePago)

          return (
            <div key={fuente.tipo}>
              {/* Fila de toggle */}
              <div className={s.fuentes.fuenteRow}>
                {/* Switch */}
                <button
                  type='button'
                  role='switch'
                  aria-checked={fuente.enabled}
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
              </div>

              {/* Contenido expandible */}
              <AnimatePresence>
                {fuente.enabled && (
                  <motion.div
                    key={`content-${fuente.tipo}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <FuenteExpandida
                      fuente={fuente}
                      omitirEntidad={omitirEntidad}
                      esError={!!esError}
                      mensajeError={erroresFuentes[fuente.tipo] ?? ''}
                      onChange={(campo, valor) => {
                        const configActual = fuente.config ?? {
                          tipo: fuente.tipo as TipoFuentePago,
                          campos: {},
                        }
                        handleFuenteConfigChange(
                          fuente.tipo as TipoFuentePago,
                          {
                            ...configActual,
                            [campo]: valor,
                          } as FuentePagoConfig
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
          <span className={s.fuentes.totalesLabel}>Total fuentes</span>
          <span className={s.fuentes.totalesValue}>
            {formatCurrency(totalFuentes)}
          </span>
        </div>
        <div className={s.fuentes.totalesRow}>
          <span className={s.fuentes.totalesLabel}>Diferencia</span>
          <span
            className={`${s.fuentes.totalesValue} ${
              diferencia !== 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {diferencia !== 0 ? formatCurrency(Math.abs(diferencia)) : '—'}
          </span>
        </div>

        <div className={s.fuentes.totalesDivider} />

        {sumaCierra ? (
          <p className={s.fuentes.okMsg}>✓ Puedes continuar</p>
        ) : (
          <p className={s.fuentes.errMsg}>
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
  omitirEntidad: boolean
  esError: boolean
  mensajeError: string
  onChange: (campo: string, valor: unknown) => void
}

function FuenteExpandida({
  fuente,
  omitirEntidad,
  esError,
  mensajeError,
  onChange,
}: FuenteExpandidaProps) {
  const config = fuente.config
  const permiteMultiples = config?.permite_multiples_abonos ?? false

  return (
    <div className={s.fuentes.fuenteContent}>
      {/* Entidad */}
      {!omitirEntidad && (
        <div>
          <label className={s.field.label}>Entidad</label>
          <input
            type='text'
            className={s.field.input}
            placeholder='Nombre del banco, caja de compensación...'
            defaultValue={config?.entidad ?? ''}
            onChange={e => onChange('entidad', e.target.value)}
          />
        </div>
      )}

      {/* Número de referencia */}
      {!omitirEntidad && (
        <div>
          <label className={s.field.label}>Número de referencia</label>
          <input
            type='text'
            className={s.field.input}
            placeholder='N° radicado, acta, resolución...'
            defaultValue={config?.numero_referencia ?? ''}
            onChange={e => onChange('numero_referencia', e.target.value)}
          />
          {esError && mensajeError && (
            <p className={s.field.error}>
              <AlertCircle className='h-3 w-3' />
              {mensajeError}
            </p>
          )}
        </div>
      )}

      {/* Monto */}
      <div>
        <label className={s.field.label}>Monto</label>
        <div className='relative'>
          <span className={s.field.prefix}>$</span>
          <input
            type='number'
            min='0'
            className={`${s.field.inputMono} ${s.field.inputWithPrefix}`}
            placeholder='0'
            defaultValue={config?.monto_aprobado ?? ''}
            onChange={e =>
              onChange('monto_aprobado', parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>

      {/* Permite múltiples abonos */}
      <div className='flex items-center gap-2.5 pt-1'>
        <button
          type='button'
          role='switch'
          aria-checked={permiteMultiples}
          onClick={() =>
            onChange('permite_multiples_abonos', !permiteMultiples)
          }
        >
          <div className={`${s.switch.track(permiteMultiples)} !h-4 !w-8`}>
            <div
              className={`${s.switch.thumb(permiteMultiples)} !h-3 !w-3 ${permiteMultiples ? '!translate-x-4' : ''}`}
            />
          </div>
        </button>
        <span className='text-xs text-zinc-400'>Permite múltiples abonos</span>
      </div>
    </div>
  )
}
