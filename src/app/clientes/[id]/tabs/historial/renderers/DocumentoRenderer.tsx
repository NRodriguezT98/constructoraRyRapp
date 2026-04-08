/**
 * DocumentoRenderer
 * Muestra datos de documento subido o actualizado.
 * - documento_subido: vista de tarjeta con metadatos
 * - documento_actualizado: diff Antes → Ahora por cada campo modificado
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Archive,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  FileText,
  Hash,
  Info,
  Loader2,
  RotateCcw,
  Star,
  Tag,
  Trash2,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { useVerDocumentoHistorial } from '@/modules/clientes/hooks/useVerDocumentoHistorial'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { MOTIVOS_ARCHIVADO } from '@/shared/documentos/constants/archivado.constants'

import { formatearValor } from './formatearValor'

/** Regex para detectar UUID v4 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function useCategoriasLookup() {
  return useQuery({
    queryKey: ['categorias_documento_lookup'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categorias_documento')
        .select('id, nombre')
      return Object.fromEntries((data ?? []).map(c => [c.id, c.nombre]))
    },
    staleTime: 10 * 60 * 1000,
  })
}

interface Props {
  evento: EventoHistorialHumanizado
}

export function DocumentoRenderer({ evento }: Props) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = evento.metadata ?? {}

  const titulo = String(get('titulo') ?? meta.titulo ?? '—')
  const urlStorage = meta.url_storage as string | undefined
  const tipoMime = (meta.tipo_mime as string | undefined) ?? ''

  const { data: categoriasMap = {} } = useCategoriasLookup()
  const { verDocumento, cargando, esCargando } = useVerDocumentoHistorial()

  /** Formatea un valor de diff resolviendo UUIDs de categoría a nombre */
  const formatearValorCampo = (campo: string, valor: unknown): string => {
    if (
      campo === 'categoria_id' &&
      typeof valor === 'string' &&
      UUID_REGEX.test(valor)
    ) {
      return categoriasMap[valor] ?? '(categoría no encontrada)'
    }
    return formatearValor(valor)
  }

  const tipoOp = (meta.tipo_operacion as string | undefined) ?? ''

  // ── Bloque compartido: cabecera con nombre del documento ──────────────────
  const DocHeader = ({
    color = 'cyan',
  }: {
    color?: 'cyan' | 'orange' | 'red' | 'green'
  }) => {
    const styles: Record<
      string,
      { border: string; bg: string; text: string; label: string }
    > = {
      cyan: {
        border: 'border-cyan-100 dark:border-cyan-900/40',
        bg: 'bg-cyan-50 dark:bg-cyan-950/30',
        text: 'text-cyan-900 dark:text-cyan-100',
        label: 'text-cyan-600 dark:text-cyan-400',
      },
      orange: {
        border: 'border-orange-100 dark:border-orange-900/40',
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        text: 'text-orange-900 dark:text-orange-100',
        label: 'text-orange-600 dark:text-orange-400',
      },
      red: {
        border: 'border-red-100 dark:border-red-900/40',
        bg: 'bg-red-50 dark:bg-red-950/30',
        text: 'text-red-900 dark:text-red-100',
        label: 'text-red-500 dark:text-red-400',
      },
      green: {
        border: 'border-green-100 dark:border-green-900/40',
        bg: 'bg-green-50 dark:bg-green-950/30',
        text: 'text-green-900 dark:text-green-100',
        label: 'text-green-600 dark:text-green-400',
      },
    }
    const s = styles[color]
    return (
      <div
        className={`flex items-start gap-2.5 rounded-xl border ${s.border} ${s.bg} px-3 py-3`}
      >
        <FileText className={`mt-0.5 h-5 w-5 shrink-0 ${s.label}`} />
        <div>
          <p
            className={`text-[11px] font-semibold uppercase tracking-wide ${s.label}`}
          >
            Documento
          </p>
          <p className={`text-sm font-bold ${s.text}`}>{titulo}</p>
        </div>
      </div>
    )
  }

  // ── ARCHIVAR ──────────────────────────────────────────────────────────────
  if (
    evento.tipo === 'documento_actualizado' &&
    tipoOp === 'ARCHIVAR_DOCUMENTO'
  ) {
    const motivoCategoria = meta.motivo_categoria as string | undefined
    const motivoDetalle = meta.motivo_detalle as string | undefined
    const motivoCategoriaLabel =
      MOTIVOS_ARCHIVADO.find(m => m.value === motivoCategoria)?.label ??
      motivoCategoria

    return (
      <div className='space-y-3'>
        <DocHeader color='orange' />
        <div className='overflow-hidden rounded-xl border border-orange-100 bg-white dark:border-orange-900/30 dark:bg-gray-900/50'>
          {/* Motivo categoría */}
          {motivoCategoria ? (
            <div className='flex items-start gap-2.5 border-b border-orange-100 px-3 py-2.5 dark:border-orange-900/30'>
              <Archive className='mt-0.5 h-4 w-4 shrink-0 text-orange-500' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Motivo del archivado
                </p>
                <p className='mt-0.5 text-sm font-semibold text-orange-700 dark:text-orange-300'>
                  {motivoCategoriaLabel}
                </p>
              </div>
            </div>
          ) : null}
          {/* Observaciones */}
          {motivoDetalle ? (
            <div className='flex items-start gap-2.5 px-3 py-2.5'>
              <Info className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Observaciones
                </p>
                <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
                  {motivoDetalle}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  // ── RESTAURAR ─────────────────────────────────────────────────────────────
  if (
    evento.tipo === 'documento_actualizado' &&
    tipoOp === 'RESTAURAR_DOCUMENTO_ARCHIVADO'
  ) {
    return (
      <div className='space-y-3'>
        <DocHeader color='green' />
        <div className='flex items-start gap-2.5 rounded-xl border border-green-100 bg-green-50 px-3 py-3 dark:border-green-900/30 dark:bg-green-950/20'>
          <RotateCcw className='mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
          <p className='text-sm text-green-800 dark:text-green-200'>
            El documento fue restaurado desde el archivo y está nuevamente{' '}
            <span className='font-semibold'>activo</span>.
          </p>
        </div>
      </div>
    )
  }

  // ── ELIMINACIÓN SUAVE ─────────────────────────────────────────────────────
  if (
    evento.tipo === 'documento_actualizado' &&
    tipoOp === 'ELIMINAR_DOCUMENTO_SOFTDELETE'
  ) {
    const nombreArchivoSoft = meta.nombre_original as string | undefined
    const categoriaIdSoft = meta.categoria_id as string | undefined
    const categoriaNombreSoft = categoriaIdSoft
      ? (categoriasMap[categoriaIdSoft] ?? null)
      : null
    const esIdentidadSoft = meta.es_documento_identidad as boolean | undefined

    return (
      <div className='space-y-3'>
        <DocHeader color='red' />
        <div className='flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3 py-3 dark:border-red-900/30 dark:bg-red-950/20'>
          <Trash2 className='mt-0.5 h-4 w-4 shrink-0 text-red-500' />
          <p className='text-sm text-red-800 dark:text-red-200'>
            El documento fue movido a la{' '}
            <span className='font-semibold'>papelera</span>.
          </p>
        </div>
        {(categoriaNombreSoft ?? nombreArchivoSoft ?? esIdentidadSoft) ? (
          <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
            {categoriaNombreSoft ? (
              <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
                <Tag className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Categoría
                  </p>
                  <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                    {categoriaNombreSoft}
                  </p>
                </div>
              </div>
            ) : null}
            {nombreArchivoSoft ? (
              <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
                <FileText className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Archivo
                  </p>
                  <p className='mt-0.5 truncate font-mono text-sm text-gray-700 dark:text-gray-300'>
                    {nombreArchivoSoft}
                  </p>
                </div>
              </div>
            ) : null}
            {esIdentidadSoft ? (
              <div className='flex items-start gap-2.5 px-3 py-2'>
                <Info className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
                <p className='text-sm font-semibold text-amber-700 dark:text-amber-400'>
                  Era el documento de identidad del cliente
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  // ── ELIMINAR (desde papelera — accion DELETE) ─────────────────────────────
  if (evento.tipo === 'documento_eliminado') {
    const numVersiones = meta.numero_versiones as number | undefined
    const categoriaIdDel = get('categoria_id')
    const categoriaNombreDel =
      typeof categoriaIdDel === 'string'
        ? (categoriasMap[categoriaIdDel] ?? null)
        : null
    const nombreArchivoDel = get('nombre_original')
    const esIdentidadDel = get('es_documento_identidad')

    const versionesTexto =
      numVersiones && numVersiones > 1
        ? ` junto a ${numVersiones - 1} versión${numVersiones > 2 ? 'es' : ''} anterior${numVersiones > 2 ? 'es' : ''}`
        : ''

    return (
      <div className='space-y-3'>
        <DocHeader color='red' />
        <div className='flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3 py-3 dark:border-red-900/30 dark:bg-red-950/20'>
          <Trash2 className='mt-0.5 h-4 w-4 shrink-0 text-red-500' />
          <p className='text-sm text-red-800 dark:text-red-200'>
            El documento fue enviado a la papelera{versionesTexto}.
          </p>
        </div>
        {(categoriaNombreDel ??
        nombreArchivoDel ??
        numVersiones ??
        esIdentidadDel) ? (
          <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
            {categoriaNombreDel ? (
              <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
                <Tag className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Categoría
                  </p>
                  <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                    {categoriaNombreDel}
                  </p>
                </div>
              </div>
            ) : null}
            {typeof nombreArchivoDel === 'string' ? (
              <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
                <FileText className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Archivo
                  </p>
                  <p className='mt-0.5 truncate font-mono text-sm text-gray-700 dark:text-gray-300'>
                    {nombreArchivoDel}
                  </p>
                </div>
              </div>
            ) : null}
            {numVersiones ? (
              <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
                <Hash className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                    Versiones eliminadas
                  </p>
                  <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                    {numVersiones}
                  </p>
                </div>
              </div>
            ) : null}
            {esIdentidadDel ? (
              <div className='flex items-start gap-2.5 px-3 py-2'>
                <Info className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
                <p className='text-sm font-semibold text-amber-700 dark:text-amber-400'>
                  Era el documento de identidad del cliente
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  // ── NUEVA VERSIÓN ─────────────────────────────────────────────────────────
  if (
    evento.tipo === 'documento_actualizado' &&
    tipoOp === 'NUEVA_VERSION_DOCUMENTO'
  ) {
    const versionNueva = meta.version_nueva as number | undefined
    const nombreArchivoAnterior = meta.nombre_archivo_anterior as
      | string
      | undefined
    const urlStorageAnterior = meta.url_storage_anterior as string | undefined
    const nombreArchivoNuevo = meta.nombre_archivo_nuevo as string | undefined
    const urlStorageNuevo = meta.url_storage_nuevo as string | undefined
    const cambiosTexto = meta.cambios as string | undefined
    const tamanoBytes = meta.tamano_bytes as number | undefined

    return (
      <div className='space-y-3'>
        <DocHeader color='cyan' />
        <div className='overflow-hidden rounded-xl border border-cyan-100 bg-white dark:border-cyan-900/30 dark:bg-gray-900/50'>
          {/* Fila de versión con flecha */}
          {versionNueva ? (
            <div className='flex items-start gap-2.5 border-b border-cyan-100 px-3 py-2.5 dark:border-cyan-900/30'>
              <Tag className='mt-0.5 h-4 w-4 shrink-0 text-cyan-500' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Versión
                </p>
                <p className='mt-0.5 flex items-center gap-1.5 text-sm font-bold'>
                  <span className='text-gray-400 line-through'>
                    v{versionNueva - 1}
                  </span>
                  <span className='text-gray-400'>→</span>
                  <span className='text-cyan-700 dark:text-cyan-300'>
                    v{versionNueva}
                  </span>
                </p>
              </div>
            </div>
          ) : null}

          {/* Versión anterior */}
          {(nombreArchivoAnterior ?? urlStorageAnterior) ? (
            <div className='flex items-center gap-2.5 border-b border-gray-100 px-3 py-2.5 dark:border-gray-800'>
              <FileText className='h-4 w-4 shrink-0 text-gray-400' />
              <div className='min-w-0 flex-1'>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Versión anterior
                </p>
                <p className='mt-0.5 truncate text-sm text-gray-500 line-through dark:text-gray-400'>
                  {nombreArchivoAnterior ?? '—'}
                </p>
              </div>
              {urlStorageAnterior ? (
                <button
                  type='button'
                  onClick={() => verDocumento(urlStorageAnterior, 'anterior')}
                  disabled={esCargando('anterior')}
                  className='flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                >
                  {esCargando('anterior') ? (
                    <Loader2 className='h-3 w-3 animate-spin' />
                  ) : (
                    <ExternalLink className='h-3 w-3' />
                  )}
                  Ver
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Versión nueva */}
          {(nombreArchivoNuevo ?? urlStorageNuevo) ? (
            <div className='flex items-center gap-2.5 border-b border-gray-100 px-3 py-2.5 dark:border-gray-800'>
              <FileText className='h-4 w-4 shrink-0 text-cyan-500' />
              <div className='min-w-0 flex-1'>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Versión nueva
                </p>
                <p className='mt-0.5 truncate text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {nombreArchivoNuevo ?? '—'}
                </p>
              </div>
              {urlStorageNuevo ? (
                <button
                  type='button'
                  onClick={() => verDocumento(urlStorageNuevo, 'nuevo')}
                  disabled={esCargando('nuevo')}
                  className='flex shrink-0 items-center gap-1 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-400 dark:hover:bg-cyan-900/30'
                >
                  {esCargando('nuevo') ? (
                    <Loader2 className='h-3 w-3 animate-spin' />
                  ) : (
                    <ExternalLink className='h-3 w-3' />
                  )}
                  Ver
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Tamaño nuevo archivo */}
          {tamanoBytes ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2.5 dark:border-gray-800'>
              <Info className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Tamaño
                </p>
                <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
                  {(tamanoBytes / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : null}

          {/* Notas de la versión */}
          {cambiosTexto ? (
            <div className='flex items-start gap-2.5 px-3 py-2.5'>
              <Star className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Notas de la versión
                </p>
                <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
                  {cambiosTexto}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  // ── REEMPLAZO DE ARCHIVO ──────────────────────────────────────────────────
  if (
    evento.tipo === 'documento_actualizado' &&
    tipoOp === 'REEMPLAZO_ARCHIVO'
  ) {
    const motivoReemplazo = meta.motivo_reemplazo as string | undefined
    const archivoOriginal = meta.archivo_original as
      | Record<string, unknown>
      | undefined
    const archivoNuevo = meta.archivo_nuevo as
      | Record<string, unknown>
      | undefined

    return (
      <div className='space-y-3'>
        <DocHeader color='orange' />
        <div className='overflow-hidden rounded-xl border border-orange-100 bg-white dark:border-orange-900/30 dark:bg-gray-900/50'>
          {motivoReemplazo ? (
            <div className='flex items-start gap-2.5 border-b border-orange-100 px-3 py-2.5 dark:border-orange-900/30'>
              <Info className='mt-0.5 h-4 w-4 shrink-0 text-orange-500' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Motivo del reemplazo
                </p>
                <p className='mt-0.5 text-sm font-semibold text-orange-700 dark:text-orange-300'>
                  {motivoReemplazo}
                </p>
              </div>
            </div>
          ) : null}
          {archivoOriginal ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2.5 dark:border-gray-800'>
              <FileText className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Archivo anterior
                </p>
                <p className='mt-0.5 truncate text-sm text-gray-500 line-through dark:text-gray-400'>
                  {String(archivoOriginal.nombre ?? '—')}
                </p>
                <p className='text-[11px] text-gray-400'>
                  {String(archivoOriginal.tamano_mb ?? '0')} MB
                </p>
              </div>
            </div>
          ) : null}
          {archivoNuevo ? (
            <div className='flex items-start gap-2.5 px-3 py-2.5'>
              <FileText className='mt-0.5 h-4 w-4 shrink-0 text-green-500' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Archivo nuevo
                </p>
                <p className='mt-0.5 truncate text-sm font-medium text-green-700 dark:text-green-300'>
                  {String(archivoNuevo.nombre ?? '—')}
                </p>
                <p className='text-[11px] text-gray-400'>
                  {String(archivoNuevo.tamano_mb ?? '0')} MB
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  // ── EDICIÓN DE CAMPOS (diff) ───────────────────────────────────────────────
  if (evento.tipo === 'documento_actualizado') {
    const camposConDiff = d.filter(det => det.valorAnterior !== undefined)

    return (
      <div className='space-y-3'>
        <DocHeader color='cyan' />
        {camposConDiff.length > 0 ? (
          <div className='space-y-2.5'>
            {camposConDiff.map(det => (
              <div
                key={det.campo}
                className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'
              >
                <div className='border-b border-gray-100 px-3 py-1.5 dark:border-gray-800'>
                  <p className='text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    {det.etiqueta}
                  </p>
                </div>
                <div className='flex items-stretch gap-0'>
                  <div className='min-w-0 flex-1 bg-red-50 px-3 py-2 dark:bg-red-950/30'>
                    <p className='mb-0.5 text-[10px] font-semibold text-red-500 dark:text-red-400'>
                      Antes
                    </p>
                    <p className='break-words text-sm text-red-800 line-through dark:text-red-300'>
                      {formatearValorCampo(det.campo, det.valorAnterior)}
                    </p>
                  </div>
                  <div className='flex items-center bg-gray-50 px-1.5 dark:bg-gray-800/50'>
                    <ArrowRight className='h-3.5 w-3.5 flex-shrink-0 text-gray-400' />
                  </div>
                  <div className='min-w-0 flex-1 bg-green-50 px-3 py-2 dark:bg-green-950/30'>
                    <p className='mb-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400'>
                      Ahora
                    </p>
                    <p className='break-words text-sm font-semibold text-green-900 dark:text-green-200'>
                      {formatearValorCampo(det.campo, det.valorNuevo)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            No hay detalle de los cambios disponible.
          </p>
        )}
      </div>
    )
  }

  // === SUBIDA: vista de tarjeta con metadatos ===
  const descripcion = get('descripcion') ?? meta.descripcion

  return (
    <div className='space-y-3'>
      <DocHeader color='cyan' />

      {/* Metadatos */}
      <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
        {descripcion ? (
          <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
            <Info className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Descripción
              </p>
              <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
                {String(descripcion)}
              </p>
            </div>
          </div>
        ) : null}

        {get('fecha_documento') ? (
          <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
            <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Fecha del documento
              </p>
              <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                {formatearValor(get('fecha_documento'))}
              </p>
            </div>
          </div>
        ) : null}

        {get('fecha_vencimiento') ? (
          <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
            <CalendarDays className='mt-0.5 h-4 w-4 shrink-0 text-orange-400' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Fecha de vencimiento
              </p>
              <p className='mt-0.5 text-sm font-medium text-orange-700 dark:text-orange-300'>
                {formatearValor(get('fecha_vencimiento'))}
              </p>
            </div>
          </div>
        ) : null}

        {get('es_importante') ? (
          <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
            <Star className='mt-0.5 h-4 w-4 shrink-0 text-yellow-500' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Importancia
              </p>
              <p className='mt-0.5 text-sm font-semibold text-yellow-700 dark:text-yellow-300'>
                Marcado como importante
              </p>
            </div>
          </div>
        ) : null}

        {(meta.categoria_nombre ?? get('tipo_documento')) ? (
          <div className='flex items-start gap-2.5 px-3 py-2'>
            <Tag className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                Categoría / Tipo
              </p>
              <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                {String(meta.categoria_nombre ?? get('tipo_documento'))}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Botón ver documento */}
      {urlStorage ? (
        <button
          onClick={() => verDocumento(urlStorage, 'upload')}
          disabled={esCargando('upload')}
          className='flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-60 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-900/40'
        >
          {esCargando('upload') ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <ExternalLink className='h-4 w-4' />
          )}
          {cargando
            ? 'Abriendo…'
            : tipoMime.startsWith('image/')
              ? 'Ver imagen'
              : 'Ver documento'}
        </button>
      ) : null}
    </div>
  )
}
