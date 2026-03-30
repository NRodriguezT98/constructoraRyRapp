'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Home,
  MapPin,
  Phone,
  Receipt,
} from 'lucide-react'

import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'

import type { RenunciaConInfo } from '../types'

import { renunciaCardStyles as s } from './RenunciaCard.styles'
import { RenunciaMontoBlock } from './RenunciaMontoBlock'

interface RenunciaCardProps {
  renuncia: RenunciaConInfo
  onProcesarDevolucion?: (renuncia: RenunciaConInfo) => void
}

export function RenunciaCard({
  renuncia,
  onProcesarDevolucion,
}: RenunciaCardProps) {
  const esPendiente = renuncia.estado === 'Pendiente Devolución'
  const esCerrada = renuncia.estado === 'Cerrada'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={s.card}
    >
      {/* Barra de color superior según estado */}
      <div className={esPendiente ? s.barPendiente : s.barCerrada} />

      <div className='p-4 pt-3'>
        {/* ── Fila 1: Consecutivo + Badge estado ── */}
        <div className={s.headerRow}>
          <span className={s.consecutivoBadge}>
            <FileText className='h-2.5 w-2.5' />
            {renuncia.consecutivo}
          </span>
          {esPendiente ? (
            <span className={s.estadoPendiente}>
              <Clock className='h-2.5 w-2.5' />
              Pendiente devolución
            </span>
          ) : (
            <span className={s.estadoCerrada}>
              <CheckCircle2 className='h-2.5 w-2.5' />
              Cerrada
            </span>
          )}
        </div>

        {/* ── Fila 2: Cliente ── */}
        <div className='mb-2.5'>
          <p className={s.clienteNombre}>{renuncia.cliente.nombre}</p>
          <div className={s.clienteInfo}>
            <span className={s.clienteDocumento}>
              {renuncia.cliente.tipo_documento} {renuncia.cliente.documento}
            </span>
            {renuncia.cliente.telefono ? (
              <span
                className={`${s.clienteDocumento} inline-flex items-center gap-1`}
              >
                <Phone className='h-3 w-3' />
                {renuncia.cliente.telefono}
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Fila 3: Ubicación + Fechas ── */}
        <div className={s.metadataRow}>
          <span className={s.metadataItem}>
            <Home className={s.metadataIcon} />
            Manzana {renuncia.vivienda.manzana} · Casa{' '}
            {renuncia.vivienda.numero}
          </span>
          <span className={s.metadataItem}>
            <MapPin className={s.metadataIcon} />
            {renuncia.proyecto.nombre}
          </span>
          <span className={s.metadataItem}>
            <Calendar className={s.metadataIcon} />
            {formatDateCompact(renuncia.fecha_renuncia)}
          </span>
          {esCerrada && renuncia.fecha_cierre ? (
            <span className={s.fechaCierreItem}>
              <CheckCircle2 className='h-3 w-3' />
              Cerrada {formatDateCompact(renuncia.fecha_cierre)}
            </span>
          ) : null}
        </div>

        {/* ── Bloque monto ── */}
        <RenunciaMontoBlock
          esPendiente={esPendiente}
          esCerrada={esCerrada}
          montoADevolver={renuncia.monto_a_devolver}
          metodoDevolucion={renuncia.metodo_devolucion}
          requiereDevolucion={renuncia.requiere_devolucion}
          retencionMonto={renuncia.retencion_monto}
          retencionMotivo={renuncia.retencion_motivo}
        />

        {/* ── Motivo ── */}
        <p className={s.motivo}>
          <span className={s.motivoLabel}>Motivo:</span> {renuncia.motivo}
        </p>

        {/* ── Acciones ── */}
        <div className={s.accionesRow}>
          <Link
            href={`/renuncias/${encodeURIComponent(renuncia.consecutivo)}`}
            className={s.btnVerExpediente}
          >
            <Eye className='h-3.5 w-3.5' />
            Ver Expediente
          </Link>
          {esPendiente && onProcesarDevolucion ? (
            <button
              type='button'
              onClick={() => onProcesarDevolucion(renuncia)}
              className={s.btnProcesarDevolucion}
            >
              <Receipt className='h-3.5 w-3.5' />
              Procesar Devolución
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
