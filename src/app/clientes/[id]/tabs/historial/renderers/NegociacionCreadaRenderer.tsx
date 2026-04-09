/**
 * NegociacionCreadaRenderer
 * Muestra los datos económicos y condiciones con que arrancó la negociación
 */

'use client'

import {
  BadgePercent,
  Building2,
  CalendarDays,
  CreditCard,
  DollarSign,
  FileText,
  FolderOpen,
  Handshake,
  Home,
  Layers,
  Maximize2,
  Ruler,
  Tag,
} from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda, formatearValor } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

interface CampoProps {
  icono: React.ReactNode
  label: string
  valor: unknown
  formato?: 'moneda' | 'normal'
  negrita?: boolean
  colorValor?: string
}

function Campo({
  icono,
  label,
  valor,
  formato = 'normal',
  negrita = false,
  colorValor,
}: CampoProps) {
  const texto =
    formato === 'moneda' ? formatearMoneda(valor) : formatearValor(valor)
  if (texto === '—') return null
  return (
    <div className='flex items-start gap-2.5 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800'>
      <div className='mt-0.5 shrink-0 text-gray-400 dark:text-gray-500'>
        {icono}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm ${negrita ? 'font-bold' : 'font-medium'} ${colorValor ?? 'text-gray-900 dark:text-white'}`}
        >
          {texto}
        </p>
      </div>
    </div>
  )
}

export function NegociacionCreadaRenderer({ evento }: Props) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = (evento.metadata ?? {}) as Record<string, unknown>

  // Fuentes de pago desde snapshot en metadata
  const fuentesPago = Array.isArray(meta.fuentes_pago)
    ? (meta.fuentes_pago as Array<{
        tipo: string
        monto_aprobado: number
        entidad?: string | null
        numero_referencia?: string | null
      }>)
    : []

  // Jerarquía de vivienda desde metadata (enriquecida a partir de PASO 6 del service)
  const proyectoNombre = meta.proyecto_nombre as string | undefined
  const manzanaNombre = meta.manzana_nombre as string | undefined
  const viviendaNumero = meta.vivienda_numero as string | undefined
  const viviendaAreaConstruida = meta.vivienda_area_construida as
    | number
    | undefined
  const viviendaAreaLote = meta.vivienda_area_lote as number | undefined
  const viviendaEsquinera = meta.vivienda_es_esquinera as boolean | undefined
  const recargoEsquinera = meta.vivienda_recargo_esquinera as number | undefined
  const viviendaTipoVivienda = meta.vivienda_tipo_vivienda as string | undefined
  const tieneJerarquia = Boolean(
    proyectoNombre ?? manzanaNombre ?? viviendaNumero
  )

  // Valores económicos
  const gastosNotariales = meta.vivienda_gastos_notariales as number | undefined
  const valorBase = meta.vivienda_valor_base as number | undefined
  const descuentoAplicado = Number(
    meta.negociacion_descuento_aplicado ?? get('descuento_aplicado') ?? 0
  )
  // valor_total usa el campo calculado por trigger en BD. Para registros
  // anteriores donde se almacenó solo (base - descuento), recalcula desde partes.
  const storedTotal = Number(
    meta.negociacion_valor_total ?? get('valor_total') ?? 0
  )
  const recalculatedTotal =
    (valorBase ?? 0) +
    (gastosNotariales ?? 0) +
    (viviendaEsquinera && recargoEsquinera ? recargoEsquinera : 0) -
    descuentoAplicado
  const valorTotal = recalculatedTotal > 0 ? recalculatedTotal : storedTotal

  // Etiquetas condicionales
  const esquineraLabel =
    viviendaEsquinera === true
      ? recargoEsquinera && recargoEsquinera > 0
        ? `Sí · ${formatearMoneda(recargoEsquinera)}`
        : 'Sí'
      : 'No'
  const descuentoLabel =
    descuentoAplicado > 0 ? `Sí · ${formatearMoneda(descuentoAplicado)}` : 'No'

  // Fallback para registros anteriores a PASO 6 (metadata vieja)
  const _viviendaLegacy = String(
    meta.vivienda_nombre ?? meta.vivienda_numero ?? get('vivienda_id') ?? ''
  )

  return (
    <div className='space-y-3'>
      {/* Jerarquía: Proyecto → Manzana → Vivienda → Áreas */}
      {tieneJerarquia ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Vivienda asignada
          </p>
          <div className='overflow-hidden rounded-xl border border-green-100 bg-green-50 dark:border-green-900/40 dark:bg-green-950/30'>
            {proyectoNombre ? (
              <div className='flex items-center gap-2.5 border-b border-green-100 px-3 py-2 dark:border-green-900/40'>
                <FolderOpen className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-green-600/70 dark:text-green-400/70'>
                    Proyecto
                  </p>
                  <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    {proyectoNombre}
                  </p>
                </div>
              </div>
            ) : null}
            {manzanaNombre ? (
              <div className='flex items-center gap-2.5 border-b border-green-100 px-3 py-2 dark:border-green-900/40'>
                <Layers className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-green-600/70 dark:text-green-400/70'>
                    Manzana
                  </p>
                  <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    {manzanaNombre}
                  </p>
                </div>
              </div>
            ) : null}
            {viviendaNumero ? (
              <div className='flex items-center gap-2.5 border-b border-green-100 px-3 py-2 dark:border-green-900/40'>
                <Home className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-green-600/70 dark:text-green-400/70'>
                    Casa
                  </p>
                  <p className='text-sm font-bold text-green-900 dark:text-green-100'>
                    #{viviendaNumero}
                    {viviendaEsquinera ? (
                      <span className='ml-2 text-xs font-normal text-amber-600 dark:text-amber-400'>
                        · Esquinera
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            ) : null}
            {viviendaTipoVivienda ? (
              <div className='flex items-center gap-2.5 border-b border-green-100 px-3 py-2 dark:border-green-900/40'>
                <Tag className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-green-600/70 dark:text-green-400/70'>
                    Tipo de vivienda
                  </p>
                  <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    {viviendaTipoVivienda}
                  </p>
                </div>
              </div>
            ) : null}
            {viviendaAreaConstruida ? (
              <div className='flex items-center gap-2.5 border-b border-green-100 px-3 py-2 dark:border-green-900/40'>
                <Ruler className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-green-600/70 dark:text-green-400/70'>
                    Área construida
                  </p>
                  <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    {viviendaAreaConstruida} m²
                  </p>
                </div>
              </div>
            ) : null}
            {viviendaAreaLote ? (
              <div className='flex items-center gap-2.5 px-3 py-2'>
                <Maximize2 className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-green-600/70 dark:text-green-400/70'>
                    Área del lote
                  </p>
                  <p className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    {viviendaAreaLote} m²
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        // Fallback para registros sin metadata enriquecida
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Vivienda asignada
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-green-100 bg-green-50 px-3 py-2.5 dark:border-green-900/40 dark:bg-green-950/30'>
            <Building2 className='mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
            <p className='text-sm font-bold text-green-900 dark:text-green-100'>
              {String(
                meta.vivienda_nombre ??
                  meta.vivienda_numero ??
                  get('vivienda_id') ??
                  '—'
              )}
            </p>
          </div>
        </section>
      )}

      {/* Condiciones económicas */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
          Condiciones económicas
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          {valorBase ? (
            <Campo
              icono={<Home className='h-4 w-4' />}
              label='Valor base vivienda'
              valor={valorBase}
              formato='moneda'
            />
          ) : null}
          {gastosNotariales ? (
            <Campo
              icono={<FileText className='h-4 w-4' />}
              label='Gastos notariales'
              valor={gastosNotariales}
              formato='moneda'
            />
          ) : null}
          {viviendaEsquinera !== undefined ? (
            <Campo
              icono={<Tag className='h-4 w-4' />}
              label='Recargo esquinera'
              valor={esquineraLabel}
              colorValor={
                viviendaEsquinera
                  ? 'text-amber-600 dark:text-amber-400'
                  : undefined
              }
            />
          ) : null}
          <Campo
            icono={<BadgePercent className='h-4 w-4' />}
            label='Descuento aplicado'
            valor={descuentoLabel}
            colorValor={
              descuentoAplicado > 0
                ? 'text-orange-600 dark:text-orange-400'
                : undefined
            }
          />
          <Campo
            icono={<DollarSign className='h-4 w-4' />}
            label='Valor total a pagar'
            valor={valorTotal}
            formato='moneda'
            negrita
            colorValor='text-green-700 dark:text-green-300'
          />
        </div>
      </section>

      {/* Fuentes de pago configuradas */}
      {fuentesPago.length > 0 ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Fuentes de pago configuradas ({fuentesPago.length})
          </p>
          <div className='space-y-1.5'>
            {fuentesPago.map((fuente, idx) => (
              <div
                key={idx}
                className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'
              >
                <CreditCard className='mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500' />
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                    {fuente.tipo}
                  </p>
                  <p className='text-xs font-medium text-green-700 dark:text-green-400'>
                    {formatearMoneda(fuente.monto_aprobado)}
                  </p>
                  {fuente.entidad ? (
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {fuente.entidad}
                      {fuente.numero_referencia
                        ? ` · Ref: ${fuente.numero_referencia}`
                        : ''}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Estado y fecha */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
          Estado y fecha
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          <Campo
            icono={<Handshake className='h-4 w-4' />}
            label='Estado inicial'
            valor={get('estado')}
          />
          <Campo
            icono={<CalendarDays className='h-4 w-4' />}
            label='Fecha de negociación'
            valor={meta.negociacion_fecha ?? get('fecha_negociacion')}
          />
        </div>
      </section>

      {/* Notas */}
      {(meta.negociacion_notas ?? get('notas')) ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400'>
            Notas
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <FileText className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {String(meta.negociacion_notas ?? get('notas'))}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
