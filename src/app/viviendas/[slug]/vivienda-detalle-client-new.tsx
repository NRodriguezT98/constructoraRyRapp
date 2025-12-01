'use client'

import { useState } from 'react'

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
    Trash2
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { AbonosTab, DocumentosTab, InfoTab } from '@/modules/viviendas/components/detalle'
import { useViviendaQuery } from '@/modules/viviendas/hooks/useViviendaQuery'

import * as styles from './vivienda-detalle.styles'

interface ViviendaDetalleClientProps {
  viviendaId: string
}

type TabType = 'info' | 'documentos' | 'abonos'

const estadoColors = {
  Disponible:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700',
  Reservada:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
  Asignada:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
  Vendida:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700',
}

export default function ViviendaDetalleClient({ viviendaId }: ViviendaDetalleClientProps) {
  const router = useRouter()

  // React Query hook (igual que proyectos)
  const { vivienda, cargando: loading, error } = useViviendaQuery(viviendaId)

  // Estados para modales y tabs
  const [activeTab, setActiveTab] = useState<TabType>('info')

  // Manejo de error (igual que proyectos)
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Error al cargar vivienda
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {error.message || 'Ocurrió un error inesperado'}
          </p>
          <Button onClick={() => router.push('/viviendas')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a viviendas
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar loader mientras carga (igual que proyectos)
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
            <Building2 className="mx-auto mb-4 h-16 w-16 text-orange-500" strokeWidth={2} />
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
    { id: 'documentos' as const, label: 'Documentos', icon: FileText, count: null },
    { id: 'abonos' as const, label: 'Abonos', icon: DollarSign, count: vivienda.cantidad_abonos || 0 },
  ]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/20"
      >
        <div className="mx-auto max-w-7xl space-y-4">
          {/* Botón Volver */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button variant="ghost" onClick={() => router.back()} className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Volver
            </Button>
          </motion.div>

          {/* Header Compacto */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-600 to-amber-600 dark:from-orange-700 dark:via-orange-700 dark:to-amber-800 shadow-2xl"
          >
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

            {/* Contenido */}
            <div className="relative z-10 p-6">
              {/* Breadcrumb superior */}
              <div className="mb-3 flex items-center gap-2 text-sm text-orange-100">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span>Viviendas</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-white">
                  Mz. {vivienda.manzanas?.nombre || '?'} Casa {vivienda.numero}
                </span>
              </div>

              {/* Contenido principal */}
              <div className="flex items-center justify-between">
                {/* Lado izquierdo: Icono + Info */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Home className="h-7 w-7 text-white" />
                  </motion.div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-white">
                        Mz. {vivienda.manzanas?.nombre || '?'} Casa {vivienda.numero}
                      </h1>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          estadoColors[vivienda.estado as keyof typeof estadoColors] ||
                          estadoColors.Disponible
                        }`}
                      >
                        {vivienda.estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-orange-100">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'}</span>
                    </div>
                  </div>
                </div>

                {/* Lado derecho: Acciones */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-lg bg-white/20 p-0 hover:bg-white/30 text-white border border-white/30"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-lg bg-white/20 p-0 hover:bg-white/30 text-white border border-white/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs Mejorados */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
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
                    {tab.count !== null && tab.count > 0 && (
                      <span className={styles.tabsClasses.tabBadge}>{tab.count}</span>
                    )}
                  </div>
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Contenido de Tabs */}
          <div className="animate-fade-in">
            {activeTab === 'info' && <InfoTab vivienda={vivienda} onAsignarCliente={() => {}} />}
            {activeTab === 'documentos' && <DocumentosTab viviendaId={vivienda.id} />}
            {activeTab === 'abonos' && <AbonosTab vivienda={vivienda} onRegistrarAbono={() => {}} />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
