'use client'

/**
 * ImpactoFinancieroModal - Modal que muestra el impacto de cambiar valor_base
 * cuando la vivienda tiene una negociación activa.
 *
 * Opciones para el admin:
 * 1. Guardar + Sincronizar negociación (actualiza valor_negociado)
 * 2. Guardar sin sincronizar (dejar valores independientes)
 * 3. Cancelar
 */

import { motion } from 'framer-motion'
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    DollarSign,
    Loader2,
    RefreshCw,
    ShieldAlert,
    User,
    XCircle,
} from 'lucide-react'

import { Modal } from '@/shared/components/ui/Modal'
import { formatCurrency } from '@/shared/utils/format'

import type { ImpactoFinanciero } from '../hooks/useEditarVivienda'

interface ImpactoFinancieroModalProps {
  isOpen: boolean
  onClose: () => void
  impacto: ImpactoFinanciero
  onConfirmarConSync: () => void
  onConfirmarSinSync: () => void
  isLoading: boolean
}

export function ImpactoFinancieroModal({
  isOpen,
  onClose,
  impacto,
  onConfirmarConSync,
  onConfirmarSinSync,
  isLoading,
}: ImpactoFinancieroModalProps) {
  const { negociacion, valorBaseAnterior, valorBaseNuevo, diferencia, bloqueado, motivoBloqueo } = impacto
  const subio = diferencia > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Impacto Financiero Detectado"
      description="El cambio de precio afecta una negociación activa"
      size="md"
      gradientColor="orange"
      icon={<AlertTriangle className="w-6 h-6 text-white" />}
    >
      <div className="space-y-4 px-6 py-4">
        {/* Cliente afectado */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40">
          <div className="w-9 h-9 rounded-lg bg-cyan-600/10 dark:bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cliente con negociación activa</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {negociacion.cliente_nombre}
            </p>
          </div>
        </div>

        {/* Comparación de valores */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
            {/* Valor anterior */}
            <div className="p-3 text-center bg-red-50/50 dark:bg-red-950/10">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Valor anterior</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                {formatCurrency(valorBaseAnterior)}
              </p>
            </div>
            {/* Valor nuevo */}
            <div className="p-3 text-center bg-emerald-50/50 dark:bg-emerald-950/10">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Valor nuevo</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                {formatCurrency(valorBaseNuevo)}
              </p>
            </div>
          </div>
          {/* Diferencia */}
          <div className={`flex items-center justify-center gap-2 py-2.5 ${
            subio
              ? 'bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-800/40'
              : 'bg-emerald-50 dark:bg-emerald-950/20 border-t border-emerald-200 dark:border-emerald-800/40'
          }`}>
            {subio ? (
              <ArrowUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className={`text-sm font-bold tabular-nums ${
              subio ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}>
              {subio ? '+' : ''}{formatCurrency(diferencia)}
            </span>
          </div>
        </div>

        {/* Datos financieros actuales */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Negociación actual
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Valor negociado:</span>
            <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
              {formatCurrency(negociacion.valor_negociado)}
            </span>
          </div>
          {negociacion.descuento_aplicado > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Descuento:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                -{formatCurrency(negociacion.descuento_aplicado)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total abonado:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(negociacion.total_abonado)}
            </span>
          </div>
        </div>

        {/* Bloqueo */}
        {bloqueado ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40"
          >
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">Cambio no permitido</p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{motivoBloqueo}</p>
            </div>
          </motion.div>
        ) : null}

        {/* Nota informativa */}
        {!bloqueado ? (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/40 p-2.5">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Sincronizar</strong> actualizará el valor negociado al nuevo precio. Después deberás
              redistribuir las fuentes de pago desde la pestaña Negociación del cliente.
            </p>
          </div>
        ) : null}

        {/* Acciones */}
        <div className="flex flex-col gap-2 pt-1">
          {!bloqueado ? (
            <>
              {/* Opción 1: Guardar + Sincronizar */}
              <button
                onClick={onConfirmarConSync}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Guardar y sincronizar negociación
              </button>

              {/* Opción 2: Guardar sin sincronizar */}
              <button
                onClick={onConfirmarSinSync}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-600 transition-all disabled:opacity-50"
              >
                <DollarSign className="w-4 h-4" />
                Solo guardar vivienda (no sincronizar)
              </button>
            </>
          ) : null}

          {/* Cancelar */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  )
}
