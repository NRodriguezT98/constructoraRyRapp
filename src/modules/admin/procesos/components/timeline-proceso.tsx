'use client'

/**
 * 📊 TIMELINE DE PROCESO DE NEGOCIACIÓN
 *
 * Muestra el progreso del proceso de compra del cliente.
 * Diseño premium con timeline vertical y glassmorphism.
 *
 * ⚠️ SISTEMA DE PROTECCIÓN:
 * - Usuario debe "Iniciar Paso" para trabajar en él
 * - Advertencia beforeunload si hay cambios sin guardar
 * - Modal de fecha al completar para registro preciso
 */

import { useAuth } from '@/contexts/auth-context'
import { useUnsavedChanges } from '@/contexts/unsaved-changes-context'
import { useModal } from '@/shared/components/modals'
import { createBrowserClient } from '@supabase/ssr'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, FileText, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useProcesoNegociacion } from '../hooks'
import { subirDocumento } from '../services/documentos-proceso.service'
import { recargarPlantilla } from '../services/plantilla-reload.service'
import { actualizarProceso } from '../services/procesos.service'
import type { ProcesoNegociacion } from '../types'
import { EstadoPaso } from '../types'
import { HeaderProceso } from './header-proceso'
import { ModalFechaCompletado } from './modal-fecha-completado'
import { PasoItem } from './paso-item'
import { timelineProcesoStyles as styles } from './timeline-proceso.styles'

// 🔧 Modo desarrollo (solo visible si esta variable está en true)
const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

interface TimelineProcesoProps {
  negociacionId: string
}

