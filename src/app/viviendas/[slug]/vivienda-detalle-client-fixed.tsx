'use client'

import {
    ArrowLeft,
    Building2,
    ChevronRight,
    DollarSign,
    Edit2,
    Home,
    Info,
    MapPin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Hooks
import { useViviendaQuery } from '@/modules/viviendas/hooks/useViviendaQuery'

// Componentes UI
import { Button } from '@/components/ui/button'
// import { Modal } from '@/shared/components/ui/Modal' // ⚠️ DESHABILITADO: usa framer-motion

// Componentes de tabs
// import {
//     AbonosTab,
//     InfoTab,
// } from '@/modules/viviendas/components/detalle'

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
 * Vista de detalle de vivienda - VERSIÓN SIN FRAMER MOTION
 * Transiciones CSS para mejor rendimiento y compatibilidad
 */
export default function ViviendaDetalleClient({ viviendaId }: ViviendaDetalleClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [modalEliminar, setModalEliminar] = useState(false)

  const { vivienda, loading, error } = useViviendaQuery(viviendaId)

  const handleEdit = () => {
    router.push(`/viviendas/${viviendaId}/editar`)
  }

  const handleEliminar = () => {
    setModalEliminar(true)
  }

  const confirmarEliminar = async () => {
    try {
      console.log('Eliminar vivienda:', viviendaId)
      router.push('/viviendas')
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  // Loading state
  if (loading || !vivienda) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/20">
        <div className="text-center animate-fade-in">
          <div className="animate-bounce-slow">
            <Home className="mx-auto mb-4 h-16 w-16 text-orange-500" strokeWidth={2} />
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
            Cargando vivienda...
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'info' as const, label: 'Información', icon: Info, count: null },
    // { id: 'documentos' as const, label: 'Documentos', icon: FileText, count: null }, // ⚠️ DESHABILITADO: framer-motion
    { id: 'abonos' as const, label: 'Abonos', icon: DollarSign, count: vivienda.cantidad_abonos || 0 },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/20 animate-fade-in'>
      <div className='mx-auto max-w-7xl space-y-4'>
        {/* Botón Volver */}
        <div className="animate-slide-down">
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='group transition-transform hover:-translate-x-1'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver
          </Button>
        </div>

        {/* Header Premium */}
        <div className={`${styles.headerClasses.container} animate-slide-down`} style={{ animationDelay: '100ms' }}>
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
              <div className={`${styles.headerClasses.iconContainer} transition-transform hover:scale-110`}>
                <Home className={styles.headerClasses.icon} />
              </div>

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
              {/* Botón eliminar deshabilitado: Modal usa framer-motion */}
              {/* <Button
                className={styles.headerClasses.deleteButton}
                onClick={handleEliminar}
              >
                <Trash2 className='h-4 w-4' />
              </Button> */}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${styles.tabsClasses.container} animate-slide-down`} style={{ animationDelay: '200ms' }}>
          <nav className={styles.tabsClasses.nav}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabsClasses.tab} transition-all hover:scale-105 active:scale-95 ${
                  activeTab === tab.id
                    ? styles.tabsClasses.tabActive
                    : styles.tabsClasses.tabInactive
                }`}
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
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de Tabs */}
        <div className="animate-fade-in">
          {activeTab === 'info' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Información de Vivienda</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID</p>
                  <p className="text-lg font-semibold">{vivienda.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Número</p>
                  <p className="text-lg font-semibold">{vivienda.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                  <p className="text-lg font-semibold">{vivienda.estado}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manzana</p>
                  <p className="text-lg font-semibold">{vivienda.manzanas?.nombre}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'abonos' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Abonos</h2>
              <p>Total abonado: ${vivienda.total_abonado || 0}</p>
              <p>Cantidad de abonos: {vivienda.cantidad_abonos || 0}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Eliminación - DESHABILITADO: Modal usa framer-motion */}
      {/* <Modal
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        title="Eliminar Vivienda"
        icon={<Trash2 className="w-6 h-6" />}
        gradientColor="red"
      >
        ...
      </Modal> */}
    </div>
  )
}
