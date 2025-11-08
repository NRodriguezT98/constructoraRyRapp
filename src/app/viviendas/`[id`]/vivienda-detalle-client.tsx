'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { ArrowLeft, Compass, FileText, Home, Info, Receipt } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  ViviendaHeader,
  ProgressBar,
  InfoTab,
  LinderosTab,
  DocumentosTab,
  AbonosTab,
} from '@/modules/viviendas/components/detalle'
import type { Vivienda } from '@/modules/viviendas/types'



import * as styles from './vivienda-detalle.styles'

interface ViviendaDetalleClientProps {
  viviendaId: string
}

type TabType = 'info' | 'linderos' | 'documentos' | 'abonos'

/**
 * Vista de detalle de vivienda - Componente principal refactorizado
 * Aplica separación de responsabilidades: Solo orquestación y navegación
 * Componentes separados: ViviendaHeader, ProgressBar, InfoTab, LinderosTab, DocumentosTab, AbonosTab
 */
export default function ViviendaDetalleClient({ viviendaId }: ViviendaDetalleClientProps) {
  const router = useRouter()
  const [vivienda, setVivienda] = useState<Vivienda | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('info')

  useEffect(() => {
    let mounted = true

    const cargarVivienda = async () => {
      setLoading(true)
      try {
        const { viviendasService } = await import('@/modules/viviendas/services/viviendas.service')
        const viviendaData = await viviendasService.obtenerVivienda(viviendaId)

        if (!mounted) return

        setVivienda(viviendaData)
      } catch (error) {
        if (!mounted) return

        console.error('Error al cargar vivienda:', error)
        setVivienda(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    cargarVivienda()

    return () => {
      mounted = false
      setLoading(false)
    }
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

  // Estados de carga y error
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Home className="mx-auto mb-4 h-16 w-16 animate-pulse text-emerald-500" />
          <p className="text-gray-600 dark:text-gray-400">Cargando vivienda...</p>
        </div>
      </div>
    )
  }

  if (!vivienda) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Home className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Vivienda no encontrada
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            La vivienda que buscas no existe o fue eliminada.
          </p>
          <Button onClick={() => router.push('/viviendas')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a viviendas
          </Button>
        </div>
      </div>
    )
  }

  // Configuración de tabs
  const tabs = [
    { id: 'info' as const, label: 'Información', icon: Info, count: null },
    { id: 'linderos' as const, label: 'Linderos', icon: Compass, count: null },
    { id: 'documentos' as const, label: 'Documentos', icon: FileText, count: null },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header con botón volver y datos principales */}
        <ViviendaHeader
          vivienda={vivienda}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          onAsignarCliente={handleAsignarCliente}
        />

        {/* Barra de Progreso (solo si está asignada o pagada) */}
        <ProgressBar vivienda={vivienda} />

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={styles.tabsClasses.container}
        >
          <nav className={styles.tabsClasses.nav}>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabsClasses.tab} ${
                  activeTab === tab.id ? styles.tabsClasses.tabActive : styles.tabsClasses.tabInactive
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
                    layoutId="activeTab"
                    className={styles.tabsClasses.tabUnderline}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Contenido de los tabs - Componentes separados */}
        <motion.div layout>
          {activeTab === 'info' && <InfoTab vivienda={vivienda} onAsignarCliente={handleAsignarCliente} />}
          {activeTab === 'linderos' && <LinderosTab vivienda={vivienda} />}
          {activeTab === 'documentos' && <DocumentosTab viviendaId={viviendaId} />}
          {activeTab === 'abonos' && <AbonosTab vivienda={vivienda} onRegistrarAbono={handleRegistrarAbono} />}
        </motion.div>
      </div>
    </div>
  )
}
