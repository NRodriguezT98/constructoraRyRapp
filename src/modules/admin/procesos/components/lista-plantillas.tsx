'use client'

/**
 * 📋 LISTA DE PLANTILLAS DE PROCESO
 *
 * Componente presentacional que muestra grid de plantillas.
 * Diseño premium con glassmorphism y gradientes blue→indigo.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Loader2, Plus } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { useGestionProcesos } from '../hooks'
import { procesosStyles as styles } from '../styles/procesos.styles'
import type { PlantillaProceso } from '../types'

import { EmptyStatePlantillas } from './empty-state-plantillas'
import { HeaderListaPlantillas } from './header-lista-plantillas'
import { PlantillaCard } from './plantilla-card'

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
          <HeaderListaPlantillas />
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
        <HeaderListaPlantillas />

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
          <EmptyStatePlantillas onCrear={handleCrearNueva} />
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
