import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Building,
  ChevronRight,
  Hash,
  Mail,
  Phone,
  Sparkles,
  User,
  Wallet
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { NegociacionConAbonos } from '@/modules/abonos/types'

import { animations, headerStyles } from '../styles/abonos-detalle.styles'

interface HeaderClienteProps {
  negociacion: NegociacionConAbonos
  onVolver: () => void
}

/**
 * 🎨 COMPONENTE PRESENTACIONAL - Header Premium
 * Muestra: avatar, info del cliente, breadcrumb, botón volver
 */
export function HeaderCliente({ negociacion, onVolver }: HeaderClienteProps) {
  const { cliente, vivienda, proyecto } = negociacion
  const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.trim()

  return (
    <motion.div
      {...animations.fadeInDown}
      className={headerStyles.container}
    >
      {/* Patrón de fondo animado */}
      <div className={headerStyles.backgroundPattern}>
        <div
          className={headerStyles.patternInner}
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      {/* Efectos de luz */}
      <div className={headerStyles.lightEffect1}></div>
      <div className={headerStyles.lightEffect2}></div>

      <div className={headerStyles.content}>
        {/* Breadcrumb */}
        <div className={headerStyles.breadcrumb}>
          <button
            onClick={onVolver}
            className={headerStyles.breadcrumbButton}
          >
            <Wallet className={headerStyles.metaIcon} />
            <span>Abonos</span>
          </button>
          <ChevronRight className={headerStyles.metaIcon} />
          <span className={headerStyles.breadcrumbCurrent}>{nombreCompleto}</span>
        </div>

        <div className={headerStyles.infoWrapper}>
          {/* Info del cliente */}
          <div className={headerStyles.clienteSection}>
            {/* Avatar grande */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={headerStyles.avatar}
            >
              <User className={headerStyles.avatarIcon} />
            </motion.div>

            <div className="space-y-2">
              <h1 className={headerStyles.title}>
                {nombreCompleto}
                <Sparkles className={headerStyles.sparkle} />
              </h1>

              <div className={headerStyles.metaInfo}>
                <div className={headerStyles.metaItem}>
                  <Hash className={headerStyles.metaIcon} />
                  <span className={headerStyles.metaText}>CC {cliente.numero_documento}</span>
                </div>
                {cliente.telefono && (
                  <div className={headerStyles.metaItem}>
                    <Phone className={headerStyles.metaIcon} />
                    <span className={headerStyles.metaText}>{cliente.telefono}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className={headerStyles.metaItem}>
                    <Mail className={headerStyles.metaIcon} />
                    <span className={headerStyles.metaText}>{cliente.email}</span>
                  </div>
                )}
              </div>

              <div className={headerStyles.projectInfo}>
                <Building className={headerStyles.projectIcon} />
                <span>{proyecto.nombre}</span>
                <span className="text-white/60">•</span>
                <span>
                  Manzana {vivienda.manzana?.nombre
                    ? `${vivienda.manzana.nombre} - Casa Número ${vivienda.numero}`
                    : `Casa Número ${vivienda.numero}`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Botón de volver */}
          <Button
            onClick={onVolver}
            variant="outline"
            className={headerStyles.backButton}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
