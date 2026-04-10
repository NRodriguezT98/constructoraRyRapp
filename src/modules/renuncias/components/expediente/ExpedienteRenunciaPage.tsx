'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  DollarSign,
  Home,
  Landmark,
  Receipt,
  Shield,
} from 'lucide-react'

import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'

import { useExpedienteRenuncia } from '../../hooks/useExpedienteRenuncia'
import { ProcesarDevolucionModal } from '../modals/ProcesarDevolucionModal'

import { ExpedienteAbonos } from './ExpedienteAbonos'
import { ExpedienteAuditoria } from './ExpedienteAuditoria'
import { ExpedienteFinanciero } from './ExpedienteFinanciero'
import { ExpedienteFuentes } from './ExpedienteFuentes'
import { ExpedienteHero } from './ExpedienteHero'
import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'
import { ExpedienteTimeline } from './ExpedienteTimeline'
import { ExpedienteVivienda } from './ExpedienteVivienda'

interface ExpedienteRenunciaPageProps {
  consecutivo: string
}

const TABS = [
  { key: 'financiero', label: 'Financiero', icon: DollarSign },
  { key: 'vivienda', label: 'Vivienda', icon: Home },
  { key: 'fuentes', label: 'Fuentes', icon: Landmark },
  { key: 'abonos', label: 'Abonos', icon: Receipt },
  { key: 'auditoria', label: 'Auditoría', icon: Shield },
] as const

type TabKey = (typeof TABS)[number]['key']

export function ExpedienteRenunciaPage({
  consecutivo,
}: ExpedienteRenunciaPageProps) {
  const { datos, cargando, error, recargar } =
    useExpedienteRenuncia(consecutivo)
  const [tabActiva, setTabActiva] = useState<TabKey>('financiero')
  const [modalDevolucionAbierto, setModalDevolucionAbierto] = useState(false)

  // === LOADING ===
  if (cargando) {
    return (
      <div className={styles.page.container}>
        <div className={styles.page.content}>
          <div className={styles.loading.container}>
            <div className={styles.loading.heroSkeleton} />
            <div className={styles.loading.timelineSkeleton} />
            <div className={styles.loading.tabsSkeleton} />
            <div className={styles.loading.contentSkeleton} />
          </div>
        </div>
      </div>
    )
  }

  // === ERROR ===
  if (error || !datos) {
    return (
      <div className={styles.page.container}>
        <div className={styles.page.content}>
          <div className={styles.error.container}>
            <div className={styles.error.iconCircle}>
              <AlertCircle className={styles.error.icon} />
            </div>
            <h2 className={styles.error.title}>No se encontró el expediente</h2>
            <p className={styles.error.message}>
              {error ?? `No existe la renuncia con consecutivo ${consecutivo}`}
            </p>
            <Link href='/renuncias' className={styles.error.backButton}>
              <ArrowLeft className='h-4 w-4' />
              Volver a renuncias
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // === CONTENIDO ===
  const esPendiente = datos.renuncia.estado === 'Pendiente Devolución'

  return (
    <div className={styles.page.container}>
      <div className={styles.page.content}>
        {/* Hero — incluye botón Procesar Devolución cuando es pendiente */}
        <ExpedienteHero
          datos={datos}
          onProcesarDevolucion={
            esPendiente ? () => setModalDevolucionAbierto(true) : undefined
          }
        />

        {/* Timeline */}
        <ExpedienteTimeline hitos={datos.timeline} />

        {/* Snapshot Banner */}
        <div className={styles.snapshotBanner.container}>
          <div className={styles.snapshotBanner.iconCircle}>
            <Camera className={styles.snapshotBanner.icon} />
          </div>
          <p className={styles.snapshotBanner.text}>
            <span className={styles.snapshotBanner.textBold}>
              Información histórica
            </span>
            {
              ' — Los datos de vivienda, financiero, fuentes y abonos corresponden al estado registrado a la '
            }
            <span className={styles.snapshotBanner.textBold}>
              fecha de cierre (
              {datos.renuncia.fecha_cierre
                ? formatDateCompact(datos.renuncia.fecha_cierre)
                : formatDateCompact(datos.renuncia.fecha_renuncia)}
              )
            </span>
            {
              '. Cambios posteriores en la vivienda o valores no se reflejan aquí.'
            }
          </p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs.container}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTabActiva(key)}
              className={`${styles.tabs.tab} ${tabActiva === key ? styles.tabs.tabActive : styles.tabs.tabInactive}`}
            >
              <Icon className={styles.tabs.tabIcon} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={tabActiva}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={styles.tabs.content}
          >
            {tabActiva === 'vivienda' ? (
              <ExpedienteVivienda datos={datos} />
            ) : null}
            {tabActiva === 'financiero' ? (
              <ExpedienteFinanciero datos={datos} />
            ) : null}
            {tabActiva === 'fuentes' ? (
              <ExpedienteFuentes fuentes={datos.fuentes} />
            ) : null}
            {tabActiva === 'abonos' ? (
              <ExpedienteAbonos abonos={datos.abonos} />
            ) : null}
            {tabActiva === 'auditoria' ? (
              <ExpedienteAuditoria datos={datos} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal Procesar Devolución */}
      {esPendiente && modalDevolucionAbierto ? (
        <ProcesarDevolucionModal
          renuncia={datos.renuncia}
          onClose={() => setModalDevolucionAbierto(false)}
          onExitosa={() => {
            setModalDevolucionAbierto(false)
            recargar()
          }}
        />
      ) : null}
    </div>
  )
}
