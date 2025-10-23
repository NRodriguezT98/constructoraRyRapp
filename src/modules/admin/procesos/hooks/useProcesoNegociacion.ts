/**
 * 🎣 HOOK DE PROCESO DE NEGOCIACIÓN
 *
 * Hook para gestionar el proceso de una negociación específica.
 * Maneja carga, actualización de pasos y upload de documentos.
 */

import { useCallback, useEffect, useState } from 'react'
import {
    actualizarProceso,
    obtenerProcesosNegociacion,
    obtenerProgresoNegociacion
} from '../services/procesos.service'
import type {
    ActualizarProcesoDTO,
    ProcesoNegociacion,
    ProgresoNegociacion
} from '../types'
import { EstadoPaso } from '../types'

interface UseProcesoNegociacionParams {
  negociacionId: string
}

interface UseProcesoNegociacionReturn {
  // Estado
  pasos: ProcesoNegociacion[]
  progreso: ProgresoNegociacion | null
  loading: boolean
  error: string | null
  actualizando: boolean

  // Operaciones
  cargarProceso: () => Promise<void>
  completarPaso: (pasoId: string, datos: ActualizarProcesoDTO) => Promise<boolean>
  iniciarPaso: (pasoId: string) => Promise<boolean>
  omitirPaso: (pasoId: string, motivo: string) => Promise<boolean>
  agregarDocumento: (pasoId: string, nombreDoc: string, url: string) => Promise<boolean>

  // Utilidades
  puedeCompletar: (paso: ProcesoNegociacion) => boolean
  obtenerPasoActual: () => ProcesoNegociacion | undefined
  limpiarError: () => void
}

/**
 * Hook para gestionar proceso de negociación
 */
