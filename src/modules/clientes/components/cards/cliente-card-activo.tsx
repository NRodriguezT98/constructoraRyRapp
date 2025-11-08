/**
 * 💳 ClienteCardActivo - Card premium con glassmorphism
 * Muestra vivienda, proyecto, progreso de pago con gradientes purple→violet
 *
 * ⭐ REFACTORIZADO: Usa hook useClienteCardActivo para lógica
 */

'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    Clock,
    Edit,
    Eye,
    Home,
    Trash2,
    TrendingUp,
    User
} from 'lucide-react'

import { CanDelete, CanEdit } from '@/modules/usuarios/components'

import { getAvatarGradient } from '../../../abonos/styles/seleccion-cliente.styles'
import { useClienteCardActivo } from '../../hooks'
import { clientesListaStyles as styles } from '../../styles/clientes-lista.styles'
import type { ClienteResumen } from '../../types'

interface ClienteCardActivoProps {
  cliente: ClienteResumen
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
  onRegistrarAbono?: (cliente: ClienteResumen) => void
}

export function ClienteCardActivo({
  cliente,
  onVer,
  onEditar,
  onEliminar,
  onRegistrarAbono
}: ClienteCardActivoProps) {
  // =====================================================
  // HOOK: Toda la lógica está en useClienteCardActivo
  // =====================================================
  const { datosVivienda, cargando, valorRestante } = useClienteCardActivo({
    clienteId: cliente.id,
  })

  // =====================================================
  // UTILIDADES DE FORMATO
  // =====================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const tiempoUltimaCuota = datosVivienda?.ultimaCuota
    ? formatDistanceToNow(datosVivienda.ultimaCuota, {
        addSuffix: true,
        locale: es,
      })
    : null

  const avatarGradient = getAvatarGradient(cliente.nombre_completo)

  // =====================================================
  // RENDER
  // =====================================================

  // Si está cargando, mostrar skeleton
  if (cargando) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.clienteCard.container}
      >
        <div className={styles.clienteCard.glow} />
        <div className="p-5 space-y-4">
          <div className={`h-6 w-48 ${styles.clienteCard.skeleton}`} />
          <div className={`h-4 w-32 ${styles.clienteCard.skeleton}`} />
          <div className={`h-24 ${styles.clienteCard.skeleton}`} />
          <div className={`h-32 ${styles.clienteCard.skeleton}`} />
        </div>
      </motion.div>
    )
  }

  // Si no hay datos de negociación, mostrar mensaje
  if (!datosVivienda) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.clienteCard.container}
      >
        <div className={styles.clienteCard.glow} />

        <div className="relative z-10 p-5">
          {/* Botones de acción */}
          <div className={styles.clienteCard.headerActions}>
            {onVer && (
              <button
                type="button"
                onClick={() => onVer(cliente)}
                className={styles.clienteCard.actionButton}
                title="Ver detalles"
              >
                <Eye className={styles.clienteCard.actionIcon} />
              </button>
            )}
            <CanEdit modulo="clientes">
              {onEditar && (
                <button
                  type="button"
                  onClick={() => onEditar(cliente)}
                  className={styles.clienteCard.actionButton}
                  title="Editar cliente"
                >
                  <Edit className={styles.clienteCard.actionIcon} />
                </button>
              )}
            </CanEdit>
            <CanDelete modulo="clientes">
              {onEliminar && (
                <button
                  type="button"
                  onClick={() => onEliminar(cliente)}
                  className={styles.clienteCard.actionButton}
                  title="Eliminar cliente"
                >
                  <Trash2 className={styles.clienteCard.actionIcon} />
                </button>
              )}
            </CanDelete>
          </div>

          {/* Avatar + título */}
          <div className={styles.clienteCard.avatarSection}>
            <div className={`${styles.clienteCard.avatar} bg-gradient-to-br ${avatarGradient}`}>
              <User className={styles.clienteCard.avatarIcon} />
            </div>
            <div className={styles.clienteCard.titleGroup}>
              <h3 className={styles.clienteCard.nombre} title={cliente.nombre_completo}>
                {cliente.nombre_completo}
              </h3>
              <p className={styles.clienteCard.documento}>
                {cliente.tipo_documento} {cliente.numero_documento}
              </p>
            </div>
            <span className={styles.clienteCard.badgeActivo}>Activo</span>
          </div>

          {/* Mensaje sin negociación */}
          <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 dark:border-yellow-700/50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 text-center">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              ⚠️ Cliente activo sin negociación registrada
            </p>
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              Crea una negociación desde el detalle del cliente
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={styles.clienteCard.container}
    >
      {/* Glow effect on hover */}
      <div className={styles.clienteCard.glow} />

      {/* Content wrapper */}
      <div className="relative z-10 p-5">
        {/* HEADER: Botones de acción */}
        <div className={styles.clienteCard.headerActions}>
          {onVer && (
            <button
              type="button"
              onClick={() => onVer(cliente)}
              className={styles.clienteCard.actionButton}
              title="Ver detalles"
            >
              <Eye className={styles.clienteCard.actionIcon} />
            </button>
          )}
          <CanEdit modulo="clientes">
            {onEditar && (
              <button
                type="button"
                onClick={() => onEditar(cliente)}
                className={styles.clienteCard.actionButton}
                title="Editar cliente"
              >
                <Edit className={styles.clienteCard.actionIcon} />
              </button>
            )}
          </CanEdit>
          <CanDelete modulo="clientes">
            {onEliminar && (
              <button
                type="button"
                onClick={() => onEliminar(cliente)}
                className={styles.clienteCard.actionButton}
                title="Eliminar cliente"
              >
                <Trash2 className={styles.clienteCard.actionIcon} />
              </button>
            )}
          </CanDelete>
        </div>

        {/* AVATAR + TÍTULO + BADGE */}
        <div className={styles.clienteCard.avatarSection}>
          {/* Avatar con gradient único */}
          <div className={`${styles.clienteCard.avatar} bg-gradient-to-br ${avatarGradient}`}>
            <User className={styles.clienteCard.avatarIcon} />
          </div>

          {/* Título y documento */}
          <div className={styles.clienteCard.titleGroup}>
            <h3 className={styles.clienteCard.nombre} title={cliente.nombre_completo}>
              {cliente.nombre_completo}
            </h3>
            <p className={styles.clienteCard.documento}>
              {cliente.tipo_documento} {cliente.numero_documento}
            </p>
          </div>

          {/* Badge estado */}
          <span className={styles.clienteCard.badgeActivo}>
            Activo
          </span>
        </div>

        {/* SECCIÓN: VIVIENDA ASIGNADA */}
        <div className={styles.clienteCard.viviendaSection}>
          <div className={styles.clienteCard.viviendaHeader}>
            <Home className={styles.clienteCard.viviendaIcon} />
            <span>VIVIENDA ASIGNADA</span>
          </div>

          <div className={styles.clienteCard.viviendaInfo}>
            {/* Proyecto */}
            <div className={styles.clienteCard.viviendaRow}>
              <Building2 className={styles.clienteCard.viviendaRowIcon} />
              <span className="font-medium">{datosVivienda.proyecto}</span>
            </div>

            {/* Manzana + Casa + Valor */}
            <div className={styles.clienteCard.viviendaRowBetween}>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                <Home className="w-3.5 h-3.5" />
                <span>
                  Manzana {datosVivienda.manzana} • Casa {datosVivienda.numero}
                </span>
              </div>
              <span className={styles.clienteCard.viviendaValor}>
                {formatCurrency(datosVivienda.valorTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN: PROGRESO DE PAGO */}
        <div className={styles.clienteCard.progresoSection}>
          {/* Header con porcentaje */}
          <div className={styles.clienteCard.progresoHeader}>
            <div className={styles.clienteCard.progresoTitle}>
              <TrendingUp className={styles.clienteCard.progresoIcon} />
              <span>PROGRESO DE PAGO</span>
            </div>
            <span className={styles.clienteCard.progresoPorcentaje}>
              {datosVivienda.porcentaje}%
            </span>
          </div>

          {/* Barra de progreso con gradient purple */}
          <div className={styles.clienteCard.progresoBar}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${datosVivienda.porcentaje}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className={styles.clienteCard.progresoFill}
            />
          </div>

          {/* Detalle: Pagado + Restante */}
          <div className={styles.clienteCard.progresoDetalle}>
            <div className={styles.clienteCard.progresoDetalleRow}>
              <span className={styles.clienteCard.progresoDetalleLabel}>Pagado:</span>
              <span className={styles.clienteCard.progresoDetalleValue}>
                {formatCurrency(datosVivienda.valorPagado)}
              </span>
            </div>
            <div className={styles.clienteCard.progresoDetalleRow}>
              <span className={styles.clienteCard.progresoDetalleLabel}>Restante:</span>
              <span className={styles.clienteCard.progresoDetalleRestante}>
                {formatCurrency(valorRestante)}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER: Última cuota + Total abonos */}
        <div className={styles.clienteCard.footer}>
          <div className={styles.clienteCard.footerRow}>
            <div className={styles.clienteCard.footerItem}>
              <Clock className={styles.clienteCard.footerIcon} />
              <span>
                {tiempoUltimaCuota
                  ? `Última cuota: ${tiempoUltimaCuota}`
                  : 'Sin abonos registrados'}
              </span>
            </div>
            <div className={styles.clienteCard.footerItem}>
              <Calendar className={styles.clienteCard.footerIcon} />
              <span>{datosVivienda.totalAbonos} abonos</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
