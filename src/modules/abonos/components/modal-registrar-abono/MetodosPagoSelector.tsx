import { motion } from 'framer-motion'
import { Banknote, CheckCircle2, CreditCard, FileText } from 'lucide-react'

import { Label } from '@/components/ui/label'

import { metodoPagoConfig, modalStyles } from './styles'

const METODOS_PAGO = [
  { value: 'Efectivo', icon: Banknote },
  { value: 'Transferencia', icon: CreditCard },
  { value: 'Cheque', icon: FileText },
] as const

interface MetodosPagoSelectorProps {
  metodoSeleccionado: string
  onSelect: (metodo: string) => void
}

export function MetodosPagoSelector({ metodoSeleccionado, onSelect }: MetodosPagoSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Label className={modalStyles.form.label}>
        Método de Pago <span className={modalStyles.form.required}>*</span>
      </Label>
      <div className={modalStyles.metodos.grid}>
        {METODOS_PAGO.map((metodo, index) => {
          const Icon = metodo.icon
          const isSelected = metodoSeleccionado === metodo.value
          const config = metodoPagoConfig[metodo.value as keyof typeof metodoPagoConfig]

          return (
            <motion.button
              key={metodo.value}
              type="button"
              onClick={() => onSelect(metodo.value)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`${modalStyles.metodos.button} ${
                isSelected
                  ? `${modalStyles.metodos.buttonSelected} bg-gradient-to-br ${config.color}`
                  : modalStyles.metodos.buttonUnselected
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={modalStyles.metodos.checkmark}
                >
                  <CheckCircle2 className={modalStyles.metodos.checkmarkIcon} />
                </motion.div>
              )}
              <Icon
                className={`${modalStyles.metodos.icon} ${
                  isSelected ? modalStyles.metodos.iconSelected : modalStyles.metodos.iconUnselected
                }`}
              />
              <p
                className={`${modalStyles.metodos.label} ${
                  isSelected ? modalStyles.metodos.labelSelected : modalStyles.metodos.labelUnselected
                }`}
              >
                {metodo.value}
              </p>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
