'use client'

/**
 * 📊 TIMELINE DE PROCESO DE NEGOCIACIÓN
 *
 * Componente presentacional que muestra el progreso del proceso de compra.
 * Diseño premium con timeline vertical y glassmorphism.
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES:
 * - Lógica de negocio → useProcesoNegociacion
 * - Lógica de UI → useTimelineProceso
 * - Presentación → Este componente (SOLO JSX)
 */

import { useUnsavedChanges } from '@/contexts/unsaved-changes-context'
import { ModalCorregirDocumentos } from '@/modules/procesos/components/ModalCorregirDocumentos'
import { ModalCorregirFecha } from '@/modules/procesos/components/ModalCorregirFecha'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, FileText, Loader2, X } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useTimelineProceso } from '../hooks'
import { actualizarProceso } from '../services/procesos.service'
import { EstadoPaso } from '../types'
import { HeaderProceso } from './header-proceso'
import { ModalFechaCompletado } from './modal-fecha-completado'
import { ModalOmitirPaso } from './modal-omitir-paso'
import { PasoItem } from './paso-item'
import { timelineProcesoStyles as styles } from './timeline-proceso.styles'

// 🔧 Modo desarrollo (solo visible si esta variable está en true)
const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

interface TimelineProcesoProps {
  negociacionId: string
}

