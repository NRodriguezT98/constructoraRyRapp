'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, Loader2, X, XCircle } from 'lucide-react'

export type ConfirmacionVariant = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmacionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  variant?: ConfirmacionVariant
  title: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  loadingText?: string
}

const variantConfig = {
  danger: {
    Icon: XCircle,
    barGradient: 'linear-gradient(to bottom, #ef4444 0%, transparent 100%)',
    iconCls: 'text-red-400',
    iconWrapCls: 'bg-red-500/10 ring-1 ring-red-500/25',
    ambientStyle: 'radial-gradient(ellipse at bottom right, rgba(239,68,68,0.11) 0%, transparent 65%)',
    confirmCls:
      'bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white shadow-[0_4px_18px_rgba(239,68,68,0.38)]',
    loadingCls: 'bg-zinc-800 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed',
  },
  warning: {
    Icon: AlertTriangle,
    barGradient: 'linear-gradient(to bottom, #f59e0b 0%, transparent 100%)',
    iconCls: 'text-amber-400',
    iconWrapCls: 'bg-amber-500/10 ring-1 ring-amber-500/25',
    ambientStyle: 'radial-gradient(ellipse at bottom right, rgba(245,158,11,0.10) 0%, transparent 65%)',
    confirmCls:
      'bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-bold shadow-[0_4px_18px_rgba(245,158,11,0.32)]',
    loadingCls: 'bg-zinc-800 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed',
  },
  info: {
    Icon: Info,
    barGradient: 'linear-gradient(to bottom, #3b82f6 0%, transparent 100%)',
    iconCls: 'text-blue-400',
    iconWrapCls: 'bg-blue-500/10 ring-1 ring-blue-500/25',
    ambientStyle: 'radial-gradient(ellipse at bottom right, rgba(59,130,246,0.10) 0%, transparent 65%)',
    confirmCls:
      'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-[0_4px_18px_rgba(59,130,246,0.38)]',
    loadingCls: 'bg-zinc-800 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed',
  },
  success: {
    Icon: CheckCircle,
    barGradient: 'linear-gradient(to bottom, #10b981 0%, transparent 100%)',
    iconCls: 'text-emerald-400',
    iconWrapCls: 'bg-emerald-500/10 ring-1 ring-emerald-500/25',
    ambientStyle: 'radial-gradient(ellipse at bottom right, rgba(16,185,129,0.10) 0%, transparent 65%)',
    confirmCls:
      'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-[0_4px_18px_rgba(16,185,129,0.36)]',
    loadingCls: 'bg-zinc-800 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed',
  },
}

export function ConfirmacionModal({
  isOpen,
  onClose,
  onConfirm,
  variant = 'danger',
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  loadingText = 'Procesando...',
}: ConfirmacionModalProps) {
  const cfg = variantConfig[variant]
  const { Icon } = cfg

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => { e.stopPropagation(); if (!isLoading) onClose() }}
            className='fixed inset-0 z-[200] bg-black/70 backdrop-blur-[3px]'
          />

          {/* Modal — stopPropagation evita que clicks en el modal suban al componente padre */}
          <div
            className='fixed inset-0 z-[200] flex items-center justify-center p-4'
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className='relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.07] bg-white shadow-[0_32px_72px_-12px_rgba(0,0,0,0.65)] dark:bg-zinc-900'
            >
              {/* Ambient glow — variant color bleeds from bottom-right */}
              <div
                className='pointer-events-none absolute inset-0'
                style={{ background: cfg.ambientStyle }}
              />

              {/* Left accent bar with gradient fade */}
              <div
                className='absolute bottom-0 left-0 top-0 w-[3px]'
                style={{ background: cfg.barGradient }}
              />

              {/* Close */}
              <button
                onClick={onClose}
                disabled={isLoading}
                aria-label='Cerrar'
                className='absolute right-3.5 top-3.5 z-10 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-black/[0.06] hover:text-zinc-700 disabled:pointer-events-none disabled:opacity-30 dark:text-zinc-500 dark:hover:bg-white/[0.07] dark:hover:text-zinc-200'
              >
                <X className='h-4 w-4' />
              </button>

              {/* Body */}
              <div className='relative pb-5 pl-6 pr-5 pt-5'>
                {/* Icon + Title */}
                <div className='mb-3.5 flex items-start gap-3 pr-8'>
                  <div
                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${cfg.iconWrapCls}`}
                  >
                    <Icon className={`h-4 w-4 ${cfg.iconCls}`} />
                  </div>
                  <h2 className='text-[15px] font-semibold leading-snug text-zinc-900 dark:text-white'>
                    {title}
                  </h2>
                </div>

                {/* Message — indented to align with title text */}
                <div className='mb-5 pl-11 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400'>
                  {typeof message === 'string' ? (
                    <p className='whitespace-pre-line'>{message}</p>
                  ) : (
                    message
                  )}
                </div>

                {/* Separator */}
                <div className='mb-4 h-px bg-zinc-900/[0.06] dark:bg-white/[0.07]' />

                {/* Actions */}
                <div className='flex items-center justify-end gap-2'>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className='rounded-lg px-4 py-2 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-zinc-100'
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] transition-all ${
                      isLoading ? cfg.loadingCls : cfg.confirmCls
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                        <span>{loadingText}</span>
                      </>
                    ) : (
                      confirmText
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
