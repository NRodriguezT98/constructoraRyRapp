/**
 * Paso 2: Fuentes de Pago
 * Configuración de todas las fuentes de financiamiento
 */

'use client'

import { FuentePagoCard } from '@/modules/clientes/components'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { animations, modalStyles } from '../styles'
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
    <motion.div {...animations.step} className={modalStyles.content.fullWidth}>
      {/* Resumen del Valor */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Valor Total a Financiar
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            ${valorTotal.toLocaleString('es-CO')}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Configura las fuentes de pago para cubrir este monto
          </p>
        </div>
      </div>

      {/* Fuentes de Pago - Todas opcionales */}
      <div className="space-y-4">
        {fuentes.map((fuente) => (
          <FuentePagoCard
            key={fuente.tipo}
            tipo={fuente.tipo}
            config={fuente.config}
            obligatorio={false} // Ninguna es obligatoria
            enabled={fuente.enabled}
            valorTotal={valorTotal}
            onEnabledChange={(enabled) => onFuenteEnabledChange(fuente.tipo, enabled)}
            onChange={(config) => onFuenteConfigChange(fuente.tipo, config)}
          />
        ))}
      </div>

      {/* Validación Visual */}
      <div
        className={`rounded-xl border-2 p-6 transition-all ${
          sumaCierra
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : totalFuentes > 0
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Fuentes de Pago:
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${totalFuentes.toLocaleString('es-CO')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor Total Vivienda:
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${valorTotal.toLocaleString('es-CO')}
            </span>
          </div>

          <div className="border-t-2 border-gray-300 pt-3 dark:border-gray-600">
            {sumaCierra ? (
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6" />
                <div>
                  <p className="font-bold">¡Financiamiento completo!</p>
                  <p className="text-sm">Las fuentes cubren exactamente el valor total.</p>
                </div>
              </div>
            ) : diferencia > 0 ? (
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-bold">Faltan ${Math.abs(diferencia).toLocaleString('es-CO')}</p>
                  <p className="text-sm">
                    Ajusta los montos o agrega más fuentes para cubrir el total.
                  </p>
                </div>
              </div>
            ) : diferencia < 0 ? (
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-bold">
                    Excedente de ${Math.abs(diferencia).toLocaleString('es-CO')}
                  </p>
                  <p className="text-sm">
                    Las fuentes superan el valor total. Reduce los montos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-bold">Configura las fuentes de pago</p>
                  <p className="text-sm">
                    Debes cubrir los ${valorTotal.toLocaleString('es-CO')} del valor total.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
