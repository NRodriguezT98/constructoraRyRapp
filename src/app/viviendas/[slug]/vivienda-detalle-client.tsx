'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
    ArrowLeft,
    Building2,
    ChevronRight,
    DollarSign,
    Edit2,
    FileText,
    Home,
    Info,
    MapPin,
    Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Hooks
import { useViviendaQuery } from '@/modules/viviendas/hooks/useViviendaQuery'

// Componentes UI
import { Button } from '@/components/ui/button'
import { Modal } from '@/shared/components/ui/Modal'

// Componentes de tabs
import {
    AbonosTab,
    DocumentosTab,
    InfoTab,
} from '@/modules/viviendas/components/detalle'

// Estilos
import * as styles from './vivienda-detalle.styles'

interface ViviendaDetalleClientProps {
  viviendaId: string
}

type TabType = 'info' | 'documentos' | 'abonos'

// Estados de vivienda con colores (tema naranja/ámbar)
const estadoColors = {
  Disponible: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800',
  Reservada: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800',
  Asignada: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800',
  Vendida: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800',
}

function formatearEstadoVivienda(estado: string): string {
  return estado || 'Sin estado'
}


/**
 * Vista de detalle de vivienda - Diseño Premium con Glassmorphism
 * Sigue el patrón de proyecto-detalle-client.tsx
 * - React Query para data fetching
 * - Header premium con gradiente naranja/ámbar
 * - Breadcrumb navigation
 * - Tabs con animaciones
 * - Modales de edición/eliminación
 */
export default function ViviendaDetalleClient({ viviendaId }: ViviendaDetalleClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [modalEditar, setModalEditar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)

  // React Query hook
  const { vivienda, loading, error } = useViviendaQuery(viviendaId)

  // Handlers
  const handleEdit = () => {
    setModalEditar(true)
  }

  const handleEliminar = () => {
    setModalEliminar(true)
  }

  const confirmarEliminar = async () => {
    try {
      // TODO: Implementar mutation de eliminación
      console.log('Eliminar vivienda:', viviendaId)
      router.push('/viviendas')
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  // Loading state premium
  if (loading || !vivienda) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Home className="mx-auto mb-4 h-16 w-16 text-orange-500" strokeWidth={2} />
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
            Cargando vivienda...
          </motion.p>

          <div className="mt-4 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-orange-500"
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

  const tabs = [
    { id: 'info' as const, label: 'Información', icon: Info, count: null },
    {
      id: 'documentos' as const,
      label: 'Documentos',
      icon: FileText,
      count: null,
    },
    {
      id: 'abonos' as const,
      label: 'Abonos',
      icon: DollarSign,
      count: vivienda.cantidad_abonos || 0,
    },
  ]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/20'
      >
        <div className='mx-auto max-w-7xl space-y-4'>
          {/* Botón Volver */}
          <motion.div {...styles.animations.fadeInUp}>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='group'
            >
              <ArrowLeft className='mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1' />
              Volver
            </Button>
          </motion.div>

          {/* Header Premium con Glassmorphism */}
          <motion.div
            {...styles.animations.fadeInUp}
            transition={{ delay: 0.1 }}
            className={styles.headerClasses.container}
          >
            {/* Patrón de fondo */}
            <div className={styles.headerClasses.backgroundPattern}>
              <div className='absolute left-10 top-10 h-32 w-32 animate-pulse rounded-full bg-white/10'></div>
              <div className='absolute bottom-10 right-10 h-24 w-24 animate-pulse rounded-full bg-white/10'></div>
            </div>

            {/* Breadcrumb */}
            <div className={styles.headerClasses.breadcrumb}>
              <Home className={styles.headerClasses.breadcrumbIcon} />
              <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
              <span>Viviendas</span>
              <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
              <span className={styles.headerClasses.breadcrumbCurrent}>
                Mz. {vivienda.manzanas?.nombre || 'N/A'} Casa {vivienda.numero}
              </span>
            </div>

            {/* Contenido Principal */}
            <div className={styles.headerClasses.contentWrapper}>
              <div className={styles.headerClasses.leftSection}>
                <motion.div
                  className={styles.headerClasses.iconContainer}
                  {...styles.animations.hoverScale}
                >
                  <Home className={styles.headerClasses.icon} />
                </motion.div>

                <div className={styles.headerClasses.titleSection}>
                  <div className="flex items-center gap-3">
                    <h1 className={styles.headerClasses.title}>
                      Mz. {vivienda.manzanas?.nombre || 'N/A'} Casa {vivienda.numero}
                    </h1>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      estadoColors[vivienda.estado as keyof typeof estadoColors] || estadoColors.Disponible
                    }`}>
                      {formatearEstadoVivienda(vivienda.estado)}
                    </span>
                  </div>
                  <div className={styles.headerClasses.location}>
                    <Building2 className={styles.headerClasses.locationIcon} />
                    <span>{vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'}</span>
                    {vivienda.nomenclatura_catastral && (
                      <>
                        <span className="text-white/60">•</span>
                        <MapPin className={styles.headerClasses.locationIcon} />
                        <span>{vivienda.nomenclatura_catastral}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className={styles.headerClasses.actionsContainer}>
                <Button
                  className={styles.headerClasses.actionButton}
                  onClick={handleEdit}
                >
                  <Edit2 className='h-4 w-4' />
                </Button>
                <Button
                  className={styles.headerClasses.deleteButton}
                  onClick={handleEliminar}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
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
                  onClick={() => setActiveTab(tab.id)}
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
                  </div>
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Contenido de Tabs - Componentes Modulares */}
          {activeTab === 'info' && <InfoTab vivienda={vivienda} onAsignarCliente={() => {}} />}
          {activeTab === 'documentos' && <DocumentosTab viviendaId={viviendaId} />}
          {activeTab === 'abonos' && <AbonosTab vivienda={vivienda} onRegistrarAbono={() => {}} />}
        </div>

        {/* Modal de Eliminación */}
        <Modal
          isOpen={modalEliminar}
          onClose={() => setModalEliminar(false)}
          title="Eliminar Vivienda"
          icon={<Trash2 className="w-6 h-6" />}
          gradientColor="red"
        >
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                    ⚠️ Esta acción no se puede deshacer
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Se eliminará la vivienda <strong>"Mz. {vivienda.manzanas?.nombre} Casa {vivienda.numero}"</strong> y toda su información asociada.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setModalEliminar(false)}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarEliminar}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Vivienda
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </AnimatePresence>
  )
}
