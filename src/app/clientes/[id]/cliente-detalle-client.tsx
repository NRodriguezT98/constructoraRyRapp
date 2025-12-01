'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL (REFACTORIZADO)
 * Cliente Detalle Client - Usa useClienteDetalle hook
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - TODA la lógica consolidada en useClienteDetalle hook
 * - Este componente SOLO orquesta la UI
 */

import { useEffect } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowLeft,
  Building2,
  ChevronRight,
  Edit2,
  FileText,
  Heart,
  History,
  Home,
  Info,
  Lock,
  Trash2,
  User,
  Wallet
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { construirURLCliente } from '@/lib/utils/slug.utils'
import { ModalRegistrarInteres } from '@/modules/clientes/components/modals'
import { useAsignacionVivienda, useClienteDetalle } from '@/modules/clientes/hooks'
import { Tooltip } from '@/shared/components/ui'

import * as styles from './cliente-detalle.styles'
import { ActividadTab, DocumentosTab, GeneralTab, InteresesTab, NegociacionesTab } from './tabs'
import { HistorialTab } from './tabs/historial-tab'

interface ClienteDetalleClientProps {
  clienteId: string  // Puede ser slug o UUID
}

// Badge de estado
function EstadoBadge({ estado }: { estado: string }) {
  const config = {
    Interesado: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    Activo: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-500',
    },
    Inactivo: {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      text: 'text-gray-700 dark:text-gray-300',
      dot: 'bg-gray-500',
    },
  }

  const { bg, text, dot} = config[estado as keyof typeof config] || config.Interesado

  return (
    <span className={`${bg} ${text} ${styles.headerClasses.statusBadge}`}>
      <span className={`${dot} ${styles.headerClasses.statusDot}`} />
      <span className={styles.headerClasses.statusText}>{estado}</span>
    </span>
  )
}

