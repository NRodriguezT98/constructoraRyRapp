/**
 * 🎯 HOOK: useTimelineProceso
 *
 * Centraliza TODA la lógica del componente TimelineProceso.
 * Maneja estados de UI, modales, subida de documentos y confirmaciones.
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - Lógica de negocio (procesos) → useProcesoNegociacion
 * - Lógica de UI y coordinación → useTimelineProceso (este hook)
 * - Presentación pura → TimelineProceso component
 */

import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import { useAuth } from '@/contexts/auth-context'
import { useModal } from '@/shared/components/modals'

import { subirDocumento } from '../services/documentos-proceso.service'
import { recargarPlantilla } from '../services/plantilla-reload.service'
import type { ProcesoNegociacion } from '../types'

import { useProcesoNegociacion } from './useProcesoNegociacion'

interface UseTimelineProcesoProps {
  negociacionId: string
}

export function useTimelineProceso({ negociacionId }: UseTimelineProcesoProps) {
  const { user, perfil } = useAuth()
  const { confirm } = useModal()

  // Hook de lógica de procesos
  const procesoHook = useProcesoNegociacion({ negociacionId })

  // ===================================
  // ESTADOS DE UI
  // ===================================

  const [pasoExpandido, setPasoExpandido] = useState<string | null>(null)
  const [subiendoDoc, setSubiendoDoc] = useState<string | null>(null)
  const [recargandoPlantilla, setRecargandoPlantilla] = useState(false)
  const [fechaNegociacion, setFechaNegociacion] = useState<string | null>(null)

  // Estados de modales
  const [modalFechaAbierto, setModalFechaAbierto] = useState(false)
  const [pasoACompletar, setPasoACompletar] = useState<ProcesoNegociacion | null>(null)
  const [modalOmitirAbierto, setModalOmitirAbierto] = useState(false)
  const [pasoAOmitir, setPasoAOmitir] = useState<ProcesoNegociacion | null>(null)

  // Estados para correcciones (solo admin)
  const [modalCorregirFechaAbierto, setModalCorregirFechaAbierto] = useState(false)
  const [pasoACorregirFecha, setPasoACorregirFecha] = useState<ProcesoNegociacion | null>(null)
  const [modalCorregirDocAbierto, setModalCorregirDocAbierto] = useState(false)
  const [pasoACorregirDoc, setPasoACorregirDoc] = useState<ProcesoNegociacion | null>(null)

  // ===================================
  // EFECTOS
  // ===================================

  // Obtener fecha de negociación para validaciones
  useEffect(() => {
    async function obtenerFechaNegociacion() {
      try {
        const supabase = createClient()

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
  // HANDLERS DE UI
  // ===================================

  const togglePaso = useCallback((pasoId: string) => {
    setPasoExpandido(prev => prev === pasoId ? null : pasoId)
  }, [])

  const handleIniciarPaso = useCallback(async (pasoId: string) => {
    const confirmed = await confirm({
      title: '¿Iniciar trabajo en este paso?',
      message: 'Se registrará la fecha de inicio y podrás adjuntar documentos.',
      confirmText: 'Iniciar Paso',
      variant: 'info'
    })

    if (!confirmed) return

    const exito = await procesoHook.iniciarPaso(pasoId)
    if (exito) {
      setPasoExpandido(pasoId)
    }
  }, [confirm, procesoHook])

  const handleAbrirModalCompletar = useCallback((paso: ProcesoNegociacion) => {
    setPasoACompletar(paso)
    setModalFechaAbierto(true)
  }, [])

  const handleConfirmarCompletado = useCallback(async (fechaString: string) => {
    if (!pasoACompletar) return

    const exito = await procesoHook.completarPaso(pasoACompletar.id, fechaString)

    if (exito) {
      setModalFechaAbierto(false)
      setPasoACompletar(null)
      setPasoExpandido(null)
    }
  }, [pasoACompletar, procesoHook])

  const handleCancelarCompletado = useCallback(() => {
    setModalFechaAbierto(false)
    setPasoACompletar(null)
  }, [])

  const handleDescartarCambios = useCallback(async (pasoId: string) => {
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

    const exito = await procesoHook.descartarCambios(pasoId)
    if (exito) {
      setPasoExpandido(null)
    }
  }, [confirm, procesoHook])

  const handleOmitirPaso = useCallback((paso: ProcesoNegociacion) => {
    setPasoAOmitir(paso)
    setModalOmitirAbierto(true)
  }, [])

  const handleConfirmarOmision = useCallback(async (motivo: string) => {
    if (!pasoAOmitir) return

    const exito = await procesoHook.omitirPaso(pasoAOmitir.id, motivo)

    if (exito) {
      await confirm({
        title: '✅ Paso omitido',
        message: `"${pasoAOmitir.nombre}" fue marcado como omitido correctamente.`,
        confirmText: 'Entendido',
        variant: 'success'
      })
      setPasoExpandido(null)
    } else {
      await confirm({
        title: '❌ Error',
        message: 'No se pudo omitir el paso. Intenta nuevamente.',
        confirmText: 'Entendido',
        variant: 'danger'
      })
    }

    setModalOmitirAbierto(false)
    setPasoAOmitir(null)
  }, [pasoAOmitir, confirm, procesoHook])

  const handleCancelarOmision = useCallback(() => {
    setModalOmitirAbierto(false)
    setPasoAOmitir(null)
  }, [])

  // ===================================
  // HANDLERS DE DOCUMENTOS
  // ===================================

  const handleAdjuntarDocumento = useCallback(async (
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
        categoriaId
      })

      if (resultado.exito && resultado.url) {
        const exito = await procesoHook.adjuntarConAutoInicio(pasoId, documentoNombre, resultado.url)

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
  }, [user, negociacionId, confirm, procesoHook])

  const handleEliminarDocumento = useCallback(async (
    pasoId: string,
    documentoId: string,
    documentoNombre: string
  ) => {
    const confirmed = await confirm({
      title: '¿Eliminar documento?',
      message: `Se eliminará "${documentoNombre}".\n\nEsta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger'
    })

    if (!confirmed) return

    await procesoHook.eliminarDocumento(pasoId, documentoId)
  }, [confirm, procesoHook])

  // ===================================
  // HANDLER DE DESARROLLO
  // ===================================

  const handleRecargarPlantilla = useCallback(async () => {
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
  }, [negociacionId, confirm])

  // ===================================
  // HANDLERS DE CORRECCIONES (SOLO ADMIN)
  // ===================================

  const handleAbrirModalCorregirFecha = useCallback((paso: ProcesoNegociacion) => {
    setPasoACorregirFecha(paso)
    setModalCorregirFechaAbierto(true)
  }, [])

  const handleCerrarModalCorregirFecha = useCallback(() => {
    setModalCorregirFechaAbierto(false)
    setPasoACorregirFecha(null)
  }, [])

  const handleSuccessCorregirFecha = useCallback(async () => {
    setModalCorregirFechaAbierto(false)
    setPasoACorregirFecha(null)
    // Recargar pasos para ver cambios
    await procesoHook.refrescar()
  }, [procesoHook])

  const handleAbrirModalCorregirDoc = useCallback((paso: ProcesoNegociacion) => {
    setPasoACorregirDoc(paso)
    setModalCorregirDocAbierto(true)
  }, [])

  const handleCerrarModalCorregirDoc = useCallback(() => {
    setModalCorregirDocAbierto(false)
    setPasoACorregirDoc(null)
  }, [])

  const handleSuccessCorregirDoc = useCallback(async () => {
    setModalCorregirDocAbierto(false)
    setPasoACorregirDoc(null)
    // Recargar pasos para ver cambios
    await procesoHook.refrescar()
  }, [procesoHook])

  // Verificar si usuario es administrador
  const esAdministrador = perfil?.rol === 'Administrador'

  // ===================================
  // RETURN
  // ===================================

  return {
    // Estados del hook de procesos
    ...procesoHook,

    // Estados de UI
    pasoExpandido,
    subiendoDoc,
    recargandoPlantilla,
    fechaNegociacion,

    // Estados de modales
    modalFechaAbierto,
    pasoACompletar,
    modalOmitirAbierto,
    pasoAOmitir,

    // Estados de modales de corrección
    modalCorregirFechaAbierto,
    pasoACorregirFecha,
    modalCorregirDocAbierto,
    pasoACorregirDoc,

    // Permisos
    esAdministrador,

    // Handlers de UI
    togglePaso,
    handleIniciarPaso,
    handleAbrirModalCompletar,
    handleConfirmarCompletado,
    handleCancelarCompletado,
    handleDescartarCambios,
    handleOmitirPaso,
    handleConfirmarOmision,
    handleCancelarOmision,

    // Handlers de documentos
    handleAdjuntarDocumento,
    handleEliminarDocumento,

    // Handlers de correcciones (solo admin)
    handleAbrirModalCorregirFecha,
    handleCerrarModalCorregirFecha,
    handleSuccessCorregirFecha,
    handleAbrirModalCorregirDoc,
    handleCerrarModalCorregirDoc,
    handleSuccessCorregirDoc,

    // Handlers de desarrollo
    handleRecargarPlantilla
  }
}