export function useProcesoNegociacion({
  negociacionId
}: UseProcesoNegociacionParams): UseProcesoNegociacionReturn {
  // ===================================
  // ESTADO
  // ===================================

  const [pasos, setPasos] = useState<ProcesoNegociacion[]>([])
  const [progreso, setProgreso] = useState<ProgresoNegociacion | null>(null)
  const [loading, setLoading] = useState(false)
  const [actualizando, setActualizando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ===================================
  // OPERACIONES
  // ===================================

  /**
   * Carga el proceso completo
   */
  const cargarProceso = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [pasosData, progresoData] = await Promise.all([
        obtenerProcesosNegociacion(negociacionId),
        obtenerProgresoNegociacion(negociacionId)
      ])

      setPasos(pasosData)
      setProgreso(progresoData)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar proceso'
      setError(mensaje)
      console.error('Error en cargarProceso:', err)
    } finally {
      setLoading(false)
    }
  }, [negociacionId])

  /**
   * Completa un paso
   */
  const completarPaso = useCallback(async (
    pasoId: string,
    datos: ActualizarProcesoDTO
  ): Promise<boolean> => {
    setActualizando(true)
    setError(null)

    try {
      const actualizado = await actualizarProceso(pasoId, {
        ...datos,
        estado: EstadoPaso.COMPLETADO,
        fechaCompletado: new Date().toISOString()
      })

      // Actualizar en lista
      setPasos(prev => prev.map(p =>
        p.id === pasoId ? actualizado : p
      ))

      // Recalcular progreso
      await obtenerProgresoNegociacion(negociacionId).then(setProgreso)

      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al completar paso'
      setError(mensaje)
      console.error('Error en completarPaso:', err)
      return false
    } finally {
      setActualizando(false)
    }
  }, [negociacionId])

  /**
   * Inicia un paso
   */
  const iniciarPaso = useCallback(async (pasoId: string): Promise<boolean> => {
    setActualizando(true)
    setError(null)

    try {
      const actualizado = await actualizarProceso(pasoId, {
        estado: EstadoPaso.EN_PROCESO,
        fechaInicio: new Date().toISOString()
      })

      setPasos(prev => prev.map(p =>
        p.id === pasoId ? actualizado : p
      ))

      await obtenerProgresoNegociacion(negociacionId).then(setProgreso)

      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al iniciar paso'
      setError(mensaje)
      console.error('Error en iniciarPaso:', err)
      return false
    } finally {
      setActualizando(false)
    }
  }, [negociacionId])

  /**
   * Omite un paso
   */
  const omitirPaso = useCallback(async (
    pasoId: string,
    motivo: string
  ): Promise<boolean> => {
    setActualizando(true)
    setError(null)

    try {
      const actualizado = await actualizarProceso(pasoId, {
        estado: EstadoPaso.OMITIDO,
        motivoOmision: motivo,
        fechaCompletado: new Date().toISOString()
      })

      setPasos(prev => prev.map(p =>
        p.id === pasoId ? actualizado : p
      ))

      await obtenerProgresoNegociacion(negociacionId).then(setProgreso)

      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al omitir paso'
      setError(mensaje)
      console.error('Error en omitirPaso:', err)
      return false
    } finally {
      setActualizando(false)
    }
  }, [negociacionId])

  /**
   * Agrega un documento a un paso
   */
  const agregarDocumento = useCallback(async (
    pasoId: string,
    nombreDoc: string,
    url: string
  ): Promise<boolean> => {
    setActualizando(true)
    setError(null)

    try {
      const paso = pasos.find(p => p.id === pasoId)
      if (!paso) throw new Error('Paso no encontrado')

      const documentosActuales = paso.documentosUrls || {}
      const nuevosDocumentos = {
        ...documentosActuales,
        [nombreDoc]: url
      }

      const actualizado = await actualizarProceso(pasoId, {
        documentosUrls: nuevosDocumentos
      })

      setPasos(prev => prev.map(p =>
        p.id === pasoId ? actualizado : p
      ))

      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al agregar documento'
      setError(mensaje)
      console.error('Error en agregarDocumento:', err)
      return false
    } finally {
      setActualizando(false)
    }
  }, [pasos])

  // ===================================
  // UTILIDADES
  // ===================================

  /**
   * Verifica si un paso puede completarse
   */
  const puedeCompletar = useCallback((paso: ProcesoNegociacion): boolean => {
    // Si ya está completado u omitido, no se puede volver a completar
    if (paso.estado === EstadoPaso.COMPLETADO || paso.estado === EstadoPaso.OMITIDO) {
      return false
    }

    // Verificar dependencias
    if (paso.dependeDe && paso.dependeDe.length > 0) {
      const dependencias = pasos.filter(p => paso.dependeDe?.includes(p.id))
      const todasCompletadas = dependencias.every(
        d => d.estado === EstadoPaso.COMPLETADO || d.estado === EstadoPaso.OMITIDO
      )

      if (!todasCompletadas) return false
    }

    // Verificar documentos obligatorios
    if (paso.documentosRequeridos) {
      const docsObligatorios = paso.documentosRequeridos.filter(d => d.obligatorio)
      const documentosSubidos = paso.documentosUrls || {}

      const todosSubidos = docsObligatorios.every(
        doc => documentosSubidos[doc.id] || documentosSubidos[doc.nombre]
      )

      if (!todosSubidos) return false
    }

    return true
  }, [pasos])

  /**
   * Obtiene el paso actual (primer pendiente o en proceso)
   */
  const obtenerPasoActual = useCallback((): ProcesoNegociacion | undefined => {
    return pasos.find(p => p.estado === EstadoPaso.EN_PROCESO)
      || pasos.find(p => p.estado === EstadoPaso.PENDIENTE)
  }, [pasos])

  /**
   * Limpia el error
   */
  const limpiarError = useCallback(() => {
    setError(null)
  }, [])

  // ===================================
  // EFECTOS
  // ===================================

  /**
   * Carga proceso al montar
   */
  useEffect(() => {
    if (negociacionId) {
      cargarProceso()
    }
  }, [negociacionId, cargarProceso])

  // ===================================
  // RETORNO
  // ===================================

  return {
    // Estado
    pasos,
    progreso,
    loading,
    error,
    actualizando,

    // Operaciones
    cargarProceso,
    completarPaso,
    iniciarPaso,
    omitirPaso,
    agregarDocumento,

    // Utilidades
    puedeCompletar,
    obtenerPasoActual,
    limpiarError
  }
}
