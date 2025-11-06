'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
// ✅ REACT QUERY: Hooks con cache inteligente (reemplazan Zustand)
import { useProyectoQuery, useProyectosQuery } from '@/modules/proyectos/hooks'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import { motion } from 'framer-motion'
import {
    Activity,
    ArrowLeft,
    Building2,
    Calendar,
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

  // Manejo de error antes del loading
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

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Building2 className='mx-auto mb-4 h-16 w-16 animate-pulse text-blue-500' />
          <p className='text-gray-600 dark:text-gray-400'>
            Cargando proyecto...
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-500 mt-2'>
            ID: {proyectoId}
          </p>
        </div>
      </div>
    )
  }

  if (!proyecto) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Building2 className='mx-auto mb-4 h-16 w-16 text-gray-400' />
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Proyecto no encontrado
          </h2>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            El proyecto que buscas no existe o fue eliminado.
          </p>
          <Button onClick={() => router.push('/proyectos')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a proyectos
          </Button>
        </div>
      </div>
    )
  }

  const totalViviendas = proyecto.manzanas.reduce(
    (sum, m) => sum + m.totalViviendas,
    0
  )

  // Stats data con gradientes
  const statsData = [
    {
      label: 'Presupuesto',
      value: formatCurrency(proyecto.presupuesto),
      icon: DollarSign,
      gradient: styles.gradients.presupuesto,
      progress: 0,
    },
    {
      label: 'Manzanas',
      value: proyecto.manzanas.length.toString(),
      icon: Home,
      gradient: styles.gradients.manzanas,
      progress: 100,
    },
    {
      label: 'Viviendas',
      value: totalViviendas.toString(),
      icon: Building2,
      gradient: styles.gradients.viviendas,
      progress: 0,
    },
    {
      label: 'Creado',
      value: formatDate(proyecto.fechaCreacion),
      icon: Calendar,
      gradient: styles.gradients.fecha,
      progress: 100,
    },
  ]

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
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20'>
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

        {/* Barra de Progreso Mejorada */}
        <motion.div
          {...styles.animations.fadeInUp}
          transition={{ delay: 0.2 }}
          className={styles.progressClasses.container}
        >
          <div className={styles.progressClasses.header}>
            <div className={styles.progressClasses.leftSection}>
              <div className={styles.progressClasses.iconContainer}>
                <Activity className={styles.progressClasses.icon} />
              </div>
              <div className={styles.progressClasses.titleSection}>
                <p className={styles.progressClasses.title}>
                  Progreso de Ventas
                </p>
                <p className={styles.progressClasses.subtitle}>
                  Calculado según viviendas vendidas
                </p>
              </div>
            </div>
            <div className={styles.progressClasses.rightSection}>
              <p className={styles.progressClasses.percentage}>
                0%
              </p>
              <p className={styles.progressClasses.percentageLabel}>
                Vendidas
              </p>
            </div>
          </div>

          {/* Barra con gradiente animado */}
          <div className={styles.progressClasses.bar}>
            <motion.div
              className={styles.progressClasses.barFill}
              initial={{ width: 0 }}
              animate={{ width: '0%' }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            >
              <div className={`${styles.progressClasses.shimmer} animate-shimmer`}></div>
            </motion.div>
          </div>

          {/* Milestones */}
          <div className={styles.progressClasses.milestones}>
            <div className={styles.progressClasses.milestone}>
              <div className={styles.progressClasses.milestoneValue}>
                {totalViviendas}
              </div>
              <div className={styles.progressClasses.milestoneLabel}>
                Total
              </div>
            </div>
            <div className={styles.progressClasses.milestone}>
              <div className={styles.progressClasses.milestoneValue}>0</div>
              <div className={styles.progressClasses.milestoneLabel}>
                Vendidas
              </div>
            </div>
            <div className={styles.progressClasses.milestone}>
              <div className={styles.progressClasses.milestoneValue}>
                {totalViviendas}
              </div>
              <div className={styles.progressClasses.milestoneLabel}>
                Disponibles
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards Mejorados */}
        <div className={styles.statsCardClasses.container}>
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              {...styles.animations.fadeInUp}
              transition={{ delay: 0.3 + index * 0.1 }}
              {...styles.animations.hoverLift}
              className={styles.statsCardClasses.card}
            >
              {/* Gradiente de fondo en hover */}
              <div
                className={`${styles.statsCardClasses.gradientOverlay} bg-gradient-to-br ${stat.gradient}`}
              ></div>

              <div className={styles.statsCardClasses.header}>
                <motion.div
                  className={`${styles.statsCardClasses.iconWrapper} bg-gradient-to-br ${stat.gradient}`}
                  {...styles.animations.hoverRotate}
                >
                  <stat.icon className={styles.statsCardClasses.icon} />
                </motion.div>
              </div>

              <div className={styles.statsCardClasses.content}>
                <p className={styles.statsCardClasses.label}>{stat.label}</p>
                <p className={styles.statsCardClasses.value}>{stat.value}</p>
              </div>

              {/* Barra de progreso */}
              <div className={styles.statsCardClasses.progressBar}>
                <motion.div
                  className={`${styles.statsCardClasses.progressFill} bg-gradient-to-r ${stat.gradient}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs Mejorados */}
        <motion.div
          {...styles.animations.fadeInUp}
          transition={{ delay: 0.7 }}
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
                whileHover={{ y: -2 }}
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

                {activeTab === tab.id && (
                  <motion.div
                    layoutId='activeTab'
                    className={styles.tabsClasses.tabUnderline}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Contenido de Tabs - Componentes Modulares */}
        {activeTab === 'info' && <GeneralTab proyecto={proyecto} />}

        {activeTab === 'documentos' && <DocumentosTab proyecto={proyecto} />}

        {activeTab === 'manzanas' && <ManzanasTab proyecto={proyecto} />}
      </div>
    </div>
  )
}
