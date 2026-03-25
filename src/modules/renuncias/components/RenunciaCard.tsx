'use client'

import { motion } from 'framer-motion'
import { Calendar, DollarSign, Eye, FileText, Home, MapPin, Receipt } from 'lucide-react'
import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'

import { renunciasStyles as styles } from '../styles/renuncias.styles'
import type { RenunciaConInfo } from '../types'
import { formatCOP } from '../utils/renuncias.utils'

interface RenunciaCardProps {
  renuncia: RenunciaConInfo
  onProcesarDevolucion?: (renuncia: RenunciaConInfo) => void
}

export function RenunciaCard({ renuncia, onProcesarDevolucion }: RenunciaCardProps) {
  const esPendiente = renuncia.estado === 'Pendiente Devolución'
  const borderClass = esPendiente ? styles.card.borderPendiente : styles.card.borderCerrada
  const badgeClass = esPendiente ? styles.card.badge.pendiente : styles.card.badge.cerrada

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`${styles.card.container} ${borderClass}`}
    >
      {/* Top row: consecutivo + badge */}
      <div className={styles.card.topRow}>
        <div>
          <p className="text-[10px] font-bold text-red-500 dark:text-red-400 tracking-wider mb-0.5">
            <FileText className="w-3 h-3 inline mr-1" />
            {renuncia.consecutivo}
          </p>
          <p className={styles.card.clienteNombre}>{renuncia.cliente.nombre}</p>
          <p className={styles.card.clienteDocumento}>{renuncia.cliente.tipo_documento} {renuncia.cliente.documento}</p>
        </div>
        <span className={badgeClass}>{renuncia.estado}</span>
      </div>

      {/* Info grid */}
      <div className={styles.card.infoGrid}>
        <div className={styles.card.infoItem}>
          <span className={styles.card.infoLabel}>
            <Home className="w-3 h-3 inline mr-1" />
            Vivienda
          </span>
          <span className={styles.card.infoValue}>
            Manzana {renuncia.vivienda.manzana} Casa No. {renuncia.vivienda.numero}
          </span>
        </div>
        <div className={styles.card.infoItem}>
          <span className={styles.card.infoLabel}>
            <MapPin className="w-3 h-3 inline mr-1" />
            Proyecto
          </span>
          <span className={styles.card.infoValue}>{renuncia.proyecto.nombre}</span>
        </div>
        <div className={styles.card.infoItem}>
          <span className={styles.card.infoLabel}>
            <Calendar className="w-3 h-3 inline mr-1" />
            Fecha
          </span>
          <span className={styles.card.infoValue}>{formatDateCompact(renuncia.fecha_renuncia)}</span>
        </div>
        <div className={styles.card.infoItem}>
          <span className={styles.card.infoLabel}>
            <DollarSign className="w-3 h-3 inline mr-1" />
            Monto a devolver
          </span>
          <span className={styles.card.montoDevolver}>{formatCOP(renuncia.monto_a_devolver)}</span>
        </div>
      </div>

      {/* Motivo truncado */}
      <p className={styles.card.motivoTruncado}>Motivo: {renuncia.motivo}</p>

      {/* Actions */}
      <div className={styles.card.actions}>
        <Link
          href={`/renuncias/${encodeURIComponent(renuncia.consecutivo)}`}
          className={`${styles.card.actionButton} ${styles.card.actionSecondary}`}
        >
          <Eye className="w-3.5 h-3.5" />
          Ver Expediente
        </Link>
        {esPendiente && onProcesarDevolucion ? (
          <button
            type="button"
            onClick={() => onProcesarDevolucion(renuncia)}
            className={`${styles.card.actionButton} ${styles.card.actionPrimary}`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Procesar Devolución
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}
