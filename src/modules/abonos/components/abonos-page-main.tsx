'use client'

import { staggerContainer } from '@/shared/styles/animations'
import { motion } from 'framer-motion'
import { AlertCircle, CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAbonos } from '../hooks'
import { containerStyles, statsStyles, textStyles } from '../styles'
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

  // Mostrar loading skeleton
  if (isLoading) {
    return (
      <div className={containerStyles.section}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className={`${statsStyles.container}`}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"
              ></div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={containerStyles.section}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={containerStyles.page}
      >
        {/* Header compacto */}
        <motion.div>
          <h1 className={textStyles.title}>
            Gestión de Abonos
          </h1>
          <p className={textStyles.subtitle}>
            Administra los pagos de tus clientes en un solo lugar
          </p>
        </motion.div>

        {/* Estadísticas compactas */}
        <motion.div className={statsStyles.container}>
          <div className={statsStyles.card}>
            <Users className={statsStyles.icon} />
            <div>
              <p className={statsStyles.value}>
                {estadisticas.totalNegociaciones}
              </p>
              <p className={statsStyles.label}>Clientes Activos</p>
            </div>
          </div>

          <div className={statsStyles.card}>
            <DollarSign className={statsStyles.icon} />
            <div>
              <p className={statsStyles.value}>
                ${(estadisticas.totalAbonado / 1_000_000).toFixed(1)}M
              </p>
              <p className={statsStyles.label}>Total Abonado</p>
            </div>
          </div>

          <div className={statsStyles.card}>
            <TrendingUp className={statsStyles.icon} />
            <div>
              <p className={statsStyles.value}>
                ${(estadisticas.totalVentas / 1_000_000).toFixed(1)}M
              </p>
              <p className={statsStyles.label}>Total en Ventas</p>
            </div>
          </div>

          <div className={statsStyles.card}>
            <AlertCircle className={statsStyles.icon} />
            <div>
              <p className={statsStyles.value}>
                ${(estadisticas.saldoPendiente / 1_000_000).toFixed(1)}M
              </p>
              <p className={statsStyles.label}>Saldo Pendiente</p>
            </div>
          </div>
        </motion.div>

        {/* Buscador compacto */}
        <motion.div>
          <ClienteSearch
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
          />
        </motion.div>

        {/* Lista de clientes */}
        {negociacionesFiltradas.length === 0 ? (
          <motion.div className="text-center py-12">
            <CreditCard className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            <h3 className={textStyles.subheading}>
              {busqueda ? 'No se encontraron resultados' : 'No hay clientes activos'}
            </h3>
            <p className={textStyles.muted}>
              {busqueda
                ? 'Intenta con otro término de búsqueda'
                : 'Los clientes con negociaciones activas aparecerán aquí'}
            </p>
          </motion.div>
        ) : (
          <motion.div className="space-y-3">
            {/* Contador de resultados */}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {negociacionesFiltradas.length === negociaciones.length
                ? `${negociaciones.length} cliente${negociaciones.length !== 1 ? 's' : ''} activo${negociaciones.length !== 1 ? 's' : ''}`
                : `${negociacionesFiltradas.length} de ${negociaciones.length} cliente${negociaciones.length !== 1 ? 's' : ''}`}
            </p>

            {/* Lista de tarjetas */}
            {negociacionesFiltradas.map((negociacion, index) => (
              <motion.div
                key={negociacion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ClienteCard negociacion={negociacion} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
