'use client'

import { useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CreditCard, DollarSign, TrendingUp, UserCircle2, Users } from 'lucide-react'

import { useAbonos } from '../hooks'
import { metricasIconColors, seleccionClienteStyles as styles } from '../styles/seleccion-cliente.styles'

import { ClienteCard } from './cliente-card'
import { ClienteSearch } from './cliente-search'

/**
 * Componente principal del módulo de Abonos
 * Vista de lista de clientes con negociaciones activas
 * Filtrado por búsqueda en tiempo real
 */
export function AbonosPageMain() {
  const { negociaciones, isLoading, estadisticas } = useAbonos()
  const [busqueda, setBusqueda] = useState('')

  // Filtrar negociaciones por búsqueda
  const negociacionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return negociaciones

    const termino = busqueda.toLowerCase().trim()
    return negociaciones.filter((neg) => {
      const nombreCompleto = `${neg.cliente.nombres} ${neg.cliente.apellidos}`.toLowerCase()
      const documento = neg.cliente.numero_documento.toLowerCase()
      const proyecto = neg.proyecto?.nombre?.toLowerCase() || ''
      const vivienda = neg.vivienda.numero.toLowerCase()

      return (
        nombreCompleto.includes(termino) ||
        documento.includes(termino) ||
        proyecto.includes(termino) ||
        vivienda.includes(termino)
      )
    })
  }, [negociaciones, busqueda])

  // Mostrar loading skeleton premium
  if (isLoading) {
    return (
      <div className={styles.container.page}>
        <div className={styles.container.content}>
          <div className={styles.loading.container}>
            <div className={styles.loading.headerSkeleton}></div>
            <div className={styles.loading.metricsGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.loading.metricSkeleton}></div>
              ))}
            </div>
            <div className={styles.loading.searchSkeleton}></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.loading.cardSkeleton}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        {/* 🎨 HEADER HERO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.header.container}
        >
          <div className={styles.header.pattern} />
          <div className={styles.header.content}>
            <div className={styles.header.topRow}>
              <div className={styles.header.titleGroup}>
                <div className={styles.header.iconCircle}>
                  <UserCircle2 className={styles.header.icon} />
                </div>
                <div className={styles.header.titleWrapper}>
                  <h1 className={styles.header.title}>Seleccionar Cliente</h1>
                  <p className={styles.header.subtitle}>
                    Sistema de registro de abonos • Selección inteligente
                  </p>
                </div>
              </div>
              <span className={styles.header.badge}>
                <Users className="w-4 h-4" />
                {negociaciones.length} Cliente{negociaciones.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 📊 MÉTRICAS PREMIUM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.metricas.grid}
        >
          {/* Clientes Activos */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={styles.metricas.card}
          >
            <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.clientes.glowColor}`} />
            <div className={styles.metricas.content}>
              <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.clientes.gradient} shadow-blue-500/50`}>
                <Users className={styles.metricas.icon} />
              </div>
              <div className={styles.metricas.textGroup}>
                <p className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.clientes.textGradient}`}>
                  {estadisticas.totalNegociaciones}
                </p>
                <p className={styles.metricas.label}>Clientes Activos</p>
              </div>
            </div>
          </motion.div>

          {/* Total Abonado */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={styles.metricas.card}
          >
            <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.abonado.glowColor}`} />
            <div className={styles.metricas.content}>
              <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.abonado.gradient} shadow-green-500/50`}>
                <DollarSign className={styles.metricas.icon} />
              </div>
              <div className={styles.metricas.textGroup}>
                <p className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.abonado.textGradient}`}>
                  ${(estadisticas.totalAbonado / 1_000_000).toFixed(1)}M
                </p>
                <p className={styles.metricas.label}>Total Abonado</p>
              </div>
            </div>
          </motion.div>

          {/* Total en Ventas */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={styles.metricas.card}
          >
            <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.ventas.glowColor}`} />
            <div className={styles.metricas.content}>
              <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.ventas.gradient} shadow-purple-500/50`}>
                <TrendingUp className={styles.metricas.icon} />
              </div>
              <div className={styles.metricas.textGroup}>
                <p className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.ventas.textGradient}`}>
                  ${(estadisticas.totalVentas / 1_000_000).toFixed(1)}M
                </p>
                <p className={styles.metricas.label}>Total en Ventas</p>
              </div>
            </div>
          </motion.div>

          {/* Saldo Pendiente */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={styles.metricas.card}
          >
            <div className={`${styles.metricas.cardGlow} bg-gradient-to-br ${metricasIconColors.pendiente.glowColor}`} />
            <div className={styles.metricas.content}>
              <div className={`${styles.metricas.iconCircle} bg-gradient-to-br ${metricasIconColors.pendiente.gradient} shadow-orange-500/50`}>
                <AlertCircle className={styles.metricas.icon} />
              </div>
              <div className={styles.metricas.textGroup}>
                <p className={`${styles.metricas.value} bg-gradient-to-br ${metricasIconColors.pendiente.textGradient}`}>
                  ${(estadisticas.saldoPendiente / 1_000_000).toFixed(1)}M
                </p>
                <p className={styles.metricas.label}>Saldo Pendiente</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 🔍 BÚSQUEDA PREMIUM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ClienteSearch
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            totalResultados={negociacionesFiltradas.length}
            totalClientes={negociaciones.length}
          />
        </motion.div>

        {/* 💳 LISTA DE CLIENTES */}
        {negociacionesFiltradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.empty.container}
          >
            <div className={styles.empty.iconWrapper}>
              <div className={styles.empty.iconGlow} />
              <div className={styles.empty.iconCircle}>
                <CreditCard className={styles.empty.icon} />
              </div>
            </div>
            <h3 className={styles.empty.title}>
              {busqueda ? 'No se encontraron resultados' : 'No hay clientes activos'}
            </h3>
            <p className={styles.empty.description}>
              {busqueda
                ? 'Intenta con otro término de búsqueda o verifica que el cliente tenga una negociación activa'
                : 'Los clientes con negociaciones activas aparecerán aquí para que puedas registrar sus abonos'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Lista con AnimatePresence */}
            <AnimatePresence mode="popLayout">
              {negociacionesFiltradas.map((negociacion, index) => (
                <motion.div
                  key={negociacion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  <ClienteCard negociacion={negociacion} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
