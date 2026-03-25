'use client'

import { motion } from 'framer-motion'
import { FileX } from 'lucide-react'
import { useState } from 'react'

import { useRenunciasList } from '../hooks/useRenunciasList'
import { renunciasStyles as styles } from '../styles/renuncias.styles'
import type { RenunciaConInfo } from '../types'

import { RenunciaCard } from './RenunciaCard'
import { RenunciasFiltrosPremium } from './RenunciasFiltrosPremium'
import { RenunciasHeaderPremium } from './RenunciasHeaderPremium'
import { RenunciasMetricasPremium } from './RenunciasMetricasPremium'
import { ProcesarDevolucionModal } from './modals/ProcesarDevolucionModal'

interface RenunciasPageMainProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

export function RenunciasPageMain({
  isAdmin = false,
}: RenunciasPageMainProps) {
  const {
    renuncias,
    cargando,
    metricas,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    totalFiltradas,
    proyectos,
  } = useRenunciasList()

  // Modal state
  const [renunciaDevolucion, setRenunciaDevolucion] = useState<RenunciaConInfo | null>(null)

  // ==========================================
  // LOADING
  // ==========================================
  if (cargando) {
    return (
      <div className={styles.container.page}>
        <div className={styles.container.content}>
          <div className={styles.loading.container}>
            <div className={styles.loading.headerSkeleton} />
            <div className={styles.loading.metricsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.loading.metricSkeleton} />
              ))}
            </div>
            <div className={styles.loading.filtrosSkeleton} />
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.loading.cardSkeleton} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        {/* Header */}
        <RenunciasHeaderPremium totalRenuncias={metricas.total} />

        {/* Métricas */}
        <RenunciasMetricasPremium metricas={metricas} />

        {/* Filtros */}
        <RenunciasFiltrosPremium
          filtros={filtros}
          onFiltrosChange={actualizarFiltros}
          onLimpiar={limpiarFiltros}
          totalResultados={totalFiltradas}
          proyectos={proyectos}
        />

        {/* Lista de renuncias */}
        {renuncias.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.empty.container}
          >
            <div className={styles.empty.iconWrapper}>
              <div className={styles.empty.iconCircle}>
                <FileX className={styles.empty.icon} />
              </div>
            </div>
            <h3 className={styles.empty.title}>No hay renuncias registradas</h3>
            <p className={styles.empty.description}>
              Las renuncias se registran desde el perfil de cliente, en la negociación activa.
            </p>
          </motion.div>
        ) : (
          <div className={styles.lista.grid}>
            {renuncias.map((renuncia) => (
              <RenunciaCard
                key={renuncia.id}
                renuncia={renuncia}
                onProcesarDevolucion={isAdmin ? setRenunciaDevolucion : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {renunciaDevolucion ? (
        <ProcesarDevolucionModal
          renuncia={renunciaDevolucion}
          onClose={() => setRenunciaDevolucion(null)}
          onExitosa={() => setRenunciaDevolucion(null)}
        />
      ) : null}
    </div>
  )
}