export function TimelineProceso({ negociacionId }: TimelineProcesoProps) {
  const { user } = useAuth()
  const { confirm } = useModal()
  const router = useRouter()
  const { setHasUnsavedChanges, setMessage, setOnDiscard } = useUnsavedChanges()
  const {
    pasos,
    progreso,
    loading,
    error,
    actualizando,
    pasoEnEdicion,
    pasoRecuperado,
    completarPaso,
    iniciarPaso,
    descartarCambios,
    agregarDocumento,
    eliminarDocumento,
    puedeCompletar,
    puedeIniciar,
    estaBloqueado,
    obtenerDependenciasIncompletas,
    limpiarError
  } = useProcesoNegociacion({ negociacionId })

  const [pasoExpandido, setPasoExpandido] = useState<string | null>(null)
  const [subiendoDoc, setSubiendoDoc] = useState<string | null>(null)
  const [recargandoPlantilla, setRecargandoPlantilla] = useState(false)

  // Modal de fecha
  const [modalFechaAbierto, setModalFechaAbierto] = useState(false)
  const [pasoACompletar, setPasoACompletar] = useState<ProcesoNegociacion | null>(null)
  const [fechaNegociacion, setFechaNegociacion] = useState<string | null>(null)

  // Crear callback estable para descartar cambios
  // IMPORTANTE: NO usa descartarCambios del hook porque ese llama setPasoEnEdicion(null)
  // lo cual causa un re-render durante el render del context
  const handleDiscardCallback = useCallback(async () => {
    if (!pasoEnEdicion) return

    try {
      // Llamar directamente al servicio sin modificar el estado local
      // El context limpiará pasoEnEdicion cuando cambie la ruta
      await actualizarProceso(pasoEnEdicion, {
        estado: EstadoPaso.PENDIENTE,
        fechaInicio: null,
        documentosUrls: null,
        notas: null
      })
    } catch (err) {
      console.error('Error al descartar cambios:', err)
    }
  }, [pasoEnEdicion])

  // Sincronizar estado de cambios sin guardar con context global
  useEffect(() => {
    if (pasoEnEdicion) {
      setHasUnsavedChanges(true)
      setMessage(
        'Tienes un paso iniciado con cambios sin guardar.\n\n' +
        'Si sales ahora:\n\n' +
        '• Se eliminarán los documentos adjuntos\n' +
        '• Se borrará la fecha de inicio\n' +
        '• El paso volverá a estado Pendiente'
      )
      // Registrar callback de descarte para cuando el usuario confirme salir
      console.log('🔧 Registrando onDiscard callback:', typeof handleDiscardCallback)
      setOnDiscard(handleDiscardCallback)
    } else {
      setHasUnsavedChanges(false)
      setMessage(null)
      setOnDiscard(null)
    }
  }, [pasoEnEdicion, setHasUnsavedChanges, setMessage, setOnDiscard, handleDiscardCallback])

  // Obtener fecha de negociación para el modal de completado
  useEffect(() => {
    async function obtenerFechaNegociacion() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from('negociaciones')
          .select('fecha_negociacion')
          .eq('id', negociacionId)
          .single()

        if (error) {
          console.error('Error al obtener fecha de negociación:', error)
          return
        }

        if (data?.fecha_negociacion) {
          setFechaNegociacion(data.fecha_negociacion)
        }
      } catch (err) {
        console.error('Error inesperado al obtener fecha de negociación:', err)
      }
    }

    obtenerFechaNegociacion()
  }, [negociacionId])

  // ===================================
  // HANDLERS
  // ===================================

  const togglePaso = (pasoId: string) => {
    setPasoExpandido(prev => prev === pasoId ? null : pasoId)
  }

  const handleIniciarPaso = async (pasoId: string) => {
    const confirmed = await confirm({
      title: '¿Iniciar trabajo en este paso?',
      message: 'Se registrará la fecha de inicio y podrás adjuntar documentos.',
      confirmText: 'Iniciar Paso',
      variant: 'info'
    })

    if (!confirmed) return

    const exito = await iniciarPaso(pasoId)
    if (exito) {
      setPasoExpandido(pasoId)
    }
  }

  const handleAbrirModalCompletar = (paso: ProcesoNegociacion) => {
    setPasoACompletar(paso)
    setModalFechaAbierto(true)
  }

  const handleConfirmarCompletado = async (fecha: Date) => {
    if (!pasoACompletar) return

    const exito = await completarPaso(pasoACompletar.id, fecha)

    if (exito) {
      setModalFechaAbierto(false)
      setPasoACompletar(null)
      setPasoExpandido(null)
    }
  }

  const handleDescartarCambios = async (pasoId: string) => {
    const confirmed = await confirm({
      title: '⚠️ ¿Descartar cambios?',
      message:
        'Esta acción revertirá lo siguiente:\n\n' +
        '• Se eliminarán los documentos adjuntos\n' +
        '• Se borrará la fecha de inicio\n' +
        '• El paso volverá a estado Pendiente\n\n' +
        'Esta acción no se puede deshacer.',
      confirmText: 'Descartar Cambios',
      cancelText: 'Cancelar',
      variant: 'warning'
    })

    if (!confirmed) return

    const exito = await descartarCambios(pasoId)
    if (exito) {
      setPasoExpandido(null)
    }
  }

  const handleRecargarPlantilla = async () => {
    const confirmed = await confirm({
      title: '⚠️ DESARROLLO: Recargar plantilla',
      message:
        'Esta acción hará lo siguiente:\n\n' +
        '• Eliminará todos los pasos actuales\n' +
        '• Los reemplazará con los de la plantilla predeterminada\n' +
        '• Los documentos subidos NO se eliminarán\n' +
        '• ACTUALIZARÁ las categorías de documentos configuradas\n\n' +
        'Usa esto para sincronizar cambios en la plantilla.\n' +
        'Esta función solo debe usarse en DESARROLLO.',
      confirmText: 'Recargar Plantilla',
      cancelText: 'Cancelar',
      variant: 'warning'
    })

    if (!confirmed) return

    setRecargandoPlantilla(true)

    try {
      const resultado = await recargarPlantilla(negociacionId)

      if (resultado.exito) {
        await confirm({
          title: '✅ Plantilla recargada',
          message: `Se crearon ${resultado.pasos} pasos correctamente.\n\nRefresca la página para ver los cambios.`,
          confirmText: 'Entendido',
          variant: 'success'
        })
        window.location.reload()
      } else {
        await confirm({
          title: '❌ Error',
          message: resultado.error || 'Error desconocido',
          confirmText: 'Entendido',
          variant: 'danger'
        })
      }
    } catch (error: any) {
      await confirm({
        title: '❌ Error',
        message: error.message || 'Error desconocido',
        confirmText: 'Entendido',
        variant: 'danger'
      })
    } finally {
      setRecargandoPlantilla(false)
    }
  }

  const handleAdjuntarDocumento = async (
    pasoId: string,
    pasoNombre: string,
    documentoId: string,
    documentoNombre: string,
    file: File,
    categoriaId?: string | null
  ) => {
    if (!user) {
      await confirm({
        title: '❌ Error',
        message: 'No hay usuario autenticado',
        confirmText: 'Entendido',
        variant: 'danger'
      })
      return
    }

    setSubiendoDoc(documentoId)

    try {
      const resultado = await subirDocumento({
        file,
        userId: user.id,
        negociacionId,
        pasoId,
        pasoNombre,
        documentoId,
        documentoNombre,
        categoriaId  // ✅ NUEVO: Pasar categoriaId al servicio
      })

      if (resultado.exito && resultado.url) {
        const exito = await agregarDocumento(pasoId, documentoId, resultado.url)

        if (exito) {
          await confirm({
            title: '✅ Documento subido',
            message: `"${documentoNombre}" se subió correctamente`,
            confirmText: 'Entendido',
            variant: 'success'
          })
        } else {
          throw new Error('No se pudo guardar la URL del documento')
        }
      } else {
        throw new Error(resultado.error || 'Error al subir documento')
      }
    } catch (error: any) {
      console.error('❌ Error completo:', error)
      await confirm({
        title: '❌ Error al subir documento',
        message: error.message || 'Error desconocido',
        confirmText: 'Entendido',
        variant: 'danger'
      })
    } finally {
      setSubiendoDoc(null)
    }
  }

  const handleEliminarDocumento = async (pasoId: string, documentoId: string, documentoNombre: string) => {
    const confirmed = await confirm({
      title: '¿Eliminar documento?',
      message: `Se eliminará "${documentoNombre}".\n\nEsta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger'
    })

    if (!confirmed) return

    await eliminarDocumento(pasoId, documentoId)
    // Eliminado modal de confirmación de éxito - la eliminación es inmediata en la UI
  }

  // ===================================
  // SISTEMA DE ADVERTENCIA: Cambios sin guardar
  // ===================================

  // El context global (UnsavedChangesProvider) ya maneja:
  // - Protección de cierre de pestaña/navegador
  // - Protección de navegación interna
  // - Modal de confirmación personalizado

  // Solo necesitamos sincronizar el estado (hecho arriba en useEffect)

  // ===================================
  // RENDER: LOADING
  // ===================================

  if (loading) {
    return (
      <div className={styles.loading.container}>
        <Loader2 className={styles.loading.spinner} />
      </div>
    )
  }

  // ===================================
  // RENDER: SIN PROCESO
  // ===================================

  if (!loading && pasos.length === 0) {
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
        progreso={progreso}
        onRecargarPlantilla={IS_DEV_MODE ? handleRecargarPlantilla : undefined}
        recargando={recargandoPlantilla}
      />

      {/* Banner de Advertencia: Paso en Proceso */}
      <AnimatePresence>
        {pasoEnEdicion && (
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
                onClick={() => pasoEnEdicion && handleDescartarCambios(pasoEnEdicion)}
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
        {pasoRecuperado && (
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
          {pasos.map((paso, index) => (
            <PasoItem
              key={paso.id}
              paso={paso}
              index={index}
              isExpanded={pasoExpandido === paso.id}
              onToggle={() => togglePaso(paso.id)}
              onIniciar={() => handleIniciarPaso(paso.id)}
              onCompletar={() => handleAbrirModalCompletar(paso)}
              onDescartar={() => handleDescartarCambios(paso.id)}
              onAdjuntarDocumento={handleAdjuntarDocumento}
              onEliminarDocumento={handleEliminarDocumento}
              puedeIniciar={puedeIniciar(paso)}
              puedeCompletar={puedeCompletar(paso)}
              estaBloqueado={estaBloqueado(paso)}
              dependenciasIncompletas={obtenerDependenciasIncompletas(paso)}
              deshabilitado={actualizando}
              subiendoDoc={subiendoDoc}
            />
          ))}
        </div>
      </div>

      {/* Modal de Fecha Completado */}
      <ModalFechaCompletado
        isOpen={modalFechaAbierto}
        pasoNombre={pasoACompletar?.nombre || ''}
        fechaInicio={pasoACompletar?.fechaInicio || undefined}
        fechaNegociacion={fechaNegociacion || undefined}
        ordenPaso={pasoACompletar?.orden || undefined}
        onConfirm={handleConfirmarCompletado}
        onCancel={() => {
          setModalFechaAbierto(false)
          setPasoACompletar(null)
        }}
      />
    </div>
  )
}
