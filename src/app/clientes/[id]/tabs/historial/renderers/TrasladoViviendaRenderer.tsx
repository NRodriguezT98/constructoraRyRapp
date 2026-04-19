/**
 * TrasladoViviendaRenderer
 *
 * Muestra el evento de traslado de vivienda con:
 * - Vivienda origen → Vivienda destino (visual de flecha)
 * - Valor anterior vs nuevo
 * - Abonos trasladados (cantidad + monto)
 * - Motivo y quien autorizó
 * - Descuento (si aplica)
 */

'use client'

import {
  ArrowRight,
  BadgePercent,
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  FolderOpen,
  Home,
  Repeat2,
  UserCheck,
} from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

interface CampoProps {
  icono: React.ReactNode
  label: string
  valor: string | null | undefined
  negrita?: boolean
  colorValor?: string
}

function Campo({ icono, label, valor, negrita, colorValor }: CampoProps) {
  if (!valor) return null
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
          {valor}
        </p>
      </div>
    </div>
  )
}

function ViviendalLabel(props: {
  numero?: string | null
  manzana?: string | null
  proyecto?: string | null
  label: string
  colorClass: string
  bgClass: string
  borderClass: string
}) {
  const linea1 = [
    props.manzana ? `Mza. ${props.manzana}` : null,
    props.numero ? `Casa ${props.numero}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className={`flex-1 rounded-xl border ${props.borderClass} ${props.bgClass} px-3 py-2.5`}
    >
      <p
        className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${props.colorClass}`}
      >
        {props.label}
      </p>
      {linea1 ? (
        <p className='text-sm font-bold text-gray-900 dark:text-white'>
          {linea1}
        </p>
      ) : (
        <p className='text-xs italic text-gray-400 dark:text-gray-500'>
          Sin datos
        </p>
      )}
      {props.proyecto ? (
        <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
          {props.proyecto}
        </p>
      ) : null}
    </div>
  )
}

