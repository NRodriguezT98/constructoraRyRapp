'use client'

/**
 * 📋 LISTA DE PLANTILLAS DE PROCESO
 *
 * Componente presentacional que muestra grid de plantillas.
 * Diseño premium con glassmorphism y gradientes blue→indigo.
 */

import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Check,
    Copy,
    FileText,
    Loader2,
    Plus,
    Settings,
    Star,
    Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGestionProcesos } from '../hooks'
import { procesosStyles as styles } from '../styles/procesos.styles'
import type { PlantillaProceso } from '../types'

export function ListaPlantillas() {
  const router = useRouter()

  const {
    plantillas,
    loading,
    error,
    guardando,
    eliminarPlantillaActual,
    duplicarPlantillaActual,
    establecerComoPredeterminada,
    limpiarError
  } = useGestionProcesos()

  // ===================================
  // HANDLERS
  // ===================================

  const handleCrearNueva = () => {
    router.push('/admin/procesos/crear')
  }

  const handleEditar = (id: string) => {
    router.push(`/admin/procesos/${id}/editar`)
  }

  const handleDuplicar = async (plantilla: PlantillaProceso) => {
    const nombreNuevo = `${plantilla.nombre} (Copia)`
    const duplicada = await duplicarPlantillaActual(plantilla.id, nombreNuevo)

    if (duplicada) {
      router.push(`/admin/procesos/${duplicada.id}`)
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla? Esta acción no se puede deshacer.')) {
      return
    }

    await eliminarPlantillaActual(id)
  }

  const handleEstablecerPredeterminada = async (id: string) => {
    await establecerComoPredeterminada(id)
  }

  // ===================================
  // RENDER: LOADING
  // ===================================

  if (loading && plantillas.length === 0) {
    return (
      <div className={styles.container.page}>
        <div className={styles.container.content}>
          <Header />
          <div className={styles.loading.container}>
            <Loader2 className={`${styles.loading.spinner}`} />
          </div>
        </div>
      </div>
    )
  }

  // ===================================
  // RENDER: PRINCIPAL
  // ===================================

  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        {/* Header Hero */}
        <Header />

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={styles.error.container}
            >
              <AlertCircle className={styles.error.icon} />
              <div className={styles.error.content}>
                <p className={styles.error.title}>Error</p>
                <p className={styles.error.message}>{error}</p>
              </div>
              <button onClick={limpiarError} className={styles.error.close}>
                <Plus className={`${styles.error.closeIcon} rotate-45`} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de Plantillas */}
        {plantillas.length === 0 ? (
          <EmptyState onCrear={handleCrearNueva} />
        ) : (
          <motion.div
            className={styles.grid.container}
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {plantillas.map(plantilla => (
              <PlantillaCard
                key={plantilla.id}
                plantilla={plantilla}
                onEditar={handleEditar}
                onDuplicar={handleDuplicar}
                onEliminar={handleEliminar}
                onEstablecerPredeterminada={handleEstablecerPredeterminada}
                deshabilitado={guardando}
              />
            ))}
          </motion.div>
        )}

        {/* FAB: Crear Nueva */}
        <motion.div
          className={styles.fab.container}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <button
            onClick={handleCrearNueva}
            className={styles.fab.button}
            disabled={guardando}
          >
            <div className={styles.fab.buttonGlow} />
            <Plus className={styles.fab.icon} />
            <span className={styles.fab.text}>Nueva Plantilla</span>
          </button>
        </motion.div>

      </div>
    </div>
  )
}

// ===================================
// COMPONENTE: HEADER
// ===================================

function Header() {
  return (
    <div className={styles.header.container}>
      <div className={styles.header.pattern} />

      <div className={styles.header.topRow}>
        <div className={styles.header.iconCircle}>
          <Settings className={styles.header.icon} />
        </div>

        <div className={styles.header.badge}>
          Administración
        </div>
      </div>

      <h1 className={styles.header.title}>
        Gestión de Procesos
      </h1>

      <p className={styles.header.subtitle}>
        Configura las etapas que los clientes deben completar desde la separación
        hasta la entrega de la vivienda. Define condiciones según fuentes de pago
        y documentos requeridos.
      </p>
    </div>
  )
}

