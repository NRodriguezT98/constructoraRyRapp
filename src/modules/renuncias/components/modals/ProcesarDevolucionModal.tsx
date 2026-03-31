'use client'

import { useRef } from 'react'

import { motion } from 'framer-motion'
import {
    AlertTriangle,
    CheckCircle,
    DollarSign,
    Loader2,
    Sparkles,
    Upload,
    User,
    X
} from 'lucide-react'


import { useModalProcesarDevolucion } from '../../hooks/useModalProcesarDevolucion'
import type { RenunciaConInfo } from '../../types'
import { formatCOP } from '../../utils/renuncias.utils'

// ─────────────────────────────────────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────────────────────────────────────
const CONFETTI_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 160 - 80,
  y: -(Math.random() * 100 + 40),
  rotate: Math.random() * 360,
  scale: Math.random() * 0.5 + 0.5,
  delay: Math.random() * 0.3,
}))
const CONFETTI_COLORS = ['#FFD700', '#4ECDC4', '#A78BFA', '#06B6D4', '#34D399']

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4',
  container: 'relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700',
  header: 'sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-t-2xl',
  headerTitle: 'text-lg font-bold flex items-center gap-2',
  closeBtn: 'p-1.5 rounded-lg hover:bg-white/20 transition-colors',
  body: 'px-5 py-4 space-y-4',
  footer: 'sticky bottom-0 px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl flex items-center justify-between',
  label: 'block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1',
  input: 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all',
  select: 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all',
  textarea: 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none',
  errorBox: 'flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300',
  infoRow: 'flex items-center gap-2 py-1',
  infoIcon: 'w-4 h-4 text-gray-400 flex-shrink-0',
  infoLabel: 'text-xs text-gray-500 dark:text-gray-400 min-w-[80px]',
  infoValue: 'text-sm font-semibold text-gray-900 dark:text-white',
  btnPrimary: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white text-sm font-semibold hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg',
  btnSecondary: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all',
  uploadZone: 'flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50',
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface ProcesarDevolucionModalProps {
  renuncia: RenunciaConInfo
  onClose: () => void
  onExitosa?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function ProcesarDevolucionModal({
  renuncia,
  onClose,
  onExitosa,
}: ProcesarDevolucionModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    fechaDevolucion,
    setFechaDevolucion,
    metodoDevolucion,
    setMetodoDevolucion,
    numeroComprobante,
    setNumeroComprobante,
    notasCierre,
    setNotasCierre,
    comprobante,
    handleComprobanteChange,
    formularioValido,
    procesando,
    error,
    exitoso,
    handleConfirmar,
    metodosDisponibles,
  } = useModalProcesarDevolucion({ renunciaId: renuncia.id, onExitosa })

  // ── Procesando ─────────────────────────────────────────────────────────
  if (procesando) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.overlay}>
        <motion.div
          initial={{ scale: 0.9 }} animate={{ scale: 1 }}
          className={s.container}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Procesando devolución"
        >
          <div className={s.header}>
            <span className={s.headerTitle}>
              <DollarSign className="w-5 h-5" /> Procesando...
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
              <Loader2 className="w-10 h-10 text-green-500" />
            </motion.div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Registrando devolución...
            </p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ── Éxito ──────────────────────────────────────────────────────────────
  if (exitoso) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.overlay}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={s.container}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Devolución procesada"
        >
          <div className="relative flex flex-col items-center justify-center py-16 px-6 overflow-hidden">
            {CONFETTI_PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale, rotate: p.rotate }}
                transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
                className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: CONFETTI_COLORS[p.id % CONFETTI_COLORS.length] }}
              />
            ))}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Devolución Procesada</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Renuncia cerrada exitosamente — {formatCOP(renuncia.monto_a_devolver)} devueltos
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-1 mt-4 text-xs text-gray-400">
              <Sparkles className="w-3 h-3" />
              <span>Cerrando automáticamente...</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // ── Formulario ─────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.overlay} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={s.container}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Procesar devolución"
      >
        {/* Header */}
        <div className={s.header}>
          <span className={s.headerTitle}>
            <DollarSign className="w-5 h-5" />
            Procesar Devolución
          </span>
          <button onClick={onClose} className={s.closeBtn}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className={s.body}>
          {/* Info renuncia */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-1">
            <div className={s.infoRow}>
              <User className={s.infoIcon} />
              <span className={s.infoLabel}>Cliente:</span>
              <span className={s.infoValue}>{renuncia.cliente.nombre}</span>
            </div>
            <div className={s.infoRow}>
              <DollarSign className={s.infoIcon} />
              <span className={s.infoLabel}>A devolver:</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {formatCOP(renuncia.monto_a_devolver)}
              </span>
            </div>
            {renuncia.retencion_monto > 0 ? (
              <div className={s.infoRow}>
                <DollarSign className={s.infoIcon} />
                <span className={s.infoLabel}>Retenido:</span>
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  {formatCOP(renuncia.retencion_monto)}
                </span>
              </div>
            ) : null}
          </div>

          {/* Fecha */}
          <div>
            <label className={s.label}>Fecha de devolución <span className="text-red-500">*</span></label>
            <input
              type="date"
              className={s.input}
              value={fechaDevolucion}
              onChange={(e) => setFechaDevolucion(e.target.value)}
            />
          </div>

          {/* Método */}
          <div>
            <label className={s.label}>Método de devolución <span className="text-red-500">*</span></label>
            <select
              className={s.select}
              value={metodoDevolucion}
              onChange={(e) => setMetodoDevolucion(e.target.value as any)}
            >
              {metodosDisponibles.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Número comprobante */}
          <div>
            <label className={s.label}>
              Número de comprobante <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              className={s.input}
              value={numeroComprobante}
              onChange={(e) => setNumeroComprobante(e.target.value)}
              placeholder="Ej: TRF-123456"
            />
          </div>

          {/* Upload comprobante */}
          <div>
            <label className={s.label}>
              Comprobante <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleComprobanteChange(e.target.files?.[0] ?? null)}
            />
            {comprobante ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300 truncate flex-1">{comprobante.name}</span>
                <button
                  onClick={() => { handleComprobanteChange(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={s.uploadZone}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
              >
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG (máx 10 MB)</p>
              </div>
            )}
          </div>

          {/* Notas cierre */}
          <div>
            <label className={s.label}>
              Notas de cierre <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              rows={2}
              className={s.textarea}
              value={notasCierre}
              onChange={(e) => setNotasCierre(e.target.value)}
              placeholder="Observaciones sobre la devolución..."
            />
          </div>

          {/* Error */}
          {error ? (
            <div className={s.errorBox}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className={s.footer}>
          <button onClick={onClose} className={s.btnSecondary}>Cancelar</button>
          <button
            onClick={handleConfirmar}
            disabled={!formularioValido}
            className={s.btnPrimary}
          >
            <CheckCircle className="w-4 h-4" />
            Confirmar Devolución
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
