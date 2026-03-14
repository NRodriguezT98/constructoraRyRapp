'use client'

import { Loader2 } from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type { FuentePagoConfiguracion } from '@/modules/clientes/components/asignar-vivienda/types'
import type { ViviendaDetalle } from '@/modules/clientes/components/asignar-vivienda/types'
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'

import { styles as s } from '../../styles'

interface SeccionRevisionProps {
  clienteNombre: string
  proyectoNombre: string
  viviendaSeleccionada: ViviendaDetalle | null
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuentoAplicado: number
  valorTotal: number
  aplicarDescuento: boolean
  tipoDescuento: string
  notas: string
  fuentes: FuentePagoConfiguracion[]
  errorApi: string | null
  creando: boolean
  onGuardar: () => void
  onEditarSeccion1: () => void
  onEditarSeccion2: () => void
}

export function SeccionRevision({
  clienteNombre,
  proyectoNombre,
  viviendaSeleccionada,
  valorBase,
  gastosNotariales,
  recargoEsquinera,
  descuentoAplicado,
  valorTotal,
  aplicarDescuento,
  notas,
  fuentes,
  errorApi,
  creando,
  onGuardar,
  onEditarSeccion1,
  onEditarSeccion2,
}: SeccionRevisionProps) {
  const { data: tiposConCampos = [] } = useTiposFuentesConCampos()

  const fuentesActivas = fuentes.filter(f => f.enabled && f.config !== null)
  const valorBaseTotal = valorBase + gastosNotariales + recargoEsquinera
  const pctDescuento =
    valorBaseTotal > 0
      ? ((descuentoAplicado / valorBaseTotal) * 100).toFixed(1)
      : '0'

  const viviendaLabel = viviendaSeleccionada
    ? [
        viviendaSeleccionada.manzana_nombre,
        `Casa ${viviendaSeleccionada.numero}`,
      ]
        .filter(Boolean)
        .join(' · ')
    : '—'

  return (
    <div className='space-y-3'>
      {/* Error de API */}
      {errorApi && (
        <div className={s.revision.errorBanner} role='alert'>
          {errorApi}
        </div>
      )}

      {/* Información básica */}
      <div className={s.revision.grid}>
        <div>
          <p className={s.revision.label}>Cliente</p>
          <p className={s.revision.value}>{clienteNombre}</p>
        </div>
        <div>
          <p className={s.revision.label}>Proyecto</p>
          <p className={s.revision.value}>{proyectoNombre || '—'}</p>
        </div>
        <div>
          <p className={s.revision.label}>Vivienda</p>
          <p className={s.revision.value}>{viviendaLabel}</p>
        </div>
        {notas && (
          <div className='col-span-2'>
            <p className={s.revision.label}>Notas</p>
            <p className={`${s.revision.value} text-xs text-zinc-400`}>
              {notas}
            </p>
          </div>
        )}
      </div>

      {/* Botón editar sección 1 */}
      <button
        type='button'
        onClick={onEditarSeccion1}
        className={s.revision.editLink}
      >
        Editar vivienda y valores ↑
      </button>

      <div className={s.revision.sep} />

      {/* Resumen financiero */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <span className={s.revision.label}>Valor base + notariales</span>
          <span className={`${s.revision.value} font-mono text-xs`}>
            {formatCurrency(valorBaseTotal)}
          </span>
        </div>

        {aplicarDescuento && descuentoAplicado > 0 && (
          <div className='flex items-center justify-between'>
            <span className={s.revision.label}>
              Descuento ({pctDescuento}%)
            </span>
            <span className={`${s.revision.descuento} font-mono text-xs`}>
              −{formatCurrency(descuentoAplicado)}
            </span>
          </div>
        )}

        <div className={s.revision.sepDouble} />

        <div className='flex items-center justify-between'>
          <span className={s.revision.totalLabel}>Total a pagar</span>
          <span className={s.revision.totalValue}>
            {formatCurrency(valorTotal)}
          </span>
        </div>
      </div>

      <div className={s.revision.sep} />

      {/* Resumen fuentes */}
      <div className='space-y-2'>
        {fuentesActivas.map(f => {
          const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
          const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
          const monto = f.config ? obtenerMonto(f.config, camposConfig) : 0
          return (
            <div key={f.tipo} className='flex items-center gap-2'>
              <div className={s.revision.fuenteDot} />
              <span className={s.revision.fuenteNombre}>{f.tipo}</span>
              {f.config?.entidad && (
                <span className={s.revision.fuenteEntidad}>
                  {f.config.entidad}
                </span>
              )}
              <span className={s.revision.fuenteMonto}>
                {formatCurrency(monto)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Botón editar sección 2 */}
      <button
        type='button'
        onClick={onEditarSeccion2}
        className={s.revision.editLink}
      >
        Editar fuentes de pago ↑
      </button>

      <div className={s.revision.sep} />

      {/* Acciones */}
      <div>
        <div className={s.revision.actionRow}>
          <button
            type='button'
            onClick={onGuardar}
            disabled={creando}
            className={s.revision.submitBtn}
          >
            {creando ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              '✓ Asignar Vivienda'
            )}
          </button>
        </div>

        {/* PDF — fuera de alcance V1 */}
        <button
          type='button'
          disabled
          className={s.revision.pdfBtn}
          title='Disponible próximamente'
        >
          ↓ Descargar PDF
        </button>
      </div>
    </div>
  )
}
