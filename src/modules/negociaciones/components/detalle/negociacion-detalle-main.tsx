/**
 * Componente Principal: Detalle de Negociación
 *
 * Orquesta todos los componentes del detalle de negociación
 * - Header con información del cliente y vivienda
 * - Sistema de tabs (Información, Fuentes de Pago, Abonos, Timeline)
 * - Modales de acciones (Suspender, Reactivar, Renuncia)
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Clock, DollarSign, FileText, RefreshCw, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useNegociacionDetalle } from '../../hooks'
import * as styles from '../../styles/detalle.styles'
import {
    AbonosTab,
    FuentesPagoTab,
    InformacionTab,
    ModalReactivar,
    ModalRenuncia,
    ModalSuspender,
    NegociacionDetalleHeader,
    NegociacionDetalleTabs,
    TimelineTab,
} from './index'

interface NegociacionDetalleMainProps {
  negociacionId: string
  clienteId: string
}

type ModalState = 'suspender' | 'renuncia' | 'reactivar' | null

export function NegociacionDetalleMain({
  negociacionId,
  clienteId,
}: NegociacionDetalleMainProps) {
  const router = useRouter()
  const {
    negociacion,
    cargando,
    activeTab,
    setActiveTab,
    abonos,
    cargandoAbonos,
    totalesPago,
    suspenderNegociacion,
    reactivarNegociacion,
    registrarRenuncia,
    recargarTodo,
    esActiva,
    estaSuspendida,
    totales,
    fuentesPago,
  } = useNegociacionDetalle({ negociacionId })

  const [modalAbierto, setModalAbierto] = useState<ModalState>(null)

  // Tabs configuration
  const tabs = useMemo(
    () => [
      {
        id: 'informacion',
        label: 'Información',
        icon: FileText,
        count: null,
      },
      {
        id: 'fuentes-pago',
        label: 'Fuentes de Pago',
        icon: DollarSign,
        count: totales?.totalFuentes || 0,
      },
      {
        id: 'abonos',
        label: 'Abonos',
        icon: TrendingUp,
        count: abonos.length,
      },
      {
        id: 'timeline',
        label: 'Timeline',
        icon: Clock,
        count: null,
      },
    ],
    [abonos.length, totales]
  )

  // Handlers para modales
  const handleSuspender = async (motivo: string) => {
    const exito = await suspenderNegociacion(motivo)
    if (exito) {
      setModalAbierto(null)
      await recargarTodo()
    }
    return exito
  }

  const handleReactivar = async () => {
    const exito = await reactivarNegociacion()
    if (exito) {
      setModalAbierto(null)
      await recargarTodo()
    }
    return exito
  }

  const handleRenuncia = async (motivo: string) => {
    const exito = await registrarRenuncia(motivo)
    if (exito) {
      setModalAbierto(null)
      await recargarTodo()
    }
    return exito
  }

  // Loading state
  if (cargando) {
    return (
      <div className={styles.loadingClasses.container}>
        <div className={styles.loadingClasses.spinner} />
        <p className={styles.loadingClasses.text}>Cargando detalle de negociación...</p>
      </div>
    )
  }

  // Error state
  if (!negociacion) {
    return (
      <div className={styles.emptyClasses.container}>
        <div className={styles.emptyClasses.icon}>⚠️</div>
        <p className={styles.emptyClasses.title}>Negociación no encontrada</p>
        <p className={styles.emptyClasses.description}>
          No se pudo cargar la información de esta negociación
        </p>
        <button
          onClick={() => router.push(`/clientes/${clienteId}`)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver al Cliente
        </button>
      </div>
    )
  }

  return (
    <div className={styles.layoutClasses.container}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbsClasses.container}>
        <button
          onClick={() => router.push(`/clientes/${clienteId}`)}
          className={`${styles.breadcrumbsClasses.link} flex items-center gap-2`}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Cliente
        </button>
        <span className={styles.breadcrumbsClasses.separator}>/</span>
        <span className={styles.breadcrumbsClasses.current}>Detalle de Negociación</span>
        <button
          onClick={recargarTodo}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Header */}
      <NegociacionDetalleHeader negociacion={negociacion} totalesPago={totalesPago} />

      {/* Tabs */}
      <NegociacionDetalleTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId: string) => setActiveTab(tabId as any)}
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          {activeTab === 'informacion' && (
            <InformacionTab
              negociacion={negociacion}
              totalesPago={totalesPago}
              esActiva={esActiva}
              estaSuspendida={estaSuspendida}
              onSuspender={() => setModalAbierto('suspender')}
              onReactivar={() => setModalAbierto('reactivar')}
              onRenuncia={() => setModalAbierto('renuncia')}
            />
          )}

          {activeTab === 'fuentes-pago' && (
            <FuentesPagoTab
              negociacionId={negociacionId}
              valorTotal={totalesPago.valorTotal}
              fuentesPago={fuentesPago || []}
              totales={{
                totalFuentes: totales?.totalFuentes || 0,
                porcentajeCubierto: totales?.porcentajeCubierto || 0,
                diferencia: totales?.diferencia || 0,
              }}
              onActualizar={recargarTodo}
            />
          )}

          {activeTab === 'abonos' && (
            <AbonosTab
              abonos={abonos}
              totalesPago={totalesPago}
              cargandoAbonos={cargandoAbonos}
            />
          )}

          {activeTab === 'timeline' && <TimelineTab negociacion={negociacion} />}
        </motion.div>
      </AnimatePresence>

      {/* Modales */}
      <ModalSuspender
        isOpen={modalAbierto === 'suspender'}
        onClose={() => setModalAbierto(null)}
        onConfirm={handleSuspender}
        negociacionId={negociacionId}
      />

      <ModalRenuncia
        isOpen={modalAbierto === 'renuncia'}
        onClose={() => setModalAbierto(null)}
        onConfirm={handleRenuncia}
        negociacionId={negociacionId}
      />

      <ModalReactivar
        isOpen={modalAbierto === 'reactivar'}
        onClose={() => setModalAbierto(null)}
        onConfirm={handleReactivar}
        negociacionId={negociacionId}
      />
    </div>
  )
}
