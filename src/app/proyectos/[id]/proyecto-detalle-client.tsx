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
import { ConfirmarCambiosModal } from '@/modules/proyectos/components/confirmar-cambios-modal'
import { ProyectosBadgesResumen } from '@/modules/proyectos/components/proyectos-badges-resumen'
import { ProyectosForm } from '@/modules/proyectos/components/proyectos-form'
import { useProyectoConValidacion, useProyectosQuery } from '@/modules/proyectos/hooks'
import { useDetectarCambios } from '@/modules/proyectos/hooks/useDetectarCambios'
import { Modal } from '@/shared/components/ui/Modal'
// ✅ REACT QUERY: Hooks con cache inteligente (reemplazan Zustand)
import { useProyectoQuery } from '@/modules/proyectos/hooks'
import type { Proyecto, ProyectoFormData } from '@/modules/proyectos/types'
import { formatearEstadoProyecto } from '@/modules/proyectos/utils/estado.utils'



import * as styles from './proyecto-detalle.styles'
import { DocumentosTab, GeneralTab } from './tabs'

interface ProyectoDetalleClientProps {
  proyectoId: string
}

type TabType = 'info' | 'documentos' | 'manzanas'

const estadoColors = {
  en_planificacion:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
  en_construccion:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-700',
  completado:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700',
  pausado: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
}

export default function ProyectoDetalleClient({
  proyectoId,
}: ProyectoDetalleClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  // ✅ REACT QUERY: Hook de detalle con cache (reemplaza useEffect + service)
  const { proyecto, cargando: loading, error } = useProyectoQuery(proyectoId)
  const { actualizarProyecto, eliminarProyecto, actualizando } = useProyectosQuery()

  // Estados para modales
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [modalEditar, setModalEditar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [modalConfirmarCambios, setModalConfirmarCambios] = useState(false)
  const [totalesProyecto, setTotalesProyecto] = useState({ totalManzanas: 0, totalViviendas: 0 })
  const [datosEdicion, setDatosEdicion] = useState<ProyectoFormData | null>(null)
  const [datosConfirmacion, setDatosConfirmacion] = useState<{
    proyectoId: string
    data: ProyectoFormData
  } | null>(null)

  // ✅ Hook optimizado: Carga proyecto con validación de manzanas
  const { data: proyectoConValidacion, isLoading: cargandoValidacion } = useProyectoConValidacion(
    modalEditar ? proyectoId : undefined
  )

  // Hook para detectar cambios
  const proyectoEditar: Proyecto | null = proyecto || null
  const cambiosDetectados = useDetectarCambios(proyectoEditar, datosEdicion)

  const handleEdit = () => {
    setModalEditar(true)
  }

  const handleActualizarProyecto = async (data: ProyectoFormData) => {
    // Guardar datos para confirmación
    setDatosEdicion(data)
    setDatosConfirmacion({
      proyectoId: proyectoId,
      data: data,
    })

    // Abrir modal de confirmación de cambios
    setModalConfirmarCambios(true)
  }

  const confirmarActualizacion = async () => {
    if (!datosConfirmacion) return

    try {
      await actualizarProyecto(datosConfirmacion.proyectoId, datosConfirmacion.data)
      setModalConfirmarCambios(false)
      setModalEditar(false)
      setDatosEdicion(null)
      setDatosConfirmacion(null)
    } catch (error) {
      // Error ya manejado por React Query con toast
    }
  }

  const handleEliminar = () => {
    setModalEliminar(true)
  }

  const confirmarEliminar = async () => {
    try {
      await eliminarProyecto(proyectoId)
      setModalEliminar(false)
      router.push('/proyectos')
    } catch (error) {
      // Error ya manejado por React Query con toast
      setModalEliminar(false)
    }
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
                <div className="flex items-center gap-3">
                  <h1 className={styles.headerClasses.title}>
                    {proyecto.nombre}
                  </h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    estadoColors[proyecto.estado as keyof typeof estadoColors] || estadoColors.pausado
                  }`}>
                    {formatearEstadoProyecto(proyecto.estado)}
                  </span>
                </div>
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
                onClick={handleEliminar}
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
      </div>

      {/* Modal de Edición */}
      <Modal
        isOpen={modalEditar}
        onClose={() => setModalEditar(false)}
        title="Editar Proyecto"
        description="Actualiza la información del proyecto"
        size="xl"
        gradientColor="green"
        icon={<Edit2 className="w-6 h-6 text-white" />}
        headerExtra={<ProyectosBadgesResumen totalManzanas={totalesProyecto.totalManzanas} totalViviendas={totalesProyecto.totalViviendas} />}
      >
        {cargandoValidacion ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cargando datos del proyecto...
              </p>
            </div>
          </div>
        ) : proyectoConValidacion ? (
          <ProyectosForm
            onSubmit={handleActualizarProyecto}
            onCancel={() => setModalEditar(false)}
            isLoading={false}
            initialData={{
              id: proyectoConValidacion.id,
              nombre: proyectoConValidacion.nombre,
              descripcion: proyectoConValidacion.descripcion,
              ubicacion: proyectoConValidacion.ubicacion,
              fechaInicio: proyectoConValidacion.fechaInicio,
              fechaFinEstimada: proyectoConValidacion.fechaFinEstimada,
              presupuesto: proyectoConValidacion.presupuesto,
              estado: proyectoConValidacion.estado,
              // ✅ Manzanas CON validación pre-cargada (sin queries adicionales)
              manzanas: proyectoConValidacion.manzanas.map(m => ({
                id: m.id,
                nombre: m.nombre,
                totalViviendas: m.totalViviendas,
                precioBase: 0,
                superficieTotal: 0,
                ubicacion: '',
                // ✅ Datos de validación (para el formulario)
                cantidadViviendasCreadas: m.cantidadViviendasCreadas,
                esEditable: m.esEditable,
                motivoBloqueado: m.motivoBloqueado,
              })),
            }}
            isEditing={true}
            onTotalsChange={setTotalesProyecto}
          />
        ) : null}
      </Modal>

      {/* Modal Confirmar Cambios */}
      <ConfirmarCambiosModal
        isOpen={modalConfirmarCambios}
        onClose={() => setModalConfirmarCambios(false)}
        onConfirm={confirmarActualizacion}
        cambios={cambiosDetectados}
        isLoading={actualizando}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        title="Eliminar Proyecto"
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
                  Se eliminará el proyecto <strong>"{proyecto.nombre}"</strong> y toda su información asociada (manzanas, documentos, etc.).
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
              Eliminar Proyecto
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
    </AnimatePresence>
  )
}
