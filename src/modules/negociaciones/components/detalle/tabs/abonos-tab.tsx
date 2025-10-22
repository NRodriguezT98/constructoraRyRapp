/**
 * Tab: Abonos
 *
 * Muestra el historial de abonos y progreso de pago
 */

import { motion } from 'framer-motion'
import { Calendar, DollarSign, Plus, Receipt, TrendingUp } from 'lucide-react'
import * as styles from '../../../styles/detalle.styles'

interface AbonosTabProps {
  abonos: any[]
  totalesPago: {
    totalPagado: number
    saldoPendiente: number
    porcentajePagado: number
    valorTotal: number
  }
  cargandoAbonos: boolean
}

export function AbonosTab({ abonos, totalesPago, cargandoAbonos }: AbonosTabProps) {
  const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`

  const esPagoCompleto = totalesPago.porcentajePagado >= 100

  return (
    <motion.div {...styles.animations.fadeInUp} className="space-y-6">
      {/* Resumen de Pagos */}
      <div className={styles.cardClasses.container}>
        <h3 className={styles.cardClasses.subtitle}>
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Progreso de Pago
        </h3>

        <div className="space-y-4">
          {/* Barra de Progreso */}
          <div className={styles.progressClasses.container}>
            <div className={styles.progressClasses.label}>
              <span className={styles.progressClasses.labelText}>Pago Completado</span>
              <span className={styles.progressClasses.labelValue}>
                {totalesPago.porcentajePagado.toFixed(1)}%
              </span>
            </div>
            <div className={styles.progressClasses.barContainer}>
              <div
                className={
                  esPagoCompleto
                    ? styles.progressClasses.barGreen
                    : styles.progressClasses.bar
                }
                style={{ width: `${Math.min(totalesPago.porcentajePagado, 100)}%` }}
              />
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Valor Total</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalesPago.valorTotal)}
              </div>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">Total Pagado</div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalesPago.totalPagado)}
              </div>
            </div>
            <div
              className={`rounded-lg p-4 ${
                totalesPago.saldoPendiente > 0
                  ? 'bg-orange-50 dark:bg-orange-900/20'
                  : 'bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div
                className={`text-xs mb-1 ${
                  totalesPago.saldoPendiente > 0
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                Saldo Pendiente
              </div>
              <div
                className={`text-xl font-bold ${
                  totalesPago.saldoPendiente > 0
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}
              >
                {formatCurrency(totalesPago.saldoPendiente)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Abonos */}
      <div className={styles.cardClasses.container}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={styles.cardClasses.subtitle}>
            <Receipt className="h-5 w-5 text-purple-600" />
            Historial de Abonos ({abonos.length})
          </h3>
          <button className={styles.buttonClasses.primary}>
            <Plus className={styles.buttonClasses.icon} />
            Registrar Abono
          </button>
        </div>

        {cargandoAbonos ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Cargando abonos...</p>
          </div>
        ) : abonos.length === 0 ? (
          <div className={styles.emptyClasses.container}>
            <Receipt className={styles.emptyClasses.icon} />
            <h4 className={styles.emptyClasses.title}>Sin abonos registrados</h4>
            <p className={styles.emptyClasses.description}>
              Aún no se han registrado abonos para esta negociación.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {abonos.map((abono, idx) => (
              <div
                key={abono.id || idx}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(abono.monto || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {abono.fuente_pago?.tipo || 'Fuente no especificada'}
                      </p>
                    </div>
                  </div>
                  {abono.numero_referencia && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 ml-13">
                      Ref: {abono.numero_referencia}
                    </p>
                  )}
                  {abono.metodo_pago && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 ml-13">
                      Método: {abono.metodo_pago}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {abono.fecha_abono
                      ? new Date(abono.fecha_abono).toLocaleDateString('es-CO')
                      : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
