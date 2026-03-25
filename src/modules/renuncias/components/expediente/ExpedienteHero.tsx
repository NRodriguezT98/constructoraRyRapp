'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Clock, FileX, Home, Mail, MapPin, Phone, User } from 'lucide-react'
import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'

import type { ExpedienteData } from '../../types'
import { getTipoDocumentoLabel } from '../../utils/renuncias.utils'
import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'

interface ExpedienteHeroProps {
  datos: ExpedienteData
}

export function ExpedienteHero({ datos }: ExpedienteHeroProps) {
  const { renuncia, duracionDias } = datos
  const esPendiente = renuncia.estado === 'Pendiente Devolución'
  const badgeClass = esPendiente ? styles.hero.estadoBadge.pendiente : styles.hero.estadoBadge.cerrada

  const clienteSnap = renuncia.cliente_datos_snapshot as Record<string, any> | null
  const email = clienteSnap?.email ?? null

  const fechaInicio = datos.negociacion.fecha_negociacion
  const fechaFin = renuncia.fecha_renuncia

  return (
    <>
      {/* Back link */}
      <Link href="/renuncias" className={styles.page.backLink}>
        <ArrowLeft className="w-4 h-4" />
        Volver a Renuncias
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.hero.container}
      >
        <div className={styles.hero.pattern} />
        <div className={styles.hero.content}>
          {/* Top: consecutivo + estado */}
          <div className={styles.hero.topRow}>
            <span className={styles.hero.consecutivoBadge}>
              <FileX className="w-4 h-4" />
              {renuncia.consecutivo}
            </span>
            <span className={badgeClass}>
              {esPendiente ? '⏳' : '✅'} {renuncia.estado}
            </span>
          </div>

          {/* Cliente */}
          <div>
            <h1 className={styles.hero.clienteNombre}>{renuncia.cliente.nombre}</h1>
            <div className={styles.hero.clienteInfo}>
              <span className={styles.hero.clienteInfoItem}>
                <User className="w-3.5 h-3.5" />
                {getTipoDocumentoLabel(renuncia.cliente.tipo_documento)} {renuncia.cliente.documento}
              </span>
              {renuncia.cliente.telefono ? (
                <span className={styles.hero.clienteInfoItem}>
                  <Phone className="w-3.5 h-3.5" />
                  {renuncia.cliente.telefono}
                </span>
              ) : null}
              {email ? (
                <span className={styles.hero.clienteInfoItem}>
                  <Mail className="w-3.5 h-3.5" />
                  {email}
                </span>
              ) : null}
            </div>
          </div>

          {/* Vivienda */}
          <div className={styles.hero.viviendaRow}>
            <MapPin className="w-3.5 h-3.5" />
            <span>Manzana {renuncia.vivienda.manzana}</span>
            <span>·</span>
            <Home className="w-3.5 h-3.5" />
            <span>Casa No. {renuncia.vivienda.numero}</span>
            <span>·</span>
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-semibold">{renuncia.proyecto.nombre}</span>
          </div>

          {/* Motivo */}
          <div className={styles.hero.motivoContainer}>
            <p className={styles.hero.motivoLabel}>Motivo de renuncia</p>
            <p className={styles.hero.motivoText}>{renuncia.motivo}</p>
          </div>

          {/* Duración */}
          {fechaInicio && fechaFin ? (
            <div className={styles.hero.duracion}>
              <Clock className="w-3.5 h-3.5" />
              Duración total: {duracionDias} días ({formatDateCompact(fechaInicio)} → {formatDateCompact(fechaFin)})
            </div>
          ) : null}
        </div>
      </motion.div>
    </>
  )
}
