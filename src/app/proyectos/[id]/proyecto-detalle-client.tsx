'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
    ArrowLeft,
    Building2,
    ChevronRight,
    Edit2,
    FileText,
    Home,
    Info,
    MapPin,
    Trash2
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
// ✅ REACT QUERY: Hooks con cache inteligente (reemplazan Zustand)
import { useProyectoQuery, useProyectosQuery } from '@/modules/proyectos/hooks'



import * as styles from './proyecto-detalle.styles'
import { DocumentosTab, GeneralTab, ManzanasTab } from './tabs'

interface ProyectoDetalleClientProps {
  proyectoId: string
}

type TabType = 'info' | 'documentos' | 'manzanas'

const estadoColors = {
  en_planificacion:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  en_construccion:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  completado:
    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  pausado: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
}

const estadoLabels = {
  en_planificacion: 'En Planificación',
  en_construccion: 'En Construcción',
  completado: 'Completado',
  pausado: 'Pausado',
}

export default function ProyectoDetalleClient({
  proyectoId,
}: ProyectoDetalleClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  // ✅ REACT QUERY: Hook de detalle con cache (reemplaza useEffect + service)
  const { proyecto, cargando: loading, error } = useProyectoQuery(proyectoId)
  const { eliminarProyecto } = useProyectosQuery()

  const [activeTab, setActiveTab] = useState<TabType>('info')

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
      await eliminarProyecto(proyectoId)
      router.push('/proyectos')
    }
  }

  const handleEdit = () => {
    // TODO: Implementar edición
    console.log('Editar proyecto:', proyectoId)
  }

  // Manejo de error
  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Building2 className='mx-auto mb-4 h-16 w-16 text-red-500' />
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Error al cargar proyecto
          </h2>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            {error.message || 'Ocurrió un error inesperado'}
          </p>
          <Button onClick={() => router.push('/proyectos')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a proyectos
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar loader mientras carga
  if (loading || !proyecto) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
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
            <Building2 className="mx-auto mb-4 h-16 w-16 text-green-500" strokeWidth={2} />
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
            Cargando proyecto...
          </motion.p>

          <div className="mt-4 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-green-500"
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
      id: 'manzanas' as const,
      label: 'Manzanas',
      icon: Home,
      count: proyecto.manzanas.length,
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
        className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20'
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

        {/* Header Mejorado con Glassmorphism */}
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
            <span>Proyectos</span>
            <ChevronRight className={styles.headerClasses.breadcrumbIcon} />
            <span className={styles.headerClasses.breadcrumbCurrent}>
              {proyecto.nombre}
            </span>
          </div>

          {/* Contenido Principal */}
          <div className={styles.headerClasses.contentWrapper}>
            <div className={styles.headerClasses.leftSection}>
              <motion.div
                className={styles.headerClasses.iconContainer}
                {...styles.animations.hoverScale}
              >
                <Building2 className={styles.headerClasses.icon} />
              </motion.div>

              <div className={styles.headerClasses.titleSection}>
                <h1 className={styles.headerClasses.title}>
                  {proyecto.nombre}
                </h1>
                <div className={styles.headerClasses.location}>
                  <MapPin className={styles.headerClasses.locationIcon} />
                  <span>{proyecto.ubicacion}</span>
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
                onClick={handleDelete}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs Mejorados - MOVIDOS ARRIBA (antes de stats) */}
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
        {activeTab === 'info' && <GeneralTab proyecto={proyecto} />}

        {activeTab === 'documentos' && <DocumentosTab proyecto={proyecto} />}

        {activeTab === 'manzanas' && <ManzanasTab proyecto={proyecto} />}
      </div>
    </motion.div>
    </AnimatePresence>
  )
}
