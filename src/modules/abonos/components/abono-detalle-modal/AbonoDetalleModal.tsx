'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Building2,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Home,
  Loader2,
  Lock,
  Receipt,
  StickyNote,
  User,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'

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
}

export function AbonoDetalleModal({
  abono,
  isOpen,
  onClose,
  onAnulado,
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
    generandoRecibo,
    anulandoAbono,
    showConfirmAnular,
    setShowConfirmAnular,
    errorAnular,
    handleDescargarComprobante,
    handleGenerarRecibo,
    handleConfirmarAnular,
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

                {/* Anular (solo si negociación activa) */}
                {esNegociacionActiva && (
                  <button
                    onClick={() => setShowConfirmAnular(true)}
                    className={s.header.btnDanger}
                    title='Anular este abono'
                  >
                    <Lock className='h-3.5 w-3.5' />
                    Anular
                  </button>
                )}

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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={comprobanteUrl}
                        alt='Comprobante de pago'
                        className={s.preview.img}
                      />
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
              </div>
            </div>

            {/* ─── Confirm Anular overlay ──────────────────────────────── */}
            {showConfirmAnular ? (
              <div className={s.confirmAnular.overlay}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={s.confirmAnular.card}
                >
                  <div className={s.confirmAnular.icon}>
                    <AlertTriangle className='h-6 w-6 text-red-600 dark:text-red-400' />
                  </div>
                  <p className={s.confirmAnular.title}>¿Anular este abono?</p>
                  <p className={s.confirmAnular.subtitle}>
                    Se eliminará <strong>{formatCurrency(abono.monto)}</strong>{' '}
                    registrado el {formatDateForDisplay(abono.fecha_abono)}.
                    Esta acción no se puede deshacer.
                  </p>
                  {errorAnular ? (
                    <p className={s.confirmAnular.error}>{errorAnular}</p>
                  ) : null}
                  <div className={s.confirmAnular.actions}>
                    <button
                      onClick={() => setShowConfirmAnular(false)}
                      disabled={anulandoAbono}
                      className={s.confirmAnular.btnCancel}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmarAnular}
                      disabled={anulandoAbono}
                      className={s.confirmAnular.btnConfirm}
                    >
                      {anulandoAbono ? (
                        <span className='flex items-center justify-center gap-1.5'>
                          <Loader2 className='h-3.5 w-3.5 animate-spin' />
                          Anulando...
                        </span>
                      ) : (
                        'Sí, anular'
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
