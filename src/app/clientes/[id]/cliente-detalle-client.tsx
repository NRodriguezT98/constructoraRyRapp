'use client'

import { useAuth } from '@/contexts/auth-context'
import { construirURLCliente, resolverSlugCliente } from '@/lib/utils/slug.utils'
import { ProgresoProcesoBadge } from '@/modules/admin/procesos/components'
import { ModalRegistrarInteres } from '@/modules/clientes/components/modals'
import { useDocumentosClienteStore } from '@/modules/clientes/documentos/store/documentos-cliente.store'
import { useClienteQuery } from '@/modules/clientes/hooks'
import type { Cliente } from '@/modules/clientes/types'
import { TIPOS_DOCUMENTO } from '@/modules/clientes/types'
import { Tooltip } from '@/shared/components/ui'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Edit2,
  FileText,
  Handshake,
  Heart,
  Lock,
  Trash2,
  User,
  Wallet,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import * as styles from './cliente-detalle.styles'
import { ActividadTab, DocumentosTab, GeneralTab, InteresesTab, NegociacionesTab } from './tabs'

interface ClienteDetalleClientProps {
  clienteId: string  // Puede ser slug o UUID
}

type TabType = 'general' | 'intereses' | 'negociaciones' | 'documentos' | 'actividad'

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

  const { bg, text, dot } = config[estado as keyof typeof config] || config.Interesado

  return (
    <span className={`${bg} ${text} ${styles.headerClasses.statusBadge}`}>
      <span className={`${dot} ${styles.headerClasses.statusDot}`} />
      <span className={styles.headerClasses.statusText}>{estado}</span>
    </span>
  )
}

