'use client'

/**
 * Modal de reactivación de cliente
 * Flujo: Confirmar → Loading (doble anillo) → Éxito (con animación)
 */

import { RefreshCw, UserCheck, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { motion } from 'framer-motion'

type ModalState = 'confirm' | 'loading' | 'success'

interface ReactivarClienteModalProps {
  isOpen: boolean
  nombreCliente: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

const OVERLAY_CLS =
  'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[3px]'
const CONTAINER_CLS =
  'relative w-full max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-white/10'

const PARTICLE_COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#3b82f6']

export function ReactivarClienteModal({
  isOpen,
  nombreCliente,
  onClose,
  onConfirm,
}: ReactivarClienteModalProps) {
  const [estado, setEstado] = useState<ModalState>('confirm')
  const prevOpen = useRef(isOpen)

  // Resetear al 'confirm' cada vez que el modal se re-abra
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      setEstado('confirm')
    }
    prevOpen.current = isOpen
  }, [isOpen])

  const handleConfirmar = async () => {
    setEstado('loading')
    try {
      await onConfirm()
      setEstado('success')
      setTimeout(() => onClose(), 2400)
    } catch {
      setEstado('confirm')
    }
  }

  if (typeof window === 'undefined' || !isOpen) return null

  // ── LOADING ───────────────────────────────────────────────────────────
  if (estado === 'loading') {
    return createPortal(
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={OVERLAY_CLS}>
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className={CONTAINER_CLS}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Reactivando cliente"
        >
          {/* Ambient glow cyan */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at bottom right, rgba(6,182,212,0.10) 0%, transparent 65%)' }}
          />
          {/* Left accent bar */}
          <div
            className="absolute bottom-0 left-0 top-0 w-[3px]"
            style={{ background: 'linear-gradient(to bottom, #06b6d4 0%, transparent 100%)' }}
          />

          <div className="flex flex-col items-center justify-center py-14 px-6 gap-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 dark:text-cyan-400">
              Reactivando cliente...
            </p>

            {/* Doble anillo — mismo patrón que formularios de clientes/viviendas/proyectos */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-900 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin" />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Procesando cambio de estado
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Esto tomará solo un momento
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>,
      document.body
    )
  }

  // ── ÉXITO ─────────────────────────────────────────────────────────────
  if (estado === 'success') {
    return createPortal(
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={OVERLAY_CLS}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className={CONTAINER_CLS}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Cliente reactivado exitosamente"
        >
          {/* Ambient glow verde */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at bottom right, rgba(16,185,129,0.12) 0%, transparent 65%)' }}
          />
          {/* Left accent bar verde */}
          <div
            className="absolute bottom-0 left-0 top-0 w-[3px]"
            style={{ background: 'linear-gradient(to bottom, #10b981 0%, transparent 100%)' }}
          />

          <div className="flex flex-col items-center justify-center py-12 px-6 overflow-hidden relative">
            {/* Partículas de confeti */}
            {PARTICLE_COLORS.map((color, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: Math.cos(i * (Math.PI / 4)) * 70,
                  y: Math.sin(i * (Math.PI / 4)) * 70,
                  opacity: 0,
                  scale: 1.4,
                }}
                transition={{ duration: 1.1, delay: 0.05, ease: 'easeOut' }}
                className="absolute top-[30%] left-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}

            {/* Ícono de éxito */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-xl shadow-cyan-500/30"
            >
              <UserCheck className="w-10 h-10 text-white" />
            </motion.div>

            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="text-center mt-5"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                ¡Cliente Reactivado!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">{nombreCliente}</span>{' '}
                ahora está en estado{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Interesado</span>
              </p>
            </motion.div>

            {/* Cierre automático */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-1.5 mt-5 text-xs text-gray-400 dark:text-gray-500"
            >
              <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-gray-500 dark:border-t-gray-300 animate-spin" />
              <span>Cerrando automáticamente...</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>,
      document.body
    )
  }

  // ── CONFIRM (estado por defecto) ───────────────────────────────────────
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={OVERLAY_CLS}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className={CONTAINER_CLS}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar reactivación de cliente"
      >
        {/* Ambient glow cyan */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at bottom right, rgba(6,182,212,0.10) 0%, transparent 65%)' }}
        />
        {/* Left accent bar */}
        <div
          className="absolute bottom-0 left-0 top-0 w-[3px]"
          style={{ background: 'linear-gradient(to bottom, #06b6d4 0%, transparent 100%)' }}
        />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3.5 top-3.5 z-10 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-black/[0.06] hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-white/[0.07] dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative pb-5 pl-6 pr-5 pt-5">
          {/* Ícono + Título */}
          <div className="mb-3.5 flex items-start gap-3 pr-8">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/25">
              <RefreshCw className="h-4 w-4 text-cyan-400" />
            </div>
            <h2 className="text-[15px] font-semibold leading-snug text-zinc-900 dark:text-white">
              ¿Reactivar cliente?
            </h2>
          </div>

          {/* Mensaje */}
          <div className="mb-5 pl-11 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            <p>
              El estado de{' '}
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">{nombreCliente}</span>{' '}
              cambiará a{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">"Interesado"</span>{' '}
              y podrá asignársele una nueva vivienda.
            </p>
          </div>

          {/* Separador */}
          <div className="mb-4 h-px bg-zinc-900/[0.06] dark:bg-white/[0.07]" />

          {/* Acciones */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-zinc-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] transition-all duration-150 shadow-[0_4px_18px_rgba(6,182,212,0.38)]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reactivar Cliente
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}
