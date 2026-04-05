'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Ban,
  Building2,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Home,
  Loader2,
  Receipt,
  StickyNote,
  User,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import NextImage from 'next/image'

import { formatDateCompact, formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'
import { ModalAnularAbono } from '../modal-anular-abono'

import { abonoDetalleStyles as s } from './AbonoDetalleModal.styles'
import { type AbonoParaDetalle, useAbonoDetalle } from './useAbonoDetalle'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

interface AbonoDetalleModalProps {
  abono: AbonoParaDetalle | null
  isOpen: boolean
  onClose: () => void
  onAnulado?: () => void
  /** Abrir modal de registro de nuevo abono (desde el éxito de anulación) */
  onRegistrarNuevo?: () => void
}

export function AbonoDetalleModal({
  abono,
  isOpen,
  onClose,
  onAnulado,
  onRegistrarNuevo: _onRegistrarNuevo,
}: AbonoDetalleModalProps) {
  // Evitar SSR crash: createPortal requiere document.body (solo existe en browser)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    comprobanteUrl,
    loadingComprobante,
    tieneComprobante,
    esNegociacionActiva,
    estaAnulado,
    generandoRecibo,
    showModalAnular,
    setShowModalAnular,
    esAdmin,
    handleDescargarComprobante,
    handleGenerarRecibo,
    handleAbonoAnulado,
  } = useAbonoDetalle({
    abono,
    onAnulado: () => {
      onAnulado?.()
      onClose()
    },
  })

  if (!abono) return null

  const esImagen = abono.comprobante_url
    ? /\.(jpe?g|png|webp)$/i.test(abono.comprobante_url)
    : false
  const esPDF = abono.comprobante_url
    ? /\.pdf$/i.test(abono.comprobante_url)
    : false

  const viviendaLabel = abono.vivienda.manzana.identificador
    ? `Mz.${abono.vivienda.manzana.identificador} Casa No. ${abono.vivienda.numero}`
    : `Casa No. ${abono.vivienda.numero}`

  if (!isOpen || !mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={s.overlay}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={s.modal}
          >
            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className={s.header.container}>
              <div className={s.header.left}>
                <div className={s.header.iconWrap}>
                  <Receipt className='h-5 w-5 text-white' />
                </div>
                <div className='min-w-0'>
                  <p className={s.header.title}>
                    {formatearNumeroRecibo(abono.numero_recibo)}
                    {' · '}
                    {formatCurrency(abono.monto)}
                  </p>
                  <p className={s.header.subtitle}>
                    {formatNombreCompleto(
                      `${abono.cliente.nombres} ${abono.cliente.apellidos}`
                    )}{' '}
                    · {formatDateForDisplay(abono.fecha_abono)}
                  </p>
                </div>
              </div>

              <div className={s.header.actions}>
                {/* Descargar comprobante */}
                {tieneComprobante && (
                  <button
                    onClick={handleDescargarComprobante}
                    className={s.header.btn}
                    title='Descargar comprobante original'
                  >
                    <Download className='h-3.5 w-3.5' />
                    Comprobante
                  </button>
                )}

                {/* Generar recibo PDF */}
                <button
                  onClick={handleGenerarRecibo}
                  disabled={generandoRecibo}
                  className={s.header.btn}
                  title='Generar recibo oficial en PDF'
                >
                  {generandoRecibo ? (
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  ) : (
                    <FileText className='h-3.5 w-3.5' />
                  )}
                  {generandoRecibo ? 'Generando...' : 'Generar Recibo'}
                </button>

                {/* Anular (solo Admin + negociación activa + no anulado ya) */}
                {esAdmin && esNegociacionActiva && !estaAnulado ? (
                  <button
                    onClick={() => setShowModalAnular(true)}
                    className={s.header.btnDanger}
                    title='Anular este abono'
                  >
                    <Ban className='h-3.5 w-3.5' />
                    Anular
                  </button>
                ) : null}

                {/* Cerrar */}
                <button onClick={onClose} className={s.header.btnClose}>
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* ─── Body split ─────────────────────────────────────────── */}
            <div className={s.body}>
              {/* Panel izquierdo: comprobante */}
              <div className={s.preview.container}>
                <div className={s.preview.inner}>
                  {loadingComprobante ? (
                    <div className={s.preview.loading}>
                      <div className={s.preview.spinner} />
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Cargando comprobante...
                      </p>
                    </div>
                  ) : tieneComprobante && comprobanteUrl ? (
                    esPDF ? (
                      <iframe
                        src={comprobanteUrl}
                        className={s.preview.iframe}
                        title='Comprobante de pago'
                      />
                    ) : esImagen ? (
                      <div className={`relative ${s.preview.img}`}>
                        <NextImage
                          src={comprobanteUrl}
                          alt='Comprobante de pago'
                          fill
                          className='object-contain'
                        />
                      </div>
                    ) : (
                      // Tipo desconocido → intentar iframe
                      <iframe
                        src={comprobanteUrl}
                        className={s.preview.iframe}
                        title='Comprobante de pago'
                      />
                    )
                  ) : (
                    <div className={s.preview.placeholder}>
                      <div className={s.preview.placeholderIcon}>
                        <FileText className='h-8 w-8 text-gray-400 dark:text-gray-500' />
                      </div>
                      <p className={s.preview.placeholderTitle}>
                        Sin comprobante adjunto
                      </p>
                      <p className={s.preview.placeholderSub}>
                        No se adjuntó comprobante al registrar este abono
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel derecho: información */}
              <div className={s.sidebar.container}>
                {/* Monto */}
                <div className={s.sidebar.section}>
                  <p className={s.sidebar.sectionTitle}>
                    <CreditCard className='h-3 w-3' />
                    Pago
                  </p>
                  <div className='rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-900/20'>
                    <p className={s.sidebar.monto}>
                      {formatCurrency(abono.monto)}
                    </p>
                    <span className={`mt-1 ${s.sidebar.badge}`}>
                      <Receipt className='h-3 w-3' />
                      {formatearNumeroRecibo(abono.numero_recibo)}
                    </span>
                  </div>

                  {/* Fecha */}
                  <div className={s.sidebar.row}>
                    <Calendar
                      className={`${s.sidebar.rowIcon} h-4 w-4 text-emerald-500`}
                    />
                    <div>
                      <p className={s.sidebar.rowLabel}>Fecha</p>
                      <p className={s.sidebar.rowValue}>
                        {formatDateForDisplay(abono.fecha_abono)}
                      </p>
                    </div>
                  </div>

                  {/* Método */}
                  <div className={s.sidebar.row}>
                    <CreditCard
                      className={`${s.sidebar.rowIcon} h-4 w-4 text-emerald-500`}
                    />
                    <div>
                      <p className={s.sidebar.rowLabel}>Método de pago</p>
                      <p className={s.sidebar.rowValue}>{abono.metodo_pago}</p>
                    </div>
                  </div>

                  {/* Referencia (solo si existe) */}
                  {abono.numero_referencia ? (
                    <div className={s.sidebar.row}>
                      <FileText
                        className={`${s.sidebar.rowIcon} h-4 w-4 text-emerald-500`}
                      />
                      <div>
                        <p className={s.sidebar.rowLabel}>
                          {abono.metodo_pago === 'Cheque'
                            ? 'Número de cheque'
                            : 'Número de transferencia'}
                        </p>
                        <p className={`${s.sidebar.rowValue} font-mono`}>
                          {abono.numero_referencia}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Fuente */}
                  <div className={s.sidebar.row}>
                    <Building2
                      className={`${s.sidebar.rowIcon} h-4 w-4 text-emerald-500`}
                    />
                    <div>
                      <p className={s.sidebar.rowLabel}>Fuente de pago</p>
                      <p className={s.sidebar.rowValue}>
                        {abono.fuente_pago.tipo}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={s.sidebar.divider} />
                {/* Cliente */}
                <div className={s.sidebar.section}>
                  <p className={s.sidebar.sectionTitle}>
                    <User className='h-3 w-3' />
                    Cliente
                  </p>
                  <div className={s.sidebar.row}>
                    <User
                      className={`${s.sidebar.rowIcon} h-4 w-4 text-blue-500`}
                    />
                    <div>
                      <p className={s.sidebar.rowLabel}>Nombre</p>
                      <p className={s.sidebar.rowValue}>
                        {formatNombreCompleto(
                          `${abono.cliente.nombres} ${abono.cliente.apellidos}`
                        )}
                      </p>
                      <p className={s.sidebar.rowValueSub}>
                        CC {abono.cliente.numero_documento}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={s.sidebar.divider} />
                {/* Propiedad */}
                <div className={s.sidebar.section}>
                  <p className={s.sidebar.sectionTitle}>
                    <Home className='h-3 w-3' />
                    Propiedad
                  </p>
                  <div className={s.sidebar.row}>
                    <Home
                      className={`${s.sidebar.rowIcon} h-4 w-4 text-orange-500`}
                    />
                    <div>
                      <p className={s.sidebar.rowLabel}>Vivienda</p>
                      <p className={s.sidebar.rowValue}>{viviendaLabel}</p>
                      <p className={s.sidebar.rowValueSub}>
                        {abono.proyecto.nombre}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Notas (si existen) */}
                {abono.notas ? (
                  <>
                    <div className={s.sidebar.divider} />
                    <div className={s.sidebar.section}>
                      <p className={s.sidebar.sectionTitle}>
                        <StickyNote className='h-3 w-3' />
                        Observaciones
                      </p>
                      <p className='rounded-lg bg-gray-50 p-3 text-xs italic text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
                        {'“'}
                        {abono.notas}
                        {'”'}
                      </p>
                    </div>
                  </>
                ) : null}
                {/* Sección ANULADO — solo si estado = Anulado */}
                {estaAnulado ? (
                  <>
                    <div className={s.sidebar.divider} />
                    <div className={s.sidebar.section}>
                      <p className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400'>
                        <Ban className='h-3 w-3' />
                        Anulación
                      </p>
                      <div className='space-y-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/30'>
                        {abono.motivo_categoria ? (
                          <div>
                            <p className={s.sidebar.rowLabel}>Motivo</p>
                            <p className='text-sm font-semibold text-red-900 dark:text-red-200'>
                              {abono.motivo_categoria}
                            </p>
                          </div>
                        ) : null}
                        {abono.motivo_detalle ? (
                          <div>
                            <p className={s.sidebar.rowLabel}>Detalle</p>
                            <p className='text-xs italic text-red-800 dark:text-red-300'>
                              {abono.motivo_detalle}
                            </p>
                          </div>
                        ) : null}
                        {abono.anulado_por_nombre ? (
                          <div>
                            <p className={s.sidebar.rowLabel}>Anulado por</p>
                            <p className='text-xs font-semibold text-red-800 dark:text-red-200'>
                              {abono.anulado_por_nombre}
                            </p>
                          </div>
                        ) : null}
                        {abono.fecha_anulacion ? (
                          <div>
                            <p className={s.sidebar.rowLabel}>
                              Fecha de anulación
                            </p>
                            <p className='text-xs text-red-800 dark:text-red-300'>
                              {formatDateCompact(abono.fecha_anulacion)}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : null}{' '}
              </div>
            </div>

            {/* ─── Modal de Anulación ──────────────────────────────────── */}
            {abono && showModalAnular ? (
              <ModalAnularAbono
                abono={{
                  id: abono.id,
                  numero_recibo: abono.numero_recibo,
                  monto: abono.monto,
                  fecha_abono: abono.fecha_abono,
                  cliente_nombre:
                    `${abono.cliente.nombres} ${abono.cliente.apellidos}`.trim(),
                  vivienda_info: abono.vivienda.manzana.identificador
                    ? `Mz.${abono.vivienda.manzana.identificador} Casa No. ${abono.vivienda.numero}`
                    : `N°${abono.vivienda.numero}`,
                  proyecto_nombre: abono.proyecto.nombre,
                  fuente_tipo: abono.fuente_pago.tipo,
                }}
                onAnulacionExitosa={() => {
                  setShowModalAnular(false)
                  handleAbonoAnulado()
                }}
                onClose={() => setShowModalAnular(false)}
              />
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
