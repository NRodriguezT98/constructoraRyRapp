/**
 * useConfiguracion - Hook para gestión de configuración de recargos
 * ✅ Separación de responsabilidades
 * ✅ Estados y lógica de negocio
 */

import { useCallback, useEffect, useState } from 'react'
import { configuracionService, type ActualizarConfiguracionDTO, type ConfiguracionRecargo, type CrearConfiguracionDTO } from '../services/configuracion.service'

export function useConfiguracion() {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionRecargo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState<ConfiguracionRecargo | null>(null)

  // Cargar configuraciones
  const cargarConfiguraciones = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await configuracionService.obtenerTodas()
      setConfiguraciones(data)
    } catch (err) {
      console.error('Error cargando configuraciones:', err)
      setError('Error al cargar configuraciones')
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear configuración
  const crear = useCallback(async (datos: CrearConfiguracionDTO) => {
    try {
      await configuracionService.crear(datos)
      await cargarConfiguraciones()
      return true
    } catch (err) {
      console.error('Error creando configuración:', err)
      setError('Error al crear configuración')
      return false
    }
  }, [cargarConfiguraciones])

  // Actualizar configuración
  const actualizar = useCallback(async (id: string, datos: ActualizarConfiguracionDTO) => {
    try {
      await configuracionService.actualizar(id, datos)
      await cargarConfiguraciones()
      return true
    } catch (err) {
      console.error('Error actualizando configuración:', err)
      setError('Error al actualizar configuración')
      return false
    }
  }, [cargarConfiguraciones])

  // Eliminar configuración
  const eliminar = useCallback(async (id: string) => {
    try {
      await configuracionService.eliminar(id)
      await cargarConfiguraciones()
      return true
    } catch (err) {
      console.error('Error eliminando configuración:', err)
      setError('Error al eliminar configuración')
      return false
    }
  }, [cargarConfiguraciones])

  // Toggle activo
  const toggleActivo = useCallback(async (id: string, activo: boolean) => {
    try {
      await configuracionService.toggleActivo(id, activo)
      await cargarConfiguraciones()
      return true
    } catch (err) {
      console.error('Error cambiando estado:', err)
      setError('Error al cambiar estado')
      return false
    }
  }, [cargarConfiguraciones])

  // Abrir modal de edición
  const abrirEdicion = useCallback((configuracion: ConfiguracionRecargo) => {
    setConfiguracionSeleccionada(configuracion)
    setModoEdicion(true)
  }, [])

  // Abrir modal de creación
  const abrirCreacion = useCallback(() => {
    setConfiguracionSeleccionada(null)
    setModoEdicion(true)
  }, [])

  // Cerrar modal
  const cerrarModal = useCallback(() => {
    setModoEdicion(false)
    setConfiguracionSeleccionada(null)
  }, [])

  // Cargar al montar
  useEffect(() => {
    cargarConfiguraciones()
  }, [cargarConfiguraciones])

  return {
    configuraciones,
    loading,
    error,
    modoEdicion,
    configuracionSeleccionada,
    crear,
    actualizar,
    eliminar,
    toggleActivo,
    abrirEdicion,
    abrirCreacion,
    cerrarModal,
    recargar: cargarConfiguraciones,
  }
}