export function TimelineProceso({ negociacionId }: TimelineProcesoProps) {
  const { setHasUnsavedChanges, setMessage, setOnDiscard } = useUnsavedChanges()

  // ✅ TODO extraído al hook personalizado
  const timeline = useTimelineProceso({ negociacionId })

  // Crear callback estable para descartar cambios
  // IMPORTANTE: NO usa descartarCambios del hook porque ese llama setPasoEnEdicion(null)
  // lo cual causa un re-render durante el render del context
  const handleDiscardCallback = useCallback(async () => {
    if (!timeline.pasoEnEdicion) return

    try {
      // Llamar directamente al servicio sin modificar el estado local
      // El context limpiará pasoEnEdicion cuando cambie la ruta
      await actualizarProceso(timeline.pasoEnEdicion, {
        estado: EstadoPaso.PENDIENTE,
        fechaInicio: null,
        documentosUrls: null,
        notas: null
      })
    } catch (err) {
      console.error('Error al descartar cambios:', err)
    }
  }, [timeline.pasoEnEdicion])

  // Sincronizar estado de cambios sin guardar con context global
  useEffect(() => {
    if (timeline.pasoEnEdicion) {
      setHasUnsavedChanges(true)
      setMessage(
        'Tienes un paso iniciado con cambios sin guardar.\n\n' +
        'Si sales ahora:\n\n' +
        '• Se eliminarán los documentos adjuntos\n' +
        '• Se borrará la fecha de inicio\n' +
        '• El paso volverá a estado Pendiente'
      )
      setOnDiscard(handleDiscardCallback)
    } else {
      setHasUnsavedChanges(false)
      setMessage(null)
      setOnDiscard(null)
    }
  }, [timeline.pasoEnEdicion, setHasUnsavedChanges, setMessage, setOnDiscard, handleDiscardCallback])

  // ===================================
  // RENDER: LOADING
  // ===================================

  if (timeline.loading) {
    return (
      <div className={styles.loading.container}>
        <Loader2 className={styles.loading.spinner} />
      </div>
    )
  }

  // ===================================
  // RENDER: SIN PROCESO
  // ===================================

  if (!timeline.loading && timeline.pasos.length === 0) {
    return (
      <div className={styles.empty.container}>
        <FileText className={styles.empty.icon} />
        <h3 className={styles.empty.title}>No hay proceso configurado</h3>
        <p className={styles.empty.description}>
          Esta negociación aún no tiene un proceso asignado.
          Contacta al administrador para configurar el proceso.
        </p>
      </div>
    )
  }

  // ===================================
  // RENDER: PRINCIPAL
  // ===================================

  return (
    <div className={styles.container}>
      {/* Header con Progreso */}
      <HeaderProceso
        progreso={timeline.progreso}
        onRecargarPlantilla={IS_DEV_MODE ? timeline.handleRecargarPlantilla : undefined}
        recargando={timeline.recargandoPlantilla}
      />

      {/* Banner de Advertencia: Paso en Proceso */}
      <AnimatePresence>
        {timeline.pasoEnEdicion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10
                       dark:from-amber-500/20 dark:via-orange-500/20 dark:to-red-500/20
                       border-2 border-amber-500/30 dark:border-amber-500/40
                       shadow-lg shadow-amber-500/10 dark:shadow-amber-500/5
                       overflow-hidden"
          >
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600
                            flex items-center justify-center flex-shrink-0
                            shadow-lg shadow-amber-500/30 animate-pulse">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-1">
                  ⚠️ Paso en Proceso
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Tienes cambios sin guardar. <strong>No podrás salir de esta página</strong> hasta que <strong>completes</strong> el paso o <strong>descartes</strong> los cambios.
                </p>
              </div>
              <button
                onClick={() => timeline.pasoEnEdicion && timeline.handleDescartarCambios(timeline.pasoEnEdicion)}
                className="px-4 py-2 rounded-xl text-sm font-semibold
                         bg-white dark:bg-gray-800
                         text-amber-900 dark:text-amber-100
                         hover:bg-amber-50 dark:hover:bg-gray-700
                         border border-amber-300 dark:border-amber-600
                         shadow-sm hover:shadow-md
                         transition-all duration-200"
              >
                Descartar Cambios
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner de Recuperación Automática */}
      <AnimatePresence>
        {timeline.pasoRecuperado && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20
                          border-2 border-blue-300 dark:border-blue-600
                          rounded-2xl p-5 flex items-center gap-4
                          shadow-lg shadow-blue-500/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600
                            flex items-center justify-center flex-shrink-0
                            shadow-lg shadow-blue-500/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">
                  🔄 Trabajo Recuperado
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Se ha recuperado automáticamente el paso que estabas editando. Tus documentos y cambios se mantienen guardados.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {timeline.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.error.container}
          >
            <AlertCircle className={styles.error.icon} />
            <div className={styles.error.content}>
              <p className={styles.error.title}>Error</p>
              <p className={styles.error.message}>{timeline.error}</p>
            </div>
            <button onClick={timeline.limpiarError} className={styles.error.close}>
              <X className={styles.error.closeIcon} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline de Pasos */}
      <div className={styles.timeline.container}>
        <div className={styles.timeline.list}>
          {/* Línea conectora */}
          <div className={styles.timeline.line} />

          {/* Pasos */}
          {timeline.pasos.map((paso, index) => (
            <PasoItem
              key={paso.id}
              paso={paso}
              index={index}
              isExpanded={timeline.pasoExpandido === paso.id}
              onToggle={() => timeline.togglePaso(paso.id)}
              onIniciar={() => timeline.handleIniciarPaso(paso.id)}
              onCompletar={() => timeline.handleAbrirModalCompletar(paso)}
              onDescartar={() => timeline.handleDescartarCambios(paso.id)}
              onOmitir={() => timeline.handleOmitirPaso(paso)}
              onAdjuntarDocumento={timeline.handleAdjuntarDocumento}
              onEliminarDocumento={timeline.handleEliminarDocumento}
              onCorregirFecha={() => timeline.handleAbrirModalCorregirFecha(paso)}
              onCorregirDocumento={() => timeline.handleAbrirModalCorregirDoc(paso)}
              esAdministrador={timeline.esAdministrador}
              puedeIniciar={timeline.puedeIniciar(paso)}
              puedeCompletar={timeline.puedeCompletar(paso)}
              estaBloqueado={timeline.estaBloqueado(paso)}
              dependenciasIncompletas={timeline.obtenerDependenciasIncompletas(paso)}
              deshabilitado={timeline.actualizando}
              subiendoDoc={timeline.subiendoDoc}
            />
          ))}
        </div>
      </div>

      {/* Modal de Fecha Completado */}
      <ModalFechaCompletado
        isOpen={timeline.modalFechaAbierto}
        pasoNombre={timeline.pasoACompletar?.nombre || ''}
        fechaInicio={timeline.pasoACompletar?.fechaInicio || undefined}
        fechaNegociacion={timeline.fechaNegociacion || undefined}
        ordenPaso={timeline.pasoACompletar?.orden || undefined}
        fechaCompletadoDependencia={
          timeline.pasoACompletar?.dependeDe && timeline.pasoACompletar.dependeDe.length > 0
            ? timeline.pasos.find(p => p.id === timeline.pasoACompletar!.dependeDe![0])?.fechaCompletado || undefined
            : undefined
        }
        nombrePasoDependencia={
          timeline.pasoACompletar?.dependeDe && timeline.pasoACompletar.dependeDe.length > 0
            ? timeline.pasos.find(p => p.id === timeline.pasoACompletar!.dependeDe![0])?.nombre || undefined
            : undefined
        }
        onConfirm={timeline.handleConfirmarCompletado}
        onCancel={timeline.handleCancelarCompletado}
      />

      {/* Modal de Omitir Paso */}
      <ModalOmitirPaso
        isOpen={timeline.modalOmitirAbierto}
        pasoNombre={timeline.pasoAOmitir?.nombre || ''}
        onConfirm={timeline.handleConfirmarOmision}
        onClose={timeline.handleCancelarOmision}
        loading={timeline.actualizando}
      />

      {/* Modales de Corrección (Solo Admin) */}
      {timeline.esAdministrador && (
        <>
          {/* Modal Corregir Fecha */}
          {timeline.pasoACorregirFecha && (
            <ModalCorregirFecha
              paso={{
                id: timeline.pasoACorregirFecha.id,
                nombre: timeline.pasoACorregirFecha.nombre,
                fecha_completado: timeline.pasoACorregirFecha.fechaCompletado!
              }}
              open={timeline.modalCorregirFechaAbierto}
              onClose={timeline.handleCerrarModalCorregirFecha}
              onSuccess={timeline.handleSuccessCorregirFecha}
            />
          )}

          {/* Modal Corregir Documentos */}
          {timeline.pasoACorregirDoc && (
            <ModalCorregirDocumentos
              paso={{
                id: timeline.pasoACorregirDoc.id,
                nombre: timeline.pasoACorregirDoc.nombre
              }}
              documentos={timeline.pasoACorregirDoc.documentosRequeridos?.map(doc => ({
                id: doc.id,
                nombre_archivo: doc.nombre,
                fecha_subida: doc.fechaSubida || new Date().toISOString(),
                categoria_id: doc.categoriaId || '',
                url_storage: doc.url || ''
              })) || []}
              open={timeline.modalCorregirDocAbierto}
              onClose={timeline.handleCerrarModalCorregirDoc}
              onSuccess={timeline.handleSuccessCorregirDoc}
            />
          )}
        </>
      )}
    </div>
  )
}
