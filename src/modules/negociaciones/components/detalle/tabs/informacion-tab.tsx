/**
 * Tab: Información General
 *
 * Muestra resumen financiero, datos de vivienda/cliente y acciones
 */

import { motion } from 'framer-motion'
import {
    AlertCircle,
    DollarSign,
    FileText,
    Home,
    Pause,
    XCircle
} from 'lucide-react'
import * as styles from '../../../styles/detalle.styles'

interface InformacionTabProps {
  negociacion: any
  totalesPago: any
  esActiva: boolean
  estaSuspendida: boolean
  onSuspender: () => void
  onReactivar: () => void
  onRenuncia: () => void
}

export function InformacionTab({
  negociacion,
  totalesPago,
  esActiva,
  estaSuspendida,
  onSuspender,
  onReactivar,
  onRenuncia,
}: InformacionTabProps) {
  const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`

  return (
    <motion.div {...styles.animations.fadeInUp} className="space-y-6">
      {/* Resumen Financiero */}
      <div className={styles.cardClasses.container}>
        <h3 className={styles.cardClasses.subtitle}>
          <DollarSign className="h-5 w-5 text-purple-600" />
          Resumen Financiero
        </h3>
        <div className="space-y-3">
          <div className={styles.infoClasses.row}>
            <span className={styles.infoClasses.label}>Valor Negociado</span>
            <span className={styles.infoClasses.value}>
              {formatCurrency(negociacion.valor_negociado || 0)}
            </span>
          </div>
          {negociacion.descuento_aplicado > 0 && (
            <div className={styles.infoClasses.row}>
              <span className={styles.infoClasses.label}>Descuento Aplicado</span>
              <span className={styles.infoClasses.valueSuccess}>
                -{formatCurrency(negociacion.descuento_aplicado)}
              </span>
            </div>
          )}
          <div className={`${styles.infoClasses.row} border-t-2 pt-3`}>
            <span className={`${styles.infoClasses.label} font-bold`}>Valor Total</span>
            <span className={styles.infoClasses.valueLarge}>
              {formatCurrency(negociacion.valor_total || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Notas */}
      {negociacion.notas && (
        <div className={styles.cardClasses.container}>
          <h3 className={styles.cardClasses.subtitle}>
            <FileText className="h-5 w-5 text-purple-600" />
            Notas
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {negociacion.notas}
          </p>
        </div>
      )}

      {/* Acciones */}
      {(esActiva || estaSuspendida) && (
        <div className={styles.cardClasses.container}>
          <h3 className={styles.cardClasses.subtitle}>
            <AlertCircle className="h-5 w-5 text-purple-600" />
            Acciones
          </h3>
          <div className="flex flex-wrap gap-3">
            {esActiva && (
              <>
                <button onClick={onSuspender} className={styles.buttonClasses.warning}>
                  <Pause className={styles.buttonClasses.icon} />
                  Suspender Negociación
                </button>
                <button onClick={onRenuncia} className={styles.buttonClasses.danger}>
                  <XCircle className={styles.buttonClasses.icon} />
                  Registrar Renuncia
                </button>
              </>
            )}
            {estaSuspendida && (
              <button onClick={onReactivar} className={styles.buttonClasses.success}>
                <Home className={styles.buttonClasses.icon} />
                Reactivar Negociación
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
