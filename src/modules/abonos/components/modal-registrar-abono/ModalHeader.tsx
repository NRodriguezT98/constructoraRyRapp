import { motion } from 'framer-motion'
import { Sparkles, Wallet } from 'lucide-react'

import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import type { FuentePagoConAbonos } from '../../types'

import { colorSchemes, modalStyles } from './styles'

interface ModalHeaderProps {
  fuente: FuentePagoConAbonos
  esDesembolso: boolean
  montoAprobado: number
  saldoPendiente: number
  formatCurrency: (value: number) => string
}

export function ModalHeader({
  fuente,
  esDesembolso,
  montoAprobado,
  saldoPendiente,
  formatCurrency,
}: ModalHeaderProps) {
  const colorScheme = colorSchemes[fuente.tipo as keyof typeof colorSchemes] || colorSchemes['Cuota Inicial']

  // Texto personalizado según tipo de fuente
  const getTextoMontoLabel = () => {
    if (fuente.tipo === 'Cuota Inicial') return 'Valor Total Pactado'
    return 'Monto Aprobado'
  }

  return (
    <div className={`${modalStyles.header.container} bg-gradient-to-br ${colorScheme.gradient}`}>
      {/* Patrón de fondo */}
      <div className={modalStyles.header.pattern}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Efectos de luz */}
      <div className={modalStyles.header.lightEffect.top} />
      <div className={modalStyles.header.lightEffect.bottom} />

      <DialogHeader className="relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3"
        >
          <div className={modalStyles.header.iconWrapper}>
            <Wallet className={modalStyles.header.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className={modalStyles.header.title}>
              <span className="truncate">{esDesembolso ? 'Registrar Desembolso' : 'Registrar Abono'}</span>
              <Sparkles className={modalStyles.header.sparkle} />
            </DialogTitle>
            <DialogDescription className={modalStyles.header.subtitle}>
              <span className="truncate block">{fuente.tipo} {fuente.entidad && `• ${fuente.entidad}`}</span>
            </DialogDescription>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={modalStyles.header.infoCard}
        >
          <div className={modalStyles.header.infoGrid}>
            <div>
              <p className={modalStyles.header.infoLabel}>{getTextoMontoLabel()}</p>
              <p className={modalStyles.header.infoValue}>{formatCurrency(montoAprobado)}</p>
            </div>
            <div>
              <p className={modalStyles.header.infoLabel}>Saldo Pendiente</p>
              <p className={modalStyles.header.infoValue}>{formatCurrency(saldoPendiente)}</p>
            </div>
          </div>
        </motion.div>
      </DialogHeader>
    </div>
  )
}
