/**
 * Página Principal de Negociaciones
 *
 * Arquitectura limpia:
 * - Lógica en hook useNegociaciones
 * - Estilos centralizados en negociaciones.styles.ts
 * - Componente presentacional puro
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

'use client'

import { motion } from 'framer-motion'
import {
    Building2,
    CheckCircle2,
    FileText,
    Loader2,
    RefreshCw,
    Search,
    TrendingUp,
    XCircle
} from 'lucide-react'
import { useNegociaciones } from '../hooks/useNegociaciones'
import * as styles from '../styles/negociaciones.styles'
import { ESTADOS_NEGOCIACION } from '../types'
import { NegociacionCard } from './negociacion-card'
import { NegociacionesSkeleton } from './negociaciones-skeleton'

// Animaciones
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
}

export function NegociacionesPageMain() {
  const {
    negociaciones,
    metricas,
    isLoading,
    error,
    busqueda,
    setBusqueda,
    filtros,
    aplicarFiltroEstado,
    limpiarFiltros,
    recargar,
    formatearMoneda,
    obtenerColorEstado,
  } = useNegociaciones()

  // ============================================
  // RENDER LOADING
  // ============================================
  if (isLoading && !metricas) {
    return <NegociacionesSkeleton />
  }

  // ============================================
  // RENDER ERROR
  // ============================================
  if (error) {
    return (
      <div className={styles.layoutClasses.container}>
        <div className={styles.layoutClasses.inner}>
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={recargar}
              className={`${styles.buttonClasses.secondary} mt-4`}
            >
              <RefreshCw className={styles.buttonClasses.icon} />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className={styles.layoutClasses.container}>
      <div className={styles.layoutClasses.inner}>
        {/* HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={styles.headerClasses.container}
        >
          <h1 className={styles.headerClasses.title}>Negociaciones</h1>
          <p className={styles.headerClasses.description}>
            Gestión completa de negociaciones y cierres financieros
          </p>
        </motion.div>

        {/* MÉTRICAS */}
        {metricas && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={styles.metricasClasses.grid}
          >
            {/* Total */}
            <motion.div
              variants={itemVariants}
              className={`${styles.metricasClasses.card} ${styles.metricasColores.total.border}`}
            >
              <div className={`${styles.metricasClasses.iconContainer} ${styles.metricasColores.total.bg}`}>
                <FileText className={styles.metricasClasses.icon} />
              </div>
              <div className={`${styles.metricasClasses.value} ${styles.metricasColores.total.valueGradient}`}>
                {metricas.total}
              </div>
              <div className={styles.metricasClasses.label}>Total</div>
            </motion.div>

            {/* En Proceso */}
            <motion.div
              variants={itemVariants}
              className={`${styles.metricasClasses.card} ${styles.metricasColores.activas.border}`}
            >
              <div className={`${styles.metricasClasses.iconContainer} ${styles.metricasColores.activas.bg}`}>
                <CheckCircle2 className={styles.metricasClasses.icon} />
              </div>
              <div className={`${styles.metricasClasses.value} ${styles.metricasColores.activas.valueGradient}`}>
                {metricas.activas}
              </div>
              <div className={styles.metricasClasses.label}>Activas</div>
            </motion.div>

            {/* Cierre Financiero */}
            <motion.div
              variants={itemVariants}
              className={`${styles.metricasClasses.card} ${styles.metricasColores.suspendidas.border}`}
            >
              <div className={`${styles.metricasClasses.iconContainer} ${styles.metricasColores.suspendidas.bg}`}>
                <TrendingUp className={styles.metricasClasses.icon} />
              </div>
              <div className={`${styles.metricasClasses.value} ${styles.metricasColores.suspendidas.valueGradient}`}>
                {metricas.suspendidas}
              </div>
              <div className={styles.metricasClasses.label}>Suspendidas</div>
            </motion.div>

            {/* Activas */}
            <motion.div
              variants={itemVariants}
              className={`${styles.metricasClasses.card} ${styles.metricasColores.completadas.border}`}
            >
              <div className={`${styles.metricasClasses.iconContainer} ${styles.metricasColores.completadas.bg}`}>
                <Building2 className={styles.metricasClasses.icon} />
              </div>
              <div className={`${styles.metricasClasses.value} ${styles.metricasColores.completadas.valueGradient}`}>
                {metricas.completadas}
              </div>
              <div className={styles.metricasClasses.label}>Completadas</div>
            </motion.div>

            {/* Completadas */}
            <motion.div
              variants={itemVariants}
              className={`${styles.metricasClasses.card} ${styles.metricasColores.cerradas_renuncia.border}`}
            >
              <div className={`${styles.metricasClasses.iconContainer} ${styles.metricasColores.cerradas_renuncia.bg}`}>
                <XCircle className={styles.metricasClasses.icon} />
              </div>
              <div className={`${styles.metricasClasses.value} ${styles.metricasColores.cerradas_renuncia.valueGradient}`}>
                {metricas.cerradas_renuncia}
              </div>
              <div className={styles.metricasClasses.label}>Renuncias</div>
            </motion.div>
          </motion.div>
        )}

        {/* FILTROS */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={styles.filtrosClasses.container}
        >
          <div className={styles.filtrosClasses.grid}>
            {/* Búsqueda */}
            <div>
              <label className={styles.filtrosClasses.label}>
                <Search className="mb-1 inline h-4 w-4" /> Buscar
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Cliente, documento, vivienda..."
                className={styles.filtrosClasses.input}
              />
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className={styles.filtrosClasses.label}>Estado</label>
              <select
                value={filtros.estado || ''}
                onChange={(e) => aplicarFiltroEstado(e.target.value || undefined)}
                className={styles.filtrosClasses.select}
              >
                <option value="">Todos los estados</option>
                {ESTADOS_NEGOCIACION.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Limpiar */}
            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className={styles.filtrosClasses.buttonReset}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </motion.div>

        {/* LISTA DE NEGOCIACIONES */}
        {isLoading && negociaciones.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : negociaciones.length === 0 ? (
          <div className={styles.listaClasses.empty}>
            <FileText className={styles.listaClasses.emptyIcon} />
            <h3 className={styles.listaClasses.emptyTitle}>No hay negociaciones</h3>
            <p className={styles.listaClasses.emptyDescription}>
              {filtros.estado || busqueda
                ? 'No se encontraron negociaciones con los filtros aplicados'
                : 'Aún no hay negociaciones registradas en el sistema'}
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={styles.listaClasses.grid}
          >
            {negociaciones.map((negociacion) => (
              <NegociacionCard
                key={negociacion.id}
                negociacion={negociacion}
                formatearMoneda={formatearMoneda}
                obtenerColorEstado={obtenerColorEstado}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
