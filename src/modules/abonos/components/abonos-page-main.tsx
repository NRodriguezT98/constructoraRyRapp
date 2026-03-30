'use client'

import { useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { CreditCard } from 'lucide-react'

import { useNegociacionesAbonos } from '../hooks'
import { seleccionClienteStyles as styles } from '../styles/seleccion-cliente.styles'

import { AbonosSkeleton } from './abonos-skeleton'
import { AbonosHeaderPremium } from './AbonosHeaderPremium'
import { AbonosMetricasPremium } from './AbonosMetricasPremium'
import { ClienteCard } from './cliente-card'
import { ClienteSearch } from './cliente-search'

type OrdenClientes =
  | 'urgente'
  | 'mayor_pago'
  | 'nombre_az'
  | 'nombre_za'
  | 'vivienda_asc'
  | 'mayor_saldo'

/**
 * Componente principal del módulo de Abonos
 * Vista de lista de clientes con negociaciones activas
 * Filtrado por búsqueda en tiempo real
 */
export function AbonosPageMain() {
  const { negociaciones, isLoading, estadisticas } = useNegociacionesAbonos()
  const [busqueda, setBusqueda] = useState('')
  const [proyectoFiltro, setProyectoFiltro] = useState('')
  const [ordenar, setOrdenar] = useState<OrdenClientes>('vivienda_asc')

  // Lista única de proyectos disponibles
  const proyectosDisponibles = useMemo(() => {
    const nombres = negociaciones
      .map(n => n.proyecto?.nombre)
      .filter((n): n is string => Boolean(n))
    return [...new Set(nombres)].sort()
  }, [negociaciones])

  // Promedio de avance del portafolio
  const promedioAvance = useMemo(() => {
    if (!negociaciones.length) return 0
    const suma = negociaciones.reduce(
      (acc, n) => acc + (n.porcentaje_pagado || 0),
      0
    )
    return Math.round(suma / negociaciones.length)
  }, [negociaciones])

  // Filtrar + ordenar por urgencia (menor % pagado primero)
  const negociacionesFiltradas = useMemo(() => {
    let result = negociaciones

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase().trim().replace(/\s/g, '')
      result = result.filter(neg => {
        const nombre =
          `${neg.cliente.nombres} ${neg.cliente.apellidos}`.toLowerCase()
        const documento = neg.cliente.numero_documento.toLowerCase()
        const proyectoNombre = neg.proyecto?.nombre?.toLowerCase() || ''
        const viviendaNumero = (neg.vivienda.numero || '').toLowerCase()
        // Búsqueda compacta tipo "A1" → Manzana A + N°1
        const manzana = (neg.vivienda.manzana?.nombre || '').toLowerCase()
        const codigoCombinado = `${manzana}${viviendaNumero}`.replace(/\s/g, '')
        const codigoCompleto = `${manzana} ${viviendaNumero}`
        return (
          nombre.includes(termino) ||
          documento.includes(termino) ||
          proyectoNombre.includes(termino) ||
          viviendaNumero.includes(termino) ||
          codigoCombinado.includes(termino) ||
          codigoCompleto.includes(termino)
        )
      })
    }

    if (proyectoFiltro) {
      result = result.filter(n => n.proyecto?.nombre === proyectoFiltro)
    }

    // Ordenar segun criterio seleccionado
    return [...result].sort((a, b) => {
      switch (ordenar) {
        case 'mayor_pago':
          return (b.porcentaje_pagado || 0) - (a.porcentaje_pagado || 0)
        case 'nombre_az': {
          const na = `${a.cliente.apellidos} ${a.cliente.nombres}`.toLowerCase()
          const nb = `${b.cliente.apellidos} ${b.cliente.nombres}`.toLowerCase()
          return na.localeCompare(nb, 'es')
        }
        case 'nombre_za': {
          const na = `${a.cliente.apellidos} ${a.cliente.nombres}`.toLowerCase()
          const nb = `${b.cliente.apellidos} ${b.cliente.nombres}`.toLowerCase()
          return nb.localeCompare(na, 'es')
        }
        case 'vivienda_asc': {
          const ka =
            `${a.vivienda.manzana?.nombre || ''}${(a.vivienda.numero || '').padStart(5, '0')}`.toLowerCase()
          const kb =
            `${b.vivienda.manzana?.nombre || ''}${(b.vivienda.numero || '').padStart(5, '0')}`.toLowerCase()
          return ka.localeCompare(kb, 'es')
        }
        case 'mayor_saldo': {
          const sa = (a.valor_total || 0) - (a.total_abonado || 0)
          const sb = (b.valor_total || 0) - (b.total_abonado || 0)
          return sb - sa
        }
        case 'urgente':
        default:
          return (a.porcentaje_pagado || 0) - (b.porcentaje_pagado || 0)
      }
    })
  }, [negociaciones, busqueda, proyectoFiltro, ordenar])

  // Mostrar loading skeleton premium
  if (isLoading) {
    return <AbonosSkeleton />
  }

  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        {/* 🎨 HEADER HERO PREMIUM */}
        <AbonosHeaderPremium totalClientes={negociacionesFiltradas.length} />

        {/* 📊 MÉTRICAS PREMIUM */}
        <AbonosMetricasPremium
          totalClientes={negociaciones.length}
          totalAbonado={estadisticas.totalAbonado}
          totalVentas={estadisticas.totalVentas}
          saldoPendiente={estadisticas.saldoPendiente}
        />

        {/* 🔍 BÚSQUEDA — PROTAGONISTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ClienteSearch
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            totalResultados={negociacionesFiltradas.length}
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
              {negociacionesFiltradas.map((negociacion, index) => (
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
          </motion.div>
        )}
      </div>
    </div>
  )
}
