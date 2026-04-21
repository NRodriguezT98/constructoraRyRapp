/**
 * SeccionRevisionTraslado — Paso 3
 *
 * Muestra comparativa lado a lado (antes → después),
 * lista de acciones automáticas y advertencia de irreversibilidad.
 */

'use client'

import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type {
  FuentePagoConfiguracion,
  ViviendaDetalle,
} from '@/modules/clientes/components/asignar-vivienda/types'
import type { FuenteConAbonos } from '@/modules/clientes/services/traslado-vivienda.service'
import { obtenerMontoParaCierre } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import type { TipoFuentePagoConCampos } from '@/modules/configuracion/types/campos-dinamicos.types'

import { styles as s } from '../../styles'

interface SeccionRevisionTrasladoProps {
  // Origen
  negociacionOrigen: Record<string, unknown> | null
  fuentesConAbonos: FuenteConAbonos[]
  // Destino
  viviendaDestinoSeleccionada: ViviendaDetalle | null
  proyectoDestinoNombre: string
  valorTotalDestino: number
  fuentes: FuentePagoConfiguracion[]
  tiposConCampos: TipoFuentePagoConCampos[]
  // Datos del traslado
  motivo: string
  autorizadoPor: string
  // Error
  errorApi: string | null
  // Navegación editar
  onEditarPaso1: () => void
  onEditarPaso2: () => void
}

