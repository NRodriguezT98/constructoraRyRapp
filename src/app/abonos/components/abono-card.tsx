import { Button } from '@/components/ui/button'
import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { construirURLCliente } from '@/lib/utils/slug.utils'
import { motion } from 'framer-motion'
import {
  Ban,
  Building2,
  Calendar,
  CreditCard,
  Eye,
  FileText,
  Home,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { abonosListStyles, infoIconColors } from './abonos-list.styles'

const s = abonosListStyles.card

/**
 * 🎯 TIPOS
 */
interface AbonoCardProps {
  abono: {
    id: string
    numero_referencia: string | null
    monto: number
    fecha_abono: string
    metodo_pago: string
    notas: string | null
    cliente: {
      id: string
      nombres: string
      apellidos: string
    }
    vivienda: {
      id: string
      numero: string
      manzana: {
        identificador: string
      }
    }
    proyecto: {
      nombre: string
    }
    negociacion: {
      id: string
      estado: 'Activa' | 'Suspendida' | 'Cerrada por Renuncia' | 'Completada'
    }
  }
  onAnular?: (abonoId: string) => void
}

/**
 * 🎨 COMPONENTE: AbonoCard (Modernizado)
 *
 * Card premium de abono con diseño glassmorphism
 * Gradientes, sombras y animaciones fluidas
 */
export function AbonoCard({ abono, onAnular }: AbonoCardProps) {
  const router = useRouter()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleVerDetalle = () => {
    // Generar URL amigable con slug de cliente
    const clienteUrl = construirURLCliente({
      id: abono.cliente.id,
      nombre_completo: `${abono.cliente.nombres} ${abono.cliente.apellidos}`
    })
    router.push(clienteUrl.replace('/clientes/', '/abonos/'))
  }

  const handleAnular = () => {
    if (onAnular) {
      onAnular(abono.id)
    }
  }

  const getBadgeEstado = () => {
    switch (abono.negociacion.estado) {
      case 'Activa':
        return s.badgeActiva
      case 'Suspendida':
        return s.badgeSuspendida
      case 'Cerrada por Renuncia':
        return s.badgeCerrada
      case 'Completada':
        return s.badgeCompletada
      default:
        return s.badgeActiva
    }
  }

  return (
    <motion.div
      className={s.wrapper}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className={s.container}>
        {/* Glow effect on hover */}
        <div className={s.glow} />

        <div className={s.content}>
          {/* 📋 HEADER */}
          <div className={s.header}>
            <div className="flex items-center gap-2">
              <span className={s.referencia}>
                {abono.numero_referencia || 'Sin Referencia'}
              </span>
            </div>
            <div className={s.fecha}>
              <Calendar className={s.fechaIcon} />
              {formatDateForDisplay(abono.fecha_abono)}
            </div>
          </div>

          {/* 💰 MONTO DESTACADO */}
          <div className={s.monto}>
            {formatCurrency(abono.monto)}
          </div>

          {/* 📊 INFO GRID */}
          <div className={s.infoGrid}>
            {/* Cliente */}
            <div className={s.infoItem}>
              <div className={`${s.iconCircle} ${infoIconColors.cliente}`}>
                <User className={s.icon} />
              </div>
              <div className={s.infoText}>
                <p className={s.infoLabel}>Cliente</p>
                <p className={s.infoValue}>
                  {abono.cliente.nombres} {abono.cliente.apellidos}
                </p>
              </div>
            </div>

            {/* Vivienda */}
            <div className={s.infoItem}>
              <div className={`${s.iconCircle} ${infoIconColors.vivienda}`}>
                <Home className={s.icon} />
              </div>
              <div className={s.infoText}>
                <p className={s.infoLabel}>Vivienda</p>
                <p className={s.infoValue}>
                  Manzana {abono.vivienda.manzana.identificador} Casa {abono.vivienda.numero}
                </p>
              </div>
            </div>

            {/* Proyecto */}
            <div className={s.infoItem}>
              <div className={`${s.iconCircle} ${infoIconColors.proyecto}`}>
                <Building2 className={s.icon} />
              </div>
              <div className={s.infoText}>
                <p className={s.infoLabel}>Proyecto</p>
                <p className={s.infoValue}>{abono.proyecto.nombre}</p>
              </div>
            </div>

            {/* Estado de Negociación */}
            <div className={s.infoItem}>
              <div className={`${s.iconCircle} ${infoIconColors.estado}`}>
                <FileText className={s.icon} />
              </div>
              <div className={s.infoText}>
                <p className={s.infoLabel}>Estado</p>
                <span className={`${s.badge} ${getBadgeEstado()}`}>
                  {abono.negociacion.estado}
                </span>
              </div>
            </div>
          </div>

          {/* 💳 MÉTODO DE PAGO */}
          <div className={s.metodo}>
            <CreditCard className={s.metodoIcon} />
            <span className={s.metodoText}>
              {abono.metodo_pago}
            </span>
          </div>

          {/* 📝 NOTAS (Opcional) */}
          {abono.notas && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wide mb-1">
                Notas
              </p>
              <p className="text-sm text-amber-900 dark:text-amber-100">{abono.notas}</p>
            </div>
          )}

          {/* 🎬 FOOTER CON ACCIONES */}
          <div className={s.footer}>
            <Button
              onClick={handleVerDetalle}
              className={`${s.button} ${s.buttonPrimary}`}
            >
              <Eye className={s.buttonIcon} />
              Ver Detalle
            </Button>

            {abono.negociacion.estado === 'Activa' && onAnular && (
              <Button
                onClick={handleAnular}
                className={`${s.button} ${s.buttonDanger}`}
              >
                <Ban className={s.buttonIcon} />
                Anular
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
