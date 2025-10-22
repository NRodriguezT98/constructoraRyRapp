/**
 * Tab: Fuentes de Pago
 *
 * Muestra y gestiona las fuentes de pago configuradas
 * Integra el componente ConfigurarFuentesPago existente
 */

import { ConfigurarFuentesPago } from '@/modules/clientes/components/negociaciones'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, CreditCard, DollarSign } from 'lucide-react'
import * as styles from '../../../styles/detalle.styles'

interface FuentesPagoTabProps {
  negociacionId: string
  valorTotal: number
  fuentesPago: any[]
  totales: {
    totalFuentes: number
    porcentajeCubierto: number
    diferencia: number
  }
  onActualizar: () => void
}

export function FuentesPagoTab({
  negociacionId,
  valorTotal,
  fuentesPago,
  totales,
  onActualizar,
}: FuentesPagoTabProps) {
  const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`

  const estaCubierto = totales.porcentajeCubierto >= 100
  const faltaPorCubrir = totales.diferencia > 0

  return (
    <motion.div {...styles.animations.fadeInUp} className="space-y-6">
      {/* Resumen de Cobertura */}
      <div className={styles.cardClasses.container}>
        <h3 className={styles.cardClasses.subtitle}>
          <DollarSign className="h-5 w-5 text-purple-600" />
          Resumen de Cobertura
        </h3>

        <div className="space-y-4">
          {/* Barra de Progreso */}
          <div className={styles.progressClasses.container}>
            <div className={styles.progressClasses.label}>
              <span className={styles.progressClasses.labelText}>Cobertura Total</span>
              <span className={styles.progressClasses.labelValue}>
                {totales.porcentajeCubierto.toFixed(1)}%
              </span>
            </div>
            <div className={styles.progressClasses.barContainer}>
              <div
                className={
                  estaCubierto
                    ? styles.progressClasses.barGreen
                    : styles.progressClasses.bar
                }
                style={{ width: `${Math.min(totales.porcentajeCubierto, 100)}%` }}
              />
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Valor Total</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(valorTotal)}
              </div>
            </div>
            <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3">
              <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Cubierto</div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(totales.totalFuentes)}
              </div>
            </div>
            <div
              className={`rounded-lg p-3 ${
                faltaPorCubrir
                  ? 'bg-orange-50 dark:bg-orange-900/20'
                  : 'bg-green-50 dark:bg-green-900/20'
              }`}
            >
              <div
                className={`text-xs mb-1 ${
                  faltaPorCubrir
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {faltaPorCubrir ? 'Faltante' : 'Excedente'}
              </div>
              <div
                className={`text-lg font-bold ${
                  faltaPorCubrir
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-green-700 dark:text-green-300'
                }`}
              >
                {formatCurrency(Math.abs(totales.diferencia))}
              </div>
            </div>
          </div>

          {/* Alerta de Estado */}
          {faltaPorCubrir && (
            <div className="flex items-start gap-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4 border border-orange-200 dark:border-orange-800">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  ⚠️ Falta configurar fuentes de pago
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Faltan {formatCurrency(totales.diferencia)} por cubrir del valor total de la vivienda.
                </p>
              </div>
            </div>
          )}

          {estaCubierto && (
            <div className="flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✅ Fuentes de pago completas
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  El valor total está 100% cubierto con las fuentes configuradas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Componente de Configuración */}
      <div className={styles.cardClasses.container}>
        <h3 className={styles.cardClasses.subtitle}>
          <CreditCard className="h-5 w-5 text-purple-600" />
          Configurar Fuentes de Pago
        </h3>
        <ConfigurarFuentesPago
          negociacionId={negociacionId}
          valorTotal={valorTotal}
          onFuentesActualizadas={onActualizar}
        />
      </div>

      {/* Lista de Fuentes Configuradas */}
      {fuentesPago.length > 0 && (
        <div className={styles.cardClasses.container}>
          <h3 className={styles.cardClasses.subtitle}>
            Fuentes Configuradas ({fuentesPago.length})
          </h3>
          <div className="space-y-3">
            {fuentesPago.map((fuente, idx) => (
              <div
                key={fuente.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {fuente.tipo}
                    </span>
                    {fuente.permite_multiples_abonos && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Múltiples abonos
                      </span>
                    )}
                  </div>
                  {fuente.entidad && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {fuente.entidad}
                    </p>
                  )}
                  {fuente.numero_referencia && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Ref: {fuente.numero_referencia}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(fuente.monto_aprobado || 0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {((fuente.monto_aprobado / valorTotal) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
