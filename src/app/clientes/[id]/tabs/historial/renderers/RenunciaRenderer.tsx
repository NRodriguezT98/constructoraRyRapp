/**
 * RenunciaRenderer
 * Muestra los datos de la renuncia (motivo, monto devolución, estado,
 * retención, vivienda/proyecto).
 * Lee desde metadata (eventos CREATE) y también desde detalles (cambios).
 */

'use client'

import {
  AlertTriangle,
  Building2,
  DollarSign,
  ExternalLink,
  FileText,
  Home,
  MapPin,
  ShieldAlert,
} from 'lucide-react'

import Link from 'next/link'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

const ESTADO_COLORES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  pendiente: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  aprobada: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
  },
  cerrada: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
  },
  rechazada: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
}

export function RenunciaRenderer({ evento }: Props) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = evento.metadata ?? {}

  // Estado: priorizar detalles (actualizaciones), fallback a metadata
  const estadoRaw = String(
    get('estado') ?? meta.estado_renuncia ?? meta.estado ?? 'pendiente'
  ).toLowerCase()
  const colores = ESTADO_COLORES[estadoRaw] ?? ESTADO_COLORES.pendiente
  const estadoLabel = String(
    get('estado') ?? meta.estado_renuncia ?? meta.estado ?? 'Pendiente'
  )

  // Datos principalmente desde metadata en eventos CREATE
  const motivo =
    String(
      get('motivo') ?? get('motivo_renuncia') ?? meta.motivo ?? ''
    ).trim() || null
  const montoDevolucion =
    get('monto_devolucion') ??
    get('monto_a_devolver') ??
    meta.monto_a_devolver ??
    null
  const requiereDevolucion = meta.requiere_devolucion as boolean | undefined
  const retencionMonto =
    (get('retencion_monto') as number | undefined) ??
    (meta.retencion_monto as number | undefined) ??
    0
  const retencionMotivo =
    String(get('retencion_motivo') ?? meta.retencion_motivo ?? '').trim() ||
    null

  // Enlace al expediente
  const consecutivo = String(meta.consecutivo ?? '').trim() || null

  // Ubicación
  const viviendaNumero =
    String(get('vivienda_numero') ?? meta.vivienda_numero ?? '').trim() || null
  const manzanaNombre =
    String(get('manzana_nombre') ?? meta.manzana_nombre ?? '').trim() || null
  const proyectoNombre =
    String(
      get('proyecto_nombre') ?? meta.proyecto_nombre ?? meta.proyecto ?? ''
    ).trim() || null

  const tieneUbicacion = viviendaNumero ?? manzanaNombre ?? proyectoNombre

  return (
    <div className='space-y-3'>
      {/* Estado de la renuncia */}
      <div
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 ${colores.bg} ${colores.border}`}
      >
        <AlertTriangle className={`h-5 w-5 shrink-0 ${colores.text}`} />
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${colores.text}`}
          >
            Estado de la renuncia
          </p>
          <p className={`text-sm font-bold capitalize ${colores.text}`}>
            {estadoLabel}
          </p>
        </div>
      </div>

      {/* Vivienda / Proyecto */}
      {tieneUbicacion ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400'>
            Vivienda renunciada
          </p>
          <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
            {(manzanaNombre ?? viviendaNumero) ? (
              <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
                <Home className='mt-0.5 h-4 w-4 shrink-0 text-orange-400' />
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Vivienda
                  </p>
                  <p className='mt-0.5 text-sm font-medium text-gray-900 dark:text-white'>
                    {[
                      manzanaNombre ? `Mza. ${manzanaNombre}` : null,
                      viviendaNumero ? `Casa ${viviendaNumero}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
            ) : null}
            {proyectoNombre ? (
              <div className='flex items-start gap-2.5 px-3 py-2'>
                <Building2 className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Proyecto
                  </p>
                  <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                    {proyectoNombre}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Motivo */}
      {motivo ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400'>
            Motivo de renuncia
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <FileText className='mt-0.5 h-4 w-4 shrink-0 text-orange-400' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>{motivo}</p>
          </div>
        </section>
      ) : null}

      {/* Devolución */}
      {requiereDevolucion === false ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400'>
            Devolución
          </p>
          <div className='flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <DollarSign className='h-4 w-4 shrink-0 text-gray-400' />
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Sin devolución (monto abonado igual a la retención)
            </p>
          </div>
        </section>
      ) : montoDevolucion ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400'>
            Monto a devolver
          </p>
          <div className='flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <DollarSign className='h-4 w-4 shrink-0 text-gray-400' />
            <p className='text-sm font-bold text-gray-900 dark:text-white'>
              {formatearMoneda(montoDevolucion)}
            </p>
          </div>
        </section>
      ) : null}

      {/* Retención */}
      {retencionMonto > 0 ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400'>
            Retención aplicada
          </p>
          <div className='overflow-hidden rounded-xl border border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20'>
            <div className='flex items-center gap-2.5 px-3 py-2'>
              <ShieldAlert className='h-4 w-4 shrink-0 text-red-500 dark:text-red-400' />
              <p className='text-sm font-bold text-red-700 dark:text-red-300'>
                {formatearMoneda(retencionMonto)}
              </p>
            </div>
            {retencionMotivo ? (
              <div className='flex items-start gap-2.5 border-t border-red-100 px-3 py-2 dark:border-red-900/40'>
                <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-red-400' />
                <p className='text-xs text-red-600 dark:text-red-400'>
                  {retencionMotivo}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Enlace al expediente */}
      {consecutivo ? (
        <div className='space-y-1.5'>
          <Link
            href={`/renuncias/${consecutivo}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800/50 dark:bg-orange-950/20 dark:text-orange-400 dark:hover:bg-orange-950/40'
          >
            <ExternalLink className='h-4 w-4 shrink-0' />
            Ver expediente {consecutivo}
          </Link>
          <p className='text-center text-[11px] text-gray-400 dark:text-gray-500'>
            El expediente contiene el detalle completo de la renuncia,
            documentos adjuntos y el historial de devolución.
          </p>
        </div>
      ) : null}
    </div>
  )
}
