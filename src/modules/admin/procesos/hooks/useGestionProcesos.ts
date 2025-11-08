/**
 * 🎣 HOOK DE GESTIÓN DE PROCESOS
 *
 * Hook personalizado para gestionar plantillas de proceso.
 * Maneja estado, loading, errores y operaciones CRUD.
 */

import { useCallback, useEffect, useState } from 'react'

import {
    actualizarPlantilla,
    calcularEstadisticas,
    crearPlantilla,
    duplicarPlantilla,
    eliminarPlantilla,
    establecerPredeterminada,
    obtenerPlantillaPorId,
    obtenerPlantillas,
    validarPlantilla
} from '../services/procesos.service'
import type {
    ActualizarPlantillaDTO,
    CrearPlantillaDTO,
    EstadisticasPlantilla,
    PasoPlantilla,
    PlantillaProceso,
    ValidacionPlantilla
} from '../types'

interface UseGestionProcesosReturn {
  // Estado
  plantillas: PlantillaProceso[]
  plantillaActual: PlantillaProceso | null
  loading: boolean
  error: string | null
  guardando: boolean

  // Operaciones de plantillas
  cargarPlantillas: () => Promise<void>
  cargarPlantilla: (id: string) => Promise<void>
  crearNuevaPlantilla: (datos: CrearPlantillaDTO) => Promise<PlantillaProceso | null>
  actualizarPlantillaActual: (datos: ActualizarPlantillaDTO) => Promise<PlantillaProceso | null>
  eliminarPlantillaActual: (id: string) => Promise<boolean>
  duplicarPlantillaActual: (id: string, nuevoNombre: string) => Promise<PlantillaProceso | null>
  establecerComoPredeterminada: (id: string) => Promise<boolean>

  // Operaciones de pasos
  agregarPaso: (paso: Omit<PasoPlantilla, 'id' | 'orden'>) => void
  actualizarPaso: (id: string, paso: Partial<PasoPlantilla>) => void
  eliminarPaso: (id: string) => void
  reordenarPasos: (pasos: PasoPlantilla[]) => void
  moverPaso: (fromIndex: number, toIndex: number) => void

  // Utilidades
  validar: () => ValidacionPlantilla
  obtenerEstadisticas: () => EstadisticasPlantilla | null
  limpiarError: () => void
  resetearPlantillaActual: () => void
}

/**
 * Hook principal para gestión de procesos
 */