// ===================================
// COMPONENTE: PLANTILLA CARD
// ===================================

interface PlantillaCardProps {
  plantilla: PlantillaProceso
  onEditar: (id: string) => void
  onDuplicar: (plantilla: PlantillaProceso) => void
  onEliminar: (id: string) => void
  onEstablecerPredeterminada: (id: string) => void
  deshabilitado: boolean
}

function PlantillaCard({
  plantilla,
  onEditar,
  onDuplicar,
  onEliminar,
  onEstablecerPredeterminada,
  deshabilitado
}: PlantillaCardProps) {
  const totalPasos = plantilla.pasos.length
  const pasosObligatorios = plantilla.pasos.filter(p => p.obligatorio).length
  const pasosCondicionales = plantilla.pasos.filter(p =>
    p.condiciones.fuentesPagoRequeridas.length > 0
  ).length

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => onEditar(plantilla.id)}
      className={styles.grid.card.container}
    >
      <div className={styles.grid.card.glow} />

      {/* Header con ícono y acciones */}
      <div className={styles.grid.card.header}>
        <div className={styles.grid.card.iconCircle}>
          <FileText className={styles.grid.card.icon} />
        </div>

        <div className={styles.grid.card.actions} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onDuplicar(plantilla)}
            disabled={deshabilitado}
            className={styles.grid.card.actionButton}
            title="Duplicar plantilla"
          >
            <Copy className={styles.grid.card.actionIcon} />
          </button>

          {!plantilla.esPredeterminado && (
            <button
              onClick={() => onEliminar(plantilla.id)}
              disabled={deshabilitado}
              className={styles.grid.card.actionButton}
              title="Eliminar plantilla"
            >
              <Trash2 className={styles.grid.card.actionIcon} />
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className={styles.grid.card.content}>
        <h3 className={styles.grid.card.title}>{plantilla.nombre}</h3>
        {plantilla.descripcion && (
          <p className={styles.grid.card.description}>{plantilla.descripcion}</p>
        )}

        {/* Badges */}
        <div className={styles.grid.card.badges}>
          {plantilla.esPredeterminado && (
            <span className={styles.grid.card.badgePredeterminado}>
              <Star className="w-3 h-3 inline-block mr-1" />
              Predeterminada
            </span>
          )}

          {plantilla.activo ? (
            <span className={styles.grid.card.badgeActivo}>
              <Check className="w-3 h-3 inline-block mr-1" />
              Activa
            </span>
          ) : (
            <span className={styles.grid.card.badgeInactivo}>
              Inactiva
            </span>
          )}
        </div>

        {/* Estadísticas */}
        <div className={styles.grid.card.stats}>
          <div className={styles.grid.card.stat.container}>
            <FileText className={styles.grid.card.stat.icon} />
            <div>
              <div className={styles.grid.card.stat.value}>{totalPasos}</div>
              <div className={styles.grid.card.stat.label}>Pasos totales</div>
            </div>
          </div>

          <div className={styles.grid.card.stat.container}>
            <AlertCircle className={styles.grid.card.stat.icon} />
            <div>
              <div className={styles.grid.card.stat.value}>{pasosObligatorios}</div>
              <div className={styles.grid.card.stat.label}>Obligatorios</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.grid.card.footer}>
        <span className={styles.grid.card.footerText}>
          {pasosCondicionales} pasos condicionales
        </span>

        {!plantilla.esPredeterminado && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEstablecerPredeterminada(plantilla.id)
            }}
            disabled={deshabilitado}
            className={styles.grid.card.footerButton}
          >
            Establecer predeterminada
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ===================================
// COMPONENTE: EMPTY STATE
// ===================================

interface EmptyStateProps {
  onCrear: () => void
}

function EmptyState({ onCrear }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={styles.empty.container}
    >
      <Settings className={styles.empty.icon} />
      <h3 className={styles.empty.title}>No hay plantillas creadas</h3>
      <p className={styles.empty.description}>
        Crea tu primera plantilla de proceso para comenzar a gestionar
        las etapas de negociación con tus clientes.
      </p>
      <button onClick={onCrear} className={styles.empty.button}>
        <Plus className="w-5 h-5 mr-2" />
        Crear Primera Plantilla
      </button>
    </motion.div>
  )
}
