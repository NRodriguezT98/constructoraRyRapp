'use client'

import { FuentePagoCard } from '@/modules/clientes/components'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, DollarSign, Info } from 'lucide-react'
import type { FuentePagoConfig, FuentePagoConfiguracion } from '../types'

interface Paso2FuentesPagoProps {
  fuentes: FuentePagoConfiguracion[]
  valorTotal: number
  totalFuentes: number
  diferencia: number
  sumaCierra: boolean
  onFuenteEnabledChange: (tipo: TipoFuentePago, enabled: boolean) => void
  onFuenteConfigChange: (tipo: TipoFuentePago, config: FuentePagoConfig | null) => void
}

export function Paso2FuentesPago({
  fuentes,
  valorTotal,
  totalFuentes,
  diferencia,
  sumaCierra,
  onFuenteEnabledChange,
  onFuenteConfigChange,
}: Paso2FuentesPagoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      <div className="space-y-3">
        {fuentes.map((fuente) => (
          <FuentePagoCard
            key={fuente.tipo}
            tipo={fuente.tipo}
            config={fuente.config}
            obligatorio={false}
            enabled={fuente.enabled}
            valorTotal={valorTotal}
            onEnabledChange={(enabled) => onFuenteEnabledChange(fuente.tipo, enabled)}
            onChange={(config) => onFuenteConfigChange(fuente.tipo, config)}
          />
        ))}
      </div>

      <div
        className={`rounded-lg border-2 p-4 transition-all ${
          sumaCierra
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
            : totalFuentes > 0
              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
              : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Total Fuentes de Pago
            </span>
            <span className={`text-base font-semibold ${
              sumaCierra
                ? 'text-green-600 dark:text-green-400'
                : totalFuentes > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
            }`}>
              ${totalFuentes.toLocaleString('es-CO')}
            </span>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Diferencia
            </span>
            <span className={`text-base font-semibold ${
              sumaCierra
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              ${diferencia.toLocaleString('es-CO')}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-2.5 p-3 rounded-lg ${
              sumaCierra
                ? 'bg-green-100 dark:bg-green-900/20'
                : totalFuentes > 0
                  ? 'bg-red-100 dark:bg-red-900/20'
                  : 'bg-gray-100 dark:bg-gray-800/50'
            }`}
          >
            {sumaCierra ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-green-800 dark:text-green-200">
                    ¡Perfecto! Las fuentes cubren exactamente el valor total
                  </p>
                  <p className="text-[10px] text-green-700 dark:text-green-300 mt-0.5">
                    Puedes continuar al siguiente paso
                  </p>
                </div>
              </>
            ) : totalFuentes > 0 ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-800 dark:text-red-200">
                    Las fuentes no coinciden con el valor total
                  </p>
                  <p className="text-[10px] text-red-700 dark:text-red-300 mt-0.5">
                    {diferencia > 0
                      ? `Falta cubrir $${diferencia.toLocaleString('es-CO')}`
                      : `Sobra $${Math.abs(diferencia).toLocaleString('es-CO')}`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Info className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Activa y configura las fuentes de pago necesarias
                  </p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                    La suma debe ser exactamente ${valorTotal.toLocaleString('es-CO')}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
