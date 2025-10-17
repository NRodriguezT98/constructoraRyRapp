'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency, formatDate } from '@/shared/utils'
import { motion } from 'framer-motion'
import {
    Activity,
    ArrowLeft,
    Building2,
    Calendar,
    ChevronRight,
    Compass,
    DollarSign,
    Edit2,
    FileText,
    FolderOpen,
    Home,
    Info,
    Mail,
    MapPin,
    Phone,
    Plus,
    Receipt,
    Trash2,
    User,
    UserPlus,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import * as styles from './vivienda-detalle.styles'

interface ViviendaDetalleClientProps {
  viviendaId: string
}

type TabType = 'info' | 'linderos' | 'documentos' | 'abonos'

const estadoColors = {
  Disponible: {
    gradient: 'from-teal-500 via-emerald-500 to-green-500',
  },
  Asignada: {
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
  },
  Pagada: {
    gradient: 'from-emerald-600 via-green-600 to-teal-700',
  },
}

export default function ViviendaDetalleClient({
  viviendaId,
}: ViviendaDetalleClientProps) {
  const router = useRouter()
  const [vivienda, setVivienda] = useState<Vivienda | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('info')

  useEffect(() => {
    const cargarVivienda = async () => {
      setLoading(true)
      try {
        const { viviendasService } = await import(
          '@/modules/viviendas/services/viviendas.service'
        )
        const viviendaData = await viviendasService.obtenerVivienda(viviendaId)
        setVivienda(viviendaData)
      } catch (error) {
        console.error('Error al cargar vivienda:', error)
        setVivienda(null)
      } finally {
        setLoading(false)
      }
    }

    cargarVivienda()
  }, [viviendaId])

  const handleAsignarCliente = () => {
    console.log('Asignar cliente a vivienda:', viviendaId)
  }

  const handleRegistrarAbono = () => {
    console.log('Registrar abono para vivienda:', viviendaId)
  }

  const handleEditar = () => {
    console.log('Editar vivienda:', viviendaId)
  }

  const handleEliminar = () => {
    if (window.confirm('¿Estás seguro de eliminar esta vivienda?')) {
      console.log('Eliminar vivienda:', viviendaId)
      router.push('/viviendas')
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Home className='mx-auto mb-4 h-16 w-16 animate-pulse text-emerald-500' />
          <p className='text-gray-600 dark:text-gray-400'>
            Cargando vivienda...
          </p>
        </div>
      </div>
    )
  }

  if (!vivienda) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Home className='mx-auto mb-4 h-16 w-16 text-gray-400' />
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Vivienda no encontrada
          </h2>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            La vivienda que buscas no existe o fue eliminada.
          </p>
          <Button onClick={() => router.push('/viviendas')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a viviendas
          </Button>
        </div>
      </div>
    )
  }

  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'
  const manzanaNombre = vivienda.manzanas?.nombre || '?'
  const colors = estadoColors[vivienda.estado as keyof typeof estadoColors] || estadoColors.Disponible

  // Configuración de tabs
  const tabs = [
    { id: 'info' as const, label: 'Información', icon: Info, count: null },
    { id: 'linderos' as const, label: 'Linderos', icon: Compass, count: null },
    {
      id: 'documentos' as const,
      label: 'Documentos',
      icon: FileText,
      count: null,
    },
    ...(vivienda.estado !== 'Disponible'
      ? [
          {
            id: 'abonos' as const,
            label: 'Abonos',
            icon: Receipt,
            count: vivienda.cantidad_abonos || 0,
          },
        ]
      : []),
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 p-6 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20'>
      <div className='mx-auto max-w-7xl space-y-6'>
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

        {/* Header con Glassmorphism */}
        <motion.div
          {...styles.animations.fadeInUp}
          transition={{ delay: 0.1 }}
          className={`${styles.headerClasses.container} bg-gradient-to-br ${colors.gradient}`}
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
              Manzana {manzanaNombre} - Casa {vivienda.numero}
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
                <h1 className={styles.headerClasses.title}>
                  Manzana {manzanaNombre} - Casa {vivienda.numero}
                </h1>
                <div className={styles.headerClasses.location}>
                  <MapPin className={styles.headerClasses.locationIcon} />
                  <span>{proyectoNombre}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className={styles.headerClasses.actionsContainer}>
              <Button
                className={styles.headerClasses.actionButton}
                onClick={handleEditar}
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

          {/* Estado Badge */}
          <div className='relative z-10 mt-4 flex items-center gap-3'>
            <span className={styles.headerClasses.statusBadge}>
              <span className={`${styles.headerClasses.statusDot} bg-white`}></span>
              <span className={styles.headerClasses.statusText}>
                {vivienda.estado}
              </span>
            </span>
            <span className={styles.headerClasses.statusBadge}>
              <span className={styles.headerClasses.statusText}>
                {vivienda.tipo_vivienda || 'Regular'}
              </span>
            </span>
            {vivienda.es_esquinera && (
              <span className={styles.headerClasses.statusBadge}>
                <span className={styles.headerClasses.statusText}>
                  🏘️ Esquinera
                </span>
              </span>
            )}
          </div>
        </motion.div>

        {/* Barra de Progreso (solo para Asignada/Pagada) */}
        {vivienda.estado !== 'Disponible' && (
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
                    Progreso de Pago
                  </p>
                  <p className={styles.progressClasses.subtitle}>
                    Calculado según abonos realizados
                  </p>
                </div>
              </div>
              <div className={styles.progressClasses.rightSection}>
                <p className={styles.progressClasses.percentage}>
                  {vivienda.porcentaje_pagado || 0}%
                </p>
                <p className={styles.progressClasses.percentageLabel}>
                  Completado
                </p>
              </div>
            </div>

            {/* Barra con gradiente animado */}
            <div className={styles.progressClasses.bar}>
              <motion.div
                className={styles.progressClasses.barFill}
                initial={{ width: 0 }}
                animate={{ width: `${vivienda.porcentaje_pagado || 0}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              >
                <div
                  className={`${styles.progressClasses.shimmer} animate-shimmer`}
                ></div>
              </motion.div>
            </div>

            {/* Milestones */}
            <div className={styles.progressClasses.milestones}>
              <div className={styles.progressClasses.milestone}>
                <div className={styles.progressClasses.milestoneValue}>
                  {formatCurrency(vivienda.total_abonado || 0)}
                </div>
                <div className={styles.progressClasses.milestoneLabel}>
                  Abonado
                </div>
              </div>
              <div className={styles.progressClasses.milestone}>
                <div className={styles.progressClasses.milestoneValue}>
                  {formatCurrency(vivienda.saldo_pendiente || vivienda.valor_total)}
                </div>
                <div className={styles.progressClasses.milestoneLabel}>
                  Pendiente
                </div>
              </div>
              <div className={styles.progressClasses.milestone}>
                <div className={styles.progressClasses.milestoneValue}>
                  {formatCurrency(vivienda.valor_total)}
                </div>
                <div className={styles.progressClasses.milestoneLabel}>
                  Total
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          {...styles.animations.fadeInUp}
          transition={{ delay: 0.3 }}
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
                  {tab.count !== null && tab.count > 0 && (
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

        {/* Contenido de Tabs */}
        {activeTab === 'info' && (
          <InfoTab vivienda={vivienda} onAsignarCliente={handleAsignarCliente} />
        )}

        {activeTab === 'linderos' && <LinderosTab vivienda={vivienda} />}

        {activeTab === 'documentos' && <DocumentosTab viviendaId={viviendaId} />}

        {activeTab === 'abonos' && vivienda.estado !== 'Disponible' && (
          <AbonosTab
            vivienda={vivienda}
            onRegistrarAbono={handleRegistrarAbono}
          />
        )}
      </div>
    </div>
  )
}

// ============================================
// TAB: INFORMACIÓN GENERAL
// ============================================
function InfoTab({
  vivienda,
  onAsignarCliente,
}: {
  vivienda: Vivienda
  onAsignarCliente: () => void
}) {
  return (
    <motion.div
      key='info'
      {...styles.animations.fadeInUp}
      className='grid gap-6 lg:grid-cols-2'
    >
      {/* Información Técnica */}
      <Card className={styles.infoCardClasses.card}>
        <CardHeader>
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.tecnica}`}
            >
              <Building2 className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>
              Información Técnica
            </h3>
          </div>
        </CardHeader>
        <CardContent className={styles.infoCardClasses.content}>
          {vivienda.matricula_inmobiliaria && (
            <div>
              <p className={styles.infoCardClasses.label}>
                Matrícula Inmobiliaria
              </p>
              <p className={`${styles.infoCardClasses.value} font-mono`}>
                {vivienda.matricula_inmobiliaria}
              </p>
            </div>
          )}
          {vivienda.nomenclatura && (
            <div>
              <p className={styles.infoCardClasses.label}>
                Nomenclatura Catastral
              </p>
              <p className={styles.infoCardClasses.value}>
                {vivienda.nomenclatura}
              </p>
            </div>
          )}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className={styles.infoCardClasses.label}>Área Construida</p>
              <p className={styles.infoCardClasses.value}>
                {vivienda.area_construida || 'N/A'} m<sup>2</sup>
              </p>
            </div>
            <div>
              <p className={styles.infoCardClasses.label}>Área de Lote</p>
              <p className={styles.infoCardClasses.value}>
                {vivienda.area_lote || 'N/A'} m<sup>2</sup>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Financiera */}
      <Card className={styles.infoCardClasses.card}>
        <CardHeader>
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.financiera}`}
            >
              <DollarSign className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>
              Información Financiera
            </h3>
          </div>
        </CardHeader>
        <CardContent className={styles.infoCardClasses.content}>
          <div>
            <p className={styles.infoCardClasses.label}>Valor Total</p>
            <p className={`${styles.infoCardClasses.value} text-2xl`}>
              {formatCurrency(vivienda.valor_total)}
            </p>
          </div>
          {vivienda.es_esquinera && (
            <div>
              <p className={styles.infoCardClasses.label}>Recargo Esquinera</p>
              <p className={styles.infoCardClasses.value}>
                {formatCurrency(vivienda.recargo_esquinera)}
              </p>
            </div>
          )}
          <div>
            <p className={styles.infoCardClasses.label}>Gastos Notariales</p>
            <p className={styles.infoCardClasses.value}>
              {formatCurrency(vivienda.gastos_notariales || 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información del Cliente (si aplica) */}
      {vivienda.estado !== 'Disponible' && (
        <Card className={styles.infoCardClasses.card}>
          <CardHeader>
            <div className={styles.infoCardClasses.header}>
              <div
                className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.cliente}`}
              >
                <User className={styles.infoCardClasses.icon} />
              </div>
              <h3 className={styles.infoCardClasses.title}>Cliente Asignado</h3>
            </div>
          </CardHeader>
          <CardContent className={styles.infoCardClasses.content}>
            <div>
              <p className={styles.infoCardClasses.label}>Nombre</p>
              <p className={styles.infoCardClasses.value}>
                {vivienda.clientes?.nombre_completo || 'No disponible'}
              </p>
            </div>
            {vivienda.clientes?.telefono && (
              <div className={styles.infoCardClasses.row}>
                <Phone className={styles.infoCardClasses.rowIcon} />
                <span>{vivienda.clientes.telefono}</span>
              </div>
            )}
            {vivienda.clientes?.email && (
              <div className={styles.infoCardClasses.row}>
                <Mail className={styles.infoCardClasses.rowIcon} />
                <span>{vivienda.clientes.email}</span>
              </div>
            )}
            {vivienda.fecha_asignacion && (
              <div className={styles.infoCardClasses.row}>
                <Calendar className={styles.infoCardClasses.rowIcon} />
                <span>
                  Asignada el {formatDate(vivienda.fecha_asignacion)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fechas Importantes */}
      <Card className={styles.infoCardClasses.card}>
        <CardHeader>
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.fechas}`}
            >
              <Calendar className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>Fechas Importantes</h3>
          </div>
        </CardHeader>
        <CardContent className={styles.infoCardClasses.content}>
          <div>
            <p className={styles.infoCardClasses.label}>Fecha de Creación</p>
            <p className={styles.infoCardClasses.value}>
              {formatDate(vivienda.fecha_creacion)}
            </p>
          </div>
          {vivienda.fecha_asignacion && (
            <div>
              <p className={styles.infoCardClasses.label}>Fecha de Asignación</p>
              <p className={styles.infoCardClasses.value}>
                {formatDate(vivienda.fecha_asignacion)}
              </p>
            </div>
          )}
          {vivienda.fecha_pago_completo && (
            <div>
              <p className={styles.infoCardClasses.label}>
                Fecha de Pago Completo
              </p>
              <p className={styles.infoCardClasses.value}>
                {formatDate(vivienda.fecha_pago_completo)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acción Quick */}
      {vivienda.estado === 'Disponible' && (
        <Card className='lg:col-span-2'>
          <CardContent className='flex items-center justify-between p-6'>
            <div>
              <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                Esta vivienda está disponible
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Puedes asignarle un cliente para iniciar el proceso de venta
              </p>
            </div>
            <Button
              onClick={onAsignarCliente}
              className='bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
            >
              <UserPlus className='mr-2 h-4 w-4' />
              Asignar Cliente
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

// ============================================
// TAB: LINDEROS
// ============================================
function LinderosTab({ vivienda }: { vivienda: Vivienda }) {
  const linderos = [
    {
      direccion: 'Norte',
      descripcion: vivienda.lindero_norte,
      icon: '⬆️',
      color: 'blue',
    },
    {
      direccion: 'Sur',
      descripcion: vivienda.lindero_sur,
      icon: '⬇️',
      color: 'orange',
    },
    {
      direccion: 'Oriente',
      descripcion: vivienda.lindero_oriente,
      icon: '➡️',
      color: 'purple',
    },
    {
      direccion: 'Occidente',
      descripcion: vivienda.lindero_occidente,
      icon: '⬅️',
      color: 'green',
    },
  ]

  return (
    <motion.div key='linderos' {...styles.animations.fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Compass className='h-5 w-5 text-emerald-600' />
            Linderos de la Vivienda
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mapa Visual de Linderos */}
          <div className='relative mx-auto mb-8 aspect-square max-w-md'>
            {/* Casa Central */}
            <div className='absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'>
              <Home className='h-12 w-12 text-emerald-600' />
            </div>

            {/* Norte */}
            <div className='absolute left-1/2 top-4 w-48 -translate-x-1/2 text-center'>
              <div className='mb-2 text-4xl'>{linderos[0].icon}</div>
              <div className='rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20'>
                <p className='text-xs font-bold text-blue-700 dark:text-blue-300'>
                  NORTE
                </p>
              </div>
            </div>

            {/* Sur */}
            <div className='absolute bottom-4 left-1/2 w-48 -translate-x-1/2 text-center'>
              <div className='rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-900/20'>
                <p className='text-xs font-bold text-orange-700 dark:text-orange-300'>
                  SUR
                </p>
              </div>
              <div className='mt-2 text-4xl'>{linderos[1].icon}</div>
            </div>

            {/* Oriente */}
            <div className='absolute right-4 top-1/2 flex w-24 -translate-y-1/2 flex-col items-center'>
              <div className='text-4xl'>{linderos[2].icon}</div>
              <div className='mt-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-900/20'>
                <p className='text-xs font-bold text-purple-700 dark:text-purple-300'>
                  ORIENTE
                </p>
              </div>
            </div>

            {/* Occidente */}
            <div className='absolute left-4 top-1/2 flex w-24 -translate-y-1/2 flex-col items-center'>
              <div className='text-4xl'>{linderos[3].icon}</div>
              <div className='mt-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20'>
                <p className='text-xs font-bold text-green-700 dark:text-green-300'>
                  OCCIDENTE
                </p>
              </div>
            </div>
          </div>

          {/* Descripciones Detalladas */}
          <div className='grid gap-4 md:grid-cols-2'>
            {linderos.map((lindero) => (
              <Card
                key={lindero.direccion}
                className={`border-${lindero.color}-200 bg-${lindero.color}-50 dark:border-${lindero.color}-800 dark:bg-${lindero.color}-900/20`}
              >
                <CardContent className='p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <span className='text-2xl'>{lindero.icon}</span>
                    <h4 className='font-bold text-gray-900 dark:text-gray-100'>
                      {lindero.direccion}
                    </h4>
                  </div>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>
                    {lindero.descripcion || 'No especificado'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// TAB: DOCUMENTACIÓN
// ============================================
function DocumentosTab({ viviendaId }: { viviendaId: string }) {
  return (
    <motion.div key='documentos' {...styles.animations.fadeInUp}>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-blue-600' />
              Documentos de la Vivienda
            </CardTitle>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Subir Documento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='py-12 text-center'>
            <FolderOpen className='mx-auto mb-4 h-16 w-16 text-gray-400' />
            <p className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Sistema de documentos en desarrollo
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Próximamente podrás gestionar:
            </p>
            <ul className='mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400'>
              <li>📄 Certificado de Tradición y Libertad</li>
              <li>📐 Planos y diseños</li>
              <li>📝 Escrituras</li>
              <li>🏗️ Licencias de construcción</li>
              <li>📋 Otros documentos legales</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// TAB: ABONOS
// ============================================
function AbonosTab({
  vivienda,
  onRegistrarAbono,
}: {
  vivienda: Vivienda
  onRegistrarAbono: () => void
}) {
  return (
    <motion.div key='abonos' {...styles.animations.fadeInUp}>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Receipt className='h-5 w-5 text-blue-600' />
              Historial de Abonos
            </CardTitle>
            <Button
              onClick={onRegistrarAbono}
              className='bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
            >
              <Plus className='mr-2 h-4 w-4' />
              Registrar Abono
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Resumen de Pagos */}
          <div className='mb-6 grid gap-4 md:grid-cols-3'>
            <Card className='border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'>
              <CardContent className='p-4'>
                <p className='mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400'>
                  Total Abonado
                </p>
                <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                  {formatCurrency(vivienda.total_abonado || 0)}
                </p>
              </CardContent>
            </Card>
            <Card className='border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'>
              <CardContent className='p-4'>
                <p className='mb-1 text-xs font-semibold text-orange-600 dark:text-orange-400'>
                  Saldo Pendiente
                </p>
                <p className='text-2xl font-bold text-orange-900 dark:text-orange-100'>
                  {formatCurrency(vivienda.saldo_pendiente || vivienda.valor_total)}
                </p>
              </CardContent>
            </Card>
            <Card className='border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'>
              <CardContent className='p-4'>
                <p className='mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                  Número de Abonos
                </p>
                <p className='text-2xl font-bold text-emerald-900 dark:text-emerald-100'>
                  {vivienda.cantidad_abonos || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Abonos */}
          <div className='py-12 text-center'>
            <Receipt className='mx-auto mb-4 h-16 w-16 text-gray-400' />
            <p className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Sistema de abonos en desarrollo
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Próximamente podrás ver el historial completo de pagos y registrar
              nuevos abonos
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
