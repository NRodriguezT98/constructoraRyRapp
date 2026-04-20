'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, FileText, Receipt } from 'lucide-react'

import NextImage from 'next/image'

import { abonoDetalleStyles as s } from './AbonoDetalleModal.styles'

interface AbonoDetallePreviewPanelProps {
  comprobanteUrl: string | null
  loadingComprobante: boolean
  tieneComprobante: boolean
  esImagen: boolean
  esPDF: boolean
}

function ContentLoadingState({ label }: { label: string }) {
  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center gap-6'>
      <div className='relative'>
        {/* Rotating ring */}
        <motion.div
          className='absolute inset-0 h-20 w-20 rounded-full border-[3px] border-transparent border-r-teal-500 border-t-emerald-400'
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Pulsing inner ring */}
        <motion.div
          className='h-17 w-17 absolute inset-1.5 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Icon */}
        <motion.div
          className='relative flex h-20 w-20 items-center justify-center'
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/40'>
            <Receipt className='h-6 w-6 text-white' strokeWidth={2} />
          </div>
        </motion.div>
      </div>

      {/* Dots */}
      <div className='flex gap-2'>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className='h-1.5 w-1.5 rounded-full bg-emerald-400'
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.p
        className='text-xs font-medium text-emerald-400'
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {label}
      </motion.p>
    </div>
  )
}

export function AbonoDetallePreviewPanel({
  comprobanteUrl,
  loadingComprobante,
  tieneComprobante,
  esImagen,
  esPDF,
}: AbonoDetallePreviewPanelProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)

  // Reset al cambiar de comprobante (apertura de otro abono)
  useEffect(() => {
    setImageLoading(true)
    setImageError(false)
    setIframeLoading(true)
  }, [comprobanteUrl])

  return (
    <div className={s.preview.container}>
      {/* Cargando URL firmada desde el backend */}
      {loadingComprobante ? (
        <ContentLoadingState label='Cargando comprobante...' />
      ) : tieneComprobante && comprobanteUrl ? (
        esPDF ? (
          <>
            {iframeLoading ? (
              <ContentLoadingState label='Cargando comprobante de pago...' />
            ) : null}
            <iframe
              key={comprobanteUrl}
              src={comprobanteUrl}
              className={`${s.preview.iframe} transition-opacity duration-500 ${
                iframeLoading ? 'opacity-0' : 'opacity-100'
              }`}
              title='Comprobante de pago'
              onLoad={() => setIframeLoading(false)}
            />
          </>
        ) : esImagen ? (
          <div className={s.preview.imgWrapper}>
            {imageLoading && !imageError ? (
              <ContentLoadingState label='Cargando comprobante de pago...' />
            ) : null}

            {imageError ? (
              <div className={s.preview.imgError}>
                <AlertCircle className='h-8 w-8 text-gray-600' />
                <p className={s.preview.imgErrorText}>
                  No se pudo cargar la imagen
                </p>
              </div>
            ) : null}

            <NextImage
              src={comprobanteUrl}
              alt='Comprobante de pago'
              fill
              unoptimized
              className={`object-contain drop-shadow-lg transition-opacity duration-500 ${
                imageLoading || imageError ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false)
                setImageError(true)
              }}
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
            <FileText className='h-8 w-8 text-gray-400' />
          </div>
          <p className={s.preview.placeholderTitle}>Sin comprobante adjunto</p>
          <p className={s.preview.placeholderSub}>
            No se adjunto comprobante al registrar este abono
          </p>
        </div>
      )}
    </div>
  )
}