export function TrasladoViviendaRenderer({ evento }: Props) {
  const meta = (evento.metadata ?? {}) as Record<string, unknown>

  // ── Vivienda Origen ──
  const origenNumero = meta.vivienda_origen_numero as string | undefined
  const origenManzana = meta.vivienda_origen_manzana as string | undefined
  const origenProyecto = meta.vivienda_origen_proyecto as string | undefined

  // ── Vivienda Destino ──
  const destinoNumero = meta.vivienda_destino_numero as string | undefined
  const destinoManzana = meta.vivienda_destino_manzana as string | undefined
  const destinoProyecto = meta.vivienda_destino_proyecto as string | undefined

  // ── Valores económicos ──
  const valorAnterior = meta.valor_anterior as number | undefined
  const valorNuevo = meta.valor_nuevo as number | undefined
  const descuento = meta.descuento_aplicado as number | undefined
  const tipoDescuento = meta.tipo_descuento as string | undefined
  const motivoDescuento = meta.motivo_descuento as string | undefined

  // ── Abonos trasladados ──
  const abonosTrasladados = meta.abonos_trasladados as number | undefined
  const montoAbonosTrasladados = meta.monto_abonos_trasladados as
    | number
    | undefined

  // ── Fuentes de pago del destino ──
  const fuentesPagoDestino = (meta.fuentes_pago_destino ?? []) as Array<{
    tipo: string
    monto_aprobado: number
    entidad?: string | null
    numero_referencia?: string | null
  }>

  // ── Motivo y autorización ──
  const motivo = meta.motivo as string | undefined
  const autorizadoPor = meta.autorizado_por as string | undefined

  const hayValores = Boolean(valorAnterior ?? valorNuevo)
  const hayAbonos = abonosTrasladados !== undefined && abonosTrasladados > 0

  return (
    <div className='space-y-3'>
      {/* ─── Cabecera: Origen → Destino ─── */}
      <div className='flex items-stretch gap-2'>
        <ViviendalLabel
          numero={origenNumero}
          manzana={origenManzana}
          proyecto={origenProyecto}
          label='Vivienda origen'
          colorClass='text-red-500 dark:text-red-400'
          bgClass='bg-red-50 dark:bg-red-950/30'
          borderClass='border-red-200 dark:border-red-800/40'
        />
        <div className='flex shrink-0 items-center pt-4'>
          <ArrowRight className='h-5 w-5 text-orange-500 dark:text-orange-400' />
        </div>
        <ViviendalLabel
          numero={destinoNumero}
          manzana={destinoManzana}
          proyecto={destinoProyecto}
          label='Vivienda destino'
          colorClass='text-green-600 dark:text-green-400'
          bgClass='bg-green-50 dark:bg-green-950/30'
          borderClass='border-green-200 dark:border-green-800/40'
        />
      </div>

      {/* ─── Valores económicos ─── */}
      {hayValores ? (
        <div className='overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800'>
          <div className='border-b border-gray-100 bg-gray-50/80 px-3 py-1.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <p className='text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
              Valor de negociación
            </p>
          </div>
          <div className='flex items-stretch'>
            {valorAnterior !== undefined ? (
              <div className='flex-1 bg-red-50 px-3 py-2.5 dark:bg-red-950/30'>
                <p className='mb-0.5 text-[10px] font-semibold uppercase text-red-500 dark:text-red-400'>
                  Antes
                </p>
                <p className='text-sm font-bold text-red-800 line-through decoration-red-400 dark:text-red-200'>
                  {formatearMoneda(valorAnterior)}
                </p>
              </div>
            ) : null}
            {valorAnterior !== undefined && valorNuevo !== undefined ? (
              <div className='flex shrink-0 items-center px-2'>
                <ArrowRight className='h-4 w-4 text-gray-400' />
              </div>
            ) : null}
            {valorNuevo !== undefined ? (
              <div className='flex-1 bg-green-50 px-3 py-2.5 dark:bg-green-950/30'>
                <p className='mb-0.5 text-[10px] font-semibold uppercase text-green-600 dark:text-green-400'>
                  Nuevo
                </p>
                <p className='text-sm font-bold text-green-800 dark:text-green-200'>
                  {formatearMoneda(valorNuevo)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ─── Descuento ─── */}
      {descuento !== undefined && descuento > 0 ? (
        <div className='flex items-start gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2.5 dark:border-yellow-800/40 dark:bg-yellow-950/30'>
          <BadgePercent className='mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400' />
          <div className='min-w-0 flex-1 space-y-0.5'>
            <p className='text-[11px] font-bold uppercase tracking-wide text-yellow-700 dark:text-yellow-400'>
              Descuento aplicado
            </p>
            <p className='text-sm font-bold text-yellow-800 dark:text-yellow-200'>
              {formatearMoneda(descuento)}
              {tipoDescuento ? (
                <span className='ml-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400'>
                  · {tipoDescuento}
                </span>
              ) : null}
            </p>
            {motivoDescuento ? (
              <p className='text-xs text-yellow-700 dark:text-yellow-300'>
                {motivoDescuento}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ─── Abonos trasladados ─── */}
      {hayAbonos ? (
        <div className='flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 dark:border-blue-800/40 dark:bg-blue-950/30'>
          <Repeat2 className='mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
          <div className='min-w-0 flex-1 space-y-0.5'>
            <p className='text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400'>
              Abonos trasladados
            </p>
            <p className='text-sm font-medium text-blue-800 dark:text-blue-200'>
              {abonosTrasladados} abono{abonosTrasladados !== 1 ? 's' : ''}
              {montoAbonosTrasladados !== undefined &&
              montoAbonosTrasladados > 0 ? (
                <span className='ml-1.5 font-bold'>
                  por {formatearMoneda(montoAbonosTrasladados)}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      ) : null}

      {/* ─── Fuentes de pago configuradas en destino ─── */}
      {fuentesPagoDestino.length > 0 ? (
        <div className='overflow-hidden rounded-xl border border-purple-200 dark:border-purple-800/40'>
          <div className='flex items-center gap-2 border-b border-purple-200 bg-purple-50 px-3 py-2 dark:border-purple-800/40 dark:bg-purple-950/30'>
            <CreditCard className='h-3.5 w-3.5 text-purple-600 dark:text-purple-400' />
            <p className='text-[11px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-400'>
              Fuentes de pago · vivienda destino
            </p>
          </div>
          <ul className='divide-y divide-purple-100 dark:divide-purple-900/40'>
            {fuentesPagoDestino.map((f, i) => (
              <li
                key={i}
                className='flex items-center justify-between px-3 py-2'
              >
                <div className='min-w-0'>
                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                    {f.tipo}
                  </p>
                  {f.entidad ? (
                    <p className='truncate text-xs text-gray-500 dark:text-gray-400'>
                      {f.entidad}
                      {f.numero_referencia
                        ? ` · Ref. ${f.numero_referencia}`
                        : ''}
                    </p>
                  ) : null}
                </div>
                <p className='ml-3 shrink-0 text-sm font-bold text-purple-700 dark:text-purple-300'>
                  {formatearMoneda(f.monto_aprobado)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* ─── Detalles adicionales ─── */}
      <div className='divide-y divide-gray-100 dark:divide-gray-800'>
        <Campo
          icono={<FileText className='h-4 w-4' />}
          label='Motivo del traslado'
          valor={motivo ?? null}
        />
        <Campo
          icono={<UserCheck className='h-4 w-4' />}
          label='Autorizado por'
          valor={autorizadoPor ?? null}
        />
        {!origenProyecto && !destinoProyecto ? (
          <Campo
            icono={<FolderOpen className='h-4 w-4' />}
            label='Proyecto'
            valor={null}
          />
        ) : null}
        <Campo
          icono={<Home className='h-4 w-4' />}
          label='Vivienda origen'
          valor={
            [
              origenManzana ? `Mza. ${origenManzana}` : null,
              origenNumero ? `Casa ${origenNumero}` : null,
              origenProyecto ?? null,
            ]
              .filter(Boolean)
              .join(' · ') || null
          }
        />
        <Campo
          icono={<Building2 className='h-4 w-4' />}
          label='Vivienda destino'
          valor={
            [
              destinoManzana ? `Mza. ${destinoManzana}` : null,
              destinoNumero ? `Casa ${destinoNumero}` : null,
              destinoProyecto ?? null,
            ]
              .filter(Boolean)
              .join(' · ') || null
          }
        />
        {valorNuevo !== undefined ? (
          <Campo
            icono={<DollarSign className='h-4 w-4' />}
            label='Nuevo valor de negociación'
            valor={formatearMoneda(valorNuevo)}
            negrita
            colorValor='text-green-700 dark:text-green-400'
          />
        ) : null}
      </div>
    </div>
  )
}