export function useGestionProcesos(): UseGestionProcesosReturn {
  // ===================================
  // ESTADO
  // ===================================

  const [plantillas, setPlantillas] = useState<PlantillaProceso[]>([])
  const [plantillaActual, setPlantillaActual] = useState<PlantillaProceso | null>(null)
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ===================================
  // OPERACIONES DE PLANTILLAS
  // ===================================

  /**
   * Carga todas las plantillas
   */
  const cargarPlantillas = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await obtenerPlantillas()
      setPlantillas(data)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar plantillas'
      setError(mensaje)
      console.error('Error en cargarPlantillas:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Carga una plantilla específica
   */
  const cargarPlantilla = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await obtenerPlantillaPorId(id)
      if (data) {
        setPlantillaActual(data)
      } else {
        setError('Plantilla no encontrada')
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar plantilla'
      setError(mensaje)
      console.error('Error en cargarPlantilla:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Crea una nueva plantilla
   */
  const crearNuevaPlantilla = useCallback(async (datos: CrearPlantillaDTO): Promise<PlantillaProceso | null> => {
    setGuardando(true)
    setError(null)

    try {
      // Validar antes de crear
      const validacion = validarPlantilla(datos)
      if (!validacion.valida) {
        setError(validacion.errores.join(', '))
        return null
      }

      const nuevaPlantilla = await crearPlantilla(datos)

      // Actualizar lista
      setPlantillas(prev => [nuevaPlantilla, ...prev])
      setPlantillaActual(nuevaPlantilla)

      return nuevaPlantilla
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al crear plantilla'
      setError(mensaje)
      console.error('Error en crearNuevaPlantilla:', err)
      return null
    } finally {
      setGuardando(false)
    }
  }, [])

  /**
   * Actualiza la plantilla actual
   */
  const actualizarPlantillaActual = useCallback(async (
    datos: ActualizarPlantillaDTO
  ): Promise<PlantillaProceso | null> => {
    if (!plantillaActual) {
      setError('No hay plantilla seleccionada')
      return null
    }

    setGuardando(true)
    setError(null)

    try {
      // Validar si hay cambios en pasos
      if (datos.pasos) {
        const validacion = validarPlantilla({ ...plantillaActual, ...datos })
        if (!validacion.valida) {
          setError(validacion.errores.join(', '))
          return null
        }
      }

      const plantillaActualizada = await actualizarPlantilla(plantillaActual.id, datos)

      // Actualizar en lista
      setPlantillas(prev => prev.map(p =>
        p.id === plantillaActualizada.id ? plantillaActualizada : p
      ))
      setPlantillaActual(plantillaActualizada)

      return plantillaActualizada
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al actualizar plantilla'
      setError(mensaje)
      console.error('Error en actualizarPlantillaActual:', err)
      return null
    } finally {
      setGuardando(false)
    }
  }, [plantillaActual])

  /**
   * Elimina una plantilla
   */
  const eliminarPlantillaActual = useCallback(async (id: string): Promise<boolean> => {
    setGuardando(true)
    setError(null)

    try {
      await eliminarPlantilla(id)

      // Actualizar lista
      setPlantillas(prev => prev.filter(p => p.id !== id))

      // Si era la actual, limpiar
      if (plantillaActual?.id === id) {
        setPlantillaActual(null)
      }

      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al eliminar plantilla'
      setError(mensaje)
      console.error('Error en eliminarPlantillaActual:', err)
      return false
    } finally {
      setGuardando(false)
    }
  }, [plantillaActual])

  /**
   * Duplica una plantilla
   */
  const duplicarPlantillaActual = useCallback(async (
    id: string,
    nuevoNombre: string
  ): Promise<PlantillaProceso | null> => {
    setGuardando(true)
    setError(null)

    try {
      const duplicada = await duplicarPlantilla(id, nuevoNombre)

      // Agregar a lista
      setPlantillas(prev => [duplicada, ...prev])

      return duplicada
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al duplicar plantilla'
      setError(mensaje)
      console.error('Error en duplicarPlantillaActual:', err)
      return null
    } finally {
      setGuardando(false)
    }
  }, [])

  /**
   * Establece como predeterminada
   */
  const establecerComoPredeterminada = useCallback(async (id: string): Promise<boolean> => {
    setGuardando(true)
    setError(null)

    try {
      await establecerPredeterminada(id)

      // Actualizar flags en lista
      setPlantillas(prev => prev.map(p => ({
        ...p,
        esPredeterminado: p.id === id
      })))

      // Actualizar actual si es la misma
      if (plantillaActual?.id === id) {
        setPlantillaActual(prev => prev ? { ...prev, esPredeterminado: true } : null)
      }

      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al establecer predeterminada'
      setError(mensaje)
      console.error('Error en establecerComoPredeterminada:', err)
      return false
    } finally {
      setGuardando(false)
    }
  }, [plantillaActual])

  // ===================================
  // OPERACIONES DE PASOS
  // ===================================

  /**
   * Agrega un nuevo paso
   */
  const agregarPaso = useCallback((paso: Omit<PasoPlantilla, 'id' | 'orden'>) => {
    if (!plantillaActual) return

    const nuevoId = crypto.randomUUID()
    const nuevoOrden = plantillaActual.pasos.length + 1

    const nuevoPaso: PasoPlantilla = {
      ...paso,
      id: nuevoId,
      orden: nuevoOrden
    }

    setPlantillaActual(prev => prev ? {
      ...prev,
      pasos: [...prev.pasos, nuevoPaso]
    } : null)
  }, [plantillaActual])

  /**
   * Actualiza un paso existente
   */
  const actualizarPaso = useCallback((id: string, cambios: Partial<PasoPlantilla>) => {
    if (!plantillaActual) return

    setPlantillaActual(prev => prev ? {
      ...prev,
      pasos: prev.pasos.map(paso =>
        paso.id === id ? { ...paso, ...cambios } : paso
      )
    } : null)
  }, [plantillaActual])

  /**
   * Elimina un paso
   */
  const eliminarPaso = useCallback((id: string) => {
    if (!plantillaActual) return

    const pasosFiltrados = plantillaActual.pasos.filter(p => p.id !== id)

    // Reordenar después de eliminar
    const pasosReordenados = pasosFiltrados.map((paso, index) => ({
      ...paso,
      orden: index + 1
    }))

    setPlantillaActual(prev => prev ? {
      ...prev,
      pasos: pasosReordenados
    } : null)
  }, [plantillaActual])

  /**
   * Reordena todos los pasos
   */
  const reordenarPasos = useCallback((nuevosPasos: PasoPlantilla[]) => {
    if (!plantillaActual) return

    // Asegurar orden secuencial
    const pasosConOrden = nuevosPasos.map((paso, index) => ({
      ...paso,
      orden: index + 1
    }))

    setPlantillaActual(prev => prev ? {
      ...prev,
      pasos: pasosConOrden
    } : null)
  }, [plantillaActual])

  /**
   * Mueve un paso de una posición a otra
   */
  const moverPaso = useCallback((fromIndex: number, toIndex: number) => {
    if (!plantillaActual) return

    const pasos = [...plantillaActual.pasos]
    const [movido] = pasos.splice(fromIndex, 1)
    pasos.splice(toIndex, 0, movido)

    reordenarPasos(pasos)
  }, [plantillaActual, reordenarPasos])

  // ===================================
  // UTILIDADES
  // ===================================

  /**
   * Valida la plantilla actual
   */
  const validar = useCallback((): ValidacionPlantilla => {
    if (!plantillaActual) {
      return {
        valida: false,
        errores: ['No hay plantilla seleccionada'],
        advertencias: []
      }
    }

    return validarPlantilla(plantillaActual)
  }, [plantillaActual])

  /**
   * Obtiene estadísticas de la plantilla actual
   */
  const obtenerEstadisticas = useCallback((): EstadisticasPlantilla | null => {
    if (!plantillaActual) return null
    return calcularEstadisticas(plantillaActual)
  }, [plantillaActual])

  /**
   * Limpia el error actual
   */
  const limpiarError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Resetea la plantilla actual
   */
  const resetearPlantillaActual = useCallback(() => {
    setPlantillaActual(null)
    setError(null)
  }, [])

  // ===================================
  // EFECTOS
  // ===================================

  /**
   * Carga plantillas al montar
   */
  useEffect(() => {
    cargarPlantillas()
  }, [cargarPlantillas])

  // ===================================
  // RETORNO
  // ===================================

  return {
    // Estado
    plantillas,
    plantillaActual,
    loading,
    error,
    guardando,

    // Operaciones de plantillas
    cargarPlantillas,
    cargarPlantilla,
    crearNuevaPlantilla,
    actualizarPlantillaActual,
    eliminarPlantillaActual,
    duplicarPlantillaActual,
    establecerComoPredeterminada,

    // Operaciones de pasos
    agregarPaso,
    actualizarPaso,
    eliminarPaso,
    reordenarPasos,
    moverPaso,

    // Utilidades
    validar,
    obtenerEstadisticas,
    limpiarError,
    resetearPlantillaActual
  }
}
