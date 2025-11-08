import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, DollarSign, TrendingUp } from 'lucide-react'

import { Label } from '@/components/ui/label'

import type { FuentePagoConAbonos } from '../../types'

import { colorSchemes, modalStyles } from './styles'

interface CampoMontoProps {
  esDesembolso: boolean
  fuente: FuentePagoConAbonos
  monto: string
  montoAutomatico: number | null
  saldoPendiente: number
  montoIngresado: number
  error?: string
  onChange: (value: string) => void
  formatCurrency: (value: number) => string
}

export function CampoMonto({
  esDesembolso,
  fuente,
  monto,
  montoAutomatico,
  saldoPendiente,
  montoIngresado,
  error,
  onChange,
  formatCurrency,
}: CampoMontoProps) {
  const colorScheme = colorSchemes[fuente.tipo as keyof typeof colorSchemes] || colorSchemes['Cuota Inicial']

  // Si es desembolso completo, mostrar monto bloqueado
  if (esDesembolso) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className={`${modalStyles.form.desembolsoCard} ${colorScheme.bg} ${colorScheme.border}`}
      >
        <div className={modalStyles.form.desembolsoHeader}>
          <div className={`${modalStyles.form.desembolsoIconWrapper} bg-gradient-to-br ${colorScheme.gradient}`}>
            <TrendingUp className={modalStyles.form.desembolsoIcon} />
          </div>
          <div>
            <p className={modalStyles.form.desembolsoTitle}>Monto del Desembolso</p>
            <p className={modalStyles.form.desembolsoSubtitle}>Valor completo aprobado</p>
          </div>
        </div>
        <p className={modalStyles.form.desembolsoMonto}>{formatCurrency(montoAutomatico || 0)}</p>
      </motion.div>
    )
  }

  // Formatear el valor para mostrar con separadores de miles
  const formatearParaMostrar = (valor: string): string => {
    if (!valor) return ''
    // Eliminar todo excepto dígitos
    const numeros = valor.replace(/\D/g, '')
    if (!numeros) return ''
    // Formatear con separadores de miles
    return new Intl.NumberFormat('es-CO').format(parseInt(numeros))
  }

  // Manejar cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    // Solo permitir dígitos y eliminar separadores
    const valorNumerico = valor.replace(/\D/g, '')
    onChange(valorNumerico)
  }

  // Si es cuota inicial, mostrar input manual
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Label htmlFor="monto" className={modalStyles.form.label}>
        <DollarSign className={modalStyles.form.labelIcon} />
        Monto a Abonar <span className={modalStyles.form.required}>*</span>
      </Label>
      <div className={modalStyles.form.montoWrapper}>
        <span className={modalStyles.form.montoPrefix}>$</span>
        <input
          type="text"
          id="monto"
          inputMode="numeric"
          value={formatearParaMostrar(monto)}
          onChange={handleInputChange}
          className={`${modalStyles.form.montoInput} ${
            error ? modalStyles.form.montoInputError : modalStyles.form.montoInputValid
          }`}
          placeholder="0"
        />
      </div>

      {/* Mensaje de error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={modalStyles.form.errorContainer}
          >
            <AlertCircle className={modalStyles.form.errorIcon} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview del nuevo saldo */}
      {montoIngresado > 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${modalStyles.form.preview} mt-3`}
        >
          <div className={modalStyles.form.previewContent}>
            <span className={modalStyles.form.previewLabel}>Nuevo Saldo Pendiente:</span>
            <span className={modalStyles.form.previewValue}>
              {formatCurrency(saldoPendiente - montoIngresado)}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
