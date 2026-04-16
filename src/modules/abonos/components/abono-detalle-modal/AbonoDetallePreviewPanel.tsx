'use client'

import { FileText } from 'lucide-react'

import NextImage from 'next/image'

import { abonoDetalleStyles as s } from './AbonoDetalleModal.styles'

interface AbonoDetallePreviewPanelProps {
  comprobanteUrl: string | null
  loadingComprobante: boolean
  tieneComprobante: boolean
  esImagen: boolean
  esPDF: boolean
}

export function AbonoDetallePreviewPanel({
  comprobanteUrl,
  loadingComprobante,
  tieneComprobante,
  esImagen,
  esPDF,
}: AbonoDetallePreviewPanelProps) {
  return (
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
  )
}
