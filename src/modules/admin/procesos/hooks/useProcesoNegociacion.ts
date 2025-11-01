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
  pasoEnEdicion: string | null
  pasoRecuperado: string | null // ID del paso recuperado (para mostrar banner)

  // Operaciones
  cargarProceso: () => Promise<void>
  completarPaso: (pasoId: string, fechaCompletado: Date) => Promise<boolean>
  iniciarPaso: (pasoId: string) => Promise<boolean>
  descartarCambios: (pasoId: string) => Promise<boolean>
  omitirPaso: (pasoId: string, motivo: string) => Promise<boolean>
  agregarDocumento: (pasoId: string, nombreDoc: string, url: string) => Promise<boolean>
  eliminarDocumento: (pasoId: string, documentoId: string) => Promise<boolean>

  // Utilidades
  puedeCompletar: (paso: ProcesoNegociacion) => boolean
  puedeIniciar: (paso: ProcesoNegociacion) => boolean
  estaBloqueado: (paso: ProcesoNegociacion) => boolean
  obtenerDependenciasIncompletas: (paso: ProcesoNegociacion) => ProcesoNegociacion[]
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
  const [pasoEnEdicion, setPasoEnEdicion] = useState<string | null>(null)
  const [pasoRecuperado, setPasoRecuperado] = useState<string | null>(null) // Para mostrar banner

  // ===================================
  // OPERACIONES
  // ===================================

  /**
   * Carga el proceso completo y recupera automáticamente pasos en edición
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

      // 🔄 RECUPERACIÓN AUTOMÁTICA: Buscar paso en "En Proceso"
      const pasoEnProceso = pasosData.find(p => p.estado === EstadoPaso.EN_PROCESO)

      if (pasoEnProceso) {
        console.log('🔄 Recuperando paso en proceso:', pasoEnProceso.nombre)
        setPasoEnEdicion(pasoEnProceso.id)
        setPasoRecuperado(pasoEnProceso.id)

        // Limpiar el banner después de 10 segundos
        setTimeout(() => {
          setPasoRecuperado(null)
        }, 10000)
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar proceso'
      setError(mensaje)
      console.error('Error en cargarProceso:', err)
    } finally {
      setLoading(false)
    }
  }, [negociacionId])

  /**
   * Completa un paso con fecha específica
   */
  const completarPaso = useCallback(async (
    pasoId: string,
    fechaCompletado: Date
  ): Promise<boolean> => {
    setActualizando(true)
    setError(null)

    try {
      const paso = pasos.find(p => p.id === pasoId)
      if (!paso) throw new Error('Paso no encontrado')

      // Usar fecha_inicio existente o la fecha de completado si no existe
      const fechaInicio = paso.fechaInicio || fechaCompletado.toISOString()

      const actualizado = await actualizarProceso(pasoId, {
        estado: EstadoPaso.COMPLETADO,
        fechaInicio,
        fechaCompletado: fechaCompletado.toISOString()
      })

      // Actualizar en lista
      setPasos(prev => prev.map(p =>
        p.id === pasoId ? actualizado : p
      ))

      // Recalcular progreso
      await obtenerProgresoNegociacion(negociacionId).then(setProgreso)

      // Limpiar paso en edición
      setPasoEnEdicion(null)

      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al completar paso'
      setError(mensaje)
      console.error('Error en completarPaso:', err)
      return false
    } finally {
      setActualizando(false)
    }
  }, [negociacionId, pasos])

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

      // Marcar como en edición
      setPasoEnEdicion(pasoId)

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
   * Descarta cambios en un paso y vuelve a Pendiente
   * Incluye limpieza completa de documentos del Storage y DB
   */
  const descartarCambios = useCallback(async (pasoId: string): Promise<boolean> => {
    setActualizando(true)
    setError(null)

    try {
      const paso = pasos.find(p => p.id === pasoId)
      if (!paso) throw new Error('Paso no encontrado')

      // 1. ELIMINAR DOCUMENTOS DEL STORAGE
      if (paso.documentosUrls && Object.keys(paso.documentosUrls).length > 0) {
        console.log('🗑️ Eliminando documentos del Storage...', paso.documentosUrls)

        const { eliminarDocumentoStorage } = await import('../services/documentos-proceso.service')

        for (const [nombreDoc, url] of Object.entries(paso.documentosUrls)) {
          try {
            const eliminado = await eliminarDocumentoStorage(url)
            if (eliminado) {
              console.log(`✅ Documento "${nombreDoc}" eliminado del Storage`)
            } else {
              console.warn(`⚠️ No se pudo eliminar "${nombreDoc}" del Storage`)
            }
          } catch (error) {
            console.error(`❌ Error al eliminar "${nombreDoc}":`, error)
            // Continuar con los demás documentos aunque uno falle
          }
        }
      }

      // 2. ACTUALIZAR PROCESO EN DB (limpiar todo)
      const actualizado = await actualizarProceso(pasoId, {
        estado: EstadoPaso.PENDIENTE,
        fechaInicio: null,
        documentosUrls: null, // Eliminar referencias a documentos
        notas: null
      })

      setPasos(prev => prev.map(p =>
        p.id === pasoId ? actualizado : p
      ))

      await obtenerProgresoNegociacion(negociacionId).then(setProgreso)

      // Limpiar paso en edición
      setPasoEnEdicion(null)

      console.log('✅ Cambios descartados completamente')
      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al descartar cambios'
      setError(mensaje)
      console.error('Error en descartarCambios:', err)
      return false
    } finally {
      setActualizando(false)
    }
  }, [negociacionId, pasos])

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

  /**
   * Elimina un documento de un paso
   */
  const eliminarDocumento = useCallback(async (
    pasoId: string,
    documentoId: string
  ): Promise<boolean> => {
    setActualizando(true)
    setError(null)

    try {
      const paso = pasos.find(p => p.id === pasoId)
      if (!paso) throw new Error('Paso no encontrado')

      const documentosActuales = paso.documentosUrls || {}
      const { [documentoId]: removed, ...nuevosDocumentos } = documentosActuales

      const actualizado = await actualizarProceso(pasoId, {
        documentosUrls: Object.keys(nuevosDocumentos).length > 0 ? nuevosDocumentos : null
      })

      setPasos(prev => prev.map(p =>
        p.id === pasoId ? actualizado : p
      ))

      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al eliminar documento'
      setError(mensaje)
      console.error('Error en eliminarDocumento:', err)
      return false
    } finally {
      setActualizando(false)
    }
  }, [pasos])

  // ===================================
  // UTILIDADES
  // ===================================

  /**
   * Verifica si un paso está bloqueado por dependencias
   */
  const estaBloqueado = useCallback((paso: ProcesoNegociacion): boolean => {
    // Si ya está completado u omitido, no está bloqueado
    if (paso.estado === EstadoPaso.COMPLETADO || paso.estado === EstadoPaso.OMITIDO) {
      return false
    }

    // Verificar si tiene dependencias sin completar
    if (paso.dependeDe && paso.dependeDe.length > 0) {
      const dependencias = pasos.filter(p => paso.dependeDe?.includes(p.id))
      const todasCompletadas = dependencias.every(
        d => d.estado === EstadoPaso.COMPLETADO || d.estado === EstadoPaso.OMITIDO
      )

      return !todasCompletadas // Bloqueado si NO todas están completadas
    }

    return false // No está bloqueado si no tiene dependencias
  }, [pasos])

  /**
   * Obtiene los pasos dependientes que están incompletos
   */
  const obtenerDependenciasIncompletas = useCallback((paso: ProcesoNegociacion): ProcesoNegociacion[] => {
    if (!paso.dependeDe || paso.dependeDe.length === 0) {
      return []
    }

    return pasos.filter(p =>
      paso.dependeDe?.includes(p.id) &&
      p.estado !== EstadoPaso.COMPLETADO &&
      p.estado !== EstadoPaso.OMITIDO
    )
  }, [pasos])

  /**
   * Verifica si un paso puede iniciarse
   */
  const puedeIniciar = useCallback((paso: ProcesoNegociacion): boolean => {
    // Si ya está en proceso, completado u omitido, no se puede iniciar
    if (paso.estado !== EstadoPaso.PENDIENTE) {
      return false
    }

    // Si está bloqueado por dependencias, no se puede iniciar
    if (estaBloqueado(paso)) {
      return false
    }

    return true
  }, [estaBloqueado])

  /**
   * Verifica si un paso puede completarse
   */
  const puedeCompletar = useCallback((paso: ProcesoNegociacion): boolean => {
    // Si ya está completado u omitido, no se puede volver a completar
    if (paso.estado === EstadoPaso.COMPLETADO || paso.estado === EstadoPaso.OMITIDO) {
      return false
    }

    // Debe estar en proceso para completarse
    if (paso.estado !== EstadoPaso.EN_PROCESO) {
      return false
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
    pasoEnEdicion,
    pasoRecuperado,

    // Operaciones
    cargarProceso,
    completarPaso,
    iniciarPaso,
    descartarCambios,
    omitirPaso,
    agregarDocumento,
    eliminarDocumento,

    // Utilidades
    puedeCompletar,
    puedeIniciar,
    estaBloqueado,
    obtenerDependenciasIncompletas,
    obtenerPasoActual,
    limpiarError
  }
}
