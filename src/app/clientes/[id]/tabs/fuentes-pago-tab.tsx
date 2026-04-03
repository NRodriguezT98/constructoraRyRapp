/**
 * ============================================
 * COMPONENTE PRESENTACIONAL PURO: FuentesPagoTab
 * ============================================
 *
 * ✅ SEPARACIÓN ESTRICTA DE RESPONSABILIDADES
 * - Componente: SOLO UI presentacional
 * - Hook: TODA la lógica (useFuentesPagoTab)
 *
 * Pestaña dedicada para gestión de fuentes de pago del cliente.
 * Permite visualizar, editar y validar las fuentes configuradas
 * para una vivienda asignada.
 *
 * IMPORTANTE: Esta pestaña NO registra abonos.
 * Los abonos se gestionan desde el módulo dedicado de Abonos.
 *
 * Funcionalidades:
 * - Dashboard de métricas
 * - Validación de configuración
 * - Edición de fuentes individuales
 * - Enlaces contextuales a otros módulos
 * - Guía paso a paso para completar configuración
 *
 * @version 1.0.0 - 2025-12-17 - Implementación inicial
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  DollarSign,
  Home,
  Info,
  Lightbulb,
  ListChecks,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react'

import type { Cliente } from '@/modules/clientes/types'

import {
  AccionesRapidas,
  EstadoValidacionComponent,
  ListaFuentes,
  MetricasDashboard,
} from './fuentes-pago/components'
import { useFuentesPagoTab } from './fuentes-pago/hooks/useFuentesPagoTab'
import { fuentesPagoTabStyles as styles } from './fuentes-pago-tab.styles'

// ============================================
// INTERFACES
// ============================================

interface FuentesPagoTabProps {
  cliente: Cliente
}

// ============================================
// COMPONENTE PRINCIPAL - SOLO UI
// ============================================

export function FuentesPagoTab({ cliente }: FuentesPagoTabProps) {
  // ✅ Hook con TODA la lógica
  const {
    // Estado
    negociacion,
    fuentesPago,
    metricas,
    estadoValidacion,
    isLoading,
    isUpdating,
    error,

    // Business Logic Functions (del hook)
    getTipoConfig,
    getDocumentacionEstado,
    calcularProgreso,
    getEstadoStyles,
    getProgressStyles,
    tiposDisponibles,

    // Lógica de fuentes disponibles
    todasFuentesCreadas,
    mensajeBotonDeshabilitado,

    // Handlers
    handleEditarFuente,
    handleAgregarFuente,
    handleEliminarFuente,
    handleVerHistorial,
    handleVerValidacion,
    handleNavegar,
    refetchFuentes,
  } = useFuentesPagoTab({ cliente })

  // =====================================================
  // RENDER: Loading State
  // =====================================================

  if (isLoading) {
    return (
      <motion.div
        className='flex flex-col items-center justify-center py-12'
        {...styles.animations.fadeInUp}
      >
        <motion.div
          className={`h-12 w-12 rounded-xl ${styles.theme.bg} mb-4 flex items-center justify-center shadow-lg`}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <Loader2 className='h-6 w-6 text-white' />
        </motion.div>

        <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
          Cargando Fuentes de Pago
        </h3>

        <p className='max-w-sm text-center text-sm text-gray-600 dark:text-gray-400'>
          Obteniendo información de la vivienda asignada y configuración de
          fuentes de pago...
        </p>
      </motion.div>
    )
  }

  // =====================================================
  // RENDER: Error State
  // =====================================================

  if (error) {
    return (
      <motion.div
        className='flex flex-col items-center justify-center py-12'
        {...styles.animations.fadeInUp}
      >
        <motion.div
          className='mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 shadow-lg'
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <AlertCircle className='h-6 w-6 text-white' />
        </motion.div>

        <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
          Error al Cargar Fuentes
        </h3>

        <p className='mb-4 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400'>
          No pudimos obtener la información de las fuentes de pago. Por favor,
          inténtalo nuevamente.
        </p>

        <motion.button
          onClick={() => refetchFuentes()}
          className={styles.header.actionButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className='h-4 w-4' />
          Reintentar
        </motion.button>
      </motion.div>
    )
  }

  // =====================================================
  // RENDER: Sin Vivienda Asignada
  // =====================================================

  if (!negociacion) {
    return (
      <motion.div
        className={styles.emptyState.container}
        {...styles.animations.fadeInUp}
      >
        {/* Icono con gradiente */}
        <div className='flex justify-center'>
          <motion.div
            className={styles.emptyState.iconWrapper}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Home className={styles.emptyState.icon} />
          </motion.div>
        </div>

        {/* Título y descripción */}
        <h3 className={styles.emptyState.title}>Sin Vivienda Asignada</h3>
        <p className={styles.emptyState.description}>
          Las fuentes de pago se configuran una vez que el cliente tiene
          asignada una vivienda específica dentro de un proyecto.
        </p>

        {/* Checklist de requisitos */}
        <div className={styles.emptyState.checklistContainer}>
          <div className={styles.emptyState.checklistHeader}>
            <ListChecks className='h-4 w-4' />
            Requisitos previos
          </div>

          <div className={styles.emptyState.checklistItems}>
            <div className={styles.emptyState.checklistItem}>
              <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
                <X className='h-3 w-3 text-red-600 dark:text-red-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className={styles.emptyState.checklistTextPending}>
                  Cliente debe tener una vivienda asignada
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={styles.emptyState.ctaContainer}>
          <div className={styles.emptyState.ctaInfo}>
            <Lightbulb className={styles.emptyState.ctaIcon} />
            <div className='flex-1'>
              <h4 className={styles.emptyState.ctaTitle}>¿Cómo continuar?</h4>
              <p className={styles.emptyState.ctaDescription}>
                Ve a la pestaña &quot;Vivienda Asignada&quot; para ver las
                instrucciones completas sobre cómo asignar una vivienda a este
                cliente.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              // Buscar tab con data-tab="vivienda-asignada" y hacer click
              const tabButton = document.querySelector(
                '[data-tab="vivienda-asignada"]'
              )
              if (tabButton instanceof HTMLElement) {
                tabButton.click()
              }
            }}
            className={styles.emptyState.ctaButton}
          >
            <Home className='h-4 w-4' />
            Ver Instrucciones
          </button>
        </div>

        {/* Footer informativo */}
        <div className={styles.emptyState.footerInfo}>
          <Info className={styles.emptyState.footerIcon} />
          <p className={styles.emptyState.footerText}>
            Las fuentes de pago incluyen cuotas iniciales, créditos hipotecarios
            y subsidios que se vincularán al valor de la vivienda asignada.
          </p>
        </div>
      </motion.div>
    )
  }

  // =====================================================
  // RENDER: Contenido Principal
  // =====================================================

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key='fuentes-pago-content'
        className={styles.container.main}
        variants={styles.animations.staggerChildren}
        initial='initial'
        animate='animate'
      >
        {/* Header con información contextual */}
        <motion.div
          className={styles.header.container}
          variants={styles.animations.fadeInUp}
        >
          <div className={styles.header.content}>
            <div className={styles.header.leftSection}>
              <div className={styles.header.iconContainer}>
                <DollarSign className={styles.header.icon} />
              </div>

              <div className={styles.header.titleSection}>
                <h2 className={styles.header.title}>Fuentes de Pago</h2>
                <p className={styles.header.subtitle}>
                  {negociacion.viviendas?.manzanas?.proyectos?.nombre} &bull;
                  Mza. {negociacion.viviendas?.manzanas?.nombre}
                  Casa {negociacion.viviendas?.numero}
                </p>
              </div>
            </div>

            <div className={styles.header.rightSection}>
              {isUpdating && (
                <motion.div
                  className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-100 px-3 py-1.5 dark:border-blue-700 dark:bg-blue-900/30'
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className='h-3 w-3 animate-spin text-blue-600 dark:text-blue-400' />
                  <span className='text-xs font-medium text-blue-700 dark:text-blue-300'>
                    Actualizando...
                  </span>
                </motion.div>
              )}

              <motion.button
                onClick={handleVerHistorial}
                className={styles.header.secondaryButton}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Ver Historial
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Métricas Dashboard */}
        <MetricasDashboard metricas={metricas} />

        {/* Estado de Validación */}
        <EstadoValidacionComponent
          estadoValidacion={estadoValidacion}
          onNavegar={handleNavegar}
          onVerDetalle={handleVerValidacion}
        />

        {/* Lista de Fuentes Configuradas */}
        <ListaFuentes
          fuentesPago={fuentesPago}
          onEditarFuente={handleEditarFuente}
          onEliminarFuente={handleEliminarFuente}
          onAgregarFuente={handleAgregarFuente}
          // ✅ Funciones procesadas del hook (LÓGICA SEPARADA)
          getTipoConfig={getTipoConfig}
          getDocumentacionEstado={getDocumentacionEstado}
          calcularProgreso={calcularProgreso}
          getEstadoStyles={getEstadoStyles}
          getProgressStyles={getProgressStyles}
          tiposDisponibles={tiposDisponibles}
          todasFuentesCreadas={todasFuentesCreadas}
          mensajeBotonDeshabilitado={mensajeBotonDeshabilitado}
        />

        {/* Acciones Rápidas - Enlaces Contextuales */}
        <AccionesRapidas
          onNavegar={handleNavegar}
          fuentesSinDocumentacion={metricas.fuentesSinDocumentacion}
          puedeRegistrarAbonos={estadoValidacion.puedeRegistrarAbonos}
        />

        {/* Información contextual al pie */}
        <motion.div
          className={`${styles.container.card} p-4`}
          variants={styles.animations.fadeInUp}
        >
          <div className='space-y-2 text-center'>
            <p className='text-xs text-gray-500 dark:text-gray-500'>
              💡 <strong>Recuerda:</strong> Las fuentes de pago definen cómo el
              cliente cubrirá el valor total de la vivienda. Una vez
              configuradas y documentadas, podrás registrar los abonos
              correspondientes en el módulo de Abonos.
            </p>

            <p className='text-xs text-gray-400 dark:text-gray-600'>
              ℹ️ Cada fuente requiere documentación de respaldo antes de
              habilitar el registro de desembolsos.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