export function SeccionRevisionTraslado({
  negociacionOrigen,
  fuentesConAbonos,
  viviendaDestinoSeleccionada,
  proyectoDestinoNombre,
  valorTotalDestino,
  fuentes,
  tiposConCampos,
  motivo,
  autorizadoPor,
  errorApi,
  onEditarPaso1,
  onEditarPaso2,
}: SeccionRevisionTrasladoProps) {
  const neg = negociacionOrigen
  const viviendaOrigen = neg?.viviendas as Record<string, unknown> | undefined
  const manzanaOrigen = viviendaOrigen?.manzanas as
    | Record<string, unknown>
    | undefined
  const proyectoOrigen = manzanaOrigen?.proyectos as
    | Record<string, unknown>
    | undefined

  const fuentesActivasNuevas = fuentes.filter(f => f.enabled)
  const totalAbonosTraslados = fuentesConAbonos
    .filter(f => !f.es_externa && f.monto_recibido > 0)
    .reduce((sum, f) => sum + (f.monto_recibido ?? 0), 0)
  const cantidadAbonosTraslados = fuentesConAbonos
    .filter(f => !f.es_externa && f.monto_recibido > 0)
    .reduce((sum, f) => sum + (f.abonos_count ?? 0), 0)

  return (
    <div className='space-y-4'>
      {/* Comparativa antes / después */}
      <div className='overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700'>
        <div className='border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800'>
          <p className='text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400'>
            Comparativa del Traslado
          </p>
        </div>

        <div className='grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700'>
          {/* ANTES */}
          <div className='bg-red-50/30 p-4 dark:bg-red-950/10'>
            <p className='mb-3 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400'>
              Antes
            </p>
            <div className='space-y-2.5'>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Vivienda
                </p>
                <p className='text-sm font-bold text-gray-900 dark:text-white'>
                  {manzanaOrigen?.nombre as string} · Casa{' '}
                  {viviendaOrigen?.numero as string}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Proyecto
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {proyectoOrigen?.nombre as string}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Valor total
                </p>
                <p className='text-sm font-bold text-red-700 line-through dark:text-red-300'>
                  {formatCurrency((neg?.valor_total_pagar as number) ?? 0)}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Fuentes
                </p>
                <div className='space-y-1'>
                  {fuentesConAbonos.map(f => {
                    const capitalBase = f.parametrosCredito?.capital ?? null
                    const tieneDesglose =
                      capitalBase != null &&
                      capitalBase > 0 &&
                      capitalBase < f.monto_aprobado
                    return (
                      <div key={f.id} className='space-y-0.5'>
                        <p className='text-xs text-gray-700 dark:text-gray-300'>
                          • {f.tipo}:{' '}
                          <span className='font-semibold'>
                            {formatCurrency(f.monto_aprobado)}
                          </span>
                        </p>
                        {tieneDesglose ? (
                          <p className='pl-3 text-[10px] text-gray-400 dark:text-gray-500'>
                            Capital {formatCurrency(capitalBase)} + int.{' '}
                            {formatCurrency(f.monto_aprobado - capitalBase)}
                          </p>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* DESPUÉS */}
          <div className='bg-green-50/30 p-4 dark:bg-green-950/10'>
            <p className='mb-3 text-xs font-bold uppercase tracking-wide text-green-600 dark:text-green-400'>
              Después
            </p>
            <div className='space-y-2.5'>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Vivienda
                </p>
                <p className='text-sm font-bold text-gray-900 dark:text-white'>
                  {viviendaDestinoSeleccionada?.manzana_nombre} · Casa{' '}
                  {viviendaDestinoSeleccionada?.numero}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Proyecto
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {proyectoDestinoNombre}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Valor total
                </p>
                <p className='text-sm font-bold text-green-700 dark:text-green-300'>
                  {formatCurrency(valorTotalDestino)}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Fuentes
                </p>
                <div className='space-y-1'>
                  {fuentesActivasNuevas.map(f => {
                    const tipoConCampos = tiposConCampos.find(
                      t => t.nombre === f.tipo
                    )
                    const camposConfig =
                      tipoConCampos?.configuracion_campos?.campos ?? []
                    const montoTotal = f.config?.monto_aprobado
                      ? f.config.monto_aprobado
                      : f.config
                        ? obtenerMontoParaCierre(
                            f.config,
                            tipoConCampos,
                            camposConfig
                          )
                        : 0
                    const capitalBase = f.config?.capital_para_cierre
                    const tieneDesglose =
                      capitalBase != null &&
                      capitalBase > 0 &&
                      capitalBase < montoTotal
                    return (
                      <div key={f.tipo} className='space-y-0.5'>
                        <p className='text-xs text-gray-700 dark:text-gray-300'>
                          • {f.tipo}:{' '}
                          <span className='font-semibold'>
                            {formatCurrency(montoTotal)}
                          </span>
                        </p>
                        {tieneDesglose && capitalBase != null ? (
                          <p className='pl-3 text-[10px] text-gray-400 dark:text-gray-500'>
                            Capital {formatCurrency(capitalBase)} + int.{' '}
                            {formatCurrency(montoTotal - capitalBase)}
                          </p>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flecha central */}
        <div className='flex items-center justify-center border-t border-gray-200 bg-gray-50 py-2 dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400'>
            <span className='text-red-500'>Negociación actual</span>
            <ArrowRight className='h-4 w-4' />
            <span className='text-green-500'>Nueva negociación</span>
          </div>
        </div>
      </div>

      {/* Datos del traslado */}
      <div className='rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
        <div className='grid grid-cols-2 gap-3 text-xs'>
          <div>
            <p className='text-gray-500 dark:text-gray-400'>Motivo</p>
            <p className='mt-0.5 font-medium text-gray-900 dark:text-white'>
              {motivo}
            </p>
          </div>
          <div>
            <p className='text-gray-500 dark:text-gray-400'>Autorizado por</p>
            <p className='mt-0.5 font-medium text-gray-900 dark:text-white'>
              {autorizadoPor}
            </p>
          </div>
        </div>

        <div className='mt-3 flex items-center gap-2'>
          <button
            type='button'
            onClick={onEditarPaso1}
            className='text-xs text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300'
          >
            Editar motivo
          </button>
          <span className='text-gray-300 dark:text-gray-600'>·</span>
          <button
            type='button'
            onClick={onEditarPaso2}
            className='text-xs text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300'
          >
            Editar vivienda/fuentes
          </button>
        </div>
      </div>

      {/* Acciones automáticas */}
      <div className='rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
        <p className='mb-3 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400'>
          Acciones automáticas al confirmar
        </p>
        <div className='space-y-2'>
          {[
            `Negociación actual → "Cerrada por Traslado"`,
            `Vivienda actual → estado "Disponible"`,
            `Nueva negociación → estado "Activa"`,
            `Vivienda destino → estado "Asignada"`,
            ...(cantidadAbonosTraslados > 0
              ? [
                  `${cantidadAbonosTraslados} abonos (${formatCurrency(totalAbonosTraslados)}) trasladados`,
                ]
              : []),
            `Registro completo en auditoría`,
          ].map((accion, i) => (
            <div key={i} className='flex items-center gap-2 text-xs'>
              <CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-emerald-500' />
              <span className='text-gray-700 dark:text-gray-300'>{accion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Advertencia */}
      <div className={s.alert.warning}>
        <AlertTriangle className={`${s.alert.icon} text-amber-500`} />
        <div className={s.alert.content}>
          <p className={`${s.alert.title} text-amber-800 dark:text-amber-200`}>
            Acción irreversible
          </p>
          <p
            className={`${s.alert.message} text-amber-700 dark:text-amber-300`}
          >
            Una vez confirmado, la negociación actual quedará{' '}
            <strong>&ldquo;Cerrada por Traslado&rdquo;</strong> y no podrá ser
            reactivada. Esta acción queda registrada en la auditoría del
            sistema.
          </p>
        </div>
      </div>

      {/* Error API */}
      {errorApi ? (
        <div className={s.alert.error}>
          <AlertTriangle className={`${s.alert.icon} text-red-500`} />
          <div className={s.alert.content}>
            <p className={`${s.alert.title} text-red-800 dark:text-red-200`}>
              Error al ejecutar el traslado
            </p>
            <p className={`${s.alert.message} text-red-700 dark:text-red-300`}>
              {errorApi}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