export default function ClienteDetalleClient({ clienteId }: ClienteDetalleClientProps) {
  const router = useRouter()

  // ✅ Hook consolidado con TODA la lógica
  const {
    clienteUUID,
    cliente,
    loading,
    error,
    activeTab,
    modalInteresAbierto,
    tieneCedula,
    cargandoValidacion,
    totalDocumentos,
    modalSubirAbierto,
    cambiarTab,
    abrirModalInteres,
    cerrarModalInteres,
    cerrarModalSubir,
    recargarCliente,
    irATabDocumentos,
  } = useClienteDetalle({ clienteIdSlug: clienteId })

  const handleEditar = () => {
    console.log('Editar cliente:', clienteUUID)
    // TODO: Abrir modal de edición o navegar a página de edición
  }

  const handleEliminar = () => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar al cliente ${cliente?.nombre_completo}? Esta acción no se puede deshacer.`
      )
    ) {
      console.log('Eliminar cliente:', clienteUUID)
      router.push('/clientes')
    }
  }

  const handleRegistrarInteres = () => {
    abrirModalInteres()
  }

  // ✅ Hook de asignación de vivienda con validación centralizada
  const clienteSlug = cliente ? construirURLCliente({
    id: clienteUUID!,
    nombres: cliente.nombres,
    apellidos: cliente.apellidos,
  }).split('/').pop() : ''

  const {
    tieneCedula: tieneCedulaAsignacion,
    puedeAsignar,
    cargando: cargandoAsignacion,
    handleIniciarAsignacion,
    mensajeValidacion
  } = useAsignacionVivienda({
    clienteId: clienteUUID || '',
    clienteNombre: cliente?.nombre_completo || '',
    clienteSlug: clienteSlug || ''
  })

  // ✅ Detectar query param "action=crear-negociacion" y usar hook de asignación
  useEffect(() => {
    if (!cliente || !clienteUUID) return

    const params = new URLSearchParams(window.location.search)
    const action = params.get('action')

    if (action === 'crear-negociacion') {
      // Limpiar query param primero
      window.history.replaceState({}, '', window.location.pathname)

      // Verificar si tiene documento
      if (!tieneCedulaAsignacion) {
        // Cambiar a tab documentos
        cambiarTab('documentos')
      } else {
        // Tiene documento, proceder con asignación
        handleIniciarAsignacion()
      }
    }
  }, [cliente, clienteUUID, tieneCedulaAsignacion, handleIniciarAsignacion, cambiarTab])

  const handleInteresRegistrado = async () => {
    cerrarModalInteres()
    // ✅ React Query refetch automático
    recargarCliente()
  }

  // Mostrar loading mientras se resuelve el slug O mientras se carga el cliente
  if (!clienteUUID || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <motion.div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/30"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <User className="h-10 w-10 text-white" />
          </motion.div>

          <motion.p
            className="text-lg font-medium text-gray-700 dark:text-gray-300"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Cargando cliente...
          </motion.p>

          <div className="mt-4 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-cyan-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Si ya resolvimos el UUID y terminó de cargar pero no hay cliente, entonces no existe
  if (!cliente) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/20'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='text-center'
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <User className='h-10 w-10 text-gray-400' />
          </div>
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Cliente no encontrado
          </h2>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            El cliente que buscas no existe o fue eliminado.
          </p>
          <button
            onClick={() => router.push('/clientes')}
            className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver a clientes
          </button>
        </motion.div>
      </div>
    )
  }

  const tabs = [
    { id: 'general' as const, label: 'Información General', icon: User, count: null, badge: null },
    {
      id: 'intereses' as const,
      label: 'Intereses',
      icon: Heart,
      count: cliente.intereses?.length || 0,
      badge: null,
    },
    {
      id: 'negociaciones' as const,
      label: 'Negociaciones',
      icon: Wallet,
      count: (cliente as any).negociaciones?.length || 0,
      badge: null,
    },
    {
      id: 'documentos' as const,
      label: 'Documentos',
      icon: FileText,
      count: totalDocumentos,
      badge: !tieneCedula ? { text: '⚠️ Requerido', color: 'orange', pulse: true } : null,
    },
    { id: 'actividad' as const, label: 'Actividad', icon: Activity, count: null, badge: null },
    { id: 'historial' as const, label: 'Historial', icon: History, count: null, badge: null },
  ]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-950/20'
      >
        <div className='mx-auto max-w-7xl space-y-4'>
          {/* Botón Volver */}
          <motion.div {...styles.animations.fadeInUp}>
            <button
              onClick={() => router.back()}
              className='group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            >
              <ArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
              Volver
            </button>
          </motion.div>

          {/* Header Mejorado con Glassmorphism */}
          <motion.div
            {...styles.animations.fadeInUp}
            transition={{ delay: 0.1 }}
            className={styles.headerClasses.container}
            style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 50%, #1e40af 100%)',
            }}
          >
            {/* Patrón de fondo */}
            <div className={styles.headerClasses.backgroundPattern}>
              <div className='absolute left-10 top-10 h-32 w-32 animate-pulse rounded-full bg-white/10'></div>
              <div className='absolute bottom-10 right-10 h-24 w-24 animate-pulse rounded-full bg-white/10'></div>
            </div>

            {/* Breadcrumb */}
            <div className={styles.headerClasses.breadcrumb}>
              <User className={styles.headerClasses.breadcrumbIcon} />
              <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
              <span>Clientes</span>
              <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
              <span className={styles.headerClasses.breadcrumbCurrent}>
                {cliente.nombre_completo}
              </span>
            </div>

            {/* Contenido Principal */}
            <div className={styles.headerClasses.contentWrapper}>
              <div className={styles.headerClasses.leftSection}>
                <motion.div
                  className={styles.headerClasses.iconContainer}
                  {...styles.animations.hoverScale}
                >
                  <User className={styles.headerClasses.icon} />
                </motion.div>

                <div className={styles.headerClasses.titleSection}>
                  {/* Nombre + Estado (lo más importante primero) */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className={styles.headerClasses.title}>
                      {cliente.nombre_completo}
                    </h1>
                    <EstadoBadge estado={cliente.estado} />
                  </div>

                  {/* Documento pegado al nombre (sin ícono, compacto) */}
                  <p className="text-sm text-white/80 dark:text-white/70 font-medium mt-0.5 mb-2">
                    {cliente.tipo_documento} {cliente.numero_documento}
                  </p>

                  {/* Info de Vivienda Asignada (solo para clientes Activos con negociación) */}
                  {cliente.estado === 'Activo' && (cliente as any).negociaciones?.[0] && (() => {
                    const neg = (cliente as any).negociaciones[0]
                    const proyecto = neg?.viviendas?.manzanas?.proyectos?.nombre || 'Sin proyecto'
                    const manzana = neg?.viviendas?.manzanas?.nombre || 'N/A'
                    const numero = neg?.viviendas?.numero || 'N/A'

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20"
                      >
                        {/* Línea 1: Texto informativo */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <Info className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                          <p className="text-xs text-white/90 font-medium">
                            Este cliente actualmente tiene asignada la vivienda:
                          </p>
                        </div>

                        {/* Línea 2: Mza. Casa del Proyecto */}
                        <div className="flex items-center gap-1.5 flex-wrap ml-5">
                          <Home className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                          <span className="text-xs text-white font-semibold">
                            Mza. {manzana} Casa {numero}
                          </span>
                          <span className="text-xs text-white/70">del proyecto</span>
                          <Building2 className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
                          <span className="text-xs text-white font-semibold">
                            {proyecto}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })()}
                </div>
              </div>

              {/* Acciones */}
              <div className={styles.headerClasses.actionsContainer}>
                {/* ✅ Botón Asignar Vivienda (solo visible para Interesados sin negociación) */}
                {cliente.estado === 'Interesado' && !(cliente as any).negociaciones?.length && (
                  <Tooltip
                    content={mensajeValidacion}
                    side="bottom"
                  >
                    <motion.button
                      onClick={handleIniciarAsignacion}
                      disabled={!puedeAsignar || cargandoAsignacion}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        puedeAsignar && !cargandoAsignacion
                          ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 hover:shadow-lg hover:shadow-white/20'
                          : 'bg-gray-400/20 border border-gray-400/30 text-gray-300 cursor-not-allowed opacity-60'
                      }`}
                      whileHover={puedeAsignar && !cargandoAsignacion ? { scale: 1.05 } : {}}
                      whileTap={puedeAsignar && !cargandoAsignacion ? { scale: 0.95 } : {}}
                    >
                      {puedeAsignar && !cargandoAsignacion ? (
                        <Home className='h-4 w-4' />
                      ) : (
                        <Lock className='h-4 w-4' />
                      )}
                      <span className="hidden sm:inline">Asignar Vivienda</span>
                      <span className="sm:hidden">Asignar</span>
                    </motion.button>
                  </Tooltip>
                )}
                <button
                  className={styles.headerClasses.actionButton}
                  onClick={handleEditar}
                >
                  <Edit2 className='h-4 w-4' />
                </button>
                <button
                  className={styles.headerClasses.deleteButton}
                  onClick={handleEliminar}
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tabs Mejorados */}
          <motion.div
            {...styles.animations.fadeInUp}
            transition={{ delay: 0.2 }}
            className={styles.tabsClasses.container}
          >
            <nav className={styles.tabsClasses.nav}>
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => cambiarTab(tab.id)}
                  className={`${styles.tabsClasses.tab} ${
                    activeTab === tab.id
                      ? styles.tabsClasses.tabActive
                      : styles.tabsClasses.tabInactive
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.tabsClasses.tabContent}>
                    <tab.icon className={styles.tabsClasses.tabIcon} />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={styles.tabsClasses.tabBadge}>
                        {tab.count}
                      </span>
                    )}
                    {tab.badge && (
                      <motion.span
                        className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                          tab.badge.color === 'orange'
                            ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                        animate={tab.badge.pulse ? {
                          scale: [1, 1.05, 1],
                          opacity: [0.8, 1, 0.8],
                        } : {}}
                        transition={tab.badge.pulse ? {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        } : {}}
                      >
                        {tab.badge.text}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Contenido de Tabs - Componentes Modulares */}
          {activeTab === 'general' && <GeneralTab cliente={cliente} />}
          {activeTab === 'intereses' && (
            <InteresesTab
              cliente={cliente}
              onRegistrarInteres={handleRegistrarInteres}
            />
          )}
          {activeTab === 'negociaciones' && <NegociacionesTab cliente={cliente} />}
          {activeTab === 'documentos' && <DocumentosTab cliente={cliente} />}
          {activeTab === 'actividad' && <ActividadTab clienteId={clienteUUID} />}
          {activeTab === 'historial' && (
            <HistorialTab
              clienteId={clienteUUID || ''}
              clienteNombre={`${cliente.nombres} ${cliente.apellidos}`}
            />
          )}
        </div>

        {/* Modal Registrar Interés */}
        <ModalRegistrarInteres
          isOpen={modalInteresAbierto}
          onClose={cerrarModalInteres}
          clienteId={clienteUUID}
          onSuccess={handleInteresRegistrado}
        />
      </motion.div>
    </AnimatePresence>
  )
}