export default function ClienteDetalleClient({ clienteId }: ClienteDetalleClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [modalInteresAbierto, setModalInteresAbierto] = useState(false)
  const [clienteUUID, setClienteUUID] = useState<string | null>(null)

  // ✅ REACT QUERY: Cargar cliente automáticamente
  const {
    data: cliente,
    isLoading: loading,
    error,
    refetch: recargarCliente,
  } = useClienteQuery(clienteUUID)

  // Store de documentos
  const {
    modalSubirAbierto,
    cerrarModalSubir,
    cargarCategorias,
  } = useDocumentosClienteStore()

  // ✅ Resolver slug a UUID
  useEffect(() => {
    const resolverSlug = async () => {
      const uuid = await resolverSlugCliente(clienteId)
      if (uuid) {
        setClienteUUID(uuid)
      } else {
        console.error('No se pudo resolver el cliente')
        router.push('/clientes')
      }
    }

    resolverSlug()
  }, [clienteId, router])

  // Cargar categorías al montar
  useEffect(() => {
    if (user?.id) {
      cargarCategorias(user.id)
    }
  }, [user?.id, cargarCategorias])

  // Listener para cambio de tab (desde otros componentes)
  useEffect(() => {
    const handleCambiarTab = (event: any) => {
      const nuevoTab = event.detail as TabType
      console.log('Cambiando a tab:', nuevoTab)
      setActiveTab(nuevoTab)
    }

    window.addEventListener('cambiar-tab', handleCambiarTab)
    return () => window.removeEventListener('cambiar-tab', handleCambiarTab)
  }, [])

  // Listener para actualización de cliente (cuando se sube cédula)
  useEffect(() => {
    if (!clienteUUID) return

    const handleClienteActualizado = () => {
      console.log('Cliente actualizado, recargando datos...')
      recargarCliente() // ✅ React Query refetch
    }

    window.addEventListener('cliente-actualizado', handleClienteActualizado)
    return () => window.removeEventListener('cliente-actualizado', handleClienteActualizado)
  }, [clienteUUID, recargarCliente])

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
    setModalInteresAbierto(true)
  }

  const handleCrearNegociacion = () => {
    // Verificar si tiene cédula antes de navegar
    if (!cliente?.documento_identidad_url) {
      alert(
        '⚠️ Para crear negociaciones, primero debes subir la cédula del cliente en la pestaña "Documentos".'
      )
      setActiveTab('documentos')
      return
    }
    // Navegar a la vista completa de crear negociación con URL amigable
    const clienteSlug = construirURLCliente({
      id: clienteUUID!,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
    })
      .split('/')
      .pop() // Extraer solo el slug
    router.push(
      `/clientes/${clienteSlug}/negociaciones/crear?nombre=${encodeURIComponent(cliente?.nombre_completo || '')}` as any
    )
  }

  const handleInteresRegistrado = async () => {
    setModalInteresAbierto(false)
    // ✅ React Query refetch automático
    recargarCliente()
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <User className='mx-auto mb-4 h-16 w-16 animate-pulse text-purple-500' />
          <p className='text-gray-600 dark:text-gray-400'>Cargando cliente...</p>
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <User className='mx-auto mb-4 h-16 w-16 text-gray-400' />
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Cliente no encontrado
          </h2>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            El cliente que buscas no existe o fue eliminado.
          </p>
          <button
            onClick={() => router.push('/clientes')}
            className='inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver a clientes
          </button>
        </div>
      </div>
    )
  }

  // Configuración de tabs
  const tabs = [
    { id: 'general' as const, label: 'Información General', icon: User, count: null },
    {
      id: 'intereses' as const,
      label: 'Intereses',
      icon: Heart,
      count: cliente.intereses?.length || 0,
    },
    {
      id: 'negociaciones' as const,
      label: 'Negociaciones',
      icon: Wallet,
      count: (cliente as any).negociaciones?.length || 0,
    },
    {
      id: 'documentos' as const,
      label: 'Documentos',
      icon: FileText,
      count: cliente.documento_identidad_url ? 1 : 0,
    },
    { id: 'actividad' as const, label: 'Actividad', icon: Activity, count: null },
  ]

  return (
    <div className='container mx-auto px-4 py-4 sm:px-4 lg:px-6'>
      <div className='space-y-4'>
        {/* Header con gradiente */}
        <motion.div
          {...styles.animations.fadeInUp}
          className={styles.headerClasses.container}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
          }}
        >
          {/* Patrón de fondo */}
          <div className={styles.headerClasses.backgroundPattern}>
            <svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
              <defs>
                <pattern
                  id='grid'
                  width='40'
                  height='40'
                  patternUnits='userSpaceOnUse'
                >
                  <path
                    d='M 40 0 L 0 0 0 40'
                    fill='none'
                    stroke='white'
                    strokeWidth='1'
                  />
                </pattern>
              </defs>
              <rect width='100%' height='100%' fill='url(#grid)' />
            </svg>
          </div>

          {/* Breadcrumb */}
          <div className={styles.headerClasses.breadcrumb}>
            <button
              onClick={() => router.push('/clientes')}
              className='flex items-center gap-1 hover:text-white'
            >
              <User className={styles.headerClasses.breadcrumbIcon} />
              <span>Clientes</span>
            </button>
            <ChevronRight className='h-4 w-4' />
            <span className={styles.headerClasses.breadcrumbCurrent}>
              {cliente.nombre_completo}
            </span>
          </div>

          {/* Contenido principal */}
          <div className={styles.headerClasses.contentWrapper}>
            <div className={styles.headerClasses.leftSection}>
              <div className={styles.headerClasses.iconContainer}>
                <User className={styles.headerClasses.icon} />
              </div>
              <div className={styles.headerClasses.titleSection}>
                <h1 className={styles.headerClasses.title}>{cliente.nombre_completo}</h1>
                <p className={styles.headerClasses.subtitle}>
                  <FileText className={styles.headerClasses.subtitleIcon} />
                  {TIPOS_DOCUMENTO[cliente.tipo_documento]} - {cliente.numero_documento}
                </p>
                {/* Badge de Progreso del Proceso - Versión Expandida */}
                <ProgresoProcesoBadge clienteId={clienteUUID} variant="expanded" />
              </div>
            </div>
            <div className={styles.headerClasses.actionsContainer}>
              <EstadoBadge estado={cliente.estado} />
              <Tooltip
                content={
                  !cliente.documento_identidad_url ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">⚠️ Cédula requerida</span>
                      <span className="text-xs opacity-90">
                        Ve a la pestaña "Documentos" para subirla
                      </span>
                    </div>
                  ) : (
                    'Crear nueva negociación para este cliente'
                  )
                }
                side="bottom"
              >
                <motion.button
                  onClick={handleCrearNegociacion}
                  disabled={!cliente.documento_identidad_url}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors ${
                    cliente.documento_identidad_url
                      ? 'border-green-400/30 bg-green-500/80 text-white hover:bg-green-600'
                      : 'border-gray-400/30 bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  }`}
                  whileHover={cliente.documento_identidad_url ? { scale: 1.05 } : {}}
                  whileTap={cliente.documento_identidad_url ? { scale: 0.95 } : {}}
                >
                  {cliente.documento_identidad_url ? (
                    <Handshake className='h-4 w-4' />
                  ) : (
                    <Lock className='h-4 w-4' />
                  )}
                  <span>Crear Negociación</span>
                </motion.button>
              </Tooltip>
              <motion.button
                onClick={handleEditar}
                className='inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit2 className='h-4 w-4' />
                <span>Editar</span>
              </motion.button>
              <motion.button
                onClick={handleEliminar}
                className='inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-red-600'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className='h-4 w-4' />
                <span>Eliminar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          {...styles.animations.fadeInUp}
          transition={{ delay: 0.1 }}
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
                    <span className={styles.tabsClasses.tabBadge}>{tab.count}</span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId='activeTabCliente'
                    className={styles.tabsClasses.tabUnderline}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Contenido de Tabs */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            {...styles.animations.slideIn}
          >
            {activeTab === 'general' && <GeneralTab cliente={cliente} />}
            {activeTab === 'intereses' && (
              <InteresesTab
                cliente={cliente}
                onRegistrarInteres={handleRegistrarInteres}
              />
            )}
            {activeTab === 'negociaciones' && (
              <NegociacionesTab cliente={cliente} />
            )}
            {activeTab === 'documentos' && <DocumentosTab cliente={cliente} />}
            {activeTab === 'actividad' && <ActividadTab clienteId={clienteUUID} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal Registrar Interés */}
      <ModalRegistrarInteres
        isOpen={modalInteresAbierto}
        onClose={() => setModalInteresAbierto(false)}
        clienteId={clienteUUID}
        onSuccess={handleInteresRegistrado}
      />
    </div>
  )
}
