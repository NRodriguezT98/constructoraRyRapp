'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CreditCard } from 'lucide-react'

import { Pagination } from '@/shared/components/ui'

import { useNegociacionesList } from '../hooks/useNegociacionesList'
import { seleccionClienteStyles as styles } from '../styles/seleccion-cliente.styles'

import { AbonosSkeleton } from './abonos-skeleton'
import { AbonosHeaderPremium } from './AbonosHeaderPremium'
import { AbonosMetricasPremium } from './AbonosMetricasPremium'
import { ClienteCard } from './cliente-card'
import { ClienteSearch } from './cliente-search'

/**
 * Componente principal del módulo de Abonos.
 * Vista de lista de clientes con negociaciones activas.
 * Toda la lógica de filtrado vive en useNegociacionesList.
 */
export function AbonosPageMain() {
  const {
    negociaciones,
    negociacionesFiltradas,
    negociacionesPaginadas,
    proyectosDisponibles,
    promedioAvance,
    busqueda,
    setBusqueda,
    proyectoFiltro,
    setProyectoFiltro,
    ordenar,
    setOrdenar,
    paginaActual,
    totalPaginas,
    totalFiltrado,
    setPaginaActual,
    pageSize,
    setPageSize,
    isLoading,
    estadisticas,
  } = useNegociacionesList()

  if (isLoading) {
    return <AbonosSkeleton />
  }

  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        <AbonosHeaderPremium totalClientes={totalFiltrado} />

        <AbonosMetricasPremium
          totalClientes={negociaciones.length}
          totalAbonado={estadisticas.totalAbonado}
          totalVentas={estadisticas.totalVentas}
          saldoPendiente={estadisticas.saldoPendiente}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ClienteSearch
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            totalResultados={totalFiltrado}
            totalClientes={negociaciones.length}
            proyectos={proyectosDisponibles}
            proyectoFiltro={proyectoFiltro}
            onProyectoFiltroChange={setProyectoFiltro}
            ordenar={ordenar}
            onOrdenarChange={setOrdenar}
            promedioAvance={promedioAvance}
            resumen={{
              totalVentas: estadisticas.totalVentas,
              saldoPendiente: estadisticas.saldoPendiente,
            }}
          />
        </motion.div>

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
              {busqueda
                ? 'No se encontraron resultados'
                : 'No hay clientes activos'}
            </h3>
            <p className={styles.empty.description}>
              {busqueda
                ? 'Intenta con otro término de búsqueda o verifica que el cliente tenga una negociación activa'
                : 'Los clientes con negociaciones activas aparecerán aquí para que puedas registrar sus abonos'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-lg dark:divide-gray-700/50 dark:border-gray-700/50 dark:bg-gray-800'
          >
            <AnimatePresence mode='popLayout'>
              {negociacionesPaginadas.map((negociacion, index) => (
                <motion.div
                  key={negociacion.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ClienteCard negociacion={negociacion} />
                </motion.div>
              ))}
            </AnimatePresence>
            <Pagination
              currentPage={paginaActual}
              totalPages={totalPaginas}
              totalItems={totalFiltrado}
              itemsPerPage={pageSize}
              onPageChange={setPaginaActual}
              onItemsPerPageChange={setPageSize}
              itemsPerPageOptions={[10, 25, 50]}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
